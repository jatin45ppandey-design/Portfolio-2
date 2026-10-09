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
} from "@/components/studio/EditorPrimitives";
import { saveSkillsDraftAction } from "@/lib/content/skills-editor-actions";
import {
  createSkill,
  createSkillGroup,
  moveSkill,
  moveSkillGroup,
  removeSkill,
  removeSkillGroup,
  SkillsEditorPayloadSchema,
  type EditorSkillGroup,
  type SkillsEditorPayload,
} from "@/lib/content/skills-editor";

type SkillsEditorProps = {
  initialValues: SkillsEditorPayload;
  initialDraftVersion: number;
};

function orderedGroups(groups: ReadonlyArray<EditorSkillGroup>) {
  return [...groups].sort((left, right) => left.order - right.order || left.id.localeCompare(right.id));
}

export function SkillsEditor({ initialValues, initialDraftVersion }: SkillsEditorProps) {
  const router = useRouter();
  const [draftVersion, setDraftVersion] = useState(initialDraftVersion);
  const [selectedGroupId, setSelectedGroupId] = useState(initialValues.skills.groups[0]?.id ?? "");
  const [feedback, setFeedback] = useState<EditorFeedback | null>(null);
  const form = useForm<SkillsEditorPayload>({
    defaultValues: initialValues,
    mode: "onBlur",
    resolver: zodResolver(SkillsEditorPayloadSchema),
  });
  const watchedSkills = useWatch({ control: form.control, name: "skills" });
  const skillsSection = watchedSkills ?? initialValues.skills;
  const groups = skillsSection.groups;
  const selectedGroupIndex = groups.findIndex((group) => group.id === selectedGroupId);
  const selectedGroup = groups[selectedGroupIndex];
  const { errors, isDirty, isSubmitting } = form.formState;

  useUnsavedChangesWarning(isDirty);

  const fieldPath = (path: string) => path as FieldPath<SkillsEditorPayload>;
  const errorFor = (path: string) => getEditorErrorMessage(errors, path);
  const replaceGroups = (nextGroups: EditorSkillGroup[]) => {
    form.setValue("skills.groups", nextGroups, { shouldDirty: true });
  };

  const addGroup = () => {
    const group = createSkillGroup(groups);
    replaceGroups([...groups, group]);
    setSelectedGroupId(group.id);
    setFeedback(null);
  };

  const removeGroup = () => {
    if (!selectedGroup || !window.confirm(`Remove ${selectedGroup.name || "this skill group"} from the draft?`)) {
      return;
    }

    try {
      const nextGroups = removeSkillGroup(groups, selectedGroup.id);
      replaceGroups(nextGroups);
      setSelectedGroupId(nextGroups[0]?.id ?? "");
      setFeedback(null);
    } catch (error) {
      setFeedback({ tone: "error", message: error instanceof Error ? error.message : "The group could not be removed." });
    }
  };

  const updateSelectedSkills = (nextSkills: EditorSkillGroup["skills"]) => {
    form.setValue(fieldPath(`skills.groups.${selectedGroupIndex}.skills`), nextSkills, { shouldDirty: true });
  };

  const addSkillToGroup = () => {
    if (!selectedGroup) {
      return;
    }

    updateSelectedSkills([...selectedGroup.skills, createSkill(groups, selectedGroup)]);
  };

  const removeSkillFromGroup = (skillId: string, skillName: string) => {
    if (!selectedGroup || !window.confirm(`Remove ${skillName || "this skill"} from the group?`)) {
      return;
    }

    try {
      updateSelectedSkills(removeSkill(selectedGroup.skills, skillId));
      setFeedback(null);
    } catch (error) {
      setFeedback({ tone: "error", message: error instanceof Error ? error.message : "The skill could not be removed." });
    }
  };

  const submit = async (values: SkillsEditorPayload) => {
    setFeedback(null);
    const result = await saveSkillsDraftAction({ payload: values, expectedDraftVersion: draftVersion });

    if (!result.ok) {
      if (result.type === "validation") {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          form.setError(field as FieldPath<SkillsEditorPayload>, { type: "server", message: messages[0] });
        }
        setFeedback({ tone: "error", message: "Review the highlighted skills fields and try again." });
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
    setSelectedGroupId(initialValues.skills.groups[0]?.id ?? "");
    setFeedback(null);
  };

  return (
    <div className="studio-collection-editor">
      <StudioEditorTopline draftVersion={draftVersion} />
      <StudioEditorNotice feedback={feedback} onReload={() => router.refresh()} />

      <div className="studio-collection-layout">
        <aside className="studio-collection-list" aria-label="Skill groups">
          <div className="studio-project-list-heading">
            <div>
              <span>Groups</span>
              <strong>{groups.length} in draft</strong>
            </div>
            <button className="studio-project-add-button" type="button" onClick={addGroup}>
              <Plus size={15} aria-hidden="true" />
              Add group
            </button>
          </div>
          <div className="studio-collection-list-items">
            {orderedGroups(groups).map((group) => (
              <button
                className={`studio-collection-list-item ${group.id === selectedGroupId ? "is-selected" : ""}`}
                type="button"
                aria-pressed={group.id === selectedGroupId}
                key={group.id}
                onClick={() => setSelectedGroupId(group.id)}
              >
                <strong>{group.name || "Untitled group"}</strong>
                <small>{group.skills.length} skills · {group.visible ? "Visible" : "Hidden"}</small>
              </button>
            ))}
          </div>
        </aside>

        {selectedGroup ? (
          <form
            className="studio-editor-form studio-collection-form"
            onSubmit={form.handleSubmit(submit, () =>
              setFeedback({ tone: "error", message: "Review the highlighted skills fields and try again." }),
            )}
          >
            <section className="studio-editor-group" aria-labelledby="skills-copy-heading">
              <div className="studio-editor-group-heading">
                <span>Section copy</span>
                <h2 id="skills-copy-heading">Skills introduction</h2>
              </div>
              <div className="studio-editor-fields studio-editor-fields--two-up">
                <StudioEditorField label="Eyebrow" error={errorFor("skills.eyebrow")}>
                  <input className="studio-form-control" {...form.register("skills.eyebrow")} />
                </StudioEditorField>
                <StudioEditorField label="Label" error={errorFor("skills.label")}>
                  <input className="studio-form-control" {...form.register("skills.label")} />
                </StudioEditorField>
              </div>
              <div className="studio-editor-fields studio-editor-fields--spaced">
                <StudioEditorField label="Heading" error={errorFor("skills.heading")}>
                  <input className="studio-form-control" {...form.register("skills.heading")} />
                </StudioEditorField>
                <StudioEditorField label="Description" error={errorFor("skills.description")}>
                  <textarea className="studio-form-control studio-form-control--textarea" rows={4} {...form.register("skills.description")} />
                </StudioEditorField>
              </div>
            </section>

            <section className="studio-editor-group" aria-labelledby="skill-group-heading">
              <div className="studio-project-form-heading">
                <div className="studio-editor-group-heading">
                  <span>Group {selectedGroup.order}</span>
                  <h2 id="skill-group-heading">{selectedGroup.name || "Untitled group"}</h2>
                </div>
                <div className="studio-project-order-actions" aria-label="Skill group order">
                  <button type="button" onClick={() => replaceGroups(moveSkillGroup(groups, selectedGroup.id, "up"))}>
                    <ArrowUp size={15} aria-hidden="true" /> Move up
                  </button>
                  <button type="button" onClick={() => replaceGroups(moveSkillGroup(groups, selectedGroup.id, "down"))}>
                    <ArrowDown size={15} aria-hidden="true" /> Move down
                  </button>
                </div>
              </div>

              <div className="studio-editor-fields studio-editor-fields--spaced">
                <StudioEditorField label="Group name" error={errorFor(`skills.groups.${selectedGroupIndex}.name`)}>
                  <input className="studio-form-control" {...form.register(fieldPath(`skills.groups.${selectedGroupIndex}.name`))} />
                </StudioEditorField>
                <label className="studio-project-image-visible">
                  <input type="checkbox" {...form.register(fieldPath(`skills.groups.${selectedGroupIndex}.visible`))} />
                  <span>Visible on the public portfolio</span>
                </label>
                {errorFor(`skills.groups.${selectedGroupIndex}.skills`) ? (
                  <p className="studio-field-error">{errorFor(`skills.groups.${selectedGroupIndex}.skills`)}</p>
                ) : null}
              </div>

              <div className="studio-collection-subheading">
                <div>
                  <span>Skills</span>
                  <strong>{selectedGroup.skills.length} entries</strong>
                </div>
                <button className="studio-project-add-button" type="button" onClick={addSkillToGroup}>
                  <Plus size={15} aria-hidden="true" /> Add skill
                </button>
              </div>

              <div className="studio-ordered-editor-list">
                {[...selectedGroup.skills]
                  .sort((left, right) => left.order - right.order || left.id.localeCompare(right.id))
                  .map((skill) => {
                    const skillIndex = selectedGroup.skills.findIndex((candidate) => candidate.id === skill.id);
                    return (
                      <article className="studio-ordered-editor-item" key={skill.id}>
                        <div className="studio-ordered-editor-main">
                          <StudioEditorField label={`Skill ${skill.order}`} error={errorFor(`skills.groups.${selectedGroupIndex}.skills.${skillIndex}.name`)}>
                            <input className="studio-form-control" {...form.register(fieldPath(`skills.groups.${selectedGroupIndex}.skills.${skillIndex}.name`))} />
                          </StudioEditorField>
                          <code>{skill.id}</code>
                        </div>
                        <div className="studio-ordered-editor-options">
                          <label>
                            <input type="checkbox" {...form.register(fieldPath(`skills.groups.${selectedGroupIndex}.skills.${skillIndex}.visible`))} /> Visible
                          </label>
                          <label>
                            <input type="checkbox" {...form.register(fieldPath(`skills.groups.${selectedGroupIndex}.skills.${skillIndex}.featured`))} /> Emphasized
                          </label>
                        </div>
                        <div className="studio-ordered-editor-actions" aria-label={`${skill.name || "Skill"} order and removal`}>
                          <button type="button" onClick={() => updateSelectedSkills(moveSkill(selectedGroup.skills, skill.id, "up"))} aria-label="Move skill up"><ArrowUp size={14} /></button>
                          <button type="button" onClick={() => updateSelectedSkills(moveSkill(selectedGroup.skills, skill.id, "down"))} aria-label="Move skill down"><ArrowDown size={14} /></button>
                          <button className="is-danger" type="button" onClick={() => removeSkillFromGroup(skill.id, skill.name)} aria-label="Remove skill"><Trash2 size={14} /></button>
                        </div>
                      </article>
                    );
                  })}
              </div>
            </section>

            <StudioEditorActions isDirty={isDirty} isSubmitting={isSubmitting} onReset={resetChanges}>
              <button className="studio-project-remove-button" type="button" disabled={isSubmitting} onClick={removeGroup}>
                <Trash2 size={14} aria-hidden="true" /> Remove group
              </button>
            </StudioEditorActions>
          </form>
        ) : null}
      </div>
    </div>
  );
}
