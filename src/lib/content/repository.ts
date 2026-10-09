import "server-only";

import { unstable_cache } from "next/cache";

import { Prisma, type Prisma as PrismaTypes } from "@/lib/generated/prisma/client";
import { db } from "@/lib/db";
import type { PortfolioDocument } from "@/lib/content/schema";

import {
  DraftVersionConflictError,
  PortfolioStateNotFoundError,
  PublishedPortfolioNotFoundError,
  RevisionVersionConflictError,
} from "./repository-errors";
import {
  assertDraftVersion,
  getNextDraftVersion,
  getNextRevisionVersion,
  normalizePortfolioActor,
  parseStoredPortfolioDocument,
  parseSubmittedPortfolioDocument,
  toPortfolioJson,
  type PortfolioActor,
} from "./repository-helpers";

const MAIN_PORTFOLIO_STATE_ID = "main";

export const PORTFOLIO_PUBLISHED_CACHE_TAG = "portfolio-published";

export type DraftPortfolio = {
  document: PortfolioDocument;
  draftVersion: number;
  updatedAt: Date;
};

export type PublishedPortfolio = {
  document: PortfolioDocument;
  revisionId: string;
  revisionVersion: number;
  publishedAt: Date;
};

export type PortfolioStateSummary = {
  draftVersion: number;
  updatedAt: Date;
  publishedRevision: {
    id: string;
    version: number;
    publishedAt: Date;
  } | null;
};

export type SavePortfolioDraftInput = {
  document: unknown;
  expectedDraftVersion: number;
  actor: PortfolioActor;
};

export type PublishPortfolioDraftInput = {
  expectedDraftVersion: number;
  actor: PortfolioActor;
};

async function throwStateMissingOrDraftConflict(
  transaction: PrismaTypes.TransactionClient,
): Promise<never> {
  const state = await transaction.portfolioState.findUnique({
    where: { id: MAIN_PORTFOLIO_STATE_ID },
    select: { id: true },
  });

  if (!state) {
    throw new PortfolioStateNotFoundError();
  }

  throw new DraftVersionConflictError();
}

function isUniqueRevisionVersionError(error: unknown): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") {
    return false;
  }

  const target = error.meta?.target;
  const targetFields = Array.isArray(target) ? target : typeof target === "string" ? [target] : [];

  return targetFields.some(
    (field) => field === "version" || field.includes("PortfolioRevision_version_key"),
  );
}

/**
 * Reads the editable document and its optimistic-concurrency version.
 */
export async function getDraftPortfolio(): Promise<DraftPortfolio> {
  const state = await db.portfolioState.findUnique({
    where: { id: MAIN_PORTFOLIO_STATE_ID },
    select: {
      draftPayload: true,
      draftVersion: true,
      updatedAt: true,
    },
  });

  if (!state) {
    throw new PortfolioStateNotFoundError();
  }

  return {
    document: parseStoredPortfolioDocument(state.draftPayload, "draft"),
    draftVersion: state.draftVersion,
    updatedAt: state.updatedAt,
  };
}

/**
 * Reads the immutable revision currently selected for the public portfolio.
 */
export async function getPublishedPortfolio(): Promise<PublishedPortfolio> {
  const state = await db.portfolioState.findUnique({
    where: { id: MAIN_PORTFOLIO_STATE_ID },
    select: {
      publishedRevision: {
        select: {
          id: true,
          version: true,
          payload: true,
          publishedAt: true,
        },
      },
    },
  });

  if (!state) {
    throw new PortfolioStateNotFoundError();
  }

  if (!state.publishedRevision) {
    throw new PublishedPortfolioNotFoundError();
  }

  return {
    document: parseStoredPortfolioDocument(state.publishedRevision.payload, "published"),
    revisionId: state.publishedRevision.id,
    revisionVersion: state.publishedRevision.version,
    publishedAt: state.publishedRevision.publishedAt,
  };
}

/**
 * Public-only reader for the immutable revision selected by PortfolioState.
 * Draft content is intentionally unavailable through this cache path.
 */
export const getPublishedPortfolioCached = unstable_cache(
  getPublishedPortfolio,
  [PORTFOLIO_PUBLISHED_CACHE_TAG],
  { tags: [PORTFOLIO_PUBLISHED_CACHE_TAG] },
);

export async function getPortfolioStateSummary(): Promise<PortfolioStateSummary> {
  const state = await db.portfolioState.findUnique({
    where: { id: MAIN_PORTFOLIO_STATE_ID },
    select: {
      draftVersion: true,
      updatedAt: true,
      publishedRevision: {
        select: {
          id: true,
          version: true,
          publishedAt: true,
        },
      },
    },
  });

  if (!state) {
    throw new PortfolioStateNotFoundError();
  }

  return state;
}

/**
 * Generic persistence function. Studio callers must obtain `actor` from the
 * authenticated server session; it must never come from the browser payload.
 */
export async function savePortfolioDraft({
  document,
  expectedDraftVersion,
  actor,
}: SavePortfolioDraftInput): Promise<DraftPortfolio> {
  const validatedDocument = parseSubmittedPortfolioDocument(document);
  const currentDraftVersion = assertDraftVersion(expectedDraftVersion);
  const nextDraftVersion = getNextDraftVersion(currentDraftVersion);
  const authenticatedActor = normalizePortfolioActor(actor);
  const payload = toPortfolioJson(validatedDocument);

  return db.$transaction(async (transaction) => {
    const updatedState = await transaction.portfolioState.updateMany({
      where: {
        id: MAIN_PORTFOLIO_STATE_ID,
        draftVersion: currentDraftVersion,
      },
      data: {
        draftPayload: payload,
        draftVersion: { increment: 1 },
      },
    });

    if (updatedState.count !== 1) {
      return throwStateMissingOrDraftConflict(transaction);
    }

    await transaction.auditEvent.create({
      data: {
        action: "DRAFT_SAVED",
        entityType: "PORTFOLIO",
        entityId: MAIN_PORTFOLIO_STATE_ID,
        actorGithubId: authenticatedActor.githubId,
        actorLogin: authenticatedActor.login,
        metadata: { draftVersion: nextDraftVersion },
      },
    });

    const savedState = await transaction.portfolioState.findUnique({
      where: { id: MAIN_PORTFOLIO_STATE_ID },
      select: { updatedAt: true },
    });

    if (!savedState) {
      throw new PortfolioStateNotFoundError();
    }

    return {
      document: validatedDocument,
      draftVersion: nextDraftVersion,
      updatedAt: savedState.updatedAt,
    };
  });
}

/**
 * Creates an immutable published revision and switches the public pointer in
 * one transaction. The row lock serializes publications for the single main
 * state so revision numbers cannot be allocated by a naive concurrent max+1.
 */
export async function publishPortfolioDraft({
  expectedDraftVersion,
  actor,
}: PublishPortfolioDraftInput): Promise<PublishedPortfolio> {
  const currentDraftVersion = assertDraftVersion(expectedDraftVersion);
  const authenticatedActor = normalizePortfolioActor(actor);

  try {
    return await db.$transaction(
      async (transaction) => {
        const states = await transaction.$queryRaw<
          Array<{ draftPayload: PrismaTypes.JsonValue; draftVersion: number }>
        >(Prisma.sql`
          SELECT "draftPayload", "draftVersion"
          FROM "PortfolioState"
          WHERE "id" = ${MAIN_PORTFOLIO_STATE_ID}
          FOR UPDATE
        `);
        const state = states[0];

        if (!state) {
          throw new PortfolioStateNotFoundError();
        }

        if (state.draftVersion !== currentDraftVersion) {
          throw new DraftVersionConflictError();
        }

        const document = parseStoredPortfolioDocument(state.draftPayload, "draft");
        const latestRevision = await transaction.portfolioRevision.findFirst({
          orderBy: { version: "desc" },
          select: { version: true },
        });
        const revisionVersion = getNextRevisionVersion(latestRevision?.version ?? null);
        const revision = await transaction.portfolioRevision.create({
          data: {
            version: revisionVersion,
            payload: toPortfolioJson(document),
            createdByGithubId: authenticatedActor.githubId,
            createdByLogin: authenticatedActor.login,
          },
          select: {
            id: true,
            version: true,
            publishedAt: true,
          },
        });

        const updatedState = await transaction.portfolioState.updateMany({
          where: {
            id: MAIN_PORTFOLIO_STATE_ID,
            draftVersion: currentDraftVersion,
          },
          data: { publishedRevisionId: revision.id },
        });

        if (updatedState.count !== 1) {
          return throwStateMissingOrDraftConflict(transaction);
        }

        await transaction.auditEvent.create({
          data: {
            action: "PUBLISHED",
            entityType: "PORTFOLIO",
            entityId: MAIN_PORTFOLIO_STATE_ID,
            actorGithubId: authenticatedActor.githubId,
            actorLogin: authenticatedActor.login,
            revisionId: revision.id,
            metadata: {
              draftVersion: currentDraftVersion,
              publishedVersion: revision.version,
            },
          },
        });

        return {
          document,
          revisionId: revision.id,
          revisionVersion: revision.version,
          publishedAt: revision.publishedAt,
        };
      },
      { isolationLevel: "Serializable" },
    );
  } catch (error) {
    if (error instanceof RevisionVersionConflictError || error instanceof DraftVersionConflictError) {
      throw error;
    }

    if (isUniqueRevisionVersionError(error)) {
      throw new RevisionVersionConflictError();
    }

    throw error;
  }
}
