import { AchievementsEditor } from "@/components/studio/AchievementsEditor";
import { StudioHeader } from "@/components/studio/StudioHeader";
import { listActiveCloudinaryAssetOptions } from "@/lib/assets/repository";
import { requireOwner } from "@/lib/auth/require-owner";
import { getAchievementsEditorPayload } from "@/lib/content/achievements-editor";
import { getDraftPortfolio } from "@/lib/content/repository";

export default async function StudioAchievementsPage() {
  await requireOwner();
  const [draft, mediaAssets] = await Promise.all([
    getDraftPortfolio(),
    listActiveCloudinaryAssetOptions(),
  ]);

  return (
    <main className="studio-shell">
      <StudioHeader />
      <section
        className="studio-content studio-collection-content"
        aria-labelledby="achievements-editor-title"
      >
        <div className="studio-profile-intro">
          <div>
            <span className="studio-kicker">Private workspace / Achievements</span>
            <h1 id="achievements-editor-title">Achievements editor</h1>
            <p>Edit sports results and their existing local certificate-image cards.</p>
          </div>
          <span className="studio-status">Draft only</span>
        </div>
        <AchievementsEditor
          key={draft.draftVersion}
          initialValues={getAchievementsEditorPayload(draft.document)}
          initialDraftVersion={draft.draftVersion}
          initialMediaAssets={mediaAssets}
        />
      </section>
    </main>
  );
}
