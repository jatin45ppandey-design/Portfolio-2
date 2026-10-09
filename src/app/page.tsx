import { connection } from "next/server";

import { PortfolioView } from "@/components/portfolio/PortfolioView";
import type { PortfolioDocument } from "@/lib/content/schema";
import { portfolio } from "@/lib/portfolio";

async function getPublicPortfolioDocument(): Promise<PortfolioDocument> {
  try {
    const { getPublishedPortfolioCached } = await import("@/lib/content/repository");
    const publishedPortfolio = await getPublishedPortfolioCached();

    return publishedPortfolio.document;
  } catch {
    // Public availability may fall back only to the repository's trusted
    // canonical static document. Studio reads and mutations never do this.
    console.error("Published portfolio read failed; rendering the static portfolio fallback.");

    return portfolio;
  }
}

export default async function Home() {
  // The published portfolio is runtime state. Waiting for a request prevents a
  // temporary build-time database outage from baking the static fallback into
  // the deployment while the explicitly tagged published-data cache stays in use.
  await connection();

  const document = await getPublicPortfolioDocument();

  return <PortfolioView document={document} />;
}
