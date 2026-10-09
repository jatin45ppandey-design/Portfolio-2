"use client";

import { ArrowLeft, Check, RotateCcw, Save, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useEffect, type ReactNode } from "react";

export type EditorFeedback = {
  tone: "success" | "error";
  message: string;
  canReload?: boolean;
};

export function useUnsavedChangesWarning(isDirty: boolean) {
  useEffect(() => {
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [isDirty]);
}

export function getEditorErrorMessage(errors: unknown, path: string): string | undefined {
  const error = path.split(".").reduce<unknown>((value, key) => {
    if (typeof value !== "object" || value === null) {
      return undefined;
    }

    return (value as Record<string, unknown>)[key];
  }, errors);

  if (typeof error !== "object" || error === null) {
    return undefined;
  }

  const message = (error as { message?: unknown }).message;
  return typeof message === "string" ? message : undefined;
}

export function StudioEditorTopline({ draftVersion }: { draftVersion: number }) {
  return (
    <div className="studio-profile-editor-topline">
      <Link className="studio-back-link" href="/studio">
        <ArrowLeft size={15} aria-hidden="true" />
        Studio overview
      </Link>
      <div className="studio-profile-editor-links">
        <Link className="studio-preview-link" href="/studio/preview">
          Preview Draft
        </Link>
        <span className="studio-draft-version">Draft version {draftVersion}</span>
      </div>
    </div>
  );
}

export function StudioEditorNotice({
  feedback,
  onReload,
}: {
  feedback: EditorFeedback | null;
  onReload: () => void;
}) {
  if (!feedback) {
    return null;
  }

  return (
    <div
      className={`studio-form-notice studio-form-notice--${feedback.tone}`}
      role={feedback.tone === "error" ? "alert" : "status"}
    >
      {feedback.tone === "success" ? (
        <Check size={17} aria-hidden="true" />
      ) : (
        <TriangleAlert size={17} aria-hidden="true" />
      )}
      <span>{feedback.message}</span>
      {feedback.canReload ? (
        <button className="studio-reload-button" type="button" onClick={onReload}>
          Reload latest draft
        </button>
      ) : null}
    </div>
  );
}

export function StudioEditorField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="studio-editor-field">
      <span>{label}</span>
      {children}
      {error ? <small className="studio-field-error">{error}</small> : null}
    </label>
  );
}

export function StudioEditorActions({
  isDirty,
  isSubmitting,
  onReset,
  children,
}: {
  isDirty: boolean;
  isSubmitting: boolean;
  onReset: () => void;
  children?: ReactNode;
}) {
  return (
    <div className="studio-form-actions">
      <button className="studio-save-button" type="submit" disabled={isSubmitting || !isDirty}>
        <Save size={15} aria-hidden="true" />
        {isSubmitting ? "Saving\u2026" : "Save Draft"}
      </button>
      <button className="studio-reset-button" type="button" disabled={isSubmitting || !isDirty} onClick={onReset}>
        <RotateCcw size={14} aria-hidden="true" />
        Reset changes
      </button>
      {children}
      <span>{isDirty ? "Unsaved changes" : "Saved"}</span>
    </div>
  );
}
