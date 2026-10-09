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
import { saveAchievementsDraftAction } from "@/lib/content/achievements-editor-actions";
import { isPortfolioImageSource } from "@/lib/content/schema";
import {
  AchievementsEditorPayloadSchema,
  createAchievement,
  moveAchievement,
  removeAchievement,
  type AchievementsEditorPayload,
  type EditorAchievement,
} from "@/lib/content/achievements-editor";

type AchievementsEditorProps = {
  initialValues: AchievementsEditorPayload;
  initialDraftVersion: number;
  initialMediaAssets: MediaAssetOption[];
};

function orderedAchievements(achievements: ReadonlyArray<EditorAchievement>) {
  return [...achievements].sort(
    (left, right) => left.order - right.order || left.id.localeCompare(right.id),
  );
}

function optionalText(value: unknown) {
  return typeof value === "string" && value.trim() ? value : undefined;
}

export function AchievementsEditor({
  initialValues,
  initialDraftVersion,
  initialMediaAssets,
}: AchievementsEditorProps) {
  const router = useRouter();
  const [draftVersion, setDraftVersion] = useState(initialDraftVersion);
  const [selectedAchievementId, setSelectedAchievementId] = useState(
    initialValues.achievements.items[0]?.id ?? "",
  );
  const [feedback, setFeedback] = useState<EditorFeedback | null>(null);
  const form = useForm<AchievementsEditorPayload>({
    defaultValues: initialValues,
    mode: "onBlur",
    resolver: zodResolver(AchievementsEditorPayloadSchema),
  });
  const watchedItems = useWatch({ control: form.control, name: "achievements.items" });
  const achievements = watchedItems ?? initialValues.achievements.items;
  const selectedIndex = achievements.findIndex(
    (achievement) => achievement.id === selectedAchievementId,
  );
  const selectedAchievement = achievements[selectedIndex];
  const { errors, isDirty, isSubmitting } = form.formState;

  useUnsavedChangesWarning(isDirty);

  const fieldPath = (path: string) => path as FieldPath<AchievementsEditorPayload>;
  const errorFor = (path: string) => getEditorErrorMessage(errors, path);

  const replaceAchievements = (nextItems: EditorAchievement[]) => {
    form.setValue("achievements.items", nextItems, { shouldDirty: true });
  };

  const addAchievement = () => {
    const achievement = createAchievement(achievements);
    replaceAchievements([...achievements, achievement]);
    setSelectedAchievementId(achievement.id);
    setFeedback(null);
  };

  const removeSelectedAchievement = () => {
    if (
      !selectedAchievement ||
      !window.confirm(`Remove ${selectedAchievement.event || "this achievement"} from the draft?`)
    ) {
      return;
    }

    try {
      const nextItems = removeAchievement(achievements, selectedAchievement.id);
      replaceAchievements(nextItems);
      setSelectedAchievementId(nextItems[0]?.id ?? "");
      setFeedback(null);
    } catch (error) {
      setFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "The achievement could not be removed.",
      });
    }
  };

  const submit = async (values: AchievementsEditorPayload) => {
    setFeedback(null);
    const result = await saveAchievementsDraftAction({
      payload: values,
      expectedDraftVersion: draftVersion,
    });

    if (!result.ok) {
      if (result.type === "validation") {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          form.setError(field as FieldPath<AchievementsEditorPayload>, {
            type: "server",
            message: messages[0],
          });
        }
        setFeedback({
          tone: "error",
          message: "Review the highlighted achievement fields and try again.",
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
    setSelectedAchievementId(initialValues.achievements.items[0]?.id ?? "");
    setFeedback(null);
  };

  const selectedImage = selectedAchievement?.image;
  const hasImagePreview = selectedImage ? isPortfolioImageSource(selectedImage.src) : false;

  return (
    <div className="studio-collection-editor">
      <StudioEditorTopline draftVersion={draftVersion} />
      <StudioEditorNotice feedback={feedback} onReload={() => router.refresh()} />

      <div className="studio-collection-layout">
        <aside className="studio-collection-list" aria-label="Achievements">
          <div className="studio-project-list-heading">
            <div>
              <span>Achievements</span>
              <strong>{achievements.length} in draft</strong>
            </div>
            <button className="studio-project-add-button" type="button" onClick={addAchievement}>
              <Plus size={15} aria-hidden="true" />
              Add achievement
            </button>
          </div>
          <div className="studio-collection-list-items">
            {orderedAchievements(achievements).map((achievement) => (
              <button
                className={`studio-collection-list-item ${achievement.id === selectedAchievementId ? "is-selected" : ""}`}
                type="button"
                aria-pressed={achievement.id === selectedAchievementId}
                key={achievement.id}
                onClick={() => setSelectedAchievementId(achievement.id)}
              >
                <strong>{achievement.event || achievement.title || "Untitled achievement"}</strong>
                <small>
                  {achievement.position || "Position required"} / {achievement.visible ? "Visible" : "Hidden"}
                </small>
              </button>
            ))}
          </div>
        </aside>

        {selectedAchievement ? (
          <form
            className="studio-editor-form studio-collection-form"
            onSubmit={form.handleSubmit(submit, () =>
              setFeedback({
                tone: "error",
                message: "Review the highlighted achievement fields and try again.",
              }),
            )}
          >
            <section className="studio-editor-group" aria-labelledby="achievements-copy-heading">
              <div className="studio-editor-group-heading">
                <span>Section copy</span>
                <h2 id="achievements-copy-heading">Achievements introduction</h2>
              </div>
              <div className="studio-editor-fields studio-editor-fields--two-up">
                <StudioEditorField label="Eyebrow" error={errorFor("achievements.section.eyebrow")}>
                  <input className="studio-form-control" {...form.register("achievements.section.eyebrow")} />
                </StudioEditorField>
                <StudioEditorField label="Label" error={errorFor("achievements.section.label")}>
                  <input className="studio-form-control" {...form.register("achievements.section.label")} />
                </StudioEditorField>
              </div>
              <div className="studio-editor-fields studio-editor-fields--spaced">
                <StudioEditorField label="Heading" error={errorFor("achievements.section.heading")}>
                  <input className="studio-form-control" {...form.register("achievements.section.heading")} />
                </StudioEditorField>
                <StudioEditorField
                  label="Description"
                  error={errorFor("achievements.section.description")}
                >
                  <textarea
                    className="studio-form-control studio-form-control--textarea"
                    rows={4}
                    {...form.register("achievements.section.description")}
                  />
                </StudioEditorField>
              </div>
            </section>

            <section className="studio-editor-group" aria-labelledby="achievement-details-heading">
              <div className="studio-project-form-heading">
                <div className="studio-editor-group-heading">
                  <span>Achievement {selectedAchievement.order}</span>
                  <h2 id="achievement-details-heading">
                    {selectedAchievement.event || selectedAchievement.title || "Untitled achievement"}
                  </h2>
                </div>
                <div className="studio-project-order-actions" aria-label="Achievement order">
                  <button
                    type="button"
                    onClick={() =>
                      replaceAchievements(
                        moveAchievement(achievements, selectedAchievement.id, "up"),
                      )
                    }
                  >
                    <ArrowUp size={15} aria-hidden="true" /> Move up
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      replaceAchievements(
                        moveAchievement(achievements, selectedAchievement.id, "down"),
                      )
                    }
                  >
                    <ArrowDown size={15} aria-hidden="true" /> Move down
                  </button>
                </div>
              </div>

              <div className="studio-editor-fields studio-editor-fields--two-up">
                <StudioEditorField
                  label="Position"
                  error={errorFor(`achievements.items.${selectedIndex}.position`)}
                >
                  <input
                    className="studio-form-control"
                    {...form.register(fieldPath(`achievements.items.${selectedIndex}.position`))}
                  />
                </StudioEditorField>
                <StudioEditorField
                  label="Title"
                  error={errorFor(`achievements.items.${selectedIndex}.title`)}
                >
                  <input
                    className="studio-form-control"
                    {...form.register(fieldPath(`achievements.items.${selectedIndex}.title`))}
                  />
                </StudioEditorField>
                <StudioEditorField
                  label="Event"
                  error={errorFor(`achievements.items.${selectedIndex}.event`)}
                >
                  <input
                    className="studio-form-control"
                    {...form.register(fieldPath(`achievements.items.${selectedIndex}.event`))}
                  />
                </StudioEditorField>
                <StudioEditorField
                  label="Date or year (optional)"
                  error={errorFor(`achievements.items.${selectedIndex}.date`)}
                >
                  <input
                    className="studio-form-control"
                    {...form.register(fieldPath(`achievements.items.${selectedIndex}.date`), {
                      setValueAs: optionalText,
                    })}
                  />
                </StudioEditorField>
              </div>
              <div className="studio-editor-fields studio-editor-fields--spaced">
                <StudioEditorField
                  label="Organization"
                  error={errorFor(`achievements.items.${selectedIndex}.organization`)}
                >
                  <input
                    className="studio-form-control"
                    {...form.register(fieldPath(`achievements.items.${selectedIndex}.organization`))}
                  />
                </StudioEditorField>
              </div>

              <div className="studio-project-identifiers" aria-label="Stable achievement identifier">
                <span>Stable ID</span>
                <code>{selectedAchievement.id}</code>
              </div>
              <div className="studio-project-toggles">
                <label>
                  <input
                    type="checkbox"
                    {...form.register(fieldPath(`achievements.items.${selectedIndex}.visible`))}
                  />
                  <span>Visible on the public portfolio</span>
                </label>
              </div>
              {errorFor("achievements.items") ? (
                <p className="studio-field-error">{errorFor("achievements.items")}</p>
              ) : null}
            </section>

            <section className="studio-editor-group" aria-labelledby="achievement-image-heading">
              <div className="studio-editor-group-heading">
                <span>Image</span>
                <h2 id="achievement-image-heading">Achievement image</h2>
              </div>
              <div className="studio-existing-image-editor">
                <figure>
                  {hasImagePreview && selectedImage ? (
                    <Image
                      src={selectedImage.src}
                      alt=""
                      fill
                      sizes="(max-width: 700px) 240px, 180px"
                      className="cover-image"
                    />
                  ) : (
                    <ImageIcon size={24} aria-hidden="true" />
                  )}
                </figure>
                {selectedImage ? (
                  <div className="studio-editor-fields studio-editor-fields--spaced">
                    <StudioEditorField
                      label="Image source"
                      error={errorFor(`achievements.items.${selectedIndex}.image.src`)}
                    >
                      <input
                        className="studio-form-control"
                        placeholder="/images/achievements/example.png"
                        {...form.register(fieldPath(`achievements.items.${selectedIndex}.image.src`))}
                      />
                    </StudioEditorField>
                    <AssetPicker
                      initialAssets={initialMediaAssets}
                      selectedUrl={selectedImage.src}
                      onSelect={(asset) => {
                        form.setValue(
                          fieldPath(`achievements.items.${selectedIndex}.image.src`),
                          asset.url,
                          { shouldDirty: true, shouldValidate: true },
                        );
                        if (asset.altText) {
                          form.setValue(
                            fieldPath(`achievements.items.${selectedIndex}.image.alt`),
                            asset.altText,
                            { shouldDirty: true, shouldValidate: true },
                          );
                        }
                      }}
                    />
                    <StudioEditorField
                      label="Alt text"
                      error={errorFor(`achievements.items.${selectedIndex}.image.alt`)}
                    >
                      <input
                        className="studio-form-control"
                        {...form.register(fieldPath(`achievements.items.${selectedIndex}.image.alt`))}
                      />
                    </StudioEditorField>
                    <StudioEditorField
                      label="Caption (optional)"
                      error={errorFor(`achievements.items.${selectedIndex}.image.label`)}
                    >
                      <input
                        className="studio-form-control"
                        {...form.register(fieldPath(`achievements.items.${selectedIndex}.image.label`), {
                          setValueAs: optionalText,
                        })}
                      />
                    </StudioEditorField>
                  </div>
                ) : (
                  <p className="studio-project-image-path">
                    This hidden item has no image. A local or ACTIVE Cloudinary image is required before it can be visible.
                  </p>
                )}
              </div>
              {errorFor(`achievements.items.${selectedIndex}.image`) ? (
                <p className="studio-field-error">
                  {errorFor(`achievements.items.${selectedIndex}.image`)}
                </p>
              ) : null}
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
                onClick={removeSelectedAchievement}
              >
                <Trash2 size={14} aria-hidden="true" /> Remove achievement
              </button>
            </StudioEditorActions>
          </form>
        ) : null}
      </div>
    </div>
  );
}
