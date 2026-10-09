import { z } from "zod";

import { PortfolioDocumentSchema, type PortfolioDocument } from "./schema";

const LeadershipPayloadBaseSchema = PortfolioDocumentSchema.pick({ leadership: true });

export const LeadershipEditorPayloadSchema = LeadershipPayloadBaseSchema;

export const LeadershipEditorSubmissionSchema = z
  .object({
    payload: LeadershipEditorPayloadSchema,
    expectedDraftVersion: z.number().int().positive(),
  })
  .strict();

export type LeadershipEditorPayload = z.infer<typeof LeadershipEditorPayloadSchema>;

export function getLeadershipEditorPayload(document: PortfolioDocument): LeadershipEditorPayload {
  return LeadershipEditorPayloadSchema.parse({ leadership: document.leadership });
}

export function mergeLeadershipEditorPayload(
  document: PortfolioDocument,
  payload: LeadershipEditorPayload,
): PortfolioDocument {
  const currentDocument = PortfolioDocumentSchema.parse(document);
  const validatedPayload = LeadershipEditorPayloadSchema.parse(payload);
  return PortfolioDocumentSchema.parse({ ...currentDocument, leadership: validatedPayload.leadership });
}
