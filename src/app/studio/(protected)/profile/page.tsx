import { ProfileEditor } from "@/components/studio/ProfileEditor";
import { StudioHeader } from "@/components/studio/StudioHeader";
import { requireOwner } from "@/lib/auth/require-owner";
import { getProfileEditorPayload } from "@/lib/content/profile-editor";
import { getDraftPortfolio } from "@/lib/content/repository";

export default async function StudioProfilePage() {
  await requireOwner();
  const draft = await getDraftPortfolio();
  const initialValues = getProfileEditorPayload(draft.document);

  return (
    <main className="studio-shell">
      <StudioHeader />
      <section className="studio-content studio-profile-content" aria-labelledby="profile-editor-title">
        <div className="studio-profile-intro">
          <div>
            <span className="studio-kicker">Private workspace / Profile</span>
            <h1 id="profile-editor-title">Profile editor</h1>
            <p>Update profile-related draft content only. Publishing remains a separate step.</p>
          </div>
          <span className="studio-status">Draft only</span>
        </div>

        <ProfileEditor
          key={draft.draftVersion}
          initialValues={initialValues}
          initialDraftVersion={draft.draftVersion}
        />
      </section>
    </main>
  );
}
