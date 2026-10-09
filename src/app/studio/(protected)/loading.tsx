import { StudioHeader } from "@/components/studio/StudioHeader";

export default function StudioLoading() {
  return (
    <main className="studio-shell" aria-busy="true">
      <StudioHeader />
      <section className="studio-content studio-route-state" aria-label="Loading Portfolio Studio">
        <span className="studio-kicker">Private workspace</span>
        <h1>Loading Studio...</h1>
        <div className="studio-loading-grid" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <p className="sr-only" role="status">
          Portfolio Studio is loading.
        </p>
      </section>
    </main>
  );
}
