"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  getEditorErrorMessage,
  StudioEditorActions,
  StudioEditorField,
  StudioEditorNotice,
  StudioEditorTopline,
  type EditorFeedback,
  useUnsavedChangesWarning,
} from "./EditorPrimitives";
import { saveEducationDraftAction } from "@/lib/content/education-editor-actions";
import {
  createSchool,
  createSemester,
  EducationEditorPayloadSchema,
  moveSchool,
  moveSemester,
  removeSchool,
  removeSemester,
  type EducationEditorPayload,
} from "@/lib/content/education-editor";

type EducationEditorProps = {
  initialValues: EducationEditorPayload;
  initialDraftVersion: number;
};

export function EducationEditor({ initialValues, initialDraftVersion }: EducationEditorProps) {
  const router = useRouter();
  const [draftVersion, setDraftVersion] = useState(initialDraftVersion);
  const [feedback, setFeedback] = useState<EditorFeedback | null>(null);
  const form = useForm<EducationEditorPayload>({
    defaultValues: initialValues,
    mode: "onBlur",
    resolver: zodResolver(EducationEditorPayloadSchema),
  });
  const education = useWatch({ control: form.control, name: "education" }) ?? initialValues.education;
  const { errors, isDirty, isSubmitting } = form.formState;

  useUnsavedChangesWarning(isDirty);

  const fieldPath = (path: string) => path as FieldPath<EducationEditorPayload>;
  const errorFor = (path: string) => getEditorErrorMessage(errors, path);
  const setSemesters = (entries: EducationEditorPayload["education"]["degree"]["sgpa"]) =>
    form.setValue("education.degree.sgpa", entries, { shouldDirty: true });
  const setSchools = (entries: EducationEditorPayload["education"]["school"]) =>
    form.setValue("education.school", entries, { shouldDirty: true });

  const removeSemesterEntry = (id: string, label: string) => {
    if (!window.confirm(`Remove ${label || "this semester result"} from the draft?`)) return;
    try {
      setSemesters(removeSemester(education.degree.sgpa, id));
      setFeedback(null);
    } catch (error) {
      setFeedback({ tone: "error", message: error instanceof Error ? error.message : "The semester could not be removed." });
    }
  };

  const removeSchoolEntry = (id: string, label: string) => {
    if (!window.confirm(`Remove ${label || "this school record"} from the draft?`)) return;
    try {
      setSchools(removeSchool(education.school, id));
      setFeedback(null);
    } catch (error) {
      setFeedback({ tone: "error", message: error instanceof Error ? error.message : "The school record could not be removed." });
    }
  };

  const submit = async (values: EducationEditorPayload) => {
    setFeedback(null);
    const result = await saveEducationDraftAction({ payload: values, expectedDraftVersion: draftVersion });
    if (!result.ok) {
      if (result.type === "validation") {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          form.setError(field as FieldPath<EducationEditorPayload>, { type: "server", message: messages[0] });
        }
        setFeedback({ tone: "error", message: "Review the highlighted education fields and try again." });
        return;
      }
      setFeedback({ tone: "error", message: result.message, canReload: result.type === "conflict" });
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
    <div className="studio-single-editor">
      <StudioEditorTopline draftVersion={draftVersion} />
      <StudioEditorNotice feedback={feedback} onReload={() => router.refresh()} />
      <form
        className="studio-editor-form"
        onSubmit={form.handleSubmit(submit, () =>
          setFeedback({ tone: "error", message: "Review the highlighted education fields and try again." }),
        )}
      >
        <section className="studio-editor-group" aria-labelledby="education-copy-heading">
          <div className="studio-editor-group-heading"><span>Section copy</span><h2 id="education-copy-heading">Education introduction</h2></div>
          <div className="studio-editor-fields studio-editor-fields--two-up">
            <StudioEditorField label="Eyebrow" error={errorFor("education.eyebrow")}><input className="studio-form-control" {...form.register("education.eyebrow")} /></StudioEditorField>
            <StudioEditorField label="Label" error={errorFor("education.label")}><input className="studio-form-control" {...form.register("education.label")} /></StudioEditorField>
          </div>
          <div className="studio-editor-fields studio-editor-fields--spaced">
            <StudioEditorField label="Heading" error={errorFor("education.heading")}><input className="studio-form-control" {...form.register("education.heading")} /></StudioEditorField>
          </div>
        </section>

        <section className="studio-editor-group" aria-labelledby="degree-heading">
          <div className="studio-editor-group-heading"><span>Current degree</span><h2 id="degree-heading">College and academic status</h2></div>
          <div className="studio-editor-fields studio-editor-fields--two-up">
            <StudioEditorField label="Degree" error={errorFor("education.degree.title")}><input className="studio-form-control" {...form.register("education.degree.title")} /></StudioEditorField>
            <StudioEditorField label="Institution" error={errorFor("education.degree.institution")}><input className="studio-form-control" {...form.register("education.degree.institution")} /></StudioEditorField>
            <StudioEditorField label="Location" error={errorFor("education.degree.location")}><input className="studio-form-control" {...form.register("education.degree.location")} /></StudioEditorField>
            <StudioEditorField label="Affiliation" error={errorFor("education.degree.affiliation")}><input className="studio-form-control" {...form.register("education.degree.affiliation")} /></StudioEditorField>
            <StudioEditorField label="Current year / semester" error={errorFor("education.degree.current")}><input className="studio-form-control" {...form.register("education.degree.current")} /></StudioEditorField>
            <StudioEditorField label="Expected graduation" error={errorFor("education.degree.graduation")}><input className="studio-form-control" {...form.register("education.degree.graduation")} /></StudioEditorField>
          </div>
        </section>

        <section className="studio-editor-group" aria-labelledby="sgpa-heading">
          <div className="studio-collection-subheading studio-collection-subheading--first">
            <div><span>Semester results</span><strong id="sgpa-heading">{education.degree.sgpa.length} entries</strong></div>
            <button className="studio-project-add-button" type="button" onClick={() => setSemesters([...education.degree.sgpa, createSemester(education.degree.sgpa)])}><Plus size={15} /> Add semester</button>
          </div>
          {errorFor("education.degree.sgpa") ? <p className="studio-field-error">{errorFor("education.degree.sgpa")}</p> : null}
          <div className="studio-ordered-editor-list">
            {[...education.degree.sgpa].sort((a, b) => a.order - b.order || a.id.localeCompare(b.id)).map((semester) => {
              const index = education.degree.sgpa.findIndex((entry) => entry.id === semester.id);
              return (
                <article className="studio-ordered-editor-item" key={semester.id}>
                  <div className="studio-ordered-editor-main studio-ordered-editor-main--two-up">
                    <StudioEditorField label="Semester" error={errorFor(`education.degree.sgpa.${index}.semester`)}><input className="studio-form-control" {...form.register(fieldPath(`education.degree.sgpa.${index}.semester`))} /></StudioEditorField>
                    <StudioEditorField label="SGPA" error={errorFor(`education.degree.sgpa.${index}.value`)}><input className="studio-form-control" {...form.register(fieldPath(`education.degree.sgpa.${index}.value`))} /></StudioEditorField>
                    <code>{semester.id}</code>
                  </div>
                  <div className="studio-ordered-editor-options"><label><input type="checkbox" {...form.register(fieldPath(`education.degree.sgpa.${index}.visible`))} /> Visible</label></div>
                  <div className="studio-ordered-editor-actions">
                    <button type="button" aria-label="Move semester up" onClick={() => setSemesters(moveSemester(education.degree.sgpa, semester.id, "up"))}><ArrowUp size={14} /></button>
                    <button type="button" aria-label="Move semester down" onClick={() => setSemesters(moveSemester(education.degree.sgpa, semester.id, "down"))}><ArrowDown size={14} /></button>
                    <button className="is-danger" type="button" aria-label="Remove semester" onClick={() => removeSemesterEntry(semester.id, semester.semester)}><Trash2 size={14} /></button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="studio-editor-group" aria-labelledby="school-heading">
          <div className="studio-collection-subheading studio-collection-subheading--first">
            <div><span>School education</span><strong id="school-heading">{education.school.length} entries</strong></div>
            <button className="studio-project-add-button" type="button" onClick={() => setSchools([...education.school, createSchool(education.school)])}><Plus size={15} /> Add school</button>
          </div>
          {errorFor("education.school") ? <p className="studio-field-error">{errorFor("education.school")}</p> : null}
          <div className="studio-ordered-editor-list">
            {[...education.school].sort((a, b) => a.order - b.order || a.id.localeCompare(b.id)).map((school) => {
              const index = education.school.findIndex((entry) => entry.id === school.id);
              return (
                <article className="studio-ordered-editor-item studio-ordered-editor-item--wide" key={school.id}>
                  <div className="studio-ordered-editor-main studio-ordered-editor-main--three-up">
                    <StudioEditorField label="Level" error={errorFor(`education.school.${index}.level`)}><input className="studio-form-control" {...form.register(fieldPath(`education.school.${index}.level`))} /></StudioEditorField>
                    <StudioEditorField label="Institution" error={errorFor(`education.school.${index}.institution`)}><input className="studio-form-control" {...form.register(fieldPath(`education.school.${index}.institution`))} /></StudioEditorField>
                    <StudioEditorField label="Score" error={errorFor(`education.school.${index}.score`)}><input className="studio-form-control" {...form.register(fieldPath(`education.school.${index}.score`))} /></StudioEditorField>
                    <code>{school.id}</code>
                  </div>
                  <div className="studio-ordered-editor-options"><label><input type="checkbox" {...form.register(fieldPath(`education.school.${index}.visible`))} /> Visible</label></div>
                  <div className="studio-ordered-editor-actions">
                    <button type="button" aria-label="Move school up" onClick={() => setSchools(moveSchool(education.school, school.id, "up"))}><ArrowUp size={14} /></button>
                    <button type="button" aria-label="Move school down" onClick={() => setSchools(moveSchool(education.school, school.id, "down"))}><ArrowDown size={14} /></button>
                    <button className="is-danger" type="button" aria-label="Remove school" onClick={() => removeSchoolEntry(school.id, school.level)}><Trash2 size={14} /></button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <StudioEditorActions isDirty={isDirty} isSubmitting={isSubmitting} onReset={resetChanges} />
      </form>
    </div>
  );
}
