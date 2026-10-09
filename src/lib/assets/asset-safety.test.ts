import assert from "node:assert/strict";
import test from "node:test";

import {
  findInactiveCloudinaryAssetUrls,
  getAssetUsage,
  getCloudinaryImageSources,
} from "@/lib/assets/references";
import {
  AssetReferenceConflictError,
  InvalidAssetStatusTransitionError,
  assertAssetStatusTransition,
} from "@/lib/assets/status-policy";
import {
  isCloudinaryPortfolioImageSource,
  isLocalPortfolioImageSource,
  PortfolioDocumentSchema,
} from "@/lib/content/schema";
import { portfolio } from "@/lib/portfolio";

const cloudinaryUrl =
  "https://res.cloudinary.com/demo-cloud/image/upload/v1234567890/jatin-portfolio/project.png";

test("portfolio image validation supports local and secure Cloudinary sources only", () => {
  assert.equal(isLocalPortfolioImageSource("/images/projects/example.png"), true);
  assert.equal(isLocalPortfolioImageSource("/images/../secret.png"), false);
  assert.equal(isLocalPortfolioImageSource("/images/%2e%2e/secret.png"), false);
  assert.equal(isLocalPortfolioImageSource("/images/projects\\secret.png"), false);
  assert.equal(isLocalPortfolioImageSource("/images/projects/example.png?raw=1"), false);
  assert.equal(isCloudinaryPortfolioImageSource(cloudinaryUrl), true);
  assert.equal(isCloudinaryPortfolioImageSource("http://res.cloudinary.com/demo/image/upload/a.png"), false);
  assert.equal(isCloudinaryPortfolioImageSource("https://example.com/image.png"), false);
  assert.equal(isCloudinaryPortfolioImageSource(`${cloudinaryUrl}?download=1`), false);
});

test("asset references cover draft and published image usage without mutating content", () => {
  const draft = structuredClone(portfolio);
  draft.leadership.image.src = cloudinaryUrl;
  const originalProfile = structuredClone(draft.profile);

  assert.deepEqual(getCloudinaryImageSources(draft), [cloudinaryUrl]);
  assert.deepEqual(getAssetUsage(cloudinaryUrl, draft, portfolio), {
    draft: ["Leadership image"],
    published: [],
  });
  assert.deepEqual(draft.profile, originalProfile);
  assert.equal(PortfolioDocumentSchema.safeParse(draft).success, true);
});

test("inactive Cloudinary references are detected before a draft save", () => {
  const draft = structuredClone(portfolio);
  draft.certifications.items[0].image.src = cloudinaryUrl;

  assert.deepEqual(findInactiveCloudinaryAssetUrls(draft, new Set()), [cloudinaryUrl]);
  assert.deepEqual(findInactiveCloudinaryAssetUrls(draft, new Set([cloudinaryUrl])), []);
});

test("asset status transitions protect references and require two-step deletion", () => {
  assert.throws(
    () =>
      assertAssetStatusTransition({
        current: "ACTIVE",
        target: "ORPHANED",
        references: ["Draft / Leadership image"],
      }),
    AssetReferenceConflictError,
  );

  assert.doesNotThrow(() =>
    assertAssetStatusTransition({ current: "ACTIVE", target: "ORPHANED", references: [] }),
  );
  assert.doesNotThrow(() =>
    assertAssetStatusTransition({ current: "ORPHANED", target: "DELETED", references: [] }),
  );
  assert.throws(
    () => assertAssetStatusTransition({ current: "ACTIVE", target: "DELETED", references: [] }),
    InvalidAssetStatusTransitionError,
  );
});
