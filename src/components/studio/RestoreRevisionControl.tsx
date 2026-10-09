"use client";

import { Check, RefreshCw, RotateCcw, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { restoreRevisionToDraftAction } from "@/lib/content/history-actions";

type RestoreRevisionControlProps = {
  revisionVersion: number;
  expectedDraftVersion: number;
};

type RestoreState = "idle" | "confirming" | "restoring" | "restored";

type Feedback = {
  tone: "error" | "success";
  message: string;
  canReload?: boolean;
};

export function RestoreRevisionControl({
  revisionVersion,
  expectedDraftVersion,
}: RestoreRevisionControlProps) {
  const router = useRouter();
  const [restoreState, setRestoreState] = useState<RestoreState>("idle");
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const restore = async () => {
    setRestoreState("restoring");
    setFeedback(null);

    const result = await restoreRevisionToDraftAction({
      revisionVersion,
      expectedDraftVersion,
    });

    if (!result.ok) {
      setRestoreState("idle");
      setFeedback({
        tone: "error",
        message: result.message,
        canReload: result.type === "conflict",
      });
      return;
    }

    setRestoreState("restored");
    setFeedback({
      tone: "success",
      message: `Revision ${revisionVersion} restored as draft version ${result.draftVersion}.`,
    });
  };

  return (
    <div className="studio-restore-control">
      {restoreState === "confirming" ? (
        <div className="studio-restore-confirmation" role="status">
          <TriangleAlert size={18} aria-hidden="true" />
          <div>
            <strong>Replace the current editable draft?</strong>
            <p>
              This replaces your current draft with Revision {revisionVersion}. The currently
              published portfolio will not change until you publish again. The historical
              revision remains read only.
            </p>
            <div className="studio-restore-confirmation-actions">
              <button
                className="studio-preview-button studio-preview-button--secondary"
                type="button"
                onClick={() => setRestoreState("idle")}
              >
                Cancel
              </button>
              <button className="studio-preview-button" type="button" onClick={restore}>
                Confirm restore as draft
              </button>
            </div>
          </div>
        </div>
      ) : restoreState !== "restored" ? (
        <button
          className="studio-preview-button studio-restore-button"
          type="button"
          disabled={restoreState === "restoring"}
          onClick={() => {
            setFeedback(null);
            setRestoreState("confirming");
          }}
        >
          <RotateCcw size={15} aria-hidden="true" />
          {restoreState === "restoring" ? "Restoring…" : "Restore as Draft"}
        </button>
      ) : null}

      {feedback ? (
        <div
          className={`studio-form-notice studio-form-notice--${feedback.tone} studio-restore-feedback`}
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
              Reload latest draft
            </button>
          ) : null}
          {feedback.tone === "success" ? (
            <span className="studio-restore-success-links">
              <Link href="/studio/preview">Preview Draft</Link>
              <Link href="/studio">Go to Studio</Link>
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
