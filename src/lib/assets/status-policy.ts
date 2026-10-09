import type { StudioAssetStatus } from "./types";

export class AssetReferenceConflictError extends Error {
  constructor(public readonly references: string[]) {
    super("This asset is still referenced by the current draft or published portfolio.");
    this.name = "AssetReferenceConflictError";
  }
}

export class InvalidAssetStatusTransitionError extends Error {
  constructor() {
    super("This asset status change is not allowed.");
    this.name = "InvalidAssetStatusTransitionError";
  }
}

export function assertAssetStatusTransition(input: {
  current: StudioAssetStatus;
  target: StudioAssetStatus;
  references: string[];
}) {
  const { current, target, references } = input;

  if (current === target) {
    return;
  }

  if ((target === "ORPHANED" || target === "DELETED") && references.length > 0) {
    throw new AssetReferenceConflictError(references);
  }

  const allowed =
    (current === "ACTIVE" && target === "ORPHANED") ||
    (current === "ORPHANED" && (target === "ACTIVE" || target === "DELETED")) ||
    (current === "DELETED" && target === "ACTIVE");

  if (!allowed) {
    throw new InvalidAssetStatusTransitionError();
  }
}
