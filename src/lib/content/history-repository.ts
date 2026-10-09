import "server-only";

import { Prisma } from "@/lib/generated/prisma/client";
import { db } from "@/lib/db";
import type { PortfolioDocument } from "@/lib/content/schema";

import {
  createRestoreDraftPlan,
  formatSafeStudioActivity,
  SAFE_STUDIO_ACTIVITY_ACTIONS,
  sortRevisionSummariesNewest,
} from "./history";
import {
  DraftVersionConflictError,
  PortfolioRevisionNotFoundError,
  PortfolioStateNotFoundError,
} from "./repository-errors";
import {
  normalizePortfolioActor,
  parseStoredPortfolioDocument,
  toPortfolioJson,
  type PortfolioActor,
} from "./repository-helpers";

const MAIN_PORTFOLIO_STATE_ID = "main";

export type RevisionHistoryItem = {
  version: number;
  publishedAt: Date;
  createdAt: Date;
  createdByLogin: string | null;
  note: string | null;
  rollbackOfVersion: number | null;
  isCurrentPublished: boolean;
};

export type HistoricalPortfolioRevision = Omit<RevisionHistoryItem, "isCurrentPublished"> & {
  document: PortfolioDocument;
  isCurrentPublished: boolean;
};

export type RecentStudioActivity = {
  action: string;
  description: string;
  actorLogin: string | null;
  createdAt: Date;
};

export type RestorePortfolioRevisionInput = {
  revisionVersion: number;
  expectedDraftVersion: number;
  actor: PortfolioActor;
};

export type RestoredDraft = {
  document: PortfolioDocument;
  draftVersion: number;
  updatedAt: Date;
};

function isPositiveSafeInteger(value: number): boolean {
  return Number.isSafeInteger(value) && value > 0;
}

export async function listPortfolioRevisions(): Promise<RevisionHistoryItem[]> {
  const [state, revisions] = await Promise.all([
    db.portfolioState.findUnique({
      where: { id: MAIN_PORTFOLIO_STATE_ID },
      select: { publishedRevisionId: true },
    }),
    db.portfolioRevision.findMany({
      orderBy: { version: "desc" },
      select: {
        id: true,
        version: true,
        publishedAt: true,
        createdAt: true,
        createdByLogin: true,
        note: true,
        rollbackOfId: true,
      },
    }),
  ]);

  if (!state) {
    throw new PortfolioStateNotFoundError();
  }

  const versionsById = new Map(revisions.map((revision) => [revision.id, revision.version]));

  return sortRevisionSummariesNewest(
    revisions.map((revision) => ({
      version: revision.version,
      publishedAt: revision.publishedAt,
      createdAt: revision.createdAt,
      createdByLogin: revision.createdByLogin,
      note: revision.note,
      rollbackOfVersion: revision.rollbackOfId
        ? (versionsById.get(revision.rollbackOfId) ?? null)
        : null,
      isCurrentPublished: revision.id === state.publishedRevisionId,
    })),
  );
}

export async function getHistoricalPortfolioRevision(
  version: number,
): Promise<HistoricalPortfolioRevision | null> {
  if (!isPositiveSafeInteger(version)) {
    return null;
  }

  const [state, revision] = await Promise.all([
    db.portfolioState.findUnique({
      where: { id: MAIN_PORTFOLIO_STATE_ID },
      select: { publishedRevisionId: true },
    }),
    db.portfolioRevision.findUnique({
      where: { version },
      select: {
        id: true,
        version: true,
        payload: true,
        publishedAt: true,
        createdAt: true,
        createdByLogin: true,
        note: true,
        rollbackOfId: true,
      },
    }),
  ]);

  if (!state) {
    throw new PortfolioStateNotFoundError();
  }

  if (!revision) {
    return null;
  }

  const rollbackRevision = revision.rollbackOfId
    ? await db.portfolioRevision.findUnique({
        where: { id: revision.rollbackOfId },
        select: { version: true },
      })
    : null;

  return {
    version: revision.version,
    document: parseStoredPortfolioDocument(revision.payload, "historical"),
    publishedAt: revision.publishedAt,
    createdAt: revision.createdAt,
    createdByLogin: revision.createdByLogin,
    note: revision.note,
    rollbackOfVersion: rollbackRevision?.version ?? null,
    isCurrentPublished: revision.id === state.publishedRevisionId,
  };
}

export async function listRecentStudioActivity(limit = 8): Promise<RecentStudioActivity[]> {
  const safeLimit = Number.isSafeInteger(limit) ? Math.min(Math.max(limit, 1), 20) : 8;
  const events = await db.auditEvent.findMany({
    where: { action: { in: [...SAFE_STUDIO_ACTIVITY_ACTIONS] } },
    orderBy: { createdAt: "desc" },
    take: safeLimit,
    select: {
      action: true,
      actorLogin: true,
      metadata: true,
      createdAt: true,
    },
  });

  return events.flatMap((event) => {
    const description = formatSafeStudioActivity(event.action, event.metadata);

    return description
      ? [{ action: event.action, description, actorLogin: event.actorLogin, createdAt: event.createdAt }]
      : [];
  });
}

/**
 * Restores an immutable revision into the editable draft only. The main state
 * row is locked so the version comparison and one-step increment are atomic.
 */
export async function restorePortfolioRevisionAsDraft({
  revisionVersion,
  expectedDraftVersion,
  actor,
}: RestorePortfolioRevisionInput): Promise<RestoredDraft> {
  if (!isPositiveSafeInteger(revisionVersion)) {
    throw new PortfolioRevisionNotFoundError();
  }

  const authenticatedActor = normalizePortfolioActor(actor);

  return db.$transaction(
    async (transaction) => {
      const states = await transaction.$queryRaw<
        Array<{ draftVersion: number; publishedRevisionId: string | null }>
      >(Prisma.sql`
        SELECT "draftVersion", "publishedRevisionId"
        FROM "PortfolioState"
        WHERE "id" = ${MAIN_PORTFOLIO_STATE_ID}
        FOR UPDATE
      `);
      const state = states[0];

      if (!state) {
        throw new PortfolioStateNotFoundError();
      }

      const revision = await transaction.portfolioRevision.findUnique({
        where: { version: revisionVersion },
        select: { id: true, version: true, payload: true },
      });

      if (!revision) {
        throw new PortfolioRevisionNotFoundError();
      }

      const plan = createRestoreDraftPlan({
        currentState: state,
        expectedDraftVersion,
        sourceRevision: revision,
      });

      const updated = await transaction.portfolioState.updateMany({
        where: {
          id: MAIN_PORTFOLIO_STATE_ID,
          draftVersion: expectedDraftVersion,
        },
        data: {
          draftPayload: toPortfolioJson(plan.document),
          draftVersion: plan.stateUpdate.draftVersion,
        },
      });

      if (updated.count !== 1) {
        throw new DraftVersionConflictError();
      }

      await transaction.auditEvent.create({
        data: {
          action: "REVISION_RESTORED_TO_DRAFT",
          entityType: "PORTFOLIO",
          entityId: MAIN_PORTFOLIO_STATE_ID,
          actorGithubId: authenticatedActor.githubId,
          actorLogin: authenticatedActor.login,
          revisionId: plan.auditRevisionId,
          metadata: plan.auditMetadata,
        },
      });

      const updatedState = await transaction.portfolioState.findUnique({
        where: { id: MAIN_PORTFOLIO_STATE_ID },
        select: { updatedAt: true },
      });

      if (!updatedState) {
        throw new PortfolioStateNotFoundError();
      }

      return {
        document: plan.document,
        draftVersion: plan.stateUpdate.draftVersion,
        updatedAt: updatedState.updatedAt,
      };
    },
    { isolationLevel: "Serializable" },
  );
}
