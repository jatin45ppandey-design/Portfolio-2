import type { PortfolioDocument } from "@/lib/content/schema";

import { DraftVersionConflictError } from "./repository-errors";
import {
  assertDraftVersion,
  getNextDraftVersion,
  parseStoredPortfolioDocument,
} from "./repository-helpers";

export const SAFE_STUDIO_ACTIVITY_ACTIONS = [
  "DRAFT_SAVED",
  "PUBLISHED",
  "REVISION_RESTORED_TO_DRAFT",
  "ASSET_UPLOADED",
  "ASSET_UPDATED",
  "ASSET_ORPHANED",
  "ASSET_DELETED",
] as const;

type RevisionOrderItem = {
  version: number;
};

type RestoreDraftPlanInput = {
  currentState: {
    draftVersion: number;
    publishedRevisionId: string | null;
  };
  expectedDraftVersion: number;
  sourceRevision: {
    id: string;
    version: number;
    payload: unknown;
  };
};

export type RestoreDraftPlan = {
  document: PortfolioDocument;
  stateUpdate: {
    draftPayload: PortfolioDocument;
    draftVersion: number;
  };
  auditRevisionId: string;
  auditMetadata: {
    sourceRevisionVersion: number;
    previousDraftVersion: number;
    newDraftVersion: number;
  };
};

const COMPARISON_SECTIONS = [
  ["profile", "Profile"],
  ["hero", "Hero"],
  ["about", "About"],
  ["navigation", "Navigation"],
  ["projects", "Projects"],
  ["skills", "Skills"],
  ["education", "Education"],
  ["leadership", "Leadership"],
  ["certifications", "Certifications"],
  ["achievements", "Achievements"],
  ["contact", "Contact"],
  ["footer", "Footer"],
] as const satisfies ReadonlyArray<readonly [keyof PortfolioDocument, string]>;

const ACTIVITY_LABELS: Record<(typeof SAFE_STUDIO_ACTIVITY_ACTIONS)[number], string> = {
  DRAFT_SAVED: "Draft saved",
  PUBLISHED: "Portfolio published",
  REVISION_RESTORED_TO_DRAFT: "Revision restored to draft",
  ASSET_UPLOADED: "Media uploaded",
  ASSET_UPDATED: "Media updated",
  ASSET_ORPHANED: "Media marked orphaned",
  ASSET_DELETED: "Media marked deleted",
};

function readSafeInteger(metadata: unknown, key: string): number | null {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }

  const value = Reflect.get(metadata, key);

  return Number.isSafeInteger(value) && Number(value) > 0 ? Number(value) : null;
}

export function sortRevisionSummariesNewest<T extends RevisionOrderItem>(items: T[]): T[] {
  return [...items].sort((left, right) => right.version - left.version);
}

/**
 * Builds the only fields that a restore transaction may write. In particular,
 * publishedRevisionId is deliberately absent from stateUpdate.
 */
export function createRestoreDraftPlan({
  currentState,
  expectedDraftVersion,
  sourceRevision,
}: RestoreDraftPlanInput): RestoreDraftPlan {
  const currentDraftVersion = assertDraftVersion(currentState.draftVersion);
  const submittedDraftVersion = assertDraftVersion(expectedDraftVersion);

  if (currentDraftVersion !== submittedDraftVersion) {
    throw new DraftVersionConflictError();
  }

  const document = parseStoredPortfolioDocument(sourceRevision.payload, "historical");
  const newDraftVersion = getNextDraftVersion(currentDraftVersion);

  return {
    document,
    stateUpdate: {
      draftPayload: document,
      draftVersion: newDraftVersion,
    },
    auditRevisionId: sourceRevision.id,
    auditMetadata: {
      sourceRevisionVersion: sourceRevision.version,
      previousDraftVersion: currentDraftVersion,
      newDraftVersion,
    },
  };
}

export function comparePortfolioDocuments(
  selected: PortfolioDocument,
  published: PortfolioDocument,
): string[] {
  return COMPARISON_SECTIONS.filter(
    ([key]) => JSON.stringify(selected[key]) !== JSON.stringify(published[key]),
  ).map(([, label]) => label);
}

export function formatSafeStudioActivity(action: string, metadata: unknown): string | null {
  if (!SAFE_STUDIO_ACTIVITY_ACTIONS.includes(action as (typeof SAFE_STUDIO_ACTIVITY_ACTIONS)[number])) {
    return null;
  }

  const safeAction = action as (typeof SAFE_STUDIO_ACTIVITY_ACTIONS)[number];

  if (safeAction === "PUBLISHED") {
    const version = readSafeInteger(metadata, "publishedVersion");
    return version ? `${ACTIVITY_LABELS[safeAction]} as revision ${version}` : ACTIVITY_LABELS[safeAction];
  }

  if (safeAction === "DRAFT_SAVED") {
    const version = readSafeInteger(metadata, "draftVersion");
    return version ? `${ACTIVITY_LABELS[safeAction]} at version ${version}` : ACTIVITY_LABELS[safeAction];
  }

  if (safeAction === "REVISION_RESTORED_TO_DRAFT") {
    const sourceVersion = readSafeInteger(metadata, "sourceRevisionVersion");
    const draftVersion = readSafeInteger(metadata, "newDraftVersion");

    if (sourceVersion && draftVersion) {
      return `${ACTIVITY_LABELS[safeAction]} from revision ${sourceVersion}; draft version ${draftVersion}`;
    }
  }

  return ACTIVITY_LABELS[safeAction];
}
