import { z } from "zod";

import {
  getNextStableEditorId,
  hasSequentialEditorOrder,
  moveEditorItem,
  normalizeEditorOrder,
} from "./editor-collections";
import { PortfolioDocumentSchema, type PortfolioDocument } from "./schema";

const CertificationsPayloadBaseSchema = PortfolioDocumentSchema.pick({ certifications: true });

export const CertificationsEditorPayloadSchema = CertificationsPayloadBaseSchema.superRefine(
  (payload, context) => {
    const ids = new Set<string>();
    const slugs = new Set<string>();

    if (!hasSequentialEditorOrder(payload.certifications.items)) {
      context.addIssue({
        code: "custom",
        path: ["certifications", "items"],
        message: "Certifications must use a consecutive order starting at 1.",
      });
    }

    if (!payload.certifications.items.some((certificate) => certificate.visible && certificate.featured)) {
      context.addIssue({
        code: "custom",
        path: ["certifications", "items"],
        message: "Keep at least one visible featured certification for the fixed public section.",
      });
    }

    payload.certifications.items.forEach((certificate, index) => {
      if (ids.has(certificate.id)) {
        context.addIssue({
          code: "custom",
          path: ["certifications", "items", index, "id"],
          message: "Each certification needs a unique stable ID.",
        });
      }
      ids.add(certificate.id);

      if (slugs.has(certificate.slug)) {
        context.addIssue({
          code: "custom",
          path: ["certifications", "items", index, "slug"],
          message: "Each certification needs a unique slug.",
        });
      }
      slugs.add(certificate.slug);

      if (certificate.featured && !certificate.visible) {
        context.addIssue({
          code: "custom",
          path: ["certifications", "items", index, "featured"],
          message: "A featured certification must also be visible.",
        });
      }
    });
  },
);

export const CertificationsEditorSubmissionSchema = z
  .object({
    payload: CertificationsEditorPayloadSchema,
    expectedDraftVersion: z.number().int().positive(),
  })
  .strict();

export type CertificationsEditorPayload = z.infer<typeof CertificationsEditorPayloadSchema>;
export type EditorCertification = CertificationsEditorPayload["certifications"]["items"][number];

export function getCertificationsEditorPayload(document: PortfolioDocument): CertificationsEditorPayload {
  return CertificationsEditorPayloadSchema.parse({ certifications: document.certifications });
}

export function mergeCertificationsEditorPayload(
  document: PortfolioDocument,
  payload: CertificationsEditorPayload,
): PortfolioDocument {
  const currentDocument = PortfolioDocumentSchema.parse(document);
  const validatedPayload = CertificationsEditorPayloadSchema.parse(payload);

  return PortfolioDocumentSchema.parse({
    ...currentDocument,
    certifications: validatedPayload.certifications,
  });
}

export function createCertification(
  certifications: ReadonlyArray<EditorCertification>,
): EditorCertification {
  const usedIds = certifications.map((certificate) => certificate.id);
  const usedSlugs = certifications.map((certificate) => certificate.slug);

  return {
    id: getNextStableEditorId(usedIds, "new-certification", "certification"),
    slug: getNextStableEditorId(usedSlugs, "new-certification", "certification"),
    title: "",
    issuer: "",
    category: "",
    image: {
      src: "",
      alt: "",
    },
    visible: true,
    featured: false,
    order: certifications.length + 1,
  };
}

export function moveCertification(
  certifications: ReadonlyArray<EditorCertification>,
  certificationId: string,
  direction: "up" | "down",
): EditorCertification[] {
  return moveEditorItem(certifications, certificationId, direction);
}

export function removeCertification(
  certifications: ReadonlyArray<EditorCertification>,
  certificationId: string,
): EditorCertification[] {
  if (certifications.length === 1) {
    throw new Error("The fixed Certifications section must keep at least one certification.");
  }

  return normalizeEditorOrder(
    certifications.filter((certificate) => certificate.id !== certificationId),
  );
}
