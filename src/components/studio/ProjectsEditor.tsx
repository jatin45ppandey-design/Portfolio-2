"use client";

import Image from "next/image";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  ImageIcon,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useForm, useWatch, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { AssetPicker } from "@/components/studio/AssetPicker";
import type { MediaAssetOption } from "@/lib/assets/types";
import { saveProjectsDraftAction } from "@/lib/content/projects-editor-actions";
import { isPortfolioImageSource } from "@/lib/content/schema";
import {
  createNewProject,
  getPrimaryProjectImage,
  moveProject,
  moveProjectImage,
  ProjectsEditorPayloadSchema,
  removeProject,
  type EditorProject,
  type ProjectsEditorPayload,
} from "@/lib/content/projects-editor";

type ProjectsEditorProps = {
  initialValues: ProjectsEditorPayload;
  initialDraftVersion: number;
  initialMediaAssets: MediaAssetOption[];
};

type Feedback = {
  tone: "success" | "error";
  message: string;
  canReload?: boolean;
};

type EditorFieldProps = {
  label: string;
  error?: string;
  children: ReactNode;
};

function EditorField({ label, error, children }: EditorFieldProps) {
  return (
    <label className="studio-editor-field">
      <span>{label}</span>
      {children}
      {error ? <small className="studio-field-error">{error}</small> : null}
    </label>
  );
}

function splitList(value: string, separator: RegExp): string[] {
  return value
    .split(separator)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getErrorMessage(errors: unknown, path: string): string | undefined {
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

function getOrderedProjects(projects: ReadonlyArray<EditorProject>): EditorProject[] {
  return [...projects].sort((left, right) => left.order - right.order || left.id.localeCompare(right.id));
}

function getOrderedImages(project: EditorProject) {
  return [...project.images].sort((left, right) => left.order - right.order || left.id.localeCompare(right.id));
}

export function ProjectsEditor({ initialValues, initialDraftVersion, initialMediaAssets }: ProjectsEditorProps) {
  const router = useRouter();
  const [draftVersion, setDraftVersion] = useState(initialDraftVersion);
  const [selectedProjectId, setSelectedProjectId] = useState(initialValues.projects[0]?.id ?? "");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const form = useForm<ProjectsEditorPayload>({
    defaultValues: initialValues,
    mode: "onBlur",
    resolver: zodResolver(ProjectsEditorPayloadSchema),
  });
  const watchedProjects = useWatch({ control: form.control, name: "projects" });
  const projects = watchedProjects ?? initialValues.projects;
  const selectedProjectIndex = projects.findIndex((project) => project.id === selectedProjectId);
  const selectedProject = projects[selectedProjectIndex];
  const { errors, isDirty, isSubmitting } = form.formState;

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

  const fieldPath = (path: string) => path as FieldPath<ProjectsEditorPayload>;
  const errorFor = (path: string) => getErrorMessage(errors, path);

  const replaceProjects = (nextProjects: EditorProject[]) => {
    form.setValue("projects", nextProjects, { shouldDirty: true });
  };

  const addProject = () => {
    const project = createNewProject(projects);
    replaceProjects([...projects, project]);
    setSelectedProjectId(project.id);
    setFeedback(null);
  };

  const moveSelectedProject = (direction: "up" | "down") => {
    if (!selectedProject) {
      return;
    }

    replaceProjects(moveProject(projects, selectedProject.id, direction));
  };

  const removeSelectedProject = () => {
    if (!selectedProject) {
      return;
    }

    if (!window.confirm(`Remove ${selectedProject.title || "this project"} from the draft?`)) {
      return;
    }

    try {
      const nextProjects = removeProject(projects, selectedProject.id);
      replaceProjects(nextProjects);
      setSelectedProjectId(nextProjects[0]?.id ?? "");
      setFeedback(null);
    } catch (error) {
      setFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "The project could not be removed.",
      });
    }
  };

  const moveSelectedImage = (imageId: string, direction: "up" | "down") => {
    if (!selectedProject) {
      return;
    }

    form.setValue(
      fieldPath(`projects.${selectedProjectIndex}.images`),
      moveProjectImage(selectedProject.images, imageId, direction),
      { shouldDirty: true },
    );
  };

  const submit = async (values: ProjectsEditorPayload) => {
    setFeedback(null);
    const result = await saveProjectsDraftAction({
      payload: values,
      expectedDraftVersion: draftVersion,
    });

    if (!result.ok) {
      if (result.type === "validation") {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          form.setError(field as FieldPath<ProjectsEditorPayload>, {
            type: "server",
            message: messages[0],
          });
        }

        setFeedback({ tone: "error", message: "Review the highlighted project fields and try again." });
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
    setSelectedProjectId(initialValues.projects[0]?.id ?? "");
    setFeedback(null);
  };

  const selectedImage = selectedProject ? getPrimaryProjectImage(selectedProject) : undefined;

  return (
    <div className="studio-projects-editor">
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

      {feedback ? (
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
            <button className="studio-reload-button" type="button" onClick={() => router.refresh()}>
              Reload latest draft
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="studio-project-editor-layout">
        <aside className="studio-project-list" aria-label="Project list">
          <div className="studio-project-list-heading">
            <div>
              <span>Projects</span>
              <strong>{projects.length} in draft</strong>
            </div>
            <button className="studio-project-add-button" type="button" onClick={addProject}>
              <Plus size={15} aria-hidden="true" />
              Add project
            </button>
          </div>

          <div className="studio-project-list-items">
            {getOrderedProjects(projects).map((project) => {
              const primaryImage = getPrimaryProjectImage(project);
              const isSelected = project.id === selectedProjectId;

              return (
                <button
                  className={`studio-project-list-item ${isSelected ? "is-selected" : ""}`}
                  type="button"
                  aria-pressed={isSelected}
                  key={project.id}
                  onClick={() => setSelectedProjectId(project.id)}
                >
                  <span className="studio-project-list-image" aria-hidden="true">
                    {primaryImage?.src ? (
                      <Image src={primaryImage.src} alt="" fill sizes="72px" className="cover-image" />
                    ) : (
                      <ImageIcon size={18} />
                    )}
                  </span>
                  <span className="studio-project-list-copy">
                    <strong>{project.title || "Untitled project"}</strong>
                    <small>{project.category || "Category required"}</small>
                    <em>
                      {project.visible ? "Visible" : "Hidden"}
                      {project.featured ? " · Featured" : ""}
                    </em>
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {selectedProject ? (
          <div className="studio-project-workspace">
            <form
              className="studio-editor-form studio-project-form"
              onSubmit={form.handleSubmit(submit, () =>
                setFeedback({ tone: "error", message: "Review the highlighted project fields and try again." }),
              )}
            >
              <section className="studio-editor-group" aria-labelledby="project-details-heading">
                <div className="studio-project-form-heading">
                  <div className="studio-editor-group-heading">
                    <span>Project {selectedProject.order}</span>
                    <h2 id="project-details-heading">{selectedProject.title || "Untitled project"}</h2>
                  </div>
                  <div className="studio-project-order-actions" aria-label="Project order">
                    <button type="button" onClick={() => moveSelectedProject("up")}>
                      <ArrowUp size={15} aria-hidden="true" />
                      Move up
                    </button>
                    <button type="button" onClick={() => moveSelectedProject("down")}>
                      <ArrowDown size={15} aria-hidden="true" />
                      Move down
                    </button>
                  </div>
                </div>

                <div className="studio-editor-fields studio-editor-fields--two-up">
                  <EditorField label="Title" error={errorFor(`projects.${selectedProjectIndex}.title`)}>
                    <input
                      className="studio-form-control"
                      {...form.register(fieldPath(`projects.${selectedProjectIndex}.title`))}
                    />
                  </EditorField>
                  <EditorField label="Category" error={errorFor(`projects.${selectedProjectIndex}.category`)}>
                    <input
                      className="studio-form-control"
                      {...form.register(fieldPath(`projects.${selectedProjectIndex}.category`))}
                    />
                  </EditorField>
                </div>

                <EditorField label="Description" error={errorFor(`projects.${selectedProjectIndex}.description`)}>
                  <textarea
                    className="studio-form-control studio-form-control--textarea"
                    rows={5}
                    {...form.register(fieldPath(`projects.${selectedProjectIndex}.description`))}
                  />
                </EditorField>

                <div className="studio-editor-fields studio-editor-fields--two-up studio-editor-fields--spaced">
                  <EditorField label="GitHub URL" error={errorFor(`projects.${selectedProjectIndex}.githubUrl`)}>
                    <input
                      type="url"
                      className="studio-form-control"
                      {...form.register(fieldPath(`projects.${selectedProjectIndex}.githubUrl`))}
                    />
                  </EditorField>
                  <EditorField label="Live URL (optional)" error={errorFor(`projects.${selectedProjectIndex}.liveUrl`)}>
                    <input
                      type="url"
                      className="studio-form-control"
                      {...form.register(fieldPath(`projects.${selectedProjectIndex}.liveUrl`))}
                    />
                  </EditorField>
                </div>

                <div className="studio-project-identifiers" aria-label="Stable project identifiers">
                  <span>Stable ID</span>
                  <code>{selectedProject.id}</code>
                  <span>Slug</span>
                  <code>{selectedProject.slug}</code>
                </div>

                <div className="studio-project-toggles">
                  <label>
                    <input
                      type="checkbox"
                      {...form.register(fieldPath(`projects.${selectedProjectIndex}.visible`))}
                    />
                    <span>Visible on the public portfolio</span>
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      {...form.register(fieldPath(`projects.${selectedProjectIndex}.featured`))}
                    />
                    <span>Featured primary project</span>
                  </label>
                </div>
                {errorFor("projects") ? <p className="studio-field-error">{errorFor("projects")}</p> : null}
              </section>

              <section className="studio-editor-group" aria-labelledby="project-content-heading">
                <div className="studio-editor-group-heading">
                  <span>Content</span>
                  <h2 id="project-content-heading">Stack and highlights</h2>
                </div>

                <EditorField label="Tech stack (comma-separated)" error={errorFor(`projects.${selectedProjectIndex}.techStack`)}>
                  <input
                    className="studio-form-control"
                    value={selectedProject.techStack.join(", ")}
                    onChange={(event) =>
                      form.setValue(
                        fieldPath(`projects.${selectedProjectIndex}.techStack`),
                        splitList(event.target.value, /,/),
                        { shouldDirty: true },
                      )
                    }
                  />
                </EditorField>

                <EditorField label="Highlights (one per line)" error={errorFor(`projects.${selectedProjectIndex}.highlights`)}>
                  <textarea
                    className="studio-form-control studio-form-control--textarea"
                    rows={5}
                    value={selectedProject.highlights.join("\n")}
                    onChange={(event) =>
                      form.setValue(
                        fieldPath(`projects.${selectedProjectIndex}.highlights`),
                        splitList(event.target.value, /\r?\n/),
                        { shouldDirty: true },
                      )
                    }
                  />
                </EditorField>
              </section>

              <section className="studio-editor-group" aria-labelledby="project-images-heading">
                <div className="studio-project-form-heading">
                  <div className="studio-editor-group-heading">
                    <span>Images</span>
                    <h2 id="project-images-heading">Project images</h2>
                  </div>
                  <small>Keep local paths or choose an ACTIVE Media Library asset.</small>
                </div>

                <div className="studio-project-image-list">
                  {getOrderedImages(selectedProject).map((image) => {
                    const imageIndex = selectedProject.images.findIndex((candidate) => candidate.id === image.id);

                    return (
                      <article className="studio-project-image-editor" key={image.id}>
                        <div className="studio-project-image-thumb">
                          {isPortfolioImageSource(image.src) ? (
                            <Image src={image.src} alt="" fill sizes="92px" className="cover-image" />
                          ) : (
                            <ImageIcon size={20} aria-hidden="true" />
                          )}
                        </div>
                        <div className="studio-project-image-fields">
                          <EditorField label="Image source" error={errorFor(`projects.${selectedProjectIndex}.images.${imageIndex}.src`)}>
                            <input
                              className="studio-form-control"
                              placeholder="/images/projects/example/screenshot.png"
                              {...form.register(fieldPath(`projects.${selectedProjectIndex}.images.${imageIndex}.src`))}
                            />
                          </EditorField>
                          <AssetPicker
                            initialAssets={initialMediaAssets}
                            selectedUrl={image.src}
                            onSelect={(asset) => {
                              form.setValue(
                                fieldPath(`projects.${selectedProjectIndex}.images.${imageIndex}.src`),
                                asset.url,
                                { shouldDirty: true, shouldValidate: true },
                              );
                              if (asset.altText) {
                                form.setValue(
                                  fieldPath(`projects.${selectedProjectIndex}.images.${imageIndex}.alt`),
                                  asset.altText,
                                  { shouldDirty: true, shouldValidate: true },
                                );
                              }
                            }}
                          />
                          <EditorField label="Alt text" error={errorFor(`projects.${selectedProjectIndex}.images.${imageIndex}.alt`)}>
                            <input
                              className="studio-form-control"
                              {...form.register(fieldPath(`projects.${selectedProjectIndex}.images.${imageIndex}.alt`))}
                            />
                          </EditorField>
                          <EditorField label="Caption (optional)" error={errorFor(`projects.${selectedProjectIndex}.images.${imageIndex}.label`)}>
                            <input
                              className="studio-form-control"
                              {...form.register(fieldPath(`projects.${selectedProjectIndex}.images.${imageIndex}.label`))}
                            />
                          </EditorField>
                          <label className="studio-project-image-visible">
                            <input
                              type="checkbox"
                              {...form.register(fieldPath(`projects.${selectedProjectIndex}.images.${imageIndex}.visible`))}
                            />
                            <span>Visible in the public gallery</span>
                          </label>
                        </div>
                        <div className="studio-project-image-order" aria-label="Image order">
                          <span>Image {image.order}</span>
                          <button type="button" onClick={() => moveSelectedImage(image.id, "up")}>
                            <ArrowUp size={14} aria-hidden="true" />
                          </button>
                          <button type="button" onClick={() => moveSelectedImage(image.id, "down")}>
                            <ArrowDown size={14} aria-hidden="true" />
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>

              <div className="studio-form-actions">
                <button className="studio-save-button" type="submit" disabled={isSubmitting || !isDirty}>
                  <Save size={15} aria-hidden="true" />
                  {isSubmitting ? "Saving…" : "Save Draft"}
                </button>
                <button className="studio-reset-button" type="button" disabled={isSubmitting || !isDirty} onClick={resetChanges}>
                  <RotateCcw size={14} aria-hidden="true" />
                  Reset changes
                </button>
                <button className="studio-project-remove-button" type="button" disabled={isSubmitting} onClick={removeSelectedProject}>
                  <Trash2 size={14} aria-hidden="true" />
                  Remove project
                </button>
                <span>{isDirty ? "Unsaved changes" : "Saved"}</span>
              </div>
            </form>

            <aside className="studio-project-preview" aria-label="Project card preview">
              <div className="studio-preview-heading">
                <span>Local preview</span>
                <small>Not published</small>
              </div>
              <article className="studio-project-preview-card">
                <div className="studio-project-preview-image">
                  {selectedImage && isPortfolioImageSource(selectedImage.src) ? (
                    <Image src={selectedImage.src} alt="" fill sizes="(max-width: 700px) 100vw, 320px" className="cover-image" />
                  ) : (
                    <ImageIcon size={26} aria-hidden="true" />
                  )}
                </div>
                <div className="studio-project-preview-copy">
                  <p>{selectedProject.category || "Project category"}</p>
                  <h2>{selectedProject.title || "Project title"}</h2>
                  <span className={selectedProject.visible ? "studio-preview-status" : "studio-preview-status studio-preview-status--hidden"}>
                    {selectedProject.visible ? "Visible" : "Hidden"}
                    {selectedProject.featured ? " · Featured" : ""}
                  </span>
                  <p>{selectedProject.description || "A concise project description will appear here."}</p>
                  <div className="tech-list">
                    {selectedProject.techStack.map((technology) => (
                      <span key={technology}>{technology}</span>
                    ))}
                  </div>
                </div>
              </article>
            </aside>
          </div>
        ) : null}
      </div>
    </div>
  );
}
