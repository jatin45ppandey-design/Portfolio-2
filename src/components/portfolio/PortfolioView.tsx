import type { PortfolioDocument } from "@/lib/content/schema";
import CinematicPortfolio from "./CinematicPortfolio";

/** Used identically for the published website and Studio draft preview.
 * Studio and server-side content validation stay unchanged.
 */
export function PortfolioView({ document }: { document: PortfolioDocument }) {
  return <CinematicPortfolio document={document} />;
}
