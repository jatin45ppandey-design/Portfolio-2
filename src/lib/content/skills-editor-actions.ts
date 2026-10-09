"use server";

import { mergeSkillsEditorPayload, SkillsEditorSubmissionSchema } from "./skills-editor";
import { saveStudioSectionDraft, type SectionDraftSaveResult } from "./section-editor-action";

export type SkillsDraftSaveResult = SectionDraftSaveResult;

export async function saveSkillsDraftAction(input: unknown): Promise<SkillsDraftSaveResult> {
  return saveStudioSectionDraft(input, {
    schema: SkillsEditorSubmissionSchema,
    merge: mergeSkillsEditorPayload,
    errorLabel: "skills",
  });
}
