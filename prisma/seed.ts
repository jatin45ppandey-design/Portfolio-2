import dotenv from "dotenv";

import type { Prisma } from "../src/lib/generated/prisma/client";
import { PortfolioDocumentSchema } from "../src/lib/content/schema";
import { portfolio } from "../src/lib/portfolio";

dotenv.config({ path: ".env.local", quiet: true });

async function main() {
  const validation = PortfolioDocumentSchema.safeParse(portfolio);

  if (!validation.success) {
    throw new Error("The portfolio document is invalid.");
  }

  const ownerGithubId = process.env.GITHUB_OWNER_ID;

  if (!ownerGithubId) {
    throw new Error("GITHUB_OWNER_ID is not configured.");
  }

  const { db } = await import("../src/lib/db");
  const payload = validation.data as Prisma.InputJsonValue;

  try {
    const seedCreated = await db.$transaction(
      async (transaction) => {
        const existingState = await transaction.portfolioState.findUnique({
          where: { id: "main" },
          select: { id: true },
        });

        if (existingState) {
          return false;
        }

        const existingInitialRevision = await transaction.portfolioRevision.findUnique({
          where: { version: 1 },
          select: { id: true },
        });

        if (existingInitialRevision) {
          throw new Error("Initial revision already exists without a portfolio state.");
        }

        const revision = await transaction.portfolioRevision.create({
          data: {
            version: 1,
            payload,
            createdByGithubId: ownerGithubId,
            createdByLogin: "jatin45ppandey-design",
            note: "Initial portfolio import",
          },
          select: { id: true },
        });

        await transaction.portfolioState.create({
          data: {
            id: "main",
            draftPayload: payload,
            draftVersion: 1,
            publishedRevisionId: revision.id,
          },
        });

        await transaction.auditEvent.create({
          data: {
            action: "INITIAL_SEED",
            entityType: "PORTFOLIO",
            entityId: "main",
            actorGithubId: ownerGithubId,
            revisionId: revision.id,
            metadata: { version: 1 },
          },
        });

        return true;
      },
      { isolationLevel: "Serializable" },
    );

    if (seedCreated) {
      console.log("Initial portfolio seed created.");
      return;
    }

    console.log("Portfolio state already exists; seed skipped.");
  } finally {
    await db.$disconnect();
  }
}

void main().catch(() => {
  console.error("Portfolio seed failed.");
  process.exitCode = 1;
});
