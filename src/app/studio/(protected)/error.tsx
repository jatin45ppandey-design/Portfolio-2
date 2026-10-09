"use client";

import { RefreshCw, TriangleAlert } from "lucide-react";
import Link from "next/link";

type StudioErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function StudioError({ reset }: StudioErrorProps) {
  return (
    <main className="studio-shell">
      <header className="studio-header">
        <div className="studio-header-inner">
          <Link className="studio-brand" href="/studio" aria-label="Portfolio Studio home">
            <span>JP</span>
            Portfolio Studio
          </Link>
        </div>
      </header>
      <section className="studio-content studio-route-state" aria-labelledby="studio-error-title">
        <TriangleAlert className="studio-route-state-icon" size={25} aria-hidden="true" />
        <span className="studio-kicker">Studio unavailable</span>
        <h1 id="studio-error-title">This workspace could not be loaded.</h1>
        <p>No database details were exposed. Retry the request or return to the Studio overview.</p>
        <div className="studio-route-state-actions">
          <button className="studio-preview-button" type="button" onClick={reset}>
            <RefreshCw size={15} aria-hidden="true" />
            Try again
          </button>
          <Link className="studio-preview-button studio-preview-button--secondary" href="/studio">
            Studio overview
          </Link>
        </div>
      </section>
    </main>
  );
}
