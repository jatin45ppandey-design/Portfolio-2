import { z } from "zod";

import {
  getNextStableEditorId,
  hasSequentialEditorOrder,
  moveEditorItem,
  normalizeEditorOrder,
} from "./editor-collections";
import { PortfolioDocumentSchema, type PortfolioDocument } from "./schema";

const AchievementsPayloadBaseSchema = PortfolioDocumentSchema.pick({ achievements: true });

export const AchievementsEditorPayloadSchema = AchievementsPayloadBaseSchema.superRefine(
  (payload, context) => {
    const ids = new Set<string>();

    if (!hasSequentialEditorOrder(payload.achievements.items)) {
      context.addIssue({
        code: "custom",
        path: ["achievements", "items"],
        message: "Achievements must use a consecutive order starting at 1.",
      });
    }

    if (!payload.achievements.items.some((achievement) => achievement.visible)) {
      context.addIssue({
        code: "custom",
        path: ["achievements", "items"],
        message: "Keep at least one visible achievement for the fixed public section.",
      });
    }

    payload.achievements.items.forEach((achievement, index) => {
      if (ids.has(achievement.id)) {
        context.addIssue({
          code: "custom",
          path: ["achievements", "items", index, "id"],
          message: "Each achievement needs a unique stable ID.",
        });
      }
      ids.add(achievement.id);

      if (achievement.visible && !achievement.image) {
        context.addIssue({
          code: "custom",
          path: ["achievements", "items", index, "image"],
          message: "A visible achievement needs an existing local image.",
        });
      }

    });
  },
);

export const AchievementsEditorSubmissionSchema = z
  .object({
    payload: AchievementsEditorPayloadSchema,
    expectedDraftVersion: z.number().int().positive(),
  })
  .strict();

export type AchievementsEditorPayload = z.infer<typeof AchievementsEditorPayloadSchema>;
export type EditorAchievement = AchievementsEditorPayload["achievements"]["items"][number];

export function getAchievementsEditorPayload(document: PortfolioDocument): AchievementsEditorPayload {
  return AchievementsEditorPayloadSchema.parse({ achievements: document.achievements });
}

export function mergeAchievementsEditorPayload(
  document: PortfolioDocument,
  payload: AchievementsEditorPayload,
): PortfolioDocument {
  const currentDocument = PortfolioDocumentSchema.parse(document);
  const validatedPayload = AchievementsEditorPayloadSchema.parse(payload);

  return PortfolioDocumentSchema.parse({
    ...currentDocument,
    achievements: validatedPayload.achievements,
  });
}

export function createAchievement(
  achievements: ReadonlyArray<EditorAchievement>,
): EditorAchievement {
  return {
    id: getNextStableEditorId(
      achievements.map((achievement) => achievement.id),
      "new-achievement",
      "achievement",
    ),
    position: "",
    title: "",
    event: "",
    organization: "",
    image: {
      src: "",
      alt: "",
    },
    visible: true,
    order: achievements.length + 1,
  };
}

export function moveAchievement(
  achievements: ReadonlyArray<EditorAchievement>,
  achievementId: string,
  direction: "up" | "down",
): EditorAchievement[] {
  return moveEditorItem(achievements, achievementId, direction);
}

export function removeAchievement(
  achievements: ReadonlyArray<EditorAchievement>,
  achievementId: string,
): EditorAchievement[] {
  if (achievements.length === 1) {
    throw new Error("The fixed Achievements section must keep at least one achievement.");
  }

  return normalizeEditorOrder(
    achievements.filter((achievement) => achievement.id !== achievementId),
  );
}
