"use server";

import { requireOwner } from "@/lib/auth/require-owner";
import {
  InactiveCloudinaryAssetError,
  assertActiveCloudinaryAssetUrls,
} from "@/lib/assets/repository";

import { DraftVersionConflictError } from "./repository-errors";
import { getDraftPortfolio } from "./repository";
import {
  mergeProjectsEditorPayload,
  ProjectsEditorSubmissionSchema,
  type ProjectsEditorSubmission,
} from "./projects-editor";
import { saveStudioPortfolioDraft } from "./studio-actions";

type FieldErrors = Record<string, string[]>;

export type ProjectsDraftSaveResult =
  | {
      ok: true;
      draftVersion: number;
    }
  | {
      ok: false;
      type: "validation";
      fieldErrors: FieldErrors;
    }
  | {
      ok: false;
      type: "conflict" | "error";
      message: string;
    };

function toFieldErrors(input: unknown): FieldErrors {
  const parsed = ProjectsEditorSubmissionSchema.safeParse(input);

  if (parsed.success) {
    return {};
  }

  return parsed.error.issues.reduce<FieldErrors>((errors, issue) => {
    const path = issue.path.join(".").replace(/^payload\./, "");

    if (path) {
      errors[path] = [...(errors[path] ?? []), issue.message];
    }

    return errors;
  }, {});
}

/**
 * The browser can submit only the projects subset and an optimistic version.
 * The latest complete draft and authenticated actor remain server-side.
 */
export async function saveProjectsDraftAction(input: unknown): Promise<ProjectsDraftSaveResult> {
  await requireOwner();

  const submitted = ProjectsEditorSubmissionSchema.safeParse(input);

  if (!submitted.success) {
    return {
      ok: false,
      type: "validation",
      fieldErrors: toFieldErrors(input),
    };
  }

  return saveProjectsDraft(submitted.data);
}

async function saveProjectsDraft(
  submission: ProjectsEditorSubmission,
): Promise<ProjectsDraftSaveResult> {
  const latestDraft = await getDraftPortfolio();

  if (latestDraft.draftVersion !== submission.expectedDraftVersion) {
    return {
      ok: false,
      type: "conflict",
      message: "This draft changed in another session. Reload the latest draft before saving again.",
    };
  }

  const mergedDocument = mergeProjectsEditorPayload(latestDraft.document, submission.payload);

  try {
    await assertActiveCloudinaryAssetUrls(mergedDocument);

    const savedDraft = await saveStudioPortfolioDraft({
      document: mergedDocument,
      expectedDraftVersion: submission.expectedDraftVersion,
    });

    return {
      ok: true,
      draftVersion: savedDraft.draftVersion,
    };
  } catch (error) {
    if (error instanceof DraftVersionConflictError) {
      return {
        ok: false,
        type: "conflict",
        message: "This draft changed in another session. Reload the latest draft before saving again.",
      };
    }

    if (error instanceof InactiveCloudinaryAssetError) {
      return {
        ok: false,
        type: "error",
        message: error.message,
      };
    }

    return {
      ok: false,
      type: "error",
      message: "The projects draft could not be saved. Try again.",
    };
  }
}
