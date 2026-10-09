import assert from "node:assert/strict";
import test from "node:test";

import {
  MAX_PORTFOLIO_IMAGE_BYTES,
  UploadValidationError,
  validatePortfolioImageUpload,
  validatePortfolioImageUploadMetadata,
} from "@/lib/assets/upload-validation";

const pngHeader = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

test("upload validation accepts a matching portfolio image", () => {
  const result = validatePortfolioImageUpload({
    name: "certificate.png",
    type: "image/png",
    size: pngHeader.byteLength,
    bytes: pngHeader,
  });

  assert.equal(result.type, "image/png");
  assert.equal(result.originalName, "certificate.png");
});

test("upload validation rejects unsupported and oversized files", () => {
  assert.throws(
    () =>
      validatePortfolioImageUploadMetadata({
        name: "large.png",
        type: "image/png",
        size: MAX_PORTFOLIO_IMAGE_BYTES + 1,
      }),
    UploadValidationError,
  );

  assert.throws(
    () =>
      validatePortfolioImageUpload({
        name: "document.svg",
        type: "image/svg+xml",
        size: 8,
        bytes: pngHeader,
      }),
    UploadValidationError,
  );

  assert.throws(
    () =>
      validatePortfolioImageUpload({
        name: "large.png",
        type: "image/png",
        size: MAX_PORTFOLIO_IMAGE_BYTES + 1,
        bytes: pngHeader,
      }),
    UploadValidationError,
  );
});

test("upload validation rejects spoofed file contents and extensions", () => {
  assert.throws(
    () =>
      validatePortfolioImageUpload({
        name: "fake.png",
        type: "image/png",
        size: 4,
        bytes: new Uint8Array([1, 2, 3, 4]),
      }),
    UploadValidationError,
  );

  assert.throws(
    () =>
      validatePortfolioImageUpload({
        name: "fake.jpg",
        type: "image/png",
        size: pngHeader.byteLength,
        bytes: pngHeader,
      }),
    UploadValidationError,
  );
});
