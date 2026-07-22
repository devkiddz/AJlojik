-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- DropIndex
DROP INDEX "review_productId_idx";

-- Add the new moderation columns before removing the legacy approval flag
ALTER TABLE "review"
ADD COLUMN "moderatedAt" TIMESTAMP(3),
ADD COLUMN "moderatedById" TEXT,
ADD COLUMN "moderationReason" TEXT,
ADD COLUMN "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING';

-- Preserve the legacy approval state
UPDATE "review"
SET "status" = CASE
  WHEN "approved" = TRUE THEN 'APPROVED'::"ReviewStatus"
  ELSE 'PENDING'::"ReviewStatus"
END;

-- Remove the legacy column only after its values have been migrated
ALTER TABLE "review"
DROP COLUMN "approved";

-- CreateIndex
CREATE INDEX "review_productId_status_idx" ON "review"("productId", "status");

-- CreateIndex
CREATE INDEX "review_status_createdAt_idx" ON "review"("status", "createdAt");

-- CreateIndex
CREATE INDEX "review_moderatedById_idx" ON "review"("moderatedById");
