import { z } from "zod";

import { PortfolioDocumentSchema, type PortfolioDocument } from "@/lib/content/schema";

const ProfileSchema = PortfolioDocumentSchema.shape.profile;
const HeroProfileSchema = PortfolioDocumentSchema.shape.hero.pick({
  eyebrow: true,
  currentFocus: true,
});
const AboutProfileSchema = z
  .object({
    section: PortfolioDocumentSchema.shape.about.shape.section.pick({ heading: true }),
    paragraphs: PortfolioDocumentSchema.shape.about.shape.paragraphs,
    facts: PortfolioDocumentSchema.shape.about.shape.facts,
  })
  .strict();
const ContactProfileSchema = PortfolioDocumentSchema.shape.contact.pick({ email: true });
const AcademicStatusSchema = PortfolioDocumentSchema.shape.education.shape.degree.pick({
  current: true,
  graduation: true,
});

/**
 * This is intentionally a derived subset of the canonical PortfolioDocument
 * schema. It exposes profile-related content only, not page structure or
 * unrelated portfolio sections.
 */
export const ProfileEditorPayloadSchema = z
  .object({
    profile: ProfileSchema,
    hero: HeroProfileSchema,
    about: AboutProfileSchema,
    contact: ContactProfileSchema,
    education: z.object({ degree: AcademicStatusSchema }).strict(),
  })
  .strict();

export const ProfileEditorSubmissionSchema = z
  .object({
    payload: ProfileEditorPayloadSchema,
    expectedDraftVersion: z.number().int().positive(),
  })
  .strict();

export type ProfileEditorPayload = z.infer<typeof ProfileEditorPayloadSchema>;
export type ProfileEditorSubmission = z.infer<typeof ProfileEditorSubmissionSchema>;

export function getProfileEditorPayload(document: PortfolioDocument): ProfileEditorPayload {
  return ProfileEditorPayloadSchema.parse({
    profile: document.profile,
    hero: {
      eyebrow: document.hero.eyebrow,
      currentFocus: document.hero.currentFocus,
    },
    about: {
      section: { heading: document.about.section.heading },
      paragraphs: document.about.paragraphs,
      facts: document.about.facts,
    },
    contact: { email: document.contact.email },
    education: {
      degree: {
        current: document.education.degree.current,
        graduation: document.education.degree.graduation,
      },
    },
  });
}

/**
 * Merges the approved Profile Editor subset into a complete draft document.
 * Every omitted field is copied from the latest server-loaded draft.
 */
export function mergeProfileEditorPayload(
  document: PortfolioDocument,
  payload: ProfileEditorPayload,
): PortfolioDocument {
  const currentDocument = PortfolioDocumentSchema.parse(document);
  const validatedPayload = ProfileEditorPayloadSchema.parse(payload);

  return PortfolioDocumentSchema.parse({
    ...currentDocument,
    profile: validatedPayload.profile,
    hero: {
      ...currentDocument.hero,
      ...validatedPayload.hero,
    },
    about: {
      ...currentDocument.about,
      section: {
        ...currentDocument.about.section,
        ...validatedPayload.about.section,
      },
      paragraphs: validatedPayload.about.paragraphs,
      facts: validatedPayload.about.facts,
    },
    contact: {
      ...currentDocument.contact,
      ...validatedPayload.contact,
    },
    education: {
      ...currentDocument.education,
      degree: {
        ...currentDocument.education.degree,
        ...validatedPayload.education.degree,
      },
    },
  });
}
