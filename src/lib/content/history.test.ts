import assert from "node:assert/strict";
import test from "node:test";

import {
  createRestoreDraftPlan,
  formatSafeStudioActivity,
  sortRevisionSummariesNewest,
} from "@/lib/content/history";
import {
  DraftVersionConflictError,
  InvalidStoredPortfolioPayloadError,
} from "@/lib/content/repository-errors";
import { portfolio } from "@/lib/portfolio";

test("revision summaries are ordered newest first without mutating the input", () => {
  const revisions = [{ version: 2 }, { version: 5 }, { version: 3 }];

  assert.deepEqual(
    sortRevisionSummariesNewest(revisions).map((revision) => revision.version),
    [5, 3, 2],
  );
  assert.deepEqual(
    revisions.map((revision) => revision.version),
    [2, 5, 3],
  );
});

test("restore rejects an invalid historical payload before creating a write plan", () => {
  assert.throws(
    () =>
      createRestoreDraftPlan({
        currentState: { draftVersion: 7, publishedRevisionId: "published-revision" },
        expectedDraftVersion: 7,
        sourceRevision: { id: "source-revision", version: 3, payload: {} },
      }),
    InvalidStoredPortfolioPayloadError,
  );
});

test("restore plan changes only draft content and increments its version exactly once", () => {
  const currentState = {
    draftVersion: 7,
    publishedRevisionId: "published-revision",
    draftPayload: { previous: true },
  };
  const sourcePayload = structuredClone(portfolio);
  const sourceBefore = structuredClone(sourcePayload);
  const plan = createRestoreDraftPlan({
    currentState,
    expectedDraftVersion: 7,
    sourceRevision: { id: "source-revision", version: 3, payload: sourcePayload },
  });
  const resultingState = { ...currentState, ...plan.stateUpdate };

  assert.equal(resultingState.draftVersion, 8);
  assert.deepEqual(resultingState.draftPayload, portfolio);
  assert.equal(resultingState.publishedRevisionId, "published-revision");
  assert.deepEqual(Object.keys(plan.stateUpdate).sort(), ["draftPayload", "draftVersion"]);
  assert.deepEqual(sourcePayload, sourceBefore, "the immutable revision payload must not be changed");
});

test("restore plan rejects a stale expected draft version", () => {
  assert.throws(
    () =>
      createRestoreDraftPlan({
        currentState: { draftVersion: 8, publishedRevisionId: "published-revision" },
        expectedDraftVersion: 7,
        sourceRevision: { id: "source-revision", version: 3, payload: portfolio },
      }),
    DraftVersionConflictError,
  );
});

test("restore audit metadata contains only safe version fields", () => {
  const plan = createRestoreDraftPlan({
    currentState: { draftVersion: 7, publishedRevisionId: "published-revision" },
    expectedDraftVersion: 7,
    sourceRevision: { id: "source-revision", version: 3, payload: portfolio },
  });

  assert.deepEqual(plan.auditMetadata, {
    sourceRevisionVersion: 3,
    previousDraftVersion: 7,
    newDraftVersion: 8,
  });
  assert.equal(JSON.stringify(plan.auditMetadata).includes("payload"), false);
  assert.equal(JSON.stringify(plan.auditMetadata).includes("source-revision"), false);
});

test("recent activity ignores unknown actions and unapproved metadata fields", () => {
  assert.equal(formatSafeStudioActivity("UNKNOWN_ACTION", { secret: "no" }), null);
  assert.equal(
    formatSafeStudioActivity("REVISION_RESTORED_TO_DRAFT", {
      sourceRevisionVersion: 3,
      newDraftVersion: 8,
      secret: "not surfaced",
    }),
    "Revision restored to draft from revision 3; draft version 8",
  );
});
