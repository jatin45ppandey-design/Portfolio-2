import { MediaManager } from "@/components/studio/MediaManager";
import { StudioHeader } from "@/components/studio/StudioHeader";
import { requireOwner } from "@/lib/auth/require-owner";
import { listStudioMediaAssets } from "@/lib/assets/repository";

export default async function StudioMediaPage() {
  await requireOwner();
  const assets = await listStudioMediaAssets();

  return (
    <main className="studio-shell">
      <StudioHeader />
      <section className="studio-content studio-collection-content" aria-labelledby="media-manager-title">
        <div className="studio-profile-intro">
          <div>
            <span className="studio-kicker">Private workspace / Media</span>
            <h1 id="media-manager-title">Media Manager</h1>
            <p>Upload and manage Cloudinary images without changing existing local portfolio assets.</p>
          </div>
          <span className="studio-status">Owner only</span>
        </div>
        <MediaManager
          key={assets.map((asset) => `${asset.id}:${asset.updatedAt}`).join("|")}
          initialAssets={assets}
        />
      </section>
    </main>
  );
}
