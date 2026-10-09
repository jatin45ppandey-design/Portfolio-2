"use server";

import { EducationEditorSubmissionSchema, mergeEducationEditorPayload } from "./education-editor";
import { saveStudioSectionDraft, type SectionDraftSaveResult } from "./section-editor-action";

export type EducationDraftSaveResult = SectionDraftSaveResult;

export async function saveEducationDraftAction(input: unknown): Promise<EducationDraftSaveResult> {
  return saveStudioSectionDraft(input, {
    schema: EducationEditorSubmissionSchema,
    merge: mergeEducationEditorPayload,
    errorLabel: "education",
  });
}
