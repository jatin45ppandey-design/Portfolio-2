"use server";

import { LeadershipEditorSubmissionSchema, mergeLeadershipEditorPayload } from "./leadership-editor";
import { saveStudioSectionDraft, type SectionDraftSaveResult } from "./section-editor-action";

export type LeadershipDraftSaveResult = SectionDraftSaveResult;

export async function saveLeadershipDraftAction(input: unknown): Promise<LeadershipDraftSaveResult> {
  return saveStudioSectionDraft(input, {
    schema: LeadershipEditorSubmissionSchema,
    merge: mergeLeadershipEditorPayload,
    errorLabel: "leadership",
    validateAssetReferences: true,
  });
}
