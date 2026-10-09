import type { Prisma } from "@/lib/generated/prisma/client";
import { PortfolioDocumentSchema, type PortfolioDocument } from "@/lib/content/schema";

import {
  InvalidDraftVersionError,
  InvalidPortfolioActorError,
  InvalidPortfolioDocumentError,
  InvalidStoredPortfolioPayloadError,
} from "./repository-errors";

export type PortfolioActor = {
  githubId: string;
  login?: string | null;
};

export function parseSubmittedPortfolioDocument(document: unknown): PortfolioDocument {
  const result = PortfolioDocumentSchema.safeParse(document);

  if (!result.success) {
    throw new InvalidPortfolioDocumentError();
  }

  return result.data;
}

export function parseStoredPortfolioDocument(
  payload: unknown,
  source: "draft" | "published" | "historical",
): PortfolioDocument {
  const result = PortfolioDocumentSchema.safeParse(payload);

  if (!result.success) {
    throw new InvalidStoredPortfolioPayloadError(source);
  }

  return result.data;
}

export function assertDraftVersion(value: number): number {
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new InvalidDraftVersionError();
  }

  return value;
}

export function getNextDraftVersion(currentVersion: number): number {
  const validVersion = assertDraftVersion(currentVersion);

  if (validVersion === Number.MAX_SAFE_INTEGER) {
    throw new InvalidDraftVersionError();
  }

  return validVersion + 1;
}

export function getNextRevisionVersion(latestVersion: number | null): number {
  if (latestVersion === null) {
    return 1;
  }

  return getNextDraftVersion(latestVersion);
}

export function normalizePortfolioActor(actor: PortfolioActor): Required<PortfolioActor> {
  const githubId = actor.githubId.trim();

  if (!/^\d+$/.test(githubId)) {
    throw new InvalidPortfolioActorError();
  }

  return {
    githubId,
    login: actor.login?.trim() || null,
  };
}

export function toPortfolioJson(document: PortfolioDocument): Prisma.InputJsonValue {
  return document as Prisma.InputJsonValue;
}
