import { SkillsEditor } from "@/components/studio/SkillsEditor";
import { StudioHeader } from "@/components/studio/StudioHeader";
import { requireOwner } from "@/lib/auth/require-owner";
import { getDraftPortfolio } from "@/lib/content/repository";
import { getSkillsEditorPayload } from "@/lib/content/skills-editor";

export default async function StudioSkillsPage() {
  await requireOwner();
  const draft = await getDraftPortfolio();
  const initialValues = getSkillsEditorPayload(draft.document);

  return (
    <main className="studio-shell">
      <StudioHeader />
      <section className="studio-content studio-collection-content" aria-labelledby="skills-editor-title">
        <div className="studio-profile-intro">
          <div>
            <span className="studio-kicker">Private workspace / Skills</span>
            <h1 id="skills-editor-title">Skills editor</h1>
            <p>Edit grouped skills, visibility, emphasis, and deterministic ordering without proficiency ratings.</p>
          </div>
          <span className="studio-status">Draft only</span>
        </div>

        <SkillsEditor
          key={draft.draftVersion}
          initialValues={initialValues}
          initialDraftVersion={draft.draftVersion}
        />
      </section>
    </main>
  );
}
