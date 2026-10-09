import { ArrowRight, Clock3, GitBranch, RotateCcw } from "lucide-react";
import Link from "next/link";

import { StudioHeader } from "@/components/studio/StudioHeader";
import { requireOwner } from "@/lib/auth/require-owner";
import {
  listPortfolioRevisions,
  listRecentStudioActivity,
} from "@/lib/content/history-repository";

const historyDateFormatter = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Kolkata",
});

function formatHistoryDate(value: Date): string {
  return historyDateFormatter.format(value);
}

export default async function StudioHistoryPage() {
  await requireOwner();
  const [revisions, activity] = await Promise.all([
    listPortfolioRevisions(),
    listRecentStudioActivity(),
  ]);

  return (
    <main className="studio-shell">
      <StudioHeader />

      <section className="studio-content studio-history-content" aria-labelledby="history-title">
        <div className="studio-profile-editor-topline">
          <Link className="studio-back-link" href="/studio">
            ← Back to Studio
          </Link>
          <Link className="studio-preview-link" href="/studio/preview">
            Preview Draft
          </Link>
        </div>

        <div className="studio-intro studio-history-intro">
          <div>
            <span className="studio-kicker">Version safety</span>
            <h1 id="history-title">Revision History</h1>
            <p>Review immutable published revisions or restore one into the editable draft.</p>
          </div>
          <span className="studio-status">{revisions.length} published revisions</span>
        </div>

        <div className="studio-history-layout">
          <section className="studio-history-list" aria-labelledby="revision-list-title">
            <div className="studio-history-panel-heading">
              <div>
                <span className="studio-kicker">Newest first</span>
                <h2 id="revision-list-title">Published revisions</h2>
              </div>
              <GitBranch size={19} aria-hidden="true" />
            </div>

            {revisions.length ? (
              <ol>
                {revisions.map((revision) => (
                  <li key={revision.version}>
                    <Link href={`/studio/history/${revision.version}`}>
                      <div className="studio-history-revision-title">
                        <strong>Revision {revision.version}</strong>
                        {revision.isCurrentPublished ? (
                          <span className="studio-history-current">Current published</span>
                        ) : null}
                      </div>
                      <p>
                        Published by {revision.createdByLogin ? `@${revision.createdByLogin}` : "GitHub owner"}
                      </p>
                      <div className="studio-history-revision-meta">
                        <time dateTime={revision.publishedAt.toISOString()}>
                          {formatHistoryDate(revision.publishedAt)}
                        </time>
                        {revision.rollbackOfVersion ? (
                          <span>
                            <RotateCcw size={13} aria-hidden="true" />
                            From revision {revision.rollbackOfVersion}
                          </span>
                        ) : null}
                      </div>
                      {revision.note ? <small>{revision.note}</small> : null}
                      <ArrowRight className="studio-history-arrow" size={18} aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="studio-history-empty">No published revisions are available yet.</p>
            )}
          </section>

          <aside className="studio-history-activity" aria-labelledby="recent-activity-title">
            <div className="studio-history-panel-heading">
              <div>
                <span className="studio-kicker">Audit trail</span>
                <h2 id="recent-activity-title">Recent activity</h2>
              </div>
              <Clock3 size={18} aria-hidden="true" />
            </div>

            {activity.length ? (
              <ul>
                {activity.map((event, index) => (
                  <li key={`${event.createdAt.toISOString()}-${event.action}-${index}`}>
                    <strong>{event.description}</strong>
                    <span>
                      {event.actorLogin ? `@${event.actorLogin}` : "GitHub owner"} ·{" "}
                      <time dateTime={event.createdAt.toISOString()}>
                        {formatHistoryDate(event.createdAt)}
                      </time>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="studio-history-empty">No recent Studio activity is available.</p>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}
