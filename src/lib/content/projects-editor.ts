import { z } from "zod";

import { PortfolioDocumentSchema, type PortfolioDocument } from "@/lib/content/schema";

const ProjectsPayloadBaseSchema = PortfolioDocumentSchema.pick({ projects: true });

function hasSequentialOrder(items: ReadonlyArray<{ order: number }>): boolean {
  return [...items]
    .sort((left, right) => left.order - right.order)
    .every((item, index) => item.order === index + 1);
}

/**
 * The public projects layout has one primary card. The Studio preserves that
 * fixed presentation by requiring exactly one visible featured project and a
 * visible primary image for every visible project.
 */
export const ProjectsEditorPayloadSchema = ProjectsPayloadBaseSchema.superRefine((payload, context) => {
  const projectIds = new Set<string>();
  const projectSlugs = new Set<string>();
  const visibleFeaturedProjects = payload.projects.filter((project) => project.visible && project.featured);

  if (!hasSequentialOrder(payload.projects)) {
    context.addIssue({
      code: "custom",
      path: ["projects"],
      message: "Projects must use a consecutive order starting at 1.",
    });
  }

  payload.projects.forEach((project, projectIndex) => {
    if (projectIds.has(project.id)) {
      context.addIssue({
        code: "custom",
        path: ["projects", projectIndex, "id"],
        message: "Each project needs a unique stable ID.",
      });
    }
    projectIds.add(project.id);

    if (projectSlugs.has(project.slug)) {
      context.addIssue({
        code: "custom",
        path: ["projects", projectIndex, "slug"],
        message: "Each project needs a unique slug.",
      });
    }
    projectSlugs.add(project.slug);

    if (project.featured && !project.visible) {
      context.addIssue({
        code: "custom",
        path: ["projects", projectIndex, "featured"],
        message: "A featured project must be visible.",
      });
    }

    if (project.visible && !project.images.some((image) => image.visible)) {
      context.addIssue({
        code: "custom",
        path: ["projects", projectIndex, "images"],
        message: "A visible project needs at least one visible image.",
      });
    }

    if (!hasSequentialOrder(project.images)) {
      context.addIssue({
        code: "custom",
        path: ["projects", projectIndex, "images"],
        message: "Project images must use a consecutive order starting at 1.",
      });
    }

    const imageIds = new Set<string>();
    project.images.forEach((image, imageIndex) => {
      if (imageIds.has(image.id)) {
        context.addIssue({
          code: "custom",
          path: ["projects", projectIndex, "images", imageIndex, "id"],
          message: "Each project image needs a unique stable ID.",
        });
      }
      imageIds.add(image.id);

    });
  });

  if (visibleFeaturedProjects.length !== 1) {
    context.addIssue({
      code: "custom",
      path: ["projects"],
      message: "Exactly one visible project must be featured for the primary project card.",
    });
  }
});

export const ProjectsEditorSubmissionSchema = z
  .object({
    payload: ProjectsEditorPayloadSchema,
    expectedDraftVersion: z.number().int().positive(),
  })
  .strict();

export type ProjectsEditorPayload = z.infer<typeof ProjectsEditorPayloadSchema>;
export type ProjectsEditorSubmission = z.infer<typeof ProjectsEditorSubmissionSchema>;
export type EditorProject = PortfolioDocument["projects"][number];
export type EditorProjectImage = EditorProject["images"][number];

export function getProjectsEditorPayload(document: PortfolioDocument): ProjectsEditorPayload {
  return ProjectsEditorPayloadSchema.parse({ projects: document.projects });
}

/**
 * Replaces only the projects collection in a fully validated portfolio
 * document. All other Studio content remains server-authoritative.
 */
export function mergeProjectsEditorPayload(
  document: PortfolioDocument,
  payload: ProjectsEditorPayload,
): PortfolioDocument {
  const currentDocument = PortfolioDocumentSchema.parse(document);
  const validatedPayload = ProjectsEditorPayloadSchema.parse(payload);

  return PortfolioDocumentSchema.parse({
    ...currentDocument,
    projects: validatedPayload.projects,
  });
}

export function toStableProjectId(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "project";
}

export function getNextProjectId(projects: ReadonlyArray<EditorProject>, value = "new-project"): string {
  const baseId = toStableProjectId(value);
  const usedIds = new Set(projects.flatMap((project) => [project.id, project.slug]));

  if (!usedIds.has(baseId)) {
    return baseId;
  }

  let suffix = 2;
  while (usedIds.has(`${baseId}-${suffix}`)) {
    suffix += 1;
  }

  return `${baseId}-${suffix}`;
}

function getNextImageId(projects: ReadonlyArray<EditorProject>, value: string): string {
  const baseId = toStableProjectId(value);
  const usedIds = new Set(projects.flatMap((project) => project.images.map((image) => image.id)));

  if (!usedIds.has(baseId)) {
    return baseId;
  }

  let suffix = 2;
  while (usedIds.has(`${baseId}-${suffix}`)) {
    suffix += 1;
  }

  return `${baseId}-${suffix}`;
}

function sortProjects(projects: ReadonlyArray<EditorProject>): EditorProject[] {
  return [...projects].sort((left, right) => left.order - right.order || left.id.localeCompare(right.id));
}

function sortImages(images: ReadonlyArray<EditorProjectImage>): EditorProjectImage[] {
  return [...images].sort((left, right) => left.order - right.order || left.id.localeCompare(right.id));
}

function normalizeProjectOrder(projects: ReadonlyArray<EditorProject>): EditorProject[] {
  return projects.map((project, index) => ({ ...project, order: index + 1 }));
}

function normalizeImageOrder(images: ReadonlyArray<EditorProjectImage>): EditorProjectImage[] {
  return images.map((image, index) => ({ ...image, order: index + 1 }));
}

export function createNewProject(projects: ReadonlyArray<EditorProject>): EditorProject {
  const id = getNextProjectId(projects);

  return {
    id,
    slug: id,
    title: "",
    category: "",
    description: "",
    highlights: [],
    techStack: [],
    githubUrl: "",
    images: [
      {
        id: getNextImageId(projects, `${id}-image`),
        src: "",
        alt: "",
        visible: true,
        order: 1,
      },
    ],
    featured: false,
    visible: true,
    order: projects.length + 1,
  };
}

export function moveProject(
  projects: ReadonlyArray<EditorProject>,
  projectId: string,
  direction: "up" | "down",
): EditorProject[] {
  const orderedProjects = sortProjects(projects);
  const currentIndex = orderedProjects.findIndex((project) => project.id === projectId);
  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

  if (currentIndex < 0 || targetIndex < 0 || targetIndex >= orderedProjects.length) {
    return normalizeProjectOrder(orderedProjects);
  }

  [orderedProjects[currentIndex], orderedProjects[targetIndex]] = [
    orderedProjects[targetIndex],
    orderedProjects[currentIndex],
  ];

  return normalizeProjectOrder(orderedProjects);
}

export function moveProjectImage(
  images: ReadonlyArray<EditorProjectImage>,
  imageId: string,
  direction: "up" | "down",
): EditorProjectImage[] {
  const orderedImages = sortImages(images);
  const currentIndex = orderedImages.findIndex((image) => image.id === imageId);
  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

  if (currentIndex < 0 || targetIndex < 0 || targetIndex >= orderedImages.length) {
    return normalizeImageOrder(orderedImages);
  }

  [orderedImages[currentIndex], orderedImages[targetIndex]] = [
    orderedImages[targetIndex],
    orderedImages[currentIndex],
  ];

  return normalizeImageOrder(orderedImages);
}

export function removeProject(projects: ReadonlyArray<EditorProject>, projectId: string): EditorProject[] {
  const project = projects.find((candidate) => candidate.id === projectId);

  if (!project) {
    return normalizeProjectOrder(sortProjects(projects));
  }

  if (projects.length === 1) {
    throw new Error("At least one project is required by the fixed public projects section.");
  }

  if (project.featured && project.visible) {
    throw new Error("Choose a different visible featured project before removing the current primary project.");
  }

  return normalizeProjectOrder(sortProjects(projects.filter((candidate) => candidate.id !== projectId)));
}

export function getPrimaryProjectImage(project: EditorProject): EditorProjectImage | undefined {
  return sortImages(project.images).find((image) => image.visible) ?? sortImages(project.images)[0];
}
