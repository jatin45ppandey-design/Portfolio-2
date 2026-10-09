import { z } from "zod";

const StableIdSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export function isLocalPortfolioImageSource(value: string): boolean {
  if (!value.startsWith("/images/") || /[\\%?#]/.test(value)) {
    return false;
  }

  const segments = value.split("/").slice(2);

  return (
    segments.length > 0 &&
    segments.every((segment) => segment.length > 0 && segment !== "." && segment !== "..")
  );
}

export function isCloudinaryPortfolioImageSource(value: string): boolean {
  try {
    const url = new URL(value);

    return (
      url.protocol === "https:" &&
      url.hostname === "res.cloudinary.com" &&
      !url.username &&
      !url.password &&
      !url.port &&
      !url.search &&
      !url.hash &&
      /^\/[^/]+\/image\/upload\/.+/.test(url.pathname)
    );
  } catch {
    return false;
  }
}

export function isPortfolioImageSource(value: string): boolean {
  return isLocalPortfolioImageSource(value) || isCloudinaryPortfolioImageSource(value);
}

export const PortfolioImageSourceSchema = z
  .string()
  .min(1)
  .refine(isPortfolioImageSource, {
    message: "Use a local /images/ path or a secure Cloudinary image URL.",
  });

const ImageSchema = z
  .object({
    src: PortfolioImageSourceSchema,
    alt: z.string().min(1),
    label: z.string().min(1).optional(),
  })
  .strict();

const ProjectImageSchema = ImageSchema.extend({
  id: StableIdSchema,
  visible: z.boolean(),
  order: z.number().int().positive(),
}).strict();

const ProjectSchema = z
  .object({
    id: StableIdSchema,
    slug: StableIdSchema,
    title: z.string().min(1),
    category: z.string().min(1),
    description: z.string().min(1),
    highlights: z.array(z.string().min(1)),
    techStack: z.array(z.string().min(1)).min(1),
    githubUrl: z.string().url(),
    liveUrl: z.string().url().optional(),
    images: z.array(ProjectImageSchema).min(1),
    featured: z.boolean(),
    visible: z.boolean(),
    order: z.number().int().positive(),
  })
  .strict();

const SkillSchema = z
  .object({
    id: StableIdSchema,
    name: z.string().min(1),
    featured: z.boolean(),
    visible: z.boolean(),
    order: z.number().int().positive(),
  })
  .strict();

const SkillGroupSchema = z
  .object({
    id: StableIdSchema,
    name: z.string().min(1),
    visible: z.boolean(),
    order: z.number().int().positive(),
    skills: z.array(SkillSchema).min(1),
  })
  .strict();

const CertificateSchema = z
  .object({
    id: StableIdSchema,
    slug: StableIdSchema,
    title: z.string().min(1),
    issuer: z.string().min(1),
    date: z.string().min(1).optional(),
    category: z.string().min(1),
    image: ImageSchema,
    visible: z.boolean(),
    featured: z.boolean(),
    order: z.number().int().positive(),
  })
  .strict();

const AchievementSchema = z
  .object({
    id: StableIdSchema,
    position: z.string().min(1),
    title: z.string().min(1),
    event: z.string().min(1),
    organization: z.string().min(1),
    date: z.string().min(1).optional(),
    image: ImageSchema.optional(),
    visible: z.boolean(),
    order: z.number().int().positive(),
  })
  .strict();

const NavigationItemSchema = z
  .object({
    label: z.string().min(1),
    href: z.string().min(1),
  })
  .strict();

const SectionHeaderSchema = z
  .object({
    eyebrow: z.string().min(1),
    label: z.string().min(1),
    heading: z.string().min(1),
  })
  .strict();

/**
 * The public site has fixed sections and a fixed layout. This document contains
 * only the editable content for those sections; it deliberately has no generic
 * section, component, HTML, or layout fields.
 */
export const PortfolioDocumentSchema = z
  .object({
    profile: z
      .object({
        name: z.string().min(1),
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        role: z.string().min(1),
        summary: z.string().min(1),
        location: z.string().min(1),
        status: z.string().min(1),
        links: z
          .object({
            github: z.string().url(),
            linkedin: z.string().url(),
            leetcode: z.string().url(),
          })
          .strict(),
      })
      .strict(),
    hero: z
      .object({
        eyebrow: z.string().min(1),
        primaryCta: NavigationItemSchema,
        secondaryCta: NavigationItemSchema,
        image: ImageSchema,
        currentFocus: z.string().min(1),
      })
      .strict(),
    about: z
      .object({
        section: SectionHeaderSchema,
        image: ImageSchema,
        imageNote: z.string().min(1),
        paragraphs: z.array(z.string().min(1)).min(1),
        facts: z
          .array(
            z
              .object({
                label: z.string().min(1),
                value: z.string().min(1),
              })
              .strict(),
          )
          .min(1),
        cta: NavigationItemSchema,
      })
      .strict(),
    navigation: z
      .object({
        primary: z.array(NavigationItemSchema),
        footer: z.array(NavigationItemSchema),
      })
      .strict(),
    projects: z.array(ProjectSchema).min(1),
    skills: z
      .object({
        eyebrow: z.string().min(1),
        label: z.string().min(1),
        heading: z.string().min(1),
        description: z.string().min(1),
        groups: z.array(SkillGroupSchema).min(1),
      })
      .strict(),
    education: z
      .object({
        eyebrow: z.string().min(1),
        label: z.string().min(1),
        heading: z.string().min(1),
        degree: z
          .object({
            title: z.string().min(1),
            institution: z.string().min(1),
            location: z.string().min(1),
            affiliation: z.string().min(1),
            current: z.string().min(1),
            graduation: z.string().min(1),
            sgpa: z
              .array(
                z
                  .object({
                    id: StableIdSchema,
                    semester: z.string().min(1),
                    value: z.string().min(1),
                    visible: z.boolean(),
                    order: z.number().int().positive(),
                  })
                  .strict(),
              )
              .min(1),
          })
          .strict(),
        school: z
          .array(
            z
              .object({
                id: StableIdSchema,
                level: z.string().min(1),
                institution: z.string().min(1),
                score: z.string().min(1),
                visible: z.boolean(),
                order: z.number().int().positive(),
              })
              .strict(),
          )
          .min(1),
      })
      .strict(),
    leadership: z
      .object({
        eyebrow: z.string().min(1),
        label: z.string().min(1),
        heading: z.string().min(1),
        role: z.string().min(1),
        organization: z.string().min(1),
        community: z.string().min(1),
        start: z.string().min(1),
        status: z.string().min(1),
        contribution: z.string().min(1),
        responsibilities: z.array(z.string().min(1)).min(1),
        highlightedEvent: z.string().min(1),
        image: ImageSchema,
      })
      .strict(),
    certifications: z
      .object({
        section: SectionHeaderSchema.extend({
          description: z.string().min(1),
        }).strict(),
        items: z.array(CertificateSchema).min(1),
      })
      .strict(),
    achievements: z
      .object({
        section: SectionHeaderSchema.extend({
          description: z.string().min(1),
        }).strict(),
        items: z.array(AchievementSchema).min(1),
      })
      .strict(),
    contact: z
      .object({
        eyebrow: z.string().min(1),
        label: z.string().min(1),
        heading: z.string().min(1),
        description: z.string().min(1),
        email: z.string().email(),
      })
      .strict(),
    footer: z
      .object({
        role: z.string().min(1),
        focus: z.string().min(1),
      })
      .strict(),
  })
  .strict();

export type PortfolioDocument = z.infer<typeof PortfolioDocumentSchema>;
