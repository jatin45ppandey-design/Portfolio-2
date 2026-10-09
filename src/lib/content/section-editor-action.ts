import "server-only";

import type { z } from "zod";

import { requireOwner } from "@/lib/auth/require-owner";
import {
  InactiveCloudinaryAssetError,
  assertActiveCloudinaryAssetUrls,
} from "@/lib/assets/repository";
import type { PortfolioDocument } from "@/lib/content/schema";

import { DraftVersionConflictError } from "./repository-errors";
import { getDraftPortfolio } from "./repository";
import { saveStudioPortfolioDraft } from "./studio-actions";

type FieldErrors = Record<string, string[]>;

type SectionEditorSubmission<TPayload> = {
  payload: TPayload;
  expectedDraftVersion: number;
};

export type SectionDraftSaveResult =
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

type SectionEditorActionConfig<TPayload> = {
  schema: z.ZodType<SectionEditorSubmission<TPayload>>;
  merge: (document: PortfolioDocument, payload: TPayload) => PortfolioDocument;
  errorLabel: string;
  validateAssetReferences?: boolean;
};

function toFieldErrors<TPayload>(
  input: unknown,
  schema: z.ZodType<SectionEditorSubmission<TPayload>>,
): FieldErrors {
  const parsed = schema.safeParse(input);

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

export async function saveStudioSectionDraft<TPayload>(
  input: unknown,
  config: SectionEditorActionConfig<TPayload>,
): Promise<SectionDraftSaveResult> {
  await requireOwner();

  const submitted = config.schema.safeParse(input);

  if (!submitted.success) {
    return {
      ok: false,
      type: "validation",
      fieldErrors: toFieldErrors(input, config.schema),
    };
  }

  const latestDraft = await getDraftPortfolio();

  if (latestDraft.draftVersion !== submitted.data.expectedDraftVersion) {
    return {
      ok: false,
      type: "conflict",
      message: "This draft changed in another session. Reload the latest draft before saving again.",
    };
  }

  try {
    const mergedDocument = config.merge(latestDraft.document, submitted.data.payload);

    if (config.validateAssetReferences) {
      await assertActiveCloudinaryAssetUrls(mergedDocument);
    }

    const savedDraft = await saveStudioPortfolioDraft({
      document: mergedDocument,
      expectedDraftVersion: submitted.data.expectedDraftVersion,
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
      message: `The ${config.errorLabel} draft could not be saved. Try again.`,
    };
  }
}
