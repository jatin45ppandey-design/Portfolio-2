"use client";

import { CloudUpload } from "lucide-react";
import { useId, useState } from "react";

import type { MediaAssetOption } from "@/lib/assets/types";
import { MAX_PORTFOLIO_IMAGE_BYTES } from "@/lib/assets/upload-validation";

type AssetUploadControlProps = {
  onUploaded: (asset: MediaAssetOption) => void;
};

export function AssetUploadControl({ onUploaded }: AssetUploadControlProps) {
  const fileInputId = useId();
  const altInputId = useId();
  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const [inputKey, setInputKey] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ tone: "error" | "success"; text: string } | null>(null);

  const upload = async () => {
    setMessage(null);

    if (!file) {
      setMessage({ tone: "error", text: "Choose an image file." });
      return;
    }

    if (!altText.trim()) {
      setMessage({ tone: "error", text: "Add descriptive alt text before uploading." });
      return;
    }

    if (file.size > MAX_PORTFOLIO_IMAGE_BYTES) {
      setMessage({ tone: "error", text: "Images must be 8 MB or smaller." });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("altText", altText.trim());
      const response = await fetch("/api/studio/assets", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as {
        asset?: MediaAssetOption;
        error?: string;
      };

      if (!response.ok || !payload.asset) {
        throw new Error(payload.error || "The image could not be uploaded.");
      }

      onUploaded(payload.asset);
      setFile(null);
      setAltText("");
      setInputKey((value) => value + 1);
      setMessage({ tone: "success", text: "Image uploaded to the Media Manager." });
    } catch (error) {
      setMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "The image could not be uploaded.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="studio-asset-upload-control">
      <div className="studio-asset-upload-fields">
        <label htmlFor={fileInputId}>
          <span>Image file</span>
          <input
            key={inputKey}
            id={fileInputId}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            disabled={isUploading}
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
          <small>JPEG, PNG, WebP, GIF, or AVIF. Maximum 8 MB.</small>
        </label>
        <label htmlFor={altInputId}>
          <span>Alt text</span>
          <input
            id={altInputId}
            className="studio-form-control"
            value={altText}
            maxLength={240}
            disabled={isUploading}
            onChange={(event) => setAltText(event.target.value)}
            placeholder="Describe the image content"
          />
        </label>
      </div>
      <button
        className="studio-asset-upload-button"
        type="button"
        disabled={isUploading}
        onClick={upload}
      >
        <CloudUpload size={15} aria-hidden="true" />
        {isUploading ? "Uploading…" : "Upload image"}
      </button>
      {message ? (
        <p
          className={`studio-asset-inline-message studio-asset-inline-message--${message.tone}`}
          role={message.tone === "error" ? "alert" : "status"}
        >
          {message.text}
        </p>
      ) : null}
    </div>
  );
}
