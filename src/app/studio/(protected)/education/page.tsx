import { EducationEditor } from "@/components/studio/EducationEditor";
import { StudioHeader } from "@/components/studio/StudioHeader";
import { requireOwner } from "@/lib/auth/require-owner";
import { getEducationEditorPayload } from "@/lib/content/education-editor";
import { getDraftPortfolio } from "@/lib/content/repository";

export default async function StudioEducationPage() {
  await requireOwner();
  const draft = await getDraftPortfolio();

  return (
    <main className="studio-shell">
      <StudioHeader />
      <section className="studio-content studio-collection-content" aria-labelledby="education-editor-title">
        <div className="studio-profile-intro">
          <div>
            <span className="studio-kicker">Private workspace / Education</span>
            <h1 id="education-editor-title">Education editor</h1>
            <p>Edit the existing degree, semester results, and school records without changing the public structure.</p>
          </div>
          <span className="studio-status">Draft only</span>
        </div>
        <EducationEditor
          key={draft.draftVersion}
          initialValues={getEducationEditorPayload(draft.document)}
          initialDraftVersion={draft.draftVersion}
        />
      </section>
    </main>
  );
}
