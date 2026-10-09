"use server";

import { requireOwner } from "@/lib/auth/require-owner";

import { DraftVersionConflictError } from "./repository-errors";
import { getDraftPortfolio } from "./repository";
import {
  mergeProfileEditorPayload,
  ProfileEditorSubmissionSchema,
  type ProfileEditorSubmission,
} from "./profile-editor";
import { saveStudioPortfolioDraft } from "./studio-actions";

type FieldErrors = Record<string, string[]>;

export type ProfileDraftSaveResult =
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
  const parsed = ProfileEditorSubmissionSchema.safeParse(input);

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
 * The browser sends only ProfileEditorSubmission. This action reloads the
 * authoritative draft before merging and persists through the owner-only
 * generic draft action, so client input cannot replace other sections.
 */
export async function saveProfileDraftAction(input: unknown): Promise<ProfileDraftSaveResult> {
  await requireOwner();

  const submitted = ProfileEditorSubmissionSchema.safeParse(input);

  if (!submitted.success) {
    return {
      ok: false,
      type: "validation",
      fieldErrors: toFieldErrors(input),
    };
  }

  return saveProfileDraft(submitted.data);
}

async function saveProfileDraft(
  submission: ProfileEditorSubmission,
): Promise<ProfileDraftSaveResult> {
  const latestDraft = await getDraftPortfolio();

  if (latestDraft.draftVersion !== submission.expectedDraftVersion) {
    return {
      ok: false,
      type: "conflict",
      message: "This draft changed in another session. Reload the latest draft before saving again.",
    };
  }

  const mergedDocument = mergeProfileEditorPayload(latestDraft.document, submission.payload);

  try {
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

    return {
      ok: false,
      type: "error",
      message: "The draft could not be saved. Try again.",
    };
  }
}
