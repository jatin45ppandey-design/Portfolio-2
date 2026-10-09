"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDown, ArrowUp, ImageIcon, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch, type FieldPath } from "react-hook-form";

import {
  getEditorErrorMessage,
  StudioEditorActions,
  StudioEditorField,
  StudioEditorNotice,
  StudioEditorTopline,
  type EditorFeedback,
  useUnsavedChangesWarning,
} from "@/components/studio/EditorPrimitives";
import { AssetPicker } from "@/components/studio/AssetPicker";
import type { MediaAssetOption } from "@/lib/assets/types";
import { saveCertificationsDraftAction } from "@/lib/content/certifications-editor-actions";
import { isPortfolioImageSource } from "@/lib/content/schema";
import {
  CertificationsEditorPayloadSchema,
  createCertification,
  moveCertification,
  removeCertification,
  type CertificationsEditorPayload,
  type EditorCertification,
} from "@/lib/content/certifications-editor";

type CertificationsEditorProps = {
  initialValues: CertificationsEditorPayload;
  initialDraftVersion: number;
  initialMediaAssets: MediaAssetOption[];
};

function orderedCertifications(certifications: ReadonlyArray<EditorCertification>) {
  return [...certifications].sort(
    (left, right) => left.order - right.order || left.id.localeCompare(right.id),
  );
}

function optionalText(value: unknown) {
  return typeof value === "string" && value.trim() ? value : undefined;
}

export function CertificationsEditor({
  initialValues,
  initialDraftVersion,
  initialMediaAssets,
}: CertificationsEditorProps) {
  const router = useRouter();
  const [draftVersion, setDraftVersion] = useState(initialDraftVersion);
  const [selectedCertificationId, setSelectedCertificationId] = useState(
    initialValues.certifications.items[0]?.id ?? "",
  );
  const [feedback, setFeedback] = useState<EditorFeedback | null>(null);
  const form = useForm<CertificationsEditorPayload>({
    defaultValues: initialValues,
    mode: "onBlur",
    resolver: zodResolver(CertificationsEditorPayloadSchema),
  });
  const watchedItems = useWatch({ control: form.control, name: "certifications.items" });
  const certifications = watchedItems ?? initialValues.certifications.items;
  const selectedIndex = certifications.findIndex(
    (certificate) => certificate.id === selectedCertificationId,
  );
  const selectedCertification = certifications[selectedIndex];
  const { errors, isDirty, isSubmitting } = form.formState;

  useUnsavedChangesWarning(isDirty);

  const fieldPath = (path: string) => path as FieldPath<CertificationsEditorPayload>;
  const errorFor = (path: string) => getEditorErrorMessage(errors, path);

  const replaceCertifications = (nextItems: EditorCertification[]) => {
    form.setValue("certifications.items", nextItems, { shouldDirty: true });
  };

  const addCertification = () => {
    const certificate = createCertification(certifications);
    replaceCertifications([...certifications, certificate]);
    setSelectedCertificationId(certificate.id);
    setFeedback(null);
  };

  const removeSelectedCertification = () => {
    if (
      !selectedCertification ||
      !window.confirm(`Remove ${selectedCertification.title || "this certification"} from the draft?`)
    ) {
      return;
    }

    try {
      const nextItems = removeCertification(certifications, selectedCertification.id);
      replaceCertifications(nextItems);
      setSelectedCertificationId(nextItems[0]?.id ?? "");
      setFeedback(null);
    } catch (error) {
      setFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "The certification could not be removed.",
      });
    }
  };

  const submit = async (values: CertificationsEditorPayload) => {
    setFeedback(null);
    const result = await saveCertificationsDraftAction({
      payload: values,
      expectedDraftVersion: draftVersion,
    });

    if (!result.ok) {
      if (result.type === "validation") {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          form.setError(field as FieldPath<CertificationsEditorPayload>, {
            type: "server",
            message: messages[0],
          });
        }
        setFeedback({
          tone: "error",
          message: "Review the highlighted certification fields and try again.",
        });
        return;
      }

      setFeedback({
        tone: "error",
        message: result.message,
        canReload: result.type === "conflict",
      });
      return;
    }

    setDraftVersion(result.draftVersion);
    form.reset(values);
    setFeedback({ tone: "success", message: `Draft saved as version ${result.draftVersion}.` });
  };

  const resetChanges = () => {
    form.reset(initialValues);
    setSelectedCertificationId(initialValues.certifications.items[0]?.id ?? "");
    setFeedback(null);
  };

  const hasImagePreview = selectedCertification
    ? isPortfolioImageSource(selectedCertification.image.src)
    : false;

  return (
    <div className="studio-collection-editor">
      <StudioEditorTopline draftVersion={draftVersion} />
      <StudioEditorNotice feedback={feedback} onReload={() => router.refresh()} />

      <div className="studio-collection-layout">
        <aside className="studio-collection-list" aria-label="Certifications">
          <div className="studio-project-list-heading">
            <div>
              <span>Certificates</span>
              <strong>{certifications.length} in draft</strong>
            </div>
            <button className="studio-project-add-button" type="button" onClick={addCertification}>
              <Plus size={15} aria-hidden="true" />
              Add certificate
            </button>
          </div>
          <div className="studio-collection-list-items">
            {orderedCertifications(certifications).map((certificate) => (
              <button
                className={`studio-collection-list-item ${certificate.id === selectedCertificationId ? "is-selected" : ""}`}
                type="button"
                aria-pressed={certificate.id === selectedCertificationId}
                key={certificate.id}
                onClick={() => setSelectedCertificationId(certificate.id)}
              >
                <strong>{certificate.title || "Untitled certification"}</strong>
                <small>
                  {certificate.visible ? "Visible" : "Hidden"}
                  {certificate.featured ? " / Featured" : ""}
                </small>
              </button>
            ))}
          </div>
        </aside>

        {selectedCertification ? (
          <form
            className="studio-editor-form studio-collection-form"
            onSubmit={form.handleSubmit(submit, () =>
              setFeedback({
                tone: "error",
                message: "Review the highlighted certification fields and try again.",
              }),
            )}
          >
            <section className="studio-editor-group" aria-labelledby="certifications-copy-heading">
              <div className="studio-editor-group-heading">
                <span>Section copy</span>
                <h2 id="certifications-copy-heading">Certifications introduction</h2>
              </div>
              <div className="studio-editor-fields studio-editor-fields--two-up">
                <StudioEditorField label="Eyebrow" error={errorFor("certifications.section.eyebrow")}>
                  <input className="studio-form-control" {...form.register("certifications.section.eyebrow")} />
                </StudioEditorField>
                <StudioEditorField label="Label" error={errorFor("certifications.section.label")}>
                  <input className="studio-form-control" {...form.register("certifications.section.label")} />
                </StudioEditorField>
              </div>
              <div className="studio-editor-fields studio-editor-fields--spaced">
                <StudioEditorField label="Heading" error={errorFor("certifications.section.heading")}>
                  <input className="studio-form-control" {...form.register("certifications.section.heading")} />
                </StudioEditorField>
                <StudioEditorField
                  label="Description"
                  error={errorFor("certifications.section.description")}
                >
                  <textarea
                    className="studio-form-control studio-form-control--textarea"
                    rows={4}
                    {...form.register("certifications.section.description")}
                  />
                </StudioEditorField>
              </div>
            </section>

            <section className="studio-editor-group" aria-labelledby="certification-details-heading">
              <div className="studio-project-form-heading">
                <div className="studio-editor-group-heading">
                  <span>Certificate {selectedCertification.order}</span>
                  <h2 id="certification-details-heading">
                    {selectedCertification.title || "Untitled certification"}
                  </h2>
                </div>
                <div className="studio-project-order-actions" aria-label="Certification order">
                  <button
                    type="button"
                    onClick={() =>
                      replaceCertifications(
                        moveCertification(certifications, selectedCertification.id, "up"),
                      )
                    }
                  >
                    <ArrowUp size={15} aria-hidden="true" /> Move up
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      replaceCertifications(
                        moveCertification(certifications, selectedCertification.id, "down"),
                      )
                    }
                  >
                    <ArrowDown size={15} aria-hidden="true" /> Move down
                  </button>
                </div>
              </div>

              <div className="studio-editor-fields studio-editor-fields--two-up">
                <StudioEditorField
                  label="Title"
                  error={errorFor(`certifications.items.${selectedIndex}.title`)}
                >
                  <input
                    className="studio-form-control"
                    {...form.register(fieldPath(`certifications.items.${selectedIndex}.title`))}
                  />
                </StudioEditorField>
                <StudioEditorField
                  label="Issuer"
                  error={errorFor(`certifications.items.${selectedIndex}.issuer`)}
                >
                  <input
                    className="studio-form-control"
                    {...form.register(fieldPath(`certifications.items.${selectedIndex}.issuer`))}
                  />
                </StudioEditorField>
              </div>
              <div className="studio-editor-fields studio-editor-fields--two-up studio-editor-fields--spaced">
                <StudioEditorField
                  label="Category"
                  error={errorFor(`certifications.items.${selectedIndex}.category`)}
                >
                  <input
                    className="studio-form-control"
                    {...form.register(fieldPath(`certifications.items.${selectedIndex}.category`))}
                  />
                </StudioEditorField>
                <StudioEditorField
                  label="Date (optional)"
                  error={errorFor(`certifications.items.${selectedIndex}.date`)}
                >
                  <input
                    className="studio-form-control"
                    {...form.register(fieldPath(`certifications.items.${selectedIndex}.date`), {
                      setValueAs: optionalText,
                    })}
                  />
                </StudioEditorField>
              </div>

              <div className="studio-project-identifiers" aria-label="Stable certification identifiers">
                <span>Stable ID</span>
                <code>{selectedCertification.id}</code>
                <span>Slug</span>
                <code>{selectedCertification.slug}</code>
              </div>

              <div className="studio-project-toggles">
                <label>
                  <input
                    type="checkbox"
                    {...form.register(fieldPath(`certifications.items.${selectedIndex}.visible`))}
                  />
                  <span>Visible on the public portfolio</span>
                </label>
                <label>
                  <input
                    type="checkbox"
                    {...form.register(fieldPath(`certifications.items.${selectedIndex}.featured`))}
                  />
                  <span>Featured in the public certification grid</span>
                </label>
              </div>
              {errorFor("certifications.items") ? (
                <p className="studio-field-error">{errorFor("certifications.items")}</p>
              ) : null}
              {errorFor(`certifications.items.${selectedIndex}.featured`) ? (
                <p className="studio-field-error">
                  {errorFor(`certifications.items.${selectedIndex}.featured`)}
                </p>
              ) : null}
            </section>

            <section className="studio-editor-group" aria-labelledby="certification-image-heading">
              <div className="studio-editor-group-heading">
                <span>Image</span>
                <h2 id="certification-image-heading">Certificate image</h2>
              </div>
              <div className="studio-existing-image-editor">
                <figure>
                  {hasImagePreview ? (
                    <Image
                      src={selectedCertification.image.src}
                      alt=""
                      fill
                      sizes="(max-width: 700px) 240px, 180px"
                      className="cover-image"
                    />
                  ) : (
                    <ImageIcon size={24} aria-hidden="true" />
                  )}
                </figure>
                <div className="studio-editor-fields studio-editor-fields--spaced">
                  <StudioEditorField
                    label="Image source"
                    error={errorFor(`certifications.items.${selectedIndex}.image.src`)}
                  >
                    <input
                      className="studio-form-control"
                      placeholder="/images/certificates/example.png"
                      {...form.register(fieldPath(`certifications.items.${selectedIndex}.image.src`))}
                    />
                  </StudioEditorField>
                  <AssetPicker
                    initialAssets={initialMediaAssets}
                    selectedUrl={selectedCertification.image.src}
                    onSelect={(asset) => {
                      form.setValue(
                        fieldPath(`certifications.items.${selectedIndex}.image.src`),
                        asset.url,
                        { shouldDirty: true, shouldValidate: true },
                      );
                      if (asset.altText) {
                        form.setValue(
                          fieldPath(`certifications.items.${selectedIndex}.image.alt`),
                          asset.altText,
                          { shouldDirty: true, shouldValidate: true },
                        );
                      }
                    }}
                  />
                  <StudioEditorField
                    label="Alt text"
                    error={errorFor(`certifications.items.${selectedIndex}.image.alt`)}
                  >
                    <input
                      className="studio-form-control"
                      {...form.register(fieldPath(`certifications.items.${selectedIndex}.image.alt`))}
                    />
                  </StudioEditorField>
                  <StudioEditorField
                    label="Caption (optional)"
                    error={errorFor(`certifications.items.${selectedIndex}.image.label`)}
                  >
                    <input
                      className="studio-form-control"
                      {...form.register(fieldPath(`certifications.items.${selectedIndex}.image.label`), {
                        setValueAs: optionalText,
                      })}
                    />
                  </StudioEditorField>
                </div>
              </div>
            </section>

            <StudioEditorActions
              isDirty={isDirty}
              isSubmitting={isSubmitting}
              onReset={resetChanges}
            >
              <button
                className="studio-project-remove-button"
                type="button"
                disabled={isSubmitting}
                onClick={removeSelectedCertification}
              >
                <Trash2 size={14} aria-hidden="true" /> Remove certificate
              </button>
            </StudioEditorActions>
          </form>
        ) : null}
      </div>
    </div>
  );
}
