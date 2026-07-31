/*
  AJ Logik / RCENTZ
  Workspace catalog, promotions, and customer shopping lists.

  Existing products are assigned to the active LIVE workspace
  before product.workspaceId becomes required.
*/

-- CreateEnum
CREATE TYPE "ShoppingListVisibility" AS ENUM (
  'PRIVATE',
  'SHARED'
);

-- CreateEnum
CREATE TYPE "ShoppingListStatus" AS ENUM (
  'ACTIVE',
  'ARCHIVED'
);

-- AlterEnum
ALTER TYPE "ExperienceEventType"
ADD VALUE 'SHOPPING_LIST_CREATED';

ALTER TYPE "ExperienceEventType"
ADD VALUE 'SHOPPING_LIST_RENAMED';

ALTER TYPE "ExperienceEventType"
ADD VALUE 'SHOPPING_LIST_ARCHIVED';

ALTER TYPE "ExperienceEventType"
ADD VALUE 'ADD_TO_SHOPPING_LIST';

ALTER TYPE "ExperienceEventType"
ADD VALUE 'REMOVE_FROM_SHOPPING_LIST';

ALTER TYPE "ExperienceEventType"
ADD VALUE 'UPDATE_SHOPPING_LIST_QUANTITY';

-- Drop obsolete global product indexes
DROP INDEX IF EXISTS
"product_active_featured_idx";

DROP INDEX IF EXISTS
"product_active_isNew_idx";

DROP INDEX IF EXISTS
"product_slug_key";

-- Add workspace ownership as nullable first
ALTER TABLE "product"
ADD COLUMN "workspaceId" TEXT;

-- Assign existing products to the active LIVE workspace
UPDATE "product"
SET "workspaceId" = (
  SELECT "id"
  FROM "workspace"
  WHERE "mode" = 'LIVE'
    AND "active" = true
  ORDER BY "createdAt" ASC
  LIMIT 1
)
WHERE "workspaceId" IS NULL;

-- Abort safely when no active LIVE workspace exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "product"
    WHERE "workspaceId" IS NULL
  ) THEN
    RAISE EXCEPTION
      'Unable to assign existing products: no active LIVE workspace was found.';
  END IF;
END
$$;

-- Workspace ownership can now be required
ALTER TABLE "product"
ALTER COLUMN "workspaceId"
SET NOT NULL;

-- CreateTable
CREATE TABLE "promotion" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "startsAt" TIMESTAMP(3),
  "endsAt" TIMESTAMP(3),
  "priority" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "promotion_pkey"
  PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotion_product" (
  "id" TEXT NOT NULL,
  "promotionId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "discountPercentage" INTEGER,
  "promotionalPrice" DECIMAL(12,2),
  "position" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "promotion_product_pkey"
  PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shopping_list" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "visibility" "ShoppingListVisibility"
    NOT NULL DEFAULT 'PRIVATE',
  "status" "ShoppingListStatus"
    NOT NULL DEFAULT 'ACTIVE',
  "position" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3)
    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "shopping_list_pkey"
  PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shopping_list_item" (
  "id" TEXT NOT NULL,
  "shoppingListId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "variantId" TEXT,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "position" INTEGER NOT NULL DEFAULT 0,
  "note" TEXT,
  "addedAt" TIMESTAMP(3)
    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "shopping_list_item_pkey"
  PRIMARY KEY ("id")
);

-- Promotion indexes
CREATE INDEX
"promotion_workspaceId_active_priority_idx"
ON "promotion"(
  "workspaceId",
  "active",
  "priority"
);

CREATE INDEX
"promotion_workspaceId_active_startsAt_endsAt_idx"
ON "promotion"(
  "workspaceId",
  "active",
  "startsAt",
  "endsAt"
);

CREATE INDEX
"promotion_startsAt_endsAt_idx"
ON "promotion"(
  "startsAt",
  "endsAt"
);

CREATE UNIQUE INDEX
"promotion_workspaceId_slug_key"
ON "promotion"(
  "workspaceId",
  "slug"
);

-- Promotion-product indexes
CREATE INDEX
"promotion_product_productId_idx"
ON "promotion_product"(
  "productId"
);

CREATE INDEX
"promotion_product_promotionId_position_idx"
ON "promotion_product"(
  "promotionId",
  "position"
);

CREATE UNIQUE INDEX
"promotion_product_promotionId_productId_key"
ON "promotion_product"(
  "promotionId",
  "productId"
);

-- Shopping-list indexes
CREATE INDEX
"shopping_list_workspaceId_userId_status_updatedAt_idx"
ON "shopping_list"(
  "workspaceId",
  "userId",
  "status",
  "updatedAt"
);

CREATE INDEX
"shopping_list_userId_updatedAt_idx"
ON "shopping_list"(
  "userId",
  "updatedAt"
);

CREATE UNIQUE INDEX
"shopping_list_workspaceId_userId_name_key"
ON "shopping_list"(
  "workspaceId",
  "userId",
  "name"
);

-- Shopping-list-item indexes
CREATE INDEX
"shopping_list_item_shoppingListId_position_idx"
ON "shopping_list_item"(
  "shoppingListId",
  "position"
);

CREATE INDEX
"shopping_list_item_productId_idx"
ON "shopping_list_item"(
  "productId"
);

CREATE INDEX
"shopping_list_item_variantId_idx"
ON "shopping_list_item"(
  "variantId"
);

CREATE UNIQUE INDEX
"shopping_list_item_shoppingListId_productId_key"
ON "shopping_list_item"(
  "shoppingListId",
  "productId"
);

-- Workspace-scoped product indexes
CREATE INDEX
"product_workspaceId_active_idx"
ON "product"(
  "workspaceId",
  "active"
);

CREATE INDEX
"product_workspaceId_active_featured_idx"
ON "product"(
  "workspaceId",
  "active",
  "featured"
);

CREATE INDEX
"product_workspaceId_active_isNew_idx"
ON "product"(
  "workspaceId",
  "active",
  "isNew"
);

CREATE UNIQUE INDEX
"product_workspaceId_slug_key"
ON "product"(
  "workspaceId",
  "slug"
);

-- Foreign keys
ALTER TABLE "product"
ADD CONSTRAINT
"product_workspaceId_fkey"
FOREIGN KEY ("workspaceId")
REFERENCES "workspace"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "promotion"
ADD CONSTRAINT
"promotion_workspaceId_fkey"
FOREIGN KEY ("workspaceId")
REFERENCES "workspace"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "promotion_product"
ADD CONSTRAINT
"promotion_product_promotionId_fkey"
FOREIGN KEY ("promotionId")
REFERENCES "promotion"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "promotion_product"
ADD CONSTRAINT
"promotion_product_productId_fkey"
FOREIGN KEY ("productId")
REFERENCES "product"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "shopping_list"
ADD CONSTRAINT
"shopping_list_workspaceId_fkey"
FOREIGN KEY ("workspaceId")
REFERENCES "workspace"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "shopping_list"
ADD CONSTRAINT
"shopping_list_userId_fkey"
FOREIGN KEY ("userId")
REFERENCES "user"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "shopping_list_item"
ADD CONSTRAINT
"shopping_list_item_shoppingListId_fkey"
FOREIGN KEY ("shoppingListId")
REFERENCES "shopping_list"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "shopping_list_item"
ADD CONSTRAINT
"shopping_list_item_productId_fkey"
FOREIGN KEY ("productId")
REFERENCES "product"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "shopping_list_item"
ADD CONSTRAINT
"shopping_list_item_variantId_fkey"
FOREIGN KEY ("variantId")
REFERENCES "product_variant"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;