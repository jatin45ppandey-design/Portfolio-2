import { LeadershipEditor } from "@/components/studio/LeadershipEditor";
import { StudioHeader } from "@/components/studio/StudioHeader";
import { listActiveCloudinaryAssetOptions } from "@/lib/assets/repository";
import { requireOwner } from "@/lib/auth/require-owner";
import { getLeadershipEditorPayload } from "@/lib/content/leadership-editor";
import { getDraftPortfolio } from "@/lib/content/repository";

export default async function StudioLeadershipPage() {
  await requireOwner();
  const [draft, mediaAssets] = await Promise.all([
    getDraftPortfolio(),
    listActiveCloudinaryAssetOptions(),
  ]);

  return (
    <main className="studio-shell">
      <StudioHeader />
      <section className="studio-content studio-collection-content" aria-labelledby="leadership-editor-title">
        <div className="studio-profile-intro">
          <div>
            <span className="studio-kicker">Private workspace / Leadership</span>
            <h1 id="leadership-editor-title">Leadership editor</h1>
            <p>Edit the single leadership record defined by the current portfolio schema.</p>
          </div>
          <span className="studio-status">Draft only</span>
        </div>
        <LeadershipEditor
          key={draft.draftVersion}
          initialValues={getLeadershipEditorPayload(draft.document)}
          initialDraftVersion={draft.draftVersion}
          initialMediaAssets={mediaAssets}
        />
      </section>
    </main>
  );
}
