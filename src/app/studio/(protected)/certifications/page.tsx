import { CertificationsEditor } from "@/components/studio/CertificationsEditor";
import { StudioHeader } from "@/components/studio/StudioHeader";
import { listActiveCloudinaryAssetOptions } from "@/lib/assets/repository";
import { requireOwner } from "@/lib/auth/require-owner";
import { getCertificationsEditorPayload } from "@/lib/content/certifications-editor";
import { getDraftPortfolio } from "@/lib/content/repository";

export default async function StudioCertificationsPage() {
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
        aria-labelledby="certifications-editor-title"
      >
        <div className="studio-profile-intro">
          <div>
            <span className="studio-kicker">Private workspace / Certifications</span>
            <h1 id="certifications-editor-title">Certifications editor</h1>
            <p>Edit technical credentials and select which existing local-image cards are featured.</p>
          </div>
          <span className="studio-status">Draft only</span>
        </div>
        <CertificationsEditor
          key={draft.draftVersion}
          initialValues={getCertificationsEditorPayload(draft.document)}
          initialDraftVersion={draft.draftVersion}
          initialMediaAssets={mediaAssets}
        />
      </section>
    </main>
  );
}
