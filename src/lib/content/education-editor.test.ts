import assert from "node:assert/strict";
import test from "node:test";

import {
  createSchool,
  createSemester,
  getEducationEditorPayload,
  mergeEducationEditorPayload,
  moveSchool,
  moveSemester,
  removeSchool,
  removeSemester,
} from "@/lib/content/education-editor";
import { portfolio } from "@/lib/portfolio";

test("Education Editor merge preserves unrelated portfolio sections", () => {
  const payload = getEducationEditorPayload(portfolio);
  const merged = mergeEducationEditorPayload(portfolio, {
    education: { ...payload.education, degree: { ...payload.education.degree, current: "3rd Year / 6th Semester" } },
  });

  assert.equal(merged.education.degree.current, "3rd Year / 6th Semester");
  assert.deepEqual(merged.profile, portfolio.profile);
  assert.deepEqual(merged.projects, portfolio.projects);
  assert.deepEqual(merged.skills, portfolio.skills);
  assert.deepEqual(merged.leadership, portfolio.leadership);
});

test("Education Editor creates stable unique collection IDs", () => {
  const payload = getEducationEditorPayload(portfolio);
  const semester = createSemester(payload.education.degree.sgpa);
  const school = createSchool(payload.education.school);

  assert.equal(semester.id, "semester");
  assert.equal(school.id, "school");
});

test("Education Editor moves collection entries deterministically", () => {
  const payload = getEducationEditorPayload(portfolio);
  const semesters = moveSemester(payload.education.degree.sgpa, payload.education.degree.sgpa[1].id, "up");
  const schools = moveSchool(payload.education.school, payload.education.school[1].id, "up");

  assert.equal(semesters[0].id, payload.education.degree.sgpa[1].id);
  assert.deepEqual(semesters.map((entry) => entry.order), [1, 2, 3, 4]);
  assert.equal(schools[0].id, payload.education.school[1].id);
  assert.deepEqual(schools.map((entry) => entry.order), [1, 2]);
});

test("Education Editor protects required visible collection entries", () => {
  const payload = getEducationEditorPayload(portfolio);
  assert.throws(() => removeSemester([payload.education.degree.sgpa[0]], payload.education.degree.sgpa[0].id), /at least one semester/i);
  assert.throws(() => removeSchool([payload.education.school[0]], payload.education.school[0].id), /at least one school/i);
});
