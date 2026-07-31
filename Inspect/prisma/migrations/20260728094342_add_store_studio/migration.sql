/*
  Warnings:

  - You are about to drop the column `shoppingLists` on the `experience_profile` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "StoreStudioCampaignType" AS ENUM ('BANNER', 'STORY', 'REEL');

-- CreateEnum
CREATE TYPE "StoreStudioCampaignStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'EXPIRED', 'REJECTED');

-- CreateEnum
CREATE TYPE "StoreStudioPlacementTier" AS ENUM ('STANDARD', 'FEATURED', 'PREMIUM', 'SPONSORED');

-- CreateEnum
CREATE TYPE "StoreStudioMediaType" AS ENUM ('IMAGE', 'VIDEO');

-- AlterTable
ALTER TABLE "experience_profile" DROP COLUMN "shoppingLists";

-- CreateTable
CREATE TABLE "StoreStudioCampaign" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "vendorId" TEXT,
    "type" "StoreStudioCampaignType" NOT NULL,
    "status" "StoreStudioCampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "placementTier" "StoreStudioPlacementTier" NOT NULL DEFAULT 'STANDARD',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "requestedPriority" INTEGER NOT NULL DEFAULT 0,
    "adminWeight" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreStudioCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreStudioAsset" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "mediaType" "StoreStudioMediaType" NOT NULL,
    "mediaUrl" TEXT NOT NULL,
    "mobileMediaUrl" TEXT,
    "coverUrl" TEXT,
    "posterUrl" TEXT,
    "eyebrow" TEXT,
    "title" TEXT,
    "description" TEXT,
    "actionLabel" TEXT,
    "actionHref" TEXT,
    "productId" TEXT,
    "promotionId" TEXT,
    "collectionId" TEXT,
    "durationSeconds" INTEGER,
    "autoplay" BOOLEAN NOT NULL DEFAULT false,
    "muted" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreStudioAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StoreStudioCampaign_workspaceId_type_status_active_idx" ON "StoreStudioCampaign"("workspaceId", "type", "status", "active");

-- CreateIndex
CREATE INDEX "StoreStudioCampaign_vendorId_idx" ON "StoreStudioCampaign"("vendorId");

-- CreateIndex
CREATE INDEX "StoreStudioCampaign_startsAt_endsAt_idx" ON "StoreStudioCampaign"("startsAt", "endsAt");

-- CreateIndex
CREATE INDEX "StoreStudioAsset_campaignId_position_active_idx" ON "StoreStudioAsset"("campaignId", "position", "active");

-- AddForeignKey
ALTER TABLE "StoreStudioCampaign" ADD CONSTRAINT "StoreStudioCampaign_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreStudioCampaign" ADD CONSTRAINT "StoreStudioCampaign_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreStudioAsset" ADD CONSTRAINT "StoreStudioAsset_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "StoreStudioCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
