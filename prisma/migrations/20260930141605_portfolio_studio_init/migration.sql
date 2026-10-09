-- CreateEnum
CREATE TYPE "AssetProvider" AS ENUM ('LOCAL', 'CLOUDINARY');

-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('ACTIVE', 'ORPHANED', 'DELETED');

-- CreateTable
CREATE TABLE "PortfolioState" (
    "id" TEXT NOT NULL DEFAULT 'main',
    "draftPayload" JSONB NOT NULL,
    "draftVersion" INTEGER NOT NULL DEFAULT 1,
    "publishedRevisionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortfolioState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortfolioRevision" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "payload" JSONB NOT NULL,
    "createdByGithubId" TEXT NOT NULL,
    "createdByLogin" TEXT,
    "rollbackOfId" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PortfolioRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "provider" "AssetProvider" NOT NULL,
    "status" "AssetStatus" NOT NULL DEFAULT 'ACTIVE',
    "publicId" TEXT,
    "url" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL DEFAULT 'image',
    "format" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "bytes" INTEGER,
    "originalName" TEXT,
    "altText" TEXT,
    "createdByGithubId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "actorGithubId" TEXT NOT NULL,
    "actorLogin" TEXT,
    "revisionId" TEXT,
    "assetId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PortfolioState_publishedRevisionId_key" ON "PortfolioState"("publishedRevisionId");

-- CreateIndex
CREATE UNIQUE INDEX "PortfolioRevision_version_key" ON "PortfolioRevision"("version");

-- CreateIndex
CREATE INDEX "PortfolioRevision_createdAt_idx" ON "PortfolioRevision"("createdAt");

-- CreateIndex
CREATE INDEX "Asset_status_idx" ON "Asset"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_provider_publicId_key" ON "Asset"("provider", "publicId");

-- CreateIndex
CREATE INDEX "AuditEvent_createdAt_idx" ON "AuditEvent"("createdAt");

-- CreateIndex
CREATE INDEX "AuditEvent_entityType_entityId_idx" ON "AuditEvent"("entityType", "entityId");

-- AddForeignKey
ALTER TABLE "PortfolioState" ADD CONSTRAINT "PortfolioState_publishedRevisionId_fkey" FOREIGN KEY ("publishedRevisionId") REFERENCES "PortfolioRevision"("id") ON DELETE SET NULL ON UPDATE CASCADE;
