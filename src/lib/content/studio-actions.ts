"use server";

import { revalidatePath, updateTag } from "next/cache";

import { requireOwner } from "@/lib/auth/require-owner";

import {
  PORTFOLIO_PUBLISHED_CACHE_TAG,
  publishPortfolioDraft,
  savePortfolioDraft,
  type PublishPortfolioDraftInput,
  type SavePortfolioDraftInput,
} from "./repository";
import type { PortfolioActor } from "./repository-helpers";

type StudioSaveDraftInput = Omit<SavePortfolioDraftInput, "actor">;
type StudioPublishDraftInput = Omit<PublishPortfolioDraftInput, "actor">;

async function getAuthenticatedPortfolioActor(): Promise<PortfolioActor> {
  const session = await requireOwner();
  const githubId = session.user.githubId;

  if (!githubId) {
    throw new Error("The owner session is missing a GitHub ID.");
  }

  return {
    githubId,
    login: session.user.login ?? null,
  };
}

/**
 * Studio-only save entry point. The actor is derived from the owner session,
 * not accepted from client input.
 */
export async function saveStudioPortfolioDraft(input: StudioSaveDraftInput) {
  const actor = await getAuthenticatedPortfolioActor();

  return savePortfolioDraft({ ...input, actor });
}

/**
 * Studio-only publish entry point. Cache invalidation only happens after the
 * database transaction has committed successfully.
 */
export async function publishStudioPortfolioDraft(input: StudioPublishDraftInput) {
  const actor = await getAuthenticatedPortfolioActor();
  const publishedPortfolio = await publishPortfolioDraft({ ...input, actor });

  updateTag(PORTFOLIO_PUBLISHED_CACHE_TAG);
  revalidatePath("/");

  return publishedPortfolio;
}
