"use server";

import {
  AchievementsEditorSubmissionSchema,
  mergeAchievementsEditorPayload,
} from "./achievements-editor";
import { saveStudioSectionDraft, type SectionDraftSaveResult } from "./section-editor-action";

export type AchievementsDraftSaveResult = SectionDraftSaveResult;

export async function saveAchievementsDraftAction(
  input: unknown,
): Promise<AchievementsDraftSaveResult> {
  return saveStudioSectionDraft(input, {
    schema: AchievementsEditorSubmissionSchema,
    merge: mergeAchievementsEditorPayload,
    errorLabel: "achievements",
    validateAssetReferences: true,
  });
}
