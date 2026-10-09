"use server";

import {
  CertificationsEditorSubmissionSchema,
  mergeCertificationsEditorPayload,
} from "./certifications-editor";
import { saveStudioSectionDraft, type SectionDraftSaveResult } from "./section-editor-action";

export type CertificationsDraftSaveResult = SectionDraftSaveResult;

export async function saveCertificationsDraftAction(
  input: unknown,
): Promise<CertificationsDraftSaveResult> {
  return saveStudioSectionDraft(input, {
    schema: CertificationsEditorSubmissionSchema,
    merge: mergeCertificationsEditorPayload,
    errorLabel: "certifications",
    validateAssetReferences: true,
  });
}
