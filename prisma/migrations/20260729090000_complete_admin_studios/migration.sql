-- AJ Logik complete Admin, Studios, media and multivendor control plane.
-- Existing Store and commerce data is preserved. New commerce records default
-- to the current single-vendor, published behavior until explicitly changed.

-- CreateEnum
CREATE TYPE "PlatformRole" AS ENUM ('STANDARD', 'DEVELOPER_ADMIN');
CREATE TYPE "WorkspaceCommerceMode" AS ENUM ('SINGLE_VENDOR', 'MULTI_VENDOR');
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'PAUSED', 'REJECTED', 'ARCHIVED');
CREATE TYPE "PromotionStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'PAUSED', 'EXPIRED', 'REJECTED', 'ARCHIVED');
CREATE TYPE "PromotionType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT', 'FIXED_PRICE', 'FEATURED');
CREATE TYPE "MediaResourceType" AS ENUM ('IMAGE', 'VIDEO', 'RAW');
CREATE TYPE "MediaAssetStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'DELETED');
CREATE TYPE "VendorStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED', 'ARCHIVED');
CREATE TYPE "VendorRole" AS ENUM ('OWNER', 'MANAGER', 'EDITOR', 'ANALYST');
CREATE TYPE "StoreCollectionStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'PAUSED', 'REJECTED', 'ARCHIVED');
CREATE TYPE "StoreCollectionLayout" AS ENUM ('FEATURED', 'CAROUSEL', 'GRID', 'SPOTLIGHT');

-- Extend existing approval target enum.
ALTER TYPE "AdminTargetType" ADD VALUE IF NOT EXISTS 'MEDIA';
ALTER TYPE "AdminTargetType" ADD VALUE IF NOT EXISTS 'COLLECTION';
ALTER TYPE "AdminTargetType" ADD VALUE IF NOT EXISTS 'CAMPAIGN';
ALTER TYPE "AdminTargetType" ADD VALUE IF NOT EXISTS 'VENDOR';
ALTER TYPE "AdminTargetType" ADD VALUE IF NOT EXISTS 'INVENTORY';
ALTER TYPE "AdminTargetType" ADD VALUE IF NOT EXISTS 'WORKSPACE';

-- Alter user and workspace control-plane records.
ALTER TABLE "user"
  ADD COLUMN "platformRole" "PlatformRole" NOT NULL DEFAULT 'STANDARD';

ALTER TABLE "workspace"
  ADD COLUMN "commerceMode" "WorkspaceCommerceMode" NOT NULL DEFAULT 'SINGLE_VENDOR',
  ADD COLUMN "vendorApplicationsOpen" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'NGN',
  ADD COLUMN "timezone" TEXT NOT NULL DEFAULT 'Africa/Lagos',
  ADD COLUMN "defaultLowStockLevel" INTEGER NOT NULL DEFAULT 5,
  ADD COLUMN "mediaFolderPrefix" TEXT;

-- Create media and vendor tables without circular foreign keys first.
CREATE TABLE "media_asset" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "uploadedById" TEXT NOT NULL,
  "vendorProfileId" TEXT,
  "cloudinaryAssetId" TEXT,
  "publicId" TEXT NOT NULL,
  "secureUrl" TEXT NOT NULL,
  "resourceType" "MediaResourceType" NOT NULL,
  "format" TEXT,
  "width" INTEGER,
  "height" INTEGER,
  "duration" DOUBLE PRECISION,
  "bytes" INTEGER NOT NULL DEFAULT 0,
  "folder" TEXT,
  "originalFilename" TEXT,
  "displayName" TEXT,
  "altText" TEXT,
  "status" "MediaAssetStatus" NOT NULL DEFAULT 'ACTIVE',
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "media_asset_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "vendor_profile" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "ownerUserId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "email" TEXT,
  "phone" TEXT,
  "status" "VendorStatus" NOT NULL DEFAULT 'PENDING',
  "active" BOOLEAN NOT NULL DEFAULT false,
  "approvedAt" TIMESTAMP(3),
  "suspendedAt" TIMESTAMP(3),
  "logoMediaAssetId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "vendor_profile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "vendor_membership" (
  "id" TEXT NOT NULL,
  "vendorId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "role" "VendorRole" NOT NULL DEFAULT 'EDITOR',
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "vendor_membership_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "store_collection" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "vendorProfileId" TEXT,
  "coverMediaAssetId" TEXT,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "subtitle" TEXT,
  "description" TEXT,
  "layout" "StoreCollectionLayout" NOT NULL DEFAULT 'CAROUSEL',
  "status" "StoreCollectionStatus" NOT NULL DEFAULT 'DRAFT',
  "featuredProductId" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "priority" INTEGER NOT NULL DEFAULT 0,
  "startsAt" TIMESTAMP(3),
  "endsAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "store_collection_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "store_collection_product" (
  "id" TEXT NOT NULL,
  "collectionId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "position" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "store_collection_product_pkey" PRIMARY KEY ("id")
);

-- Alter existing catalog and campaign records.
ALTER TABLE "product"
  ADD COLUMN "status" "ProductStatus" NOT NULL DEFAULT 'PUBLISHED',
  ADD COLUMN "vendorProfileId" TEXT,
  ADD COLUMN "submittedAt" TIMESTAMP(3),
  ADD COLUMN "approvedAt" TIMESTAMP(3);

ALTER TABLE "product_variant"
  ADD COLUMN "mediaAssetId" TEXT;

ALTER TABLE "product_image"
  ADD COLUMN "mediaAssetId" TEXT;

ALTER TABLE "promotion"
  ADD COLUMN "status" "PromotionStatus" NOT NULL DEFAULT 'PUBLISHED',
  ADD COLUMN "type" "PromotionType" NOT NULL DEFAULT 'PERCENTAGE',
  ADD COLUMN "discountValue" DECIMAL(12,2),
  ADD COLUMN "usageLimit" INTEGER,
  ADD COLUMN "code" TEXT,
  ADD COLUMN "vendorProfileId" TEXT,
  ADD COLUMN "bannerMediaAssetId" TEXT;

ALTER TABLE "StoreStudioCampaign"
  ADD COLUMN "vendorProfileId" TEXT;

ALTER TABLE "StoreStudioAsset"
  ADD COLUMN "mediaAssetId" TEXT,
  ADD COLUMN "mobileMediaAssetId" TEXT,
  ADD COLUMN "coverMediaAssetId" TEXT,
  ADD COLUMN "posterMediaAssetId" TEXT;

ALTER TABLE "storefront_hero"
  ADD COLUMN "mediaAssetId" TEXT,
  ADD COLUMN "posterMediaAssetId" TEXT;

-- Unique constraints.
CREATE UNIQUE INDEX "media_asset_cloudinaryAssetId_key" ON "media_asset"("cloudinaryAssetId");
CREATE UNIQUE INDEX "media_asset_publicId_key" ON "media_asset"("publicId");
CREATE UNIQUE INDEX "vendor_profile_workspaceId_slug_key" ON "vendor_profile"("workspaceId", "slug");
CREATE UNIQUE INDEX "vendor_membership_vendorId_userId_key" ON "vendor_membership"("vendorId", "userId");
CREATE UNIQUE INDEX "store_collection_workspaceId_slug_key" ON "store_collection"("workspaceId", "slug");
CREATE UNIQUE INDEX "store_collection_product_collectionId_productId_key" ON "store_collection_product"("collectionId", "productId");

-- Query indexes.
CREATE INDEX "media_asset_workspaceId_status_createdAt_idx" ON "media_asset"("workspaceId", "status", "createdAt");
CREATE INDEX "media_asset_uploadedById_createdAt_idx" ON "media_asset"("uploadedById", "createdAt");
CREATE INDEX "media_asset_vendorProfileId_status_idx" ON "media_asset"("vendorProfileId", "status");
CREATE INDEX "media_asset_resourceType_status_idx" ON "media_asset"("resourceType", "status");
CREATE INDEX "vendor_profile_workspaceId_status_active_idx" ON "vendor_profile"("workspaceId", "status", "active");
CREATE INDEX "vendor_profile_ownerUserId_idx" ON "vendor_profile"("ownerUserId");
CREATE INDEX "vendor_profile_logoMediaAssetId_idx" ON "vendor_profile"("logoMediaAssetId");
CREATE INDEX "vendor_membership_userId_active_idx" ON "vendor_membership"("userId", "active");
CREATE INDEX "store_collection_workspaceId_status_active_priority_idx" ON "store_collection"("workspaceId", "status", "active", "priority");
CREATE INDEX "store_collection_vendorProfileId_status_idx" ON "store_collection"("vendorProfileId", "status");
CREATE INDEX "store_collection_coverMediaAssetId_idx" ON "store_collection"("coverMediaAssetId");
CREATE INDEX "store_collection_product_collectionId_position_idx" ON "store_collection_product"("collectionId", "position");
CREATE INDEX "store_collection_product_productId_idx" ON "store_collection_product"("productId");
CREATE INDEX "product_vendorProfileId_status_idx" ON "product"("vendorProfileId", "status");
CREATE INDEX "product_variant_mediaAssetId_idx" ON "product_variant"("mediaAssetId");
CREATE INDEX "product_image_mediaAssetId_idx" ON "product_image"("mediaAssetId");
CREATE INDEX "promotion_vendorProfileId_status_idx" ON "promotion"("vendorProfileId", "status");
CREATE INDEX "promotion_bannerMediaAssetId_idx" ON "promotion"("bannerMediaAssetId");
CREATE INDEX "StoreStudioCampaign_vendorProfileId_idx" ON "StoreStudioCampaign"("vendorProfileId");
CREATE INDEX "StoreStudioAsset_mediaAssetId_idx" ON "StoreStudioAsset"("mediaAssetId");
CREATE INDEX "StoreStudioAsset_mobileMediaAssetId_idx" ON "StoreStudioAsset"("mobileMediaAssetId");
CREATE INDEX "StoreStudioAsset_coverMediaAssetId_idx" ON "StoreStudioAsset"("coverMediaAssetId");
CREATE INDEX "StoreStudioAsset_posterMediaAssetId_idx" ON "StoreStudioAsset"("posterMediaAssetId");
CREATE INDEX "storefront_hero_mediaAssetId_idx" ON "storefront_hero"("mediaAssetId");
CREATE INDEX "storefront_hero_posterMediaAssetId_idx" ON "storefront_hero"("posterMediaAssetId");

-- Foreign keys for new tables.
ALTER TABLE "media_asset" ADD CONSTRAINT "media_asset_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "media_asset" ADD CONSTRAINT "media_asset_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "media_asset" ADD CONSTRAINT "media_asset_vendorProfileId_fkey" FOREIGN KEY ("vendorProfileId") REFERENCES "vendor_profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "vendor_profile" ADD CONSTRAINT "vendor_profile_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "vendor_profile" ADD CONSTRAINT "vendor_profile_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "vendor_profile" ADD CONSTRAINT "vendor_profile_logoMediaAssetId_fkey" FOREIGN KEY ("logoMediaAssetId") REFERENCES "media_asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "vendor_membership" ADD CONSTRAINT "vendor_membership_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendor_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "vendor_membership" ADD CONSTRAINT "vendor_membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "store_collection" ADD CONSTRAINT "store_collection_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "store_collection" ADD CONSTRAINT "store_collection_vendorProfileId_fkey" FOREIGN KEY ("vendorProfileId") REFERENCES "vendor_profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "store_collection" ADD CONSTRAINT "store_collection_coverMediaAssetId_fkey" FOREIGN KEY ("coverMediaAssetId") REFERENCES "media_asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "store_collection_product" ADD CONSTRAINT "store_collection_product_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "store_collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "store_collection_product" ADD CONSTRAINT "store_collection_product_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Foreign keys added to existing tables.
ALTER TABLE "product" ADD CONSTRAINT "product_vendorProfileId_fkey" FOREIGN KEY ("vendorProfileId") REFERENCES "vendor_profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "product_variant" ADD CONSTRAINT "product_variant_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "media_asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "product_image" ADD CONSTRAINT "product_image_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "media_asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "promotion" ADD CONSTRAINT "promotion_vendorProfileId_fkey" FOREIGN KEY ("vendorProfileId") REFERENCES "vendor_profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "promotion" ADD CONSTRAINT "promotion_bannerMediaAssetId_fkey" FOREIGN KEY ("bannerMediaAssetId") REFERENCES "media_asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StoreStudioCampaign" ADD CONSTRAINT "StoreStudioCampaign_vendorProfileId_fkey" FOREIGN KEY ("vendorProfileId") REFERENCES "vendor_profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StoreStudioAsset" ADD CONSTRAINT "StoreStudioAsset_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "media_asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StoreStudioAsset" ADD CONSTRAINT "StoreStudioAsset_mobileMediaAssetId_fkey" FOREIGN KEY ("mobileMediaAssetId") REFERENCES "media_asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StoreStudioAsset" ADD CONSTRAINT "StoreStudioAsset_coverMediaAssetId_fkey" FOREIGN KEY ("coverMediaAssetId") REFERENCES "media_asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StoreStudioAsset" ADD CONSTRAINT "StoreStudioAsset_posterMediaAssetId_fkey" FOREIGN KEY ("posterMediaAssetId") REFERENCES "media_asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "storefront_hero" ADD CONSTRAINT "storefront_hero_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "media_asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "storefront_hero" ADD CONSTRAINT "storefront_hero_posterMediaAssetId_fkey" FOREIGN KEY ("posterMediaAssetId") REFERENCES "media_asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
