import "server-only";

import { requireOwner } from "@/lib/auth/require-owner";
import { normalizePortfolioActor, type PortfolioActor } from "@/lib/content/repository-helpers";

export async function requireAssetOwnerActor(): Promise<Required<PortfolioActor>> {
  const session = await requireOwner();

  return normalizePortfolioActor({
    githubId: session.user.githubId ?? "",
    login: session.user.login ?? null,
  });
}
