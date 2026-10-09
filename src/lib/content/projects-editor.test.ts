import assert from "node:assert/strict";
import test from "node:test";

import {
  createNewProject,
  getNextProjectId,
  getProjectsEditorPayload,
  mergeProjectsEditorPayload,
  moveProject,
  moveProjectImage,
  ProjectsEditorPayloadSchema,
  removeProject,
} from "@/lib/content/projects-editor";
import { portfolio } from "@/lib/portfolio";

test("Projects Editor merge preserves unrelated portfolio content", () => {
  const payload = getProjectsEditorPayload(portfolio);
  const mergedDocument = mergeProjectsEditorPayload(portfolio, {
    projects: payload.projects.map((project) =>
      project.id === "codesense" ? { ...project, title: "CodeSense Studio" } : project,
    ),
  });

  assert.equal(mergedDocument.projects.find((project) => project.id === "codesense")?.title, "CodeSense Studio");
  assert.deepEqual(mergedDocument.profile, portfolio.profile);
  assert.deepEqual(mergedDocument.skills, portfolio.skills);
  assert.deepEqual(mergedDocument.education, portfolio.education);
  assert.deepEqual(mergedDocument.certifications, portfolio.certifications);
  assert.deepEqual(mergedDocument.navigation, portfolio.navigation);
});

test("Projects Editor requires one visible featured primary project", () => {
  const payload = getProjectsEditorPayload(portfolio);
  const result = ProjectsEditorPayloadSchema.safeParse({
    projects: payload.projects.map((project) => ({ ...project, featured: false })),
  });

  assert.equal(result.success, false);
});

test("Projects Editor move controls update deterministic project order", () => {
  const movedProjects = moveProject(portfolio.projects, "khao-piio", "up");

  assert.deepEqual(
    movedProjects.map((project) => project.id),
    ["bhumiai", "khao-piio", "codesense", "payvia"],
  );
  assert.deepEqual(
    movedProjects.map((project) => project.order),
    [1, 2, 3, 4],
  );
});

test("Projects Editor image move controls update deterministic image order", () => {
  const bhumiAi = portfolio.projects.find((project) => project.id === "bhumiai");
  assert.ok(bhumiAi);

  const movedImages = moveProjectImage(bhumiAi.images, "bhumiai-verify-record", "up");

  assert.deepEqual(
    movedImages.map((image) => image.id),
    ["bhumiai-officer-review", "bhumiai-verify-record", "bhumiai-upload-workspace"],
  );
  assert.deepEqual(
    movedImages.map((image) => image.order),
    [1, 2, 3],
  );
});

test("Projects Editor generates collision-safe stable IDs for new projects", () => {
  const firstId = getNextProjectId(portfolio.projects);
  const newProject = createNewProject(portfolio.projects);
  const secondId = getNextProjectId([...portfolio.projects, newProject]);

  assert.equal(firstId, "new-project");
  assert.equal(newProject.id, "new-project");
  assert.equal(newProject.slug, "new-project");
  assert.equal(secondId, "new-project-2");
});

test("Projects Editor removal keeps order contiguous and protects the primary project", () => {
  const remainingProjects = removeProject(portfolio.projects, "codesense");

  assert.deepEqual(
    remainingProjects.map((project) => project.order),
    [1, 2, 3],
  );
  assert.throws(() => removeProject(portfolio.projects, "bhumiai"), /featured project/);
});
