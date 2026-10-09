import { FileQuestion } from "lucide-react";
import Link from "next/link";

import { StudioHeader } from "@/components/studio/StudioHeader";

export default function StudioNotFound() {
  return (
    <main className="studio-shell">
      <StudioHeader />
      <section className="studio-content studio-route-state" aria-labelledby="studio-not-found-title">
        <FileQuestion className="studio-route-state-icon" size={25} aria-hidden="true" />
        <span className="studio-kicker">Not found</span>
        <h1 id="studio-not-found-title">That Studio record is unavailable.</h1>
        <p>It may not exist, or the requested revision number may be invalid.</p>
        <div className="studio-route-state-actions">
          <Link className="studio-preview-button" href="/studio/history">
            Revision History
          </Link>
          <Link className="studio-preview-button studio-preview-button--secondary" href="/studio">
            Studio overview
          </Link>
        </div>
      </section>
    </main>
  );
}
