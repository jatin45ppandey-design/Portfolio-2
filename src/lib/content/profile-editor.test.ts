import assert from "node:assert/strict";
import test from "node:test";

import {
  getProfileEditorPayload,
  mergeProfileEditorPayload,
  ProfileEditorPayloadSchema,
} from "@/lib/content/profile-editor";
import { portfolio } from "@/lib/portfolio";

test("Profile Editor merge preserves unrelated portfolio content", () => {
  const payload = getProfileEditorPayload(portfolio);
  const mergedDocument = mergeProfileEditorPayload(portfolio, {
    ...payload,
    profile: { ...payload.profile, status: "Available for internships" },
  });

  assert.equal(mergedDocument.profile.status, "Available for internships");
  assert.deepEqual(mergedDocument.projects, portfolio.projects);
  assert.deepEqual(mergedDocument.skills, portfolio.skills);
  assert.deepEqual(mergedDocument.hero.image, portfolio.hero.image);
  assert.deepEqual(mergedDocument.navigation, portfolio.navigation);
});

test("Profile Editor applies the canonical URL validation", () => {
  const payload = getProfileEditorPayload(portfolio);
  const result = ProfileEditorPayloadSchema.safeParse({
    ...payload,
    profile: {
      ...payload.profile,
      links: { ...payload.profile.links, github: "not-a-url" },
    },
  });

  assert.equal(result.success, false);
});
