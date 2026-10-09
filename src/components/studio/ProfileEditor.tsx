"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Check, MapPin, RotateCcw, Save, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useForm, useWatch, type FieldPath } from "react-hook-form";

import { saveProfileDraftAction } from "@/lib/content/profile-editor-actions";
import {
  ProfileEditorPayloadSchema,
  type ProfileEditorPayload,
} from "@/lib/content/profile-editor";

type ProfileEditorProps = {
  initialValues: ProfileEditorPayload;
  initialDraftVersion: number;
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

export function ProfileEditor({ initialValues, initialDraftVersion }: ProfileEditorProps) {
  const router = useRouter();
  const [draftVersion, setDraftVersion] = useState(initialDraftVersion);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const form = useForm<ProfileEditorPayload>({
    defaultValues: initialValues,
    mode: "onBlur",
    resolver: zodResolver(ProfileEditorPayloadSchema),
  });
  const preview = useWatch({ control: form.control }) as ProfileEditorPayload;
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

  const submit = async (values: ProfileEditorPayload) => {
    setFeedback(null);
    const result = await saveProfileDraftAction({
      payload: values,
      expectedDraftVersion: draftVersion,
    });

    if (!result.ok) {
      if (result.type === "validation") {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          form.setError(field as FieldPath<ProfileEditorPayload>, {
            type: "server",
            message: messages[0],
          });
        }

        setFeedback({ tone: "error", message: "Review the highlighted profile fields and try again." });
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
    setFeedback(null);
  };

  return (
    <div className="studio-profile-editor">
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

      <div className="studio-editor-grid">
        <form
          className="studio-editor-form"
          onSubmit={form.handleSubmit(submit, () =>
            setFeedback({ tone: "error", message: "Review the highlighted profile fields and try again." }),
          )}
        >
          <section className="studio-editor-group" aria-labelledby="identity-heading">
            <div className="studio-editor-group-heading">
              <span>Profile</span>
              <h2 id="identity-heading">Identity and positioning</h2>
            </div>
            <div className="studio-editor-fields studio-editor-fields--two-up">
              <EditorField label="Full name" error={errors.profile?.name?.message}>
                <input id="profile-name" className="studio-form-control" {...form.register("profile.name")} />
              </EditorField>
              <EditorField label="Hero eyebrow" error={errors.hero?.eyebrow?.message}>
                <input id="hero-eyebrow" className="studio-form-control" {...form.register("hero.eyebrow")} />
              </EditorField>
              <EditorField label="First name" error={errors.profile?.firstName?.message}>
                <input
                  id="profile-first-name"
                  className="studio-form-control"
                  {...form.register("profile.firstName")}
                />
              </EditorField>
              <EditorField label="Last name" error={errors.profile?.lastName?.message}>
                <input
                  id="profile-last-name"
                  className="studio-form-control"
                  {...form.register("profile.lastName")}
                />
              </EditorField>
            </div>
            <div className="studio-editor-fields studio-editor-fields--spaced">
              <EditorField label="Role / headline" error={errors.profile?.role?.message}>
                <input id="profile-role" className="studio-form-control" {...form.register("profile.role")} />
              </EditorField>
              <EditorField label="Supporting summary" error={errors.profile?.summary?.message}>
                <textarea
                  id="profile-summary"
                  className="studio-form-control studio-form-control--textarea"
                  rows={4}
                  {...form.register("profile.summary")}
                />
              </EditorField>
              <div className="studio-editor-fields studio-editor-fields--two-up">
                <EditorField label="Availability" error={errors.profile?.status?.message}>
                  <input id="profile-status" className="studio-form-control" {...form.register("profile.status")} />
                </EditorField>
                <EditorField label="Location" error={errors.profile?.location?.message}>
                  <input id="profile-location" className="studio-form-control" {...form.register("profile.location")} />
                </EditorField>
              </div>
              <EditorField label="Current focus" error={errors.hero?.currentFocus?.message}>
                <input
                  id="hero-current-focus"
                  className="studio-form-control"
                  {...form.register("hero.currentFocus")}
                />
              </EditorField>
            </div>
          </section>

          <section className="studio-editor-group" aria-labelledby="contact-heading">
            <div className="studio-editor-group-heading">
              <span>Contact</span>
              <h2 id="contact-heading">Contact and social links</h2>
            </div>
            <div className="studio-editor-fields">
              <EditorField label="Email" error={errors.contact?.email?.message}>
                <input
                  id="contact-email"
                  type="email"
                  className="studio-form-control"
                  {...form.register("contact.email")}
                />
              </EditorField>
              <div className="studio-editor-fields studio-editor-fields--two-up">
                <EditorField label="GitHub URL" error={errors.profile?.links?.github?.message}>
                  <input
                    id="profile-github"
                    type="url"
                    className="studio-form-control"
                    {...form.register("profile.links.github")}
                  />
                </EditorField>
                <EditorField label="LinkedIn URL" error={errors.profile?.links?.linkedin?.message}>
                  <input
                    id="profile-linkedin"
                    type="url"
                    className="studio-form-control"
                    {...form.register("profile.links.linkedin")}
                  />
                </EditorField>
              </div>
              <EditorField label="LeetCode URL" error={errors.profile?.links?.leetcode?.message}>
                <input
                  id="profile-leetcode"
                  type="url"
                  className="studio-form-control"
                  {...form.register("profile.links.leetcode")}
                />
              </EditorField>
            </div>
          </section>

          <section className="studio-editor-group" aria-labelledby="academic-heading">
            <div className="studio-editor-group-heading">
              <span>Academic status</span>
              <h2 id="academic-heading">Current study details</h2>
            </div>
            <div className="studio-editor-fields studio-editor-fields--two-up">
              <EditorField label="Current year / semester" error={errors.education?.degree?.current?.message}>
                <input
                  id="education-current"
                  className="studio-form-control"
                  {...form.register("education.degree.current")}
                />
              </EditorField>
              <EditorField label="Expected graduation" error={errors.education?.degree?.graduation?.message}>
                <input
                  id="education-graduation"
                  className="studio-form-control"
                  {...form.register("education.degree.graduation")}
                />
              </EditorField>
            </div>
          </section>

          <section className="studio-editor-group" aria-labelledby="about-heading">
            <div className="studio-editor-group-heading">
              <span>About</span>
              <h2 id="about-heading">Supporting profile context</h2>
            </div>
            <div className="studio-editor-fields">
              <EditorField label="About heading" error={errors.about?.section?.heading?.message}>
                <input
                  id="about-heading-input"
                  className="studio-form-control"
                  {...form.register("about.section.heading")}
                />
              </EditorField>
              {initialValues.about.paragraphs.map((_, index) => (
                <EditorField
                  key={index}
                  label={`About paragraph ${index + 1}`}
                  error={errors.about?.paragraphs?.[index]?.message}
                >
                  <textarea
                    id={`about-paragraph-${index + 1}`}
                    className="studio-form-control studio-form-control--textarea"
                    rows={4}
                    {...form.register(`about.paragraphs.${index}` as const)}
                  />
                </EditorField>
              ))}
              <div className="studio-editor-facts" aria-label="About facts">
                {initialValues.about.facts.map((_, index) => (
                  <div className="studio-editor-fact" key={index}>
                    <EditorField label={`Fact ${index + 1} label`} error={errors.about?.facts?.[index]?.label?.message}>
                      <input
                        id={`about-fact-label-${index + 1}`}
                        className="studio-form-control"
                        {...form.register(`about.facts.${index}.label` as const)}
                      />
                    </EditorField>
                    <EditorField label={`Fact ${index + 1} value`} error={errors.about?.facts?.[index]?.value?.message}>
                      <input
                        id={`about-fact-value-${index + 1}`}
                        className="studio-form-control"
                        {...form.register(`about.facts.${index}.value` as const)}
                      />
                    </EditorField>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="studio-form-actions">
            <button className="studio-save-button" type="submit" disabled={!isDirty || isSubmitting}>
              <Save size={16} aria-hidden="true" />
              {isSubmitting ? "Saving…" : "Save Draft"}
            </button>
            <button className="studio-reset-button" type="button" onClick={resetChanges} disabled={!isDirty || isSubmitting}>
              <RotateCcw size={15} aria-hidden="true" />
              Reset changes
            </button>
            <span>{isDirty ? "Unsaved changes" : "Saved"}</span>
          </div>
        </form>

        <aside className="studio-profile-preview" aria-labelledby="profile-preview-heading">
          <div className="studio-preview-heading">
            <span>Local preview</span>
            <small>Not published</small>
          </div>
          <div className="studio-preview-card">
            <p>{preview.hero.eyebrow}</p>
            <h2>{preview.profile.name}</h2>
            <h3>{preview.profile.role}</h3>
            <div className="studio-preview-status">{preview.profile.status}</div>
            <p className="studio-preview-summary">{preview.profile.summary}</p>
            <p className="studio-preview-location">
              <MapPin size={15} aria-hidden="true" />
              {preview.profile.location}
            </p>
            <div className="studio-preview-about">
              <span>About</span>
              <strong id="profile-preview-heading">{preview.about.section.heading}</strong>
              <p>{preview.about.paragraphs[0]}</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
