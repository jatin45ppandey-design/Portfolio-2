import { ProjectsEditor } from "@/components/studio/ProjectsEditor";
import { StudioHeader } from "@/components/studio/StudioHeader";
import { listActiveCloudinaryAssetOptions } from "@/lib/assets/repository";
import { requireOwner } from "@/lib/auth/require-owner";
import { getProjectsEditorPayload } from "@/lib/content/projects-editor";
import { getDraftPortfolio } from "@/lib/content/repository";

export default async function StudioProjectsPage() {
  await requireOwner();
  const [draft, mediaAssets] = await Promise.all([
    getDraftPortfolio(),
    listActiveCloudinaryAssetOptions(),
  ]);
  const initialValues = getProjectsEditorPayload(draft.document);

  return (
    <main className="studio-shell">
      <StudioHeader />
      <section className="studio-content studio-projects-content" aria-labelledby="projects-editor-title">
        <div className="studio-profile-intro">
          <div>
            <span className="studio-kicker">Private workspace / Projects</span>
            <h1 id="projects-editor-title">Projects editor</h1>
            <p>Update the fixed public projects section. Saving stays in draft until you publish from Preview Draft.</p>
          </div>
          <span className="studio-status">Draft only</span>
        </div>

        <ProjectsEditor
          key={draft.draftVersion}
          initialValues={initialValues}
          initialDraftVersion={draft.draftVersion}
          initialMediaAssets={mediaAssets}
        />
      </section>
    </main>
  );
}
