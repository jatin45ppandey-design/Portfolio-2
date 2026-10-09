"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import type { MediaAssetOption } from "@/lib/assets/types";
import {
  getEditorErrorMessage,
  StudioEditorActions,
  StudioEditorField,
  StudioEditorNotice,
  StudioEditorTopline,
  type EditorFeedback,
  useUnsavedChangesWarning,
} from "./EditorPrimitives";
import { AssetPicker } from "./AssetPicker";
import { saveLeadershipDraftAction } from "@/lib/content/leadership-editor-actions";
import { LeadershipEditorPayloadSchema, type LeadershipEditorPayload } from "@/lib/content/leadership-editor";
import { isPortfolioImageSource } from "@/lib/content/schema";

type LeadershipEditorProps = {
  initialValues: LeadershipEditorPayload;
  initialDraftVersion: number;
  initialMediaAssets: MediaAssetOption[];
};

function splitLines(value: string) {
  return value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
}

export function LeadershipEditor({ initialValues, initialDraftVersion, initialMediaAssets }: LeadershipEditorProps) {
  const router = useRouter();
  const [draftVersion, setDraftVersion] = useState(initialDraftVersion);
  const [feedback, setFeedback] = useState<EditorFeedback | null>(null);
  const form = useForm<LeadershipEditorPayload>({ defaultValues: initialValues, mode: "onBlur", resolver: zodResolver(LeadershipEditorPayloadSchema) });
  const leadership = useWatch({ control: form.control, name: "leadership" }) ?? initialValues.leadership;
  const { errors, isDirty, isSubmitting } = form.formState;
  useUnsavedChangesWarning(isDirty);

  const errorFor = (path: string) => getEditorErrorMessage(errors, path);
  const submit = async (values: LeadershipEditorPayload) => {
    setFeedback(null);
    const result = await saveLeadershipDraftAction({ payload: values, expectedDraftVersion: draftVersion });
    if (!result.ok) {
      if (result.type === "validation") {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          form.setError(field as FieldPath<LeadershipEditorPayload>, { type: "server", message: messages[0] });
        }
        setFeedback({ tone: "error", message: "Review the highlighted leadership fields and try again." });
        return;
      }
      setFeedback({ tone: "error", message: result.message, canReload: result.type === "conflict" });
      return;
    }
    setDraftVersion(result.draftVersion);
    form.reset(values);
    setFeedback({ tone: "success", message: `Draft saved as version ${result.draftVersion}.` });
  };

  return (
    <div className="studio-single-editor">
      <StudioEditorTopline draftVersion={draftVersion} />
      <StudioEditorNotice feedback={feedback} onReload={() => router.refresh()} />
      <form className="studio-editor-form" onSubmit={form.handleSubmit(submit, () => setFeedback({ tone: "error", message: "Review the highlighted leadership fields and try again." }))}>
        <section className="studio-editor-group" aria-labelledby="leadership-copy-heading">
          <div className="studio-editor-group-heading"><span>Section copy</span><h2 id="leadership-copy-heading">Leadership introduction</h2></div>
          <div className="studio-editor-fields studio-editor-fields--two-up">
            <StudioEditorField label="Eyebrow" error={errorFor("leadership.eyebrow")}><input className="studio-form-control" {...form.register("leadership.eyebrow")} /></StudioEditorField>
            <StudioEditorField label="Label" error={errorFor("leadership.label")}><input className="studio-form-control" {...form.register("leadership.label")} /></StudioEditorField>
          </div>
          <div className="studio-editor-fields studio-editor-fields--spaced"><StudioEditorField label="Heading" error={errorFor("leadership.heading")}><input className="studio-form-control" {...form.register("leadership.heading")} /></StudioEditorField></div>
        </section>

        <section className="studio-editor-group" aria-labelledby="leadership-role-heading">
          <div className="studio-editor-group-heading"><span>Leadership record</span><h2 id="leadership-role-heading">Role and contribution</h2></div>
          <div className="studio-editor-fields studio-editor-fields--two-up">
            <StudioEditorField label="Role" error={errorFor("leadership.role")}><input className="studio-form-control" {...form.register("leadership.role")} /></StudioEditorField>
            <StudioEditorField label="Organization" error={errorFor("leadership.organization")}><input className="studio-form-control" {...form.register("leadership.organization")} /></StudioEditorField>
            <StudioEditorField label="Community / category" error={errorFor("leadership.community")}><input className="studio-form-control" {...form.register("leadership.community")} /></StudioEditorField>
            <StudioEditorField label="Started" error={errorFor("leadership.start")}><input className="studio-form-control" {...form.register("leadership.start")} /></StudioEditorField>
            <StudioEditorField label="Status" error={errorFor("leadership.status")}><input className="studio-form-control" {...form.register("leadership.status")} /></StudioEditorField>
            <StudioEditorField label="Highlighted event" error={errorFor("leadership.highlightedEvent")}><input className="studio-form-control" {...form.register("leadership.highlightedEvent")} /></StudioEditorField>
          </div>
          <div className="studio-editor-fields studio-editor-fields--spaced">
            <StudioEditorField label="Contribution description" error={errorFor("leadership.contribution")}><textarea className="studio-form-control studio-form-control--textarea" rows={5} {...form.register("leadership.contribution")} /></StudioEditorField>
            <StudioEditorField label="Responsibilities (one per line)" error={errorFor("leadership.responsibilities")}>
              <textarea className="studio-form-control studio-form-control--textarea" rows={6} value={leadership.responsibilities.join("\n")} onChange={(event) => form.setValue("leadership.responsibilities", splitLines(event.target.value), { shouldDirty: true })} />
            </StudioEditorField>
          </div>
        </section>

        <section className="studio-editor-group" aria-labelledby="leadership-image-heading">
          <div className="studio-editor-group-heading"><span>Image</span><h2 id="leadership-image-heading">Leadership photograph</h2></div>
          <div className="studio-existing-image-editor">
            <figure>{isPortfolioImageSource(leadership.image.src) ? <Image src={leadership.image.src} alt="" fill sizes="180px" className="cover-image" /> : null}</figure>
            <div className="studio-editor-fields">
              <StudioEditorField label="Image source" error={errorFor("leadership.image.src")}>
                <input
                  className="studio-form-control"
                  placeholder="/images/profile/example.jpg"
                  {...form.register("leadership.image.src")}
                />
              </StudioEditorField>
              <AssetPicker
                initialAssets={initialMediaAssets}
                selectedUrl={leadership.image.src}
                onSelect={(asset) => {
                  form.setValue("leadership.image.src", asset.url, { shouldDirty: true, shouldValidate: true });
                  if (asset.altText) {
                    form.setValue("leadership.image.alt", asset.altText, { shouldDirty: true, shouldValidate: true });
                  }
                }}
              />
              <StudioEditorField label="Alt text" error={errorFor("leadership.image.alt")}><input className="studio-form-control" {...form.register("leadership.image.alt")} /></StudioEditorField>
              <StudioEditorField label="Caption (optional)" error={errorFor("leadership.image.label")}><input className="studio-form-control" {...form.register("leadership.image.label")} /></StudioEditorField>
            </div>
          </div>
        </section>

        <StudioEditorActions isDirty={isDirty} isSubmitting={isSubmitting} onReset={() => { form.reset(initialValues); setFeedback(null); }} />
      </form>
    </div>
  );
}
