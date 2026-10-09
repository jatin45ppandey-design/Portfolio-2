import assert from "node:assert/strict";
import test from "node:test";

import {
  AchievementsEditorPayloadSchema,
  createAchievement,
  getAchievementsEditorPayload,
  mergeAchievementsEditorPayload,
  moveAchievement,
  removeAchievement,
} from "@/lib/content/achievements-editor";
import { portfolio } from "@/lib/portfolio";

test("Achievements Editor merge preserves unrelated portfolio sections", () => {
  const payload = getAchievementsEditorPayload(portfolio);
  const merged = mergeAchievementsEditorPayload(portfolio, {
    achievements: {
      ...payload.achievements,
      section: { ...payload.achievements.section, heading: "Updated achievements heading" },
    },
  });

  assert.equal(merged.achievements.section.heading, "Updated achievements heading");
  assert.deepEqual(merged.profile, portfolio.profile);
  assert.deepEqual(merged.projects, portfolio.projects);
  assert.deepEqual(merged.certifications, portfolio.certifications);
  assert.deepEqual(merged.leadership, portfolio.leadership);
});

test("Achievements Editor creates collision-safe stable IDs and order", () => {
  const first = createAchievement(portfolio.achievements.items);
  const second = createAchievement([...portfolio.achievements.items, first]);

  assert.equal(first.id, "new-achievement");
  assert.equal(second.id, "new-achievement-2");
  assert.equal(second.order, portfolio.achievements.items.length + 2);
});

test("Achievements Editor reorders and removes deterministically", () => {
  const moved = moveAchievement(
    portfolio.achievements.items,
    portfolio.achievements.items[1].id,
    "up",
  );
  assert.equal(moved[0].id, portfolio.achievements.items[1].id);
  assert.deepEqual(moved.map((achievement) => achievement.order), [1, 2]);

  const withExtra = [...moved, { ...createAchievement(moved), visible: false }];
  const removed = removeAchievement(withExtra, withExtra[1].id);
  assert.equal(removed.length, withExtra.length - 1);
  assert.deepEqual(removed.map((achievement) => achievement.order), [1, 2]);
});

test("Achievements Editor rejects arbitrary remote images and visible image-less items", () => {
  const payload = getAchievementsEditorPayload(portfolio);
  const remoteImage = structuredClone(payload);
  remoteImage.achievements.items[0].image = {
    src: "https://example.com/achievement.png",
    alt: "Remote image",
  };
  assert.equal(AchievementsEditorPayloadSchema.safeParse(remoteImage).success, false);

  const missingImage = structuredClone(payload);
  delete missingImage.achievements.items[0].image;
  assert.equal(AchievementsEditorPayloadSchema.safeParse(missingImage).success, false);
});
