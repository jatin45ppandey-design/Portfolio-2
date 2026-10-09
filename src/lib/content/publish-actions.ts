"use server";

import { z } from "zod";

import { requireOwner } from "@/lib/auth/require-owner";

import { DraftVersionConflictError } from "./repository-errors";
import { publishStudioPortfolioDraft } from "./studio-actions";

const PublishDraftSubmissionSchema = z
  .object({
    expectedDraftVersion: z.number().int().positive(),
  })
  .strict();

export type PublishDraftResult =
  | {
      ok: true;
      revisionVersion: number;
    }
  | {
      ok: false;
      type: "conflict" | "error";
      message: string;
    };

/**
 * Owner-only Studio boundary for publishing a previewed draft. The expected
 * draft version is the only browser-controlled value; the authenticated actor
 * and cache invalidation remain server-side.
 */
export async function publishDraftAction(input: unknown): Promise<PublishDraftResult> {
  await requireOwner();

  const submission = PublishDraftSubmissionSchema.safeParse(input);

  if (!submission.success) {
    return {
      ok: false,
      type: "error",
      message: "The draft could not be published. Reload the preview and try again.",
    };
  }

  try {
    const published = await publishStudioPortfolioDraft(submission.data);

    return {
      ok: true,
      revisionVersion: published.revisionVersion,
    };
  } catch (error) {
    if (error instanceof DraftVersionConflictError) {
      return {
        ok: false,
        type: "conflict",
        message: "This draft changed after this preview was opened. Reload the preview before publishing.",
      };
    }

    return {
      ok: false,
      type: "error",
      message: "The draft could not be published. Try again.",
    };
  }
}
