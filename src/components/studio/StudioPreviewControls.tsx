"use client";

import { Check, RefreshCw, TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { publishDraftAction } from "@/lib/content/publish-actions";

type StudioPreviewControlsProps = {
  expectedDraftVersion: number;
};

type PublishState = "idle" | "confirming" | "publishing" | "published";

type Feedback = {
  tone: "error" | "success";
  message: string;
  canReload?: boolean;
};

export function StudioPreviewControls({ expectedDraftVersion }: StudioPreviewControlsProps) {
  const router = useRouter();
  const [publishState, setPublishState] = useState<PublishState>("idle");
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const publish = async () => {
    setPublishState("publishing");
    setFeedback(null);

    const result = await publishDraftAction({ expectedDraftVersion });

    if (!result.ok) {
      setPublishState("idle");
      setFeedback({
        tone: "error",
        message: result.message,
        canReload: result.type === "conflict",
      });
      return;
    }

    setPublishState("published");
    setFeedback({
      tone: "success",
      message: `Published successfully \u2014 revision ${result.revisionVersion}.`,
    });
  };

  return (
    <div className="studio-preview-controls">
      {publishState === "confirming" ? (
        <div className="studio-publish-confirmation" role="status">
          <p>This will make the current draft visible on the public portfolio.</p>
          <div>
            <button
              className="studio-preview-button studio-preview-button--secondary"
              type="button"
              onClick={() => setPublishState("idle")}
            >
              Cancel
            </button>
            <button className="studio-preview-button" type="button" onClick={publish}>
              Confirm publish
            </button>
          </div>
        </div>
      ) : (
        <button
          className="studio-preview-button"
          type="button"
          disabled={publishState === "publishing" || publishState === "published"}
          onClick={() => {
            setFeedback(null);
            setPublishState("confirming");
          }}
        >
          {publishState === "publishing"
            ? "Publishing\u2026"
            : publishState === "published"
              ? "Published"
              : "Publish Draft"}
        </button>
      )}

      {feedback ? (
        <div
          className={`studio-preview-feedback studio-preview-feedback--${feedback.tone}`}
          role={feedback.tone === "error" ? "alert" : "status"}
        >
          {feedback.tone === "success" ? (
            <Check size={16} aria-hidden="true" />
          ) : (
            <TriangleAlert size={16} aria-hidden="true" />
          )}
          <span>{feedback.message}</span>
          {feedback.canReload ? (
            <button
              className="studio-preview-reload"
              type="button"
              onClick={() => router.refresh()}
            >
              <RefreshCw size={14} aria-hidden="true" />
              Reload Preview
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
