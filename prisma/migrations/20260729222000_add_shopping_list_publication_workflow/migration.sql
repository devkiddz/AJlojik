-- Customer shopping-list publication and moderation workflow.

CREATE TYPE "ShoppingListPublicationStatus" AS ENUM (
  'PRIVATE',
  'PENDING_REVIEW',
  'APPROVED',
  'REJECTED'
);

ALTER TYPE "AdminTargetType"
ADD VALUE IF NOT EXISTS 'SHOPPING_LIST';

ALTER TABLE "shopping_list"
ADD COLUMN "publicationStatus" "ShoppingListPublicationStatus" NOT NULL DEFAULT 'PRIVATE',
ADD COLUMN "publicationSubmittedAt" TIMESTAMP(3),
ADD COLUMN "publicationReviewedAt" TIMESTAMP(3),
ADD COLUMN "publicationPublishedAt" TIMESTAMP(3),
ADD COLUMN "publicationReviewNote" TEXT;

CREATE INDEX "shopping_list_workspaceId_visibility_publicationStatus_updatedAt_idx"
ON "shopping_list"(
  "workspaceId",
  "visibility",
  "publicationStatus",
  "updatedAt"
);
