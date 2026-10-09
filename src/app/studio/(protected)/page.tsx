import Link from "next/link";

import { StudioHeader } from "@/components/studio/StudioHeader";
import { requireOwner } from "@/lib/auth/require-owner";
import { comparePortfolioDocuments } from "@/lib/content/history";
import {
  getDraftPortfolio,
  getPortfolioStateSummary,
  getPublishedPortfolio,
} from "@/lib/content/repository";

const studioSections = [
  { name: "Profile", href: "/studio/profile", action: "Edit profile" },
  { name: "Preview Draft", href: "/studio/preview", action: "Review full draft" },
  { name: "Revision History", href: "/studio/history", action: "Review or restore revisions" },
  { name: "Projects", href: "/studio/projects", action: "Edit projects" },
  { name: "Skills", href: "/studio/skills", action: "Edit skills" },
  { name: "Education", href: "/studio/education", action: "Edit education" },
  { name: "Leadership", href: "/studio/leadership", action: "Edit leadership" },
  { name: "Certifications", href: "/studio/certifications", action: "Edit certifications" },
  { name: "Achievements", href: "/studio/achievements", action: "Edit achievements" },
  { name: "Media", href: "/studio/media", action: "Manage image assets" },
];

export default async function StudioDashboardPage() {
  const session = await requireOwner();
  const state = await getPortfolioStateSummary();
  const isConfigured = Boolean(state.publishedRevision);
  let draftStatus = "No published revision";

  if (state.publishedRevision) {
    const [draft, published] = await Promise.all([
      getDraftPortfolio(),
      getPublishedPortfolio(),
    ]);
    draftStatus = comparePortfolioDocuments(draft.document, published.document).length
      ? "Changes in draft"
      : "Matches published";
  }

  return (
    <main className="studio-shell">
      <StudioHeader />

      <section className="studio-content" aria-labelledby="studio-title">
        <div className="studio-intro">
          <div>
            <span className="studio-kicker">Private workspace</span>
            <h1 id="studio-title">Portfolio Studio</h1>
            <p>
              Signed in as <strong>{session.user.name ?? "Portfolio owner"}</strong>
              {session.user.login ? ` / ${session.user.login}` : null}
            </p>
          </div>
          <span className={isConfigured ? "studio-status" : "studio-status studio-status--error"}>
            {isConfigured ? "Portfolio state connected" : "Configuration needed"}
          </span>
        </div>

        {state.publishedRevision ? (
          <div className="studio-version-grid" aria-label="Portfolio revision status">
            <article>
              <span>Published</span>
              <strong>Revision {state.publishedRevision.version}</strong>
            </article>
            <article>
              <span>Draft</span>
              <strong>Version {state.draftVersion}</strong>
            </article>
            <article>
              <span>Draft status</span>
              <strong>{draftStatus}</strong>
            </article>
          </div>
        ) : (
          <p className="studio-config-error" role="alert">
            Portfolio state is missing. Verify the initial Studio seed before editing content.
          </p>
        )}

        <section className="studio-section-list" aria-labelledby="studio-sections-title">
          <div className="studio-section-heading">
            <div>
              <span className="studio-kicker">Content areas</span>
              <h2 id="studio-sections-title">Edit, review, and publish.</h2>
            </div>
            <span>Fixed portfolio structure</span>
          </div>

          <ul>
            {studioSections.map((section) => (
              <li className="studio-section-list-item--link" key={section.name}>
                <Link className="studio-section-link" href={section.href}>
                  <span>{section.name}</span>
                  <small>{section.action}</small>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </section>
    </main>
  );
}
