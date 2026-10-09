import assert from "node:assert/strict";
import test from "node:test";

import {
  getLeadershipEditorPayload,
  LeadershipEditorPayloadSchema,
  mergeLeadershipEditorPayload,
} from "@/lib/content/leadership-editor";
import { portfolio } from "@/lib/portfolio";

test("Leadership Editor merge preserves unrelated portfolio sections", () => {
  const payload = getLeadershipEditorPayload(portfolio);
  const merged = mergeLeadershipEditorPayload(portfolio, {
    leadership: { ...payload.leadership, status: "Active" },
  });

  assert.equal(merged.leadership.status, "Active");
  assert.deepEqual(merged.profile, portfolio.profile);
  assert.deepEqual(merged.projects, portfolio.projects);
  assert.deepEqual(merged.education, portfolio.education);
  assert.deepEqual(merged.certifications, portfolio.certifications);
});

test("Leadership Editor rejects arbitrary remote image hosts", () => {
  const payload = getLeadershipEditorPayload(portfolio);
  const result = LeadershipEditorPayloadSchema.safeParse({
    leadership: { ...payload.leadership, image: { ...payload.leadership.image, src: "https://example.com/photo.jpg" } },
  });

  assert.equal(result.success, false);
});
