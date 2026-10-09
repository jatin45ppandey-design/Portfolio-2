import { z } from "zod";

import {
  getNextStableEditorId,
  hasSequentialEditorOrder,
  moveEditorItem,
  normalizeEditorName,
  normalizeEditorOrder,
} from "./editor-collections";
import { PortfolioDocumentSchema, type PortfolioDocument } from "./schema";

const SkillsPayloadBaseSchema = PortfolioDocumentSchema.pick({ skills: true });

export const SkillsEditorPayloadSchema = SkillsPayloadBaseSchema.superRefine((payload, context) => {
  const groupIds = new Set<string>();
  const skillIds = new Set<string>();

  if (!hasSequentialEditorOrder(payload.skills.groups)) {
    context.addIssue({
      code: "custom",
      path: ["skills", "groups"],
      message: "Skill groups must use a consecutive order starting at 1.",
    });
  }

  payload.skills.groups.forEach((group, groupIndex) => {
    if (groupIds.has(group.id)) {
      context.addIssue({
        code: "custom",
        path: ["skills", "groups", groupIndex, "id"],
        message: "Each skill group needs a unique stable ID.",
      });
    }
    groupIds.add(group.id);

    if (group.visible && !group.skills.some((skill) => skill.visible)) {
      context.addIssue({
        code: "custom",
        path: ["skills", "groups", groupIndex, "skills"],
        message: "A visible group needs at least one visible skill.",
      });
    }

    if (!hasSequentialEditorOrder(group.skills)) {
      context.addIssue({
        code: "custom",
        path: ["skills", "groups", groupIndex, "skills"],
        message: "Skills must use a consecutive order starting at 1.",
      });
    }

    const normalizedNames = new Set<string>();
    group.skills.forEach((skill, skillIndex) => {
      if (skillIds.has(skill.id)) {
        context.addIssue({
          code: "custom",
          path: ["skills", "groups", groupIndex, "skills", skillIndex, "id"],
          message: "Each skill needs a unique stable ID.",
        });
      }
      skillIds.add(skill.id);

      const normalizedName = normalizeEditorName(skill.name);
      if (normalizedNames.has(normalizedName)) {
        context.addIssue({
          code: "custom",
          path: ["skills", "groups", groupIndex, "skills", skillIndex, "name"],
          message: "This skill is already present in the group.",
        });
      }
      normalizedNames.add(normalizedName);
    });
  });
});

export const SkillsEditorSubmissionSchema = z
  .object({
    payload: SkillsEditorPayloadSchema,
    expectedDraftVersion: z.number().int().positive(),
  })
  .strict();

export type SkillsEditorPayload = z.infer<typeof SkillsEditorPayloadSchema>;
export type EditorSkillGroup = PortfolioDocument["skills"]["groups"][number];
export type EditorSkill = EditorSkillGroup["skills"][number];

export function getSkillsEditorPayload(document: PortfolioDocument): SkillsEditorPayload {
  return SkillsEditorPayloadSchema.parse({ skills: document.skills });
}

export function mergeSkillsEditorPayload(
  document: PortfolioDocument,
  payload: SkillsEditorPayload,
): PortfolioDocument {
  const currentDocument = PortfolioDocumentSchema.parse(document);
  const validatedPayload = SkillsEditorPayloadSchema.parse(payload);

  return PortfolioDocumentSchema.parse({
    ...currentDocument,
    skills: validatedPayload.skills,
  });
}

export function createSkillGroup(groups: ReadonlyArray<EditorSkillGroup>): EditorSkillGroup {
  const usedGroupIds = groups.map((group) => group.id);
  const usedSkillIds = groups.flatMap((group) => group.skills.map((skill) => skill.id));
  const id = getNextStableEditorId(usedGroupIds, "new-group", "skill-group");

  return {
    id,
    name: "",
    visible: true,
    order: groups.length + 1,
    skills: [
      {
        id: getNextStableEditorId(usedSkillIds, `${id}-skill`, "skill"),
        name: "",
        featured: false,
        visible: true,
        order: 1,
      },
    ],
  };
}

export function createSkill(groups: ReadonlyArray<EditorSkillGroup>, group: EditorSkillGroup): EditorSkill {
  const usedSkillIds = groups.flatMap((candidate) => candidate.skills.map((skill) => skill.id));

  return {
    id: getNextStableEditorId(usedSkillIds, `${group.id}-skill`, "skill"),
    name: "",
    featured: false,
    visible: true,
    order: group.skills.length + 1,
  };
}

export function moveSkillGroup(
  groups: ReadonlyArray<EditorSkillGroup>,
  groupId: string,
  direction: "up" | "down",
): EditorSkillGroup[] {
  return moveEditorItem(groups, groupId, direction);
}

export function moveSkill(
  skills: ReadonlyArray<EditorSkill>,
  skillId: string,
  direction: "up" | "down",
): EditorSkill[] {
  return moveEditorItem(skills, skillId, direction);
}

export function removeSkillGroup(
  groups: ReadonlyArray<EditorSkillGroup>,
  groupId: string,
): EditorSkillGroup[] {
  if (groups.length === 1) {
    throw new Error("At least one skill group is required by the fixed Skills section.");
  }

  return normalizeEditorOrder(groups.filter((group) => group.id !== groupId));
}

export function removeSkill(skills: ReadonlyArray<EditorSkill>, skillId: string): EditorSkill[] {
  if (skills.length === 1) {
    throw new Error("A skill group must keep at least one skill.");
  }

  return normalizeEditorOrder(skills.filter((skill) => skill.id !== skillId));
}
