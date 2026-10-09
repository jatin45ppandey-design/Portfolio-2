import { z } from "zod";

import {
  getNextStableEditorId,
  hasSequentialEditorOrder,
  moveEditorItem,
  normalizeEditorOrder,
} from "./editor-collections";
import { PortfolioDocumentSchema, type PortfolioDocument } from "./schema";

const EducationPayloadBaseSchema = PortfolioDocumentSchema.pick({ education: true });

export const EducationEditorPayloadSchema = EducationPayloadBaseSchema.superRefine((payload, context) => {
  const semesterIds = new Set<string>();
  const schoolIds = new Set<string>();
  const { sgpa } = payload.education.degree;
  const { school } = payload.education;

  if (!hasSequentialEditorOrder(sgpa)) {
    context.addIssue({ code: "custom", path: ["education", "degree", "sgpa"], message: "Semester entries must use a consecutive order starting at 1." });
  }
  if (!sgpa.some((semester) => semester.visible)) {
    context.addIssue({ code: "custom", path: ["education", "degree", "sgpa"], message: "Keep at least one visible semester result." });
  }
  sgpa.forEach((semester, index) => {
    if (semesterIds.has(semester.id)) {
      context.addIssue({ code: "custom", path: ["education", "degree", "sgpa", index, "id"], message: "Each semester entry needs a unique stable ID." });
    }
    semesterIds.add(semester.id);
  });

  if (!hasSequentialEditorOrder(school)) {
    context.addIssue({ code: "custom", path: ["education", "school"], message: "School entries must use a consecutive order starting at 1." });
  }
  if (!school.some((entry) => entry.visible)) {
    context.addIssue({ code: "custom", path: ["education", "school"], message: "Keep at least one visible school entry." });
  }
  school.forEach((entry, index) => {
    if (schoolIds.has(entry.id)) {
      context.addIssue({ code: "custom", path: ["education", "school", index, "id"], message: "Each school entry needs a unique stable ID." });
    }
    schoolIds.add(entry.id);
  });
});

export const EducationEditorSubmissionSchema = z
  .object({
    payload: EducationEditorPayloadSchema,
    expectedDraftVersion: z.number().int().positive(),
  })
  .strict();

export type EducationEditorPayload = z.infer<typeof EducationEditorPayloadSchema>;
export type EditorSemester = PortfolioDocument["education"]["degree"]["sgpa"][number];
export type EditorSchool = PortfolioDocument["education"]["school"][number];

export function getEducationEditorPayload(document: PortfolioDocument): EducationEditorPayload {
  return EducationEditorPayloadSchema.parse({ education: document.education });
}

export function mergeEducationEditorPayload(
  document: PortfolioDocument,
  payload: EducationEditorPayload,
): PortfolioDocument {
  const currentDocument = PortfolioDocumentSchema.parse(document);
  const validatedPayload = EducationEditorPayloadSchema.parse(payload);
  return PortfolioDocumentSchema.parse({ ...currentDocument, education: validatedPayload.education });
}

export function createSemester(semesters: ReadonlyArray<EditorSemester>): EditorSemester {
  return {
    id: getNextStableEditorId(semesters.map((semester) => semester.id), "semester", "semester"),
    semester: "",
    value: "",
    visible: true,
    order: semesters.length + 1,
  };
}

export function createSchool(schools: ReadonlyArray<EditorSchool>): EditorSchool {
  return {
    id: getNextStableEditorId(schools.map((school) => school.id), "school", "school"),
    level: "",
    institution: "",
    score: "",
    visible: true,
    order: schools.length + 1,
  };
}

export function moveSemester(semesters: ReadonlyArray<EditorSemester>, id: string, direction: "up" | "down") {
  return moveEditorItem(semesters, id, direction);
}

export function moveSchool(schools: ReadonlyArray<EditorSchool>, id: string, direction: "up" | "down") {
  return moveEditorItem(schools, id, direction);
}

function removeRequiredVisibleItem<T extends { id: string; visible: boolean; order: number }>(
  items: ReadonlyArray<T>,
  id: string,
  label: string,
): T[] {
  if (items.length === 1) {
    throw new Error(`At least one ${label} entry is required.`);
  }

  const item = items.find((candidate) => candidate.id === id);
  if (item?.visible && items.filter((candidate) => candidate.visible).length === 1) {
    throw new Error(`Keep at least one visible ${label} entry.`);
  }

  return normalizeEditorOrder(items.filter((candidate) => candidate.id !== id));
}

export function removeSemester(semesters: ReadonlyArray<EditorSemester>, id: string) {
  return removeRequiredVisibleItem(semesters, id, "semester");
}

export function removeSchool(schools: ReadonlyArray<EditorSchool>, id: string) {
  return removeRequiredVisibleItem(schools, id, "school");
}
