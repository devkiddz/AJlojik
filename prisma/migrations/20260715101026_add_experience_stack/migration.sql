-- CreateEnum
CREATE TYPE "ExperienceHistoryRetention" AS ENUM ('SESSION', 'ONE_DAY', 'SEVEN_DAYS', 'THIRTY_DAYS', 'FOREVER');

-- CreateEnum
CREATE TYPE "ExperienceHistorySource" AS ENUM ('CATEGORY', 'DISCOVERY_HUB', 'SMART_PICK', 'CAMPAIGN', 'SEARCH', 'COLLECTION', 'PRODUCT', 'SYSTEM');

-- CreateTable
CREATE TABLE "experience_history_settings" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "retention" "ExperienceHistoryRetention" NOT NULL DEFAULT 'SEVEN_DAYS',
    "maxEntries" INTEGER NOT NULL DEFAULT 20,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "experience_history_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experience_history_entry" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "subtitle" TEXT,
    "categorySlug" TEXT NOT NULL,
    "source" "ExperienceHistorySource" NOT NULL,
    "experienceId" TEXT,
    "campaignId" TEXT,
    "collectionId" TEXT,
    "productId" TEXT,
    "intentSnapshot" JSONB NOT NULL,
    "contextSnapshot" JSONB,
    "fingerprint" TEXT NOT NULL,
    "visitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "experience_history_entry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "experience_history_settings_userId_idx" ON "experience_history_settings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "experience_history_settings_workspaceId_userId_key" ON "experience_history_settings"("workspaceId", "userId");

-- CreateIndex
CREATE INDEX "experience_history_entry_workspaceId_userId_visitedAt_idx" ON "experience_history_entry"("workspaceId", "userId", "visitedAt");

-- CreateIndex
CREATE INDEX "experience_history_entry_userId_visitedAt_idx" ON "experience_history_entry"("userId", "visitedAt");

-- CreateIndex
CREATE INDEX "experience_history_entry_expiresAt_idx" ON "experience_history_entry"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "experience_history_entry_workspaceId_userId_fingerprint_key" ON "experience_history_entry"("workspaceId", "userId", "fingerprint");

-- AddForeignKey
ALTER TABLE "experience_history_settings" ADD CONSTRAINT "experience_history_settings_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experience_history_settings" ADD CONSTRAINT "experience_history_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experience_history_entry" ADD CONSTRAINT "experience_history_entry_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experience_history_entry" ADD CONSTRAINT "experience_history_entry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
