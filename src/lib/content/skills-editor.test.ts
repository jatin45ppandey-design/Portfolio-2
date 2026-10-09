import assert from "node:assert/strict";
import test from "node:test";

import {
  createSkill,
  createSkillGroup,
  getSkillsEditorPayload,
  mergeSkillsEditorPayload,
  moveSkill,
  moveSkillGroup,
  removeSkill,
  SkillsEditorPayloadSchema,
} from "@/lib/content/skills-editor";
import { portfolio } from "@/lib/portfolio";

test("Skills Editor merge preserves unrelated portfolio sections", () => {
  const payload = getSkillsEditorPayload(portfolio);
  const merged = mergeSkillsEditorPayload(portfolio, {
    skills: { ...payload.skills, heading: "Technical toolkit" },
  });

  assert.equal(merged.skills.heading, "Technical toolkit");
  assert.deepEqual(merged.profile, portfolio.profile);
  assert.deepEqual(merged.projects, portfolio.projects);
  assert.deepEqual(merged.education, portfolio.education);
  assert.deepEqual(merged.certifications, portfolio.certifications);
});

test("Skills Editor rejects normalized duplicate skills in one group", () => {
  const payload = getSkillsEditorPayload(portfolio);
  const primary = payload.skills.groups[0];
  const duplicate = { ...primary.skills[0], id: "java-duplicate", name: "  JAVA  ", order: primary.skills.length + 1 };
  const result = SkillsEditorPayloadSchema.safeParse({
    skills: {
      ...payload.skills,
      groups: [
        { ...primary, skills: [...primary.skills, duplicate] },
        ...payload.skills.groups.slice(1),
      ],
    },
  });

  assert.equal(result.success, false);
});

test("Skills Editor group and skill moves keep consecutive order", () => {
  const payload = getSkillsEditorPayload(portfolio);
  const movedGroups = moveSkillGroup(payload.skills.groups, "frontend", "up");
  const movedSkills = moveSkill(payload.skills.groups[0].skills, "spring-boot", "up");

  assert.equal(movedGroups[0].id, "frontend");
  assert.deepEqual(movedGroups.map((group) => group.order), [1, 2, 3, 4, 5]);
  assert.equal(movedSkills[0].id, "spring-boot");
  assert.deepEqual(movedSkills.map((skill) => skill.order), [1, 2, 3, 4, 5, 6]);
});

test("Skills Editor generates unique IDs and protects required collection items", () => {
  const payload = getSkillsEditorPayload(portfolio);
  const group = createSkillGroup(payload.skills.groups);
  const skill = createSkill([...payload.skills.groups, group], group);

  assert.equal(group.id, "new-group");
  assert.notEqual(skill.id, group.skills[0].id);
  assert.throws(() => removeSkill([group.skills[0]], group.skills[0].id), /at least one skill/i);
});
