import "server-only";

import { AssetProvider, AssetStatus } from "@/lib/generated/prisma/enums";
import { db } from "@/lib/db";
import type { PortfolioDocument } from "@/lib/content/schema";
import {
  normalizePortfolioActor,
  parseStoredPortfolioDocument,
  type PortfolioActor,
} from "@/lib/content/repository-helpers";

import {
  findInactiveCloudinaryAssetUrls,
  getAssetUsage,
} from "./references";
import {
  assertAssetStatusTransition,
} from "./status-policy";
import type {
  AssetUsageSummary,
  MediaAssetOption,
  StudioAssetStatus,
  StudioMediaAsset,
} from "./types";

const MAIN_PORTFOLIO_STATE_ID = "main";

type AssetRecord = {
  id: string;
  provider: string;
  status: string;
  publicId: string | null;
  url: string;
  resourceType: string;
  format: string | null;
  width: number | null;
  height: number | null;
  bytes: number | null;
  originalName: string | null;
  altText: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type UploadedCloudinaryAsset = {
  publicId: string;
  url: string;
  resourceType: string;
  format: string | null;
  width: number | null;
  height: number | null;
  bytes: number | null;
  originalName: string;
  altText: string;
};

export class InactiveCloudinaryAssetError extends Error {
  constructor(public readonly urls: string[]) {
    super("Choose an ACTIVE Cloudinary asset from the Media Manager before saving.");
    this.name = "InactiveCloudinaryAssetError";
  }
}

function toAssetOption(asset: AssetRecord): MediaAssetOption {
  return {
    id: asset.id,
    url: asset.url,
    altText: asset.altText,
    format: asset.format,
    width: asset.width,
    height: asset.height,
    bytes: asset.bytes,
    originalName: asset.originalName,
  };
}

function toStudioMediaAsset(
  asset: AssetRecord & { publicId: string },
  usage: AssetUsageSummary,
): StudioMediaAsset {
  return {
    ...toAssetOption(asset),
    provider: "CLOUDINARY",
    status: asset.status as StudioAssetStatus,
    publicId: asset.publicId,
    resourceType: asset.resourceType,
    createdAt: asset.createdAt.toISOString(),
    updatedAt: asset.updatedAt.toISOString(),
    deletedAt: asset.deletedAt?.toISOString() ?? null,
    usage,
  };
}

async function getCurrentPortfolioDocuments(): Promise<{
  draft: PortfolioDocument;
  published: PortfolioDocument | null;
}> {
  const state = await db.portfolioState.findUnique({
    where: { id: MAIN_PORTFOLIO_STATE_ID },
    select: {
      draftPayload: true,
      publishedRevision: { select: { payload: true } },
    },
  });

  if (!state) {
    throw new Error("Portfolio state is missing.");
  }

  return {
    draft: parseStoredPortfolioDocument(state.draftPayload, "draft"),
    published: state.publishedRevision
      ? parseStoredPortfolioDocument(state.publishedRevision.payload, "published")
      : null,
  };
}

export async function listActiveCloudinaryAssetOptions(): Promise<MediaAssetOption[]> {
  const assets = await db.asset.findMany({
    where: {
      provider: AssetProvider.CLOUDINARY,
      status: AssetStatus.ACTIVE,
      publicId: { not: null },
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });

  return assets.map(toAssetOption);
}

export async function listStudioMediaAssets(): Promise<StudioMediaAsset[]> {
  const [assets, documents] = await Promise.all([
    db.asset.findMany({
      where: {
        provider: AssetProvider.CLOUDINARY,
        publicId: { not: null },
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    }),
    getCurrentPortfolioDocuments(),
  ]);

  return assets.flatMap((asset) => {
    if (!asset.publicId) {
      return [];
    }

    return [
      toStudioMediaAsset(
        { ...asset, publicId: asset.publicId },
        getAssetUsage(asset.url, documents.draft, documents.published),
      ),
    ];
  });
}

export async function createUploadedCloudinaryAsset(
  input: UploadedCloudinaryAsset,
  actor: PortfolioActor,
): Promise<MediaAssetOption> {
  const authenticatedActor = normalizePortfolioActor(actor);

  const asset = await db.$transaction(async (transaction) => {
    const created = await transaction.asset.create({
      data: {
        provider: AssetProvider.CLOUDINARY,
        status: AssetStatus.ACTIVE,
        publicId: input.publicId,
        url: input.url,
        resourceType: input.resourceType,
        format: input.format,
        width: input.width,
        height: input.height,
        bytes: input.bytes,
        originalName: input.originalName,
        altText: input.altText,
        createdByGithubId: authenticatedActor.githubId,
      },
    });

    await transaction.auditEvent.create({
      data: {
        action: "ASSET_UPLOADED",
        entityType: "ASSET",
        entityId: created.id,
        assetId: created.id,
        actorGithubId: authenticatedActor.githubId,
        actorLogin: authenticatedActor.login,
        metadata: {
          provider: "CLOUDINARY",
          resourceType: created.resourceType,
          format: created.format,
          width: created.width,
          height: created.height,
          bytes: created.bytes,
        },
      },
    });

    return created;
  });

  return toAssetOption(asset);
}

export async function updateCloudinaryAssetAltText(
  assetId: string,
  altText: string,
  actor: PortfolioActor,
): Promise<MediaAssetOption> {
  const authenticatedActor = normalizePortfolioActor(actor);

  const asset = await db.$transaction(async (transaction) => {
    const current = await transaction.asset.findUnique({ where: { id: assetId } });

    if (
      !current ||
      current.provider !== AssetProvider.CLOUDINARY ||
      current.status === AssetStatus.DELETED
    ) {
      throw new Error("The Cloudinary asset is unavailable.");
    }

    const updated = await transaction.asset.update({
      where: { id: assetId },
      data: { altText },
    });

    await transaction.auditEvent.create({
      data: {
        action: "ASSET_UPDATED",
        entityType: "ASSET",
        entityId: updated.id,
        assetId: updated.id,
        actorGithubId: authenticatedActor.githubId,
        actorLogin: authenticatedActor.login,
        metadata: { field: "altText" },
      },
    });

    return updated;
  });

  return toAssetOption(asset);
}

export async function transitionCloudinaryAssetStatus(
  assetId: string,
  target: StudioAssetStatus,
  actor: PortfolioActor,
): Promise<{ status: StudioAssetStatus; deletedAt: string | null }> {
  const authenticatedActor = normalizePortfolioActor(actor);

  return db.$transaction(async (transaction) => {
    const [asset, state] = await Promise.all([
      transaction.asset.findUnique({ where: { id: assetId } }),
      transaction.portfolioState.findUnique({
        where: { id: MAIN_PORTFOLIO_STATE_ID },
        select: {
          draftPayload: true,
          publishedRevision: { select: { payload: true } },
        },
      }),
    ]);

    if (!asset || asset.provider !== AssetProvider.CLOUDINARY || !asset.publicId) {
      throw new Error("The Cloudinary asset is unavailable.");
    }

    if (!state) {
      throw new Error("Portfolio state is missing.");
    }

    const draft = parseStoredPortfolioDocument(state.draftPayload, "draft");
    const published = state.publishedRevision
      ? parseStoredPortfolioDocument(state.publishedRevision.payload, "published")
      : null;
    const usage = getAssetUsage(asset.url, draft, published);
    const references = [
      ...usage.draft.map((location) => `Draft: ${location}`),
      ...usage.published.map((location) => `Published: ${location}`),
    ];

    assertAssetStatusTransition({
      current: asset.status as StudioAssetStatus,
      target,
      references,
    });

    const updated = await transaction.asset.update({
      where: { id: asset.id },
      data: {
        status: target,
        deletedAt: target === AssetStatus.DELETED ? new Date() : null,
      },
    });

    const action =
      target === AssetStatus.ORPHANED
        ? "ASSET_ORPHANED"
        : target === AssetStatus.DELETED
          ? "ASSET_DELETED"
          : "ASSET_UPDATED";

    await transaction.auditEvent.create({
      data: {
        action,
        entityType: "ASSET",
        entityId: updated.id,
        assetId: updated.id,
        actorGithubId: authenticatedActor.githubId,
        actorLogin: authenticatedActor.login,
        metadata: {
          previousStatus: asset.status,
          status: updated.status,
          physicalDeletion: false,
        },
      },
    });

    return {
      status: updated.status as StudioAssetStatus,
      deletedAt: updated.deletedAt?.toISOString() ?? null,
    };
  });
}

export async function assertActiveCloudinaryAssetUrls(
  document: PortfolioDocument,
): Promise<void> {
  const cloudinaryUrls = findInactiveCloudinaryAssetUrls(document, new Set());

  if (cloudinaryUrls.length === 0) {
    return;
  }

  const activeAssets = await db.asset.findMany({
    where: {
      provider: AssetProvider.CLOUDINARY,
      status: AssetStatus.ACTIVE,
      url: { in: cloudinaryUrls },
    },
    select: { url: true },
  });
  const inactiveUrls = findInactiveCloudinaryAssetUrls(
    document,
    new Set(activeAssets.map((asset) => asset.url)),
  );

  if (inactiveUrls.length > 0) {
    throw new InactiveCloudinaryAssetError(inactiveUrls);
  }
}
