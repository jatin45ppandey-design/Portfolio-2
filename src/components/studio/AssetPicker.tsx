"use client";

import { Check, ImageIcon, Images, X } from "lucide-react";
import Image from "next/image";
import { useId, useState } from "react";

import type { MediaAssetOption } from "@/lib/assets/types";

import { AssetUploadControl } from "./AssetUploadControl";

type AssetPickerProps = {
  initialAssets: MediaAssetOption[];
  selectedUrl: string;
  onSelect: (asset: MediaAssetOption) => void;
};

export function AssetPicker({ initialAssets, selectedUrl, onSelect }: AssetPickerProps) {
  const panelId = useId();
  const [assets, setAssets] = useState(initialAssets);
  const [isOpen, setIsOpen] = useState(false);

  const addUploadedAsset = (asset: MediaAssetOption) => {
    setAssets((current) => [asset, ...current.filter((candidate) => candidate.id !== asset.id)]);
    onSelect(asset);
  };

  return (
    <div className="studio-asset-picker">
      <button
        className="studio-asset-picker-toggle"
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((value) => !value)}
      >
        <Images size={15} aria-hidden="true" />
        {isOpen ? "Close Media Library" : "Choose from Media Library"}
      </button>

      {isOpen ? (
        <div className="studio-asset-picker-panel" id={panelId}>
          <div className="studio-asset-picker-heading">
            <div>
              <span>ACTIVE Cloudinary assets</span>
              <strong>{assets.length} available</strong>
            </div>
            <button type="button" aria-label="Close Media Library" onClick={() => setIsOpen(false)}>
              <X size={15} aria-hidden="true" />
            </button>
          </div>

          {assets.length > 0 ? (
            <div className="studio-asset-picker-grid">
              {assets.map((asset) => {
                const selected = selectedUrl === asset.url;
                return (
                  <button
                    className={selected ? "is-selected" : undefined}
                    type="button"
                    key={asset.id}
                    aria-pressed={selected}
                    onClick={() => onSelect(asset)}
                  >
                    <span className="studio-asset-picker-image">
                      <Image src={asset.url} alt="" fill sizes="130px" className="cover-image" />
                    </span>
                    <span>
                      <strong>{asset.originalName || "Cloudinary image"}</strong>
                      <small>{asset.altText || "Alt text not set"}</small>
                    </span>
                    {selected ? <Check size={15} aria-hidden="true" /> : null}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="studio-asset-picker-empty">
              <ImageIcon size={17} aria-hidden="true" /> No ACTIVE Cloudinary images yet.
            </p>
          )}

          <div className="studio-asset-picker-upload">
            <div>
              <span>Upload</span>
              <strong>Add and select a new image</strong>
            </div>
            <AssetUploadControl onUploaded={addUploadedAsset} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
