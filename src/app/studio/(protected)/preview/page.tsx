import Link from "next/link";

import { PortfolioView } from "@/components/portfolio/PortfolioView";
import { StudioPreviewControls } from "@/components/studio/StudioPreviewControls";
import { requireOwner } from "@/lib/auth/require-owner";
import { getDraftPortfolio } from "@/lib/content/repository";

export default async function StudioPreviewPage() {
  await requireOwner();
  const draft = await getDraftPortfolio();

  return (
    <div className="studio-draft-preview">
      <aside className="studio-draft-preview-banner" aria-label="Studio draft preview">
        <div className="studio-draft-preview-context">
          <p>{"Draft preview \u2014 not published"}</p>
          <span>Draft version {draft.draftVersion}</span>
        </div>
        <div className="studio-draft-preview-actions">
          <Link href="/studio">Back to Studio</Link>
          <StudioPreviewControls key={draft.draftVersion} expectedDraftVersion={draft.draftVersion} />
        </div>
      </aside>
      <PortfolioView document={draft.document} />
    </div>
  );
}
