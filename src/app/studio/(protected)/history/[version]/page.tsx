import Link from "next/link";
import { notFound } from "next/navigation";

import { RestoreRevisionControl } from "@/components/studio/RestoreRevisionControl";
import { StudioHeader } from "@/components/studio/StudioHeader";
import { requireOwner } from "@/lib/auth/require-owner";
import { comparePortfolioDocuments } from "@/lib/content/history";
import { getHistoricalPortfolioRevision } from "@/lib/content/history-repository";
import { getDraftPortfolio, getPublishedPortfolio } from "@/lib/content/repository";

const detailDateFormatter = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Kolkata",
});

type StudioRevisionDetailPageProps = {
  params: Promise<{ version: string }>;
};

function parseRevisionVersion(value: string): number | null {
  if (!/^[1-9]\d*$/.test(value)) {
    return null;
  }

  const version = Number(value);
  return Number.isSafeInteger(version) ? version : null;
}

function VisibilityLabel({ visible }: { visible: boolean }) {
  return (
    <span className={visible ? "studio-history-visible" : "studio-history-hidden"}>
      {visible ? "Visible" : "Hidden"}
    </span>
  );
}

export default async function StudioRevisionDetailPage({ params }: StudioRevisionDetailPageProps) {
  await requireOwner();
  const { version: versionParam } = await params;
  const version = parseRevisionVersion(versionParam);

  if (!version) {
    notFound();
  }

  const [revision, draft, published] = await Promise.all([
    getHistoricalPortfolioRevision(version),
    getDraftPortfolio(),
    getPublishedPortfolio(),
  ]);

  if (!revision) {
    notFound();
  }

  const document = revision.document;
  const changedSections = comparePortfolioDocuments(document, published.document);

  return (
    <main className="studio-shell">
      <StudioHeader />

      <section className="studio-content studio-history-content" aria-labelledby="revision-title">
        <div className="studio-profile-editor-topline">
          <Link className="studio-back-link" href="/studio/history">
            ← Revision History
          </Link>
          <span className="studio-draft-version">Current draft version {draft.draftVersion}</span>
        </div>

        <div className="studio-history-readonly-banner">
          <span>Historical revision — read only</span>
          <small>Viewing a saved published snapshot. Changes can only be made after restoring it as a draft.</small>
        </div>

        <div className="studio-intro studio-history-detail-intro">
          <div>
            <span className="studio-kicker">Published snapshot</span>
            <h1 id="revision-title">Revision {revision.version}</h1>
            <p>
              Published by {revision.createdByLogin ? `@${revision.createdByLogin}` : "GitHub owner"} on{" "}
              <time dateTime={revision.publishedAt.toISOString()}>
                {detailDateFormatter.format(revision.publishedAt)}
              </time>
              .
            </p>
          </div>
          {revision.isCurrentPublished ? (
            <span className="studio-status">Current published</span>
          ) : null}
        </div>

        <div className="studio-history-detail-actions">
          <RestoreRevisionControl
            key={`${revision.version}-${draft.draftVersion}`}
            revisionVersion={revision.version}
            expectedDraftVersion={draft.draftVersion}
          />
        </div>

        <section className="studio-history-comparison" aria-labelledby="comparison-title">
          <span className="studio-kicker">Compared with revision {published.revisionVersion}</span>
          <h2 id="comparison-title">Current published comparison</h2>
          {changedSections.length ? (
            <p>Different content areas: {changedSections.join(", ")}.</p>
          ) : (
            <p>This snapshot matches the current published portfolio.</p>
          )}
          {revision.rollbackOfVersion ? (
            <small>Recorded as originating from revision {revision.rollbackOfVersion}.</small>
          ) : null}
          {revision.note ? <small>Publication note: {revision.note}</small> : null}
        </section>

        <section className="studio-history-summary" aria-labelledby="revision-summary-title">
          <div className="studio-history-panel-heading studio-history-summary-heading">
            <div>
              <span className="studio-kicker">Validated PortfolioDocument</span>
              <h2 id="revision-summary-title">Revision content summary</h2>
            </div>
          </div>

          <div className="studio-history-summary-grid">
            <article>
              <span className="studio-kicker">Profile and status</span>
              <h3>{document.profile.name}</h3>
              <p>{document.profile.role}</p>
              <dl>
                <div><dt>Status</dt><dd>{document.profile.status}</dd></div>
                <div><dt>Location</dt><dd>{document.profile.location}</dd></div>
                <div><dt>Current focus</dt><dd>{document.hero.currentFocus}</dd></div>
              </dl>
            </article>

            <article>
              <span className="studio-kicker">Projects</span>
              <h3>{document.projects.length} project entries</h3>
              <ul>
                {[...document.projects].sort((a, b) => a.order - b.order).map((project) => (
                  <li key={project.id}>
                    <span>{project.title}{project.featured ? " · Featured" : ""}</span>
                    <VisibilityLabel visible={project.visible} />
                  </li>
                ))}
              </ul>
            </article>

            <article>
              <span className="studio-kicker">Skills</span>
              <h3>{document.skills.heading}</h3>
              <ul>
                {[...document.skills.groups].sort((a, b) => a.order - b.order).map((group) => (
                  <li key={group.id}>
                    <span>{group.name}: {[...group.skills].sort((a, b) => a.order - b.order).map((skill) => skill.name).join(", ")}</span>
                    <VisibilityLabel visible={group.visible} />
                  </li>
                ))}
              </ul>
            </article>

            <article>
              <span className="studio-kicker">Education</span>
              <h3>{document.education.degree.title}</h3>
              <p>{document.education.degree.institution}</p>
              <dl>
                <div><dt>Current</dt><dd>{document.education.degree.current}</dd></div>
                <div><dt>Graduation</dt><dd>{document.education.degree.graduation}</dd></div>
                <div><dt>SGPA entries</dt><dd>{document.education.degree.sgpa.length}</dd></div>
                <div><dt>School entries</dt><dd>{document.education.school.length}</dd></div>
              </dl>
            </article>

            <article>
              <span className="studio-kicker">Leadership</span>
              <h3>{document.leadership.role}</h3>
              <p>{document.leadership.organization}</p>
              <dl>
                <div><dt>Status</dt><dd>{document.leadership.status}</dd></div>
                <div><dt>Started</dt><dd>{document.leadership.start}</dd></div>
                <div><dt>Responsibilities</dt><dd>{document.leadership.responsibilities.length}</dd></div>
              </dl>
            </article>

            <article>
              <span className="studio-kicker">Certifications</span>
              <h3>{document.certifications.items.length} certification entries</h3>
              <ul>
                {[...document.certifications.items].sort((a, b) => a.order - b.order).map((certificate) => (
                  <li key={certificate.id}>
                    <span>{certificate.title} · {certificate.issuer}</span>
                    <VisibilityLabel visible={certificate.visible} />
                  </li>
                ))}
              </ul>
            </article>

            <article>
              <span className="studio-kicker">Achievements</span>
              <h3>{document.achievements.items.length} achievement entries</h3>
              <ul>
                {[...document.achievements.items].sort((a, b) => a.order - b.order).map((achievement) => (
                  <li key={achievement.id}>
                    <span>{achievement.position} · {achievement.title}</span>
                    <VisibilityLabel visible={achievement.visible} />
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </section>
      </section>
    </main>
  );
}
