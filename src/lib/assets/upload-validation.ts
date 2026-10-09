export const MAX_PORTFOLIO_IMAGE_BYTES = 8 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = {
  "image/jpeg": ["jpg", "jpeg"],
  "image/png": ["png"],
  "image/webp": ["webp"],
  "image/gif": ["gif"],
  "image/avif": ["avif"],
} as const;

export type AllowedPortfolioImageType = keyof typeof ALLOWED_IMAGE_TYPES;

export class UploadValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UploadValidationError";
  }
}

type PortfolioImageUploadMetadata = {
  name: string;
  type: string;
  size: number;
};

export function validatePortfolioImageUploadMetadata(
  input: PortfolioImageUploadMetadata,
): { type: AllowedPortfolioImageType; originalName: string } {
  if (!Number.isSafeInteger(input.size) || input.size < 1) {
    throw new UploadValidationError("Choose a non-empty image file.");
  }

  if (input.size > MAX_PORTFOLIO_IMAGE_BYTES) {
    throw new UploadValidationError("Images must be 8 MB or smaller.");
  }

  if (!(input.type in ALLOWED_IMAGE_TYPES)) {
    throw new UploadValidationError("Use a JPEG, PNG, WebP, GIF, or AVIF image.");
  }

  const type = input.type as AllowedPortfolioImageType;
  const originalName = sanitizeOriginalFilename(input.name);
  const extension = originalName.split(".").pop()?.toLowerCase();

  if (!extension || !ALLOWED_IMAGE_TYPES[type].includes(extension as never)) {
    throw new UploadValidationError("The file extension does not match the selected image type.");
  }

  return { type, originalName };
}

function hasBytes(bytes: Uint8Array, expected: ReadonlyArray<number>, offset = 0): boolean {
  return expected.every((value, index) => bytes[offset + index] === value);
}

function hasAscii(bytes: Uint8Array, value: string, offset = 0): boolean {
  return [...value].every((character, index) => bytes[offset + index] === character.charCodeAt(0));
}

function matchesImageSignature(type: AllowedPortfolioImageType, bytes: Uint8Array): boolean {
  switch (type) {
    case "image/jpeg":
      return hasBytes(bytes, [0xff, 0xd8, 0xff]);
    case "image/png":
      return hasBytes(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    case "image/webp":
      return hasAscii(bytes, "RIFF") && hasAscii(bytes, "WEBP", 8);
    case "image/gif":
      return hasAscii(bytes, "GIF87a") || hasAscii(bytes, "GIF89a");
    case "image/avif":
      return hasAscii(bytes, "ftyp", 4) &&
        (hasAscii(bytes, "avif", 8) || hasAscii(bytes, "avis", 8));
  }
}

export function sanitizeOriginalFilename(value: string): string {
  const filename = value.split(/[\\/]/).pop()?.trim() || "portfolio-image";
  return filename.replace(/[\u0000-\u001f\u007f]/g, "").slice(0, 255) || "portfolio-image";
}

export function validatePortfolioImageUpload(input: {
  name: string;
  type: string;
  size: number;
  bytes: Uint8Array;
}): { type: AllowedPortfolioImageType; originalName: string } {
  const validated = validatePortfolioImageUploadMetadata(input);

  if (!matchesImageSignature(validated.type, input.bytes)) {
    throw new UploadValidationError("The file contents do not match the selected image type.");
  }

  return validated;
}
