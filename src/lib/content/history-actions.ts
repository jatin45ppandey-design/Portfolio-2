"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireOwner } from "@/lib/auth/require-owner";

import { restorePortfolioRevisionAsDraft } from "./history-repository";
import {
  DraftVersionConflictError,
  InvalidStoredPortfolioPayloadError,
  PortfolioRevisionNotFoundError,
} from "./repository-errors";

const RestoreRevisionSubmissionSchema = z
  .object({
    revisionVersion: z.number().int().positive(),
    expectedDraftVersion: z.number().int().positive(),
  })
  .strict();

export type RestoreRevisionResult =
  | { ok: true; draftVersion: number }
  | { ok: false; type: "conflict" | "error"; message: string };

export async function restoreRevisionToDraftAction(input: unknown): Promise<RestoreRevisionResult> {
  const session = await requireOwner();
  const submission = RestoreRevisionSubmissionSchema.safeParse(input);
  const githubId = session.user.githubId;

  if (!submission.success || !githubId) {
    return {
      ok: false,
      type: "error",
      message: "The revision could not be restored. Reload Revision History and try again.",
    };
  }

  try {
    const restored = await restorePortfolioRevisionAsDraft({
      ...submission.data,
      actor: {
        githubId,
        login: session.user.login ?? null,
      },
    });

    revalidatePath("/studio");
    revalidatePath("/studio/history");
    revalidatePath("/studio/preview");

    return { ok: true, draftVersion: restored.draftVersion };
  } catch (error) {
    if (error instanceof DraftVersionConflictError) {
      return {
        ok: false,
        type: "conflict",
        message:
          "The draft changed after this revision page was opened. Reload the latest draft before restoring.",
      };
    }

    if (
      error instanceof PortfolioRevisionNotFoundError ||
      error instanceof InvalidStoredPortfolioPayloadError
    ) {
      return {
        ok: false,
        type: "error",
        message: "This historical revision is unavailable or invalid and was not restored.",
      };
    }

    return {
      ok: false,
      type: "error",
      message: "The revision could not be restored. Try again.",
    };
  }
}
