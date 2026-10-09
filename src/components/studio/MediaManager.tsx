"use client";

import { Check, Clipboard, ExternalLink, RotateCcw, Save, Trash2, TriangleAlert } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  transitionAssetStatusAction,
  updateAssetAltTextAction,
} from "@/lib/assets/actions";
import type { StudioAssetStatus, StudioMediaAsset } from "@/lib/assets/types";

import { AssetUploadControl } from "./AssetUploadControl";

type MediaManagerProps = {
  initialAssets: StudioMediaAsset[];
};

type ManagerFeedback = {
  tone: "success" | "error";
  message: string;
};

function formatBytes(bytes: number | null) {
  if (bytes === null) {
    return "Size unavailable";
  }

  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function MediaAssetCard({
  asset,
  onUpdated,
  onFeedback,
}: {
  asset: StudioMediaAsset;
  onUpdated: (assetId: string, update: Partial<StudioMediaAsset>) => void;
  onFeedback: (feedback: ManagerFeedback) => void;
}) {
  const [altText, setAltText] = useState(asset.altText ?? "");
  const [isPending, setIsPending] = useState(false);
  const references = [...asset.usage.draft, ...asset.usage.published];

  const saveAltText = async () => {
    setIsPending(true);
    const result = await updateAssetAltTextAction({ assetId: asset.id, altText });
    setIsPending(false);

    if (!result.ok) {
      onFeedback({ tone: "error", message: result.message });
      return;
    }

    onUpdated(asset.id, { altText: result.altText ?? altText });
    onFeedback({ tone: "success", message: "Asset alt text updated." });
  };

  const transition = async (target: StudioAssetStatus) => {
    const verb = target === "DELETED" ? "soft-delete" : target === "ORPHANED" ? "mark as orphaned" : "restore";
    if (!window.confirm(`Confirm you want to ${verb} this asset?`)) {
      return;
    }

    setIsPending(true);
    const result = await transitionAssetStatusAction({ assetId: asset.id, target });
    setIsPending(false);

    if (!result.ok) {
      onFeedback({ tone: "error", message: result.message });
      return;
    }

    onUpdated(asset.id, {
      status: result.status ?? target,
      deletedAt: result.deletedAt ?? null,
    });
    onFeedback({
      tone: "success",
      message:
        target === "DELETED"
          ? "Asset soft-deleted. The Cloudinary file was not physically removed."
          : `Asset status changed to ${target.toLowerCase()}.`,
    });
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(asset.url);
      onFeedback({ tone: "success", message: "Asset URL copied." });
    } catch {
      onFeedback({ tone: "error", message: "The asset URL could not be copied." });
    }
  };

  return (
    <article className="studio-media-card">
      <figure>
        <Image src={asset.url} alt="" fill sizes="(max-width: 700px) 100vw, 320px" className="cover-image" />
        <span className={`studio-media-status studio-media-status--${asset.status.toLowerCase()}`}>
          {asset.status}
        </span>
      </figure>
      <div className="studio-media-card-body">
        <div className="studio-media-card-heading">
          <div>
            <h2>{asset.originalName || asset.publicId}</h2>
            <p>{asset.publicId}</p>
          </div>
          <a href={asset.url} target="_blank" rel="noreferrer" aria-label="Open image in a new tab">
            <ExternalLink size={15} aria-hidden="true" />
          </a>
        </div>

        <dl className="studio-media-meta">
          <div><dt>Format</dt><dd>{asset.format?.toUpperCase() || "Unknown"}</dd></div>
          <div><dt>Dimensions</dt><dd>{asset.width && asset.height ? `${asset.width} × ${asset.height}` : "Unknown"}</dd></div>
          <div><dt>File size</dt><dd>{formatBytes(asset.bytes)}</dd></div>
        </dl>

        <label className="studio-media-alt-field">
          <span>Default alt text</span>
          <textarea
            className="studio-form-control studio-form-control--textarea"
            rows={3}
            maxLength={240}
            value={altText}
            disabled={isPending || asset.status === "DELETED"}
            onChange={(event) => setAltText(event.target.value)}
          />
        </label>

        <div className="studio-media-usage">
          <span>Usage</span>
          {references.length > 0 ? (
            <ul>
              {asset.usage.draft.map((location) => <li key={`draft-${location}`}>Draft / {location}</li>)}
              {asset.usage.published.map((location) => <li key={`published-${location}`}>Published / {location}</li>)}
            </ul>
          ) : (
            <p>Not referenced by the current draft or published revision.</p>
          )}
        </div>

        <div className="studio-media-actions">
          <button type="button" disabled={isPending || asset.status === "DELETED" || !altText.trim()} onClick={saveAltText}>
            <Save size={14} aria-hidden="true" /> Save alt text
          </button>
          <button type="button" onClick={copyUrl}>
            <Clipboard size={14} aria-hidden="true" /> Copy URL
          </button>
          {asset.status === "ACTIVE" ? (
            <button
              type="button"
              disabled={isPending || references.length > 0}
              title={references.length > 0 ? "Remove all current draft and published references first." : undefined}
              onClick={() => transition("ORPHANED")}
            >
              <Trash2 size={14} aria-hidden="true" /> Mark orphaned
            </button>
          ) : null}
          {asset.status === "ORPHANED" ? (
            <>
              <button type="button" disabled={isPending} onClick={() => transition("ACTIVE")}>
                <RotateCcw size={14} aria-hidden="true" /> Restore
              </button>
              <button className="is-danger" type="button" disabled={isPending} onClick={() => transition("DELETED")}>
                <Trash2 size={14} aria-hidden="true" /> Soft delete
              </button>
            </>
          ) : null}
          {asset.status === "DELETED" ? (
            <button type="button" disabled={isPending} onClick={() => transition("ACTIVE")}>
              <RotateCcw size={14} aria-hidden="true" /> Restore
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function MediaManager({ initialAssets }: MediaManagerProps) {
  const router = useRouter();
  const [assets, setAssets] = useState(initialAssets);
  const [feedback, setFeedback] = useState<ManagerFeedback | null>(null);

  const onUploaded = () => {
    setFeedback({ tone: "success", message: "Image uploaded and recorded. Refreshing the library…" });
    router.refresh();
  };

  const updateAsset = (assetId: string, update: Partial<StudioMediaAsset>) => {
    setAssets((current) =>
      current.map((asset) => (asset.id === assetId ? { ...asset, ...update } : asset)),
    );
  };

  return (
    <div className="studio-media-manager">
      <section className="studio-media-upload" aria-labelledby="media-upload-title">
        <div className="studio-editor-group-heading">
          <span>Secure upload</span>
          <h2 id="media-upload-title">Add a portfolio image</h2>
          <p>The file is validated server-side, uploaded with signed Cloudinary credentials, then recorded in Neon.</p>
        </div>
        <AssetUploadControl onUploaded={onUploaded} />
      </section>

      {feedback ? (
        <div
          className={`studio-form-notice studio-form-notice--${feedback.tone}`}
          role={feedback.tone === "error" ? "alert" : "status"}
        >
          {feedback.tone === "success" ? <Check size={17} aria-hidden="true" /> : <TriangleAlert size={17} aria-hidden="true" />}
          <span>{feedback.message}</span>
        </div>
      ) : null}

      <section className="studio-media-library" aria-labelledby="media-library-title">
        <div className="studio-media-library-heading">
          <div>
            <span>Cloudinary library</span>
            <h2 id="media-library-title">Managed assets</h2>
          </div>
          <strong>{assets.length} records</strong>
        </div>

        {assets.length > 0 ? (
          <div className="studio-media-grid">
            {assets.map((asset) => (
              <MediaAssetCard
                asset={asset}
                key={asset.id}
                onUpdated={updateAsset}
                onFeedback={setFeedback}
              />
            ))}
          </div>
        ) : (
          <p className="studio-media-empty">No Cloudinary assets have been uploaded yet. Local `/images/...` content remains valid.</p>
        )}
      </section>
    </div>
  );
}
