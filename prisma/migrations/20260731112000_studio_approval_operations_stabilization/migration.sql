-- AJ Logik / RCENTZ
-- Studio and Approval Operations Stabilization.
-- Adds operational lifecycle metadata without deleting existing requests.

CREATE TYPE "AdminApprovalSource" AS ENUM (
  'CUSTOMER',
  'VENDOR',
  'ADMIN',
  'SYSTEM'
);

CREATE TYPE "AdminApprovalPriority" AS ENUM (
  'LOW',
  'NORMAL',
  'HIGH',
  'URGENT'
);

CREATE TYPE "AdminApprovalEventType" AS ENUM (
  'CREATED',
  'INSPECTION_STARTED',
  'ASSIGNED',
  'DEADLINE_CHANGED',
  'NOTE_UPDATED',
  'HELD',
  'REACTIVATED',
  'CHANGES_REQUESTED',
  'APPROVED',
  'EXECUTED',
  'PAUSED',
  'REJECTED',
  'CANCELLED',
  'EXPIRED',
  'REVERTED'
);

ALTER TYPE "AdminApprovalStatus" ADD VALUE IF NOT EXISTS 'IN_INSPECTION';
ALTER TYPE "AdminApprovalStatus" ADD VALUE IF NOT EXISTS 'ON_HOLD';
ALTER TYPE "AdminApprovalStatus" ADD VALUE IF NOT EXISTS 'CHANGES_REQUESTED';
ALTER TYPE "AdminApprovalStatus" ADD VALUE IF NOT EXISTS 'PAUSED';
ALTER TYPE "AdminApprovalStatus" ADD VALUE IF NOT EXISTS 'EXPIRED';
ALTER TYPE "AdminApprovalStatus" ADD VALUE IF NOT EXISTS 'REVERTED';

ALTER TABLE "admin_approval_request"
ADD COLUMN "assignedReviewerId" TEXT,
ADD COLUMN "source" "AdminApprovalSource" NOT NULL DEFAULT 'ADMIN',
ADD COLUMN "priority" "AdminApprovalPriority" NOT NULL DEFAULT 'NORMAL',
ADD COLUMN "internalNote" TEXT,
ADD COLUMN "targetSnapshot" JSONB,
ADD COLUMN "resultSnapshot" JSONB,
ADD COLUMN "revision" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN "dueAt" TIMESTAMP(3),
ADD COLUMN "holdUntil" TIMESTAMP(3),
ADD COLUMN "inspectionStartedAt" TIMESTAMP(3),
ADD COLUMN "changesRequestedAt" TIMESTAMP(3),
ADD COLUMN "pausedAt" TIMESTAMP(3),
ADD COLUMN "reactivatedAt" TIMESTAMP(3),
ADD COLUMN "revertedAt" TIMESTAMP(3),
ADD COLUMN "expiredAt" TIMESTAMP(3);

ALTER TABLE "admin_approval_request"
ADD CONSTRAINT "admin_approval_request_assignedReviewerId_fkey"
FOREIGN KEY ("assignedReviewerId") REFERENCES "user"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "admin_approval_event" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "requestId" TEXT NOT NULL,
  "actorId" TEXT,
  "type" "AdminApprovalEventType" NOT NULL,
  "fromStatus" "AdminApprovalStatus",
  "toStatus" "AdminApprovalStatus",
  "note" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "admin_approval_event_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "admin_approval_event"
ADD CONSTRAINT "admin_approval_event_workspaceId_fkey"
FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "admin_approval_event"
ADD CONSTRAINT "admin_approval_event_requestId_fkey"
FOREIGN KEY ("requestId") REFERENCES "admin_approval_request"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "admin_approval_event"
ADD CONSTRAINT "admin_approval_event_actorId_fkey"
FOREIGN KEY ("actorId") REFERENCES "user"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- Infer existing customer and vendor requests where the target makes the source clear.
UPDATE "admin_approval_request"
SET "source" = 'CUSTOMER'
WHERE "targetType" = 'SHOPPING_LIST';

UPDATE "admin_approval_request" request
SET "source" = 'VENDOR'
WHERE request."targetType" = 'VENDOR'
   OR (
     request."targetType" = 'PRODUCT'
     AND EXISTS (
       SELECT 1 FROM "product" product
       WHERE product."id" = request."targetId"
         AND product."vendorProfileId" IS NOT NULL
     )
   )
   OR (
     request."targetType" = 'PROMOTION'
     AND EXISTS (
       SELECT 1 FROM "promotion" promotion
       WHERE promotion."id" = request."targetId"
         AND promotion."vendorProfileId" IS NOT NULL
     )
   )
   OR (
     request."targetType" = 'COLLECTION'
     AND EXISTS (
       SELECT 1 FROM "store_collection" collection
       WHERE collection."id" = request."targetId"
         AND collection."vendorProfileId" IS NOT NULL
     )
   )
   OR (
     request."targetType" IN ('CAMPAIGN', 'EXPERIENCE')
     AND EXISTS (
       SELECT 1 FROM "StoreStudioCampaign" campaign
       WHERE campaign."id" = request."targetId"
         AND campaign."vendorProfileId" IS NOT NULL
     )
   );

UPDATE "admin_approval_request"
SET "dueAt" = "createdAt" + INTERVAL '48 hours'
WHERE "dueAt" IS NULL
  AND "status" = 'PENDING';

INSERT INTO "admin_approval_event" (
  "id",
  "workspaceId",
  "requestId",
  "actorId",
  "type",
  "fromStatus",
  "toStatus",
  "note",
  "metadata",
  "createdAt"
)
SELECT
  'migration_' || request."id",
  request."workspaceId",
  request."id",
  request."requestedById",
  'CREATED',
  NULL,
  request."status",
  'Imported from the existing Approval queue.',
  jsonb_build_object('migration', '20260731112000'),
  request."createdAt"
FROM "admin_approval_request" request
ON CONFLICT DO NOTHING;

DROP INDEX IF EXISTS "admin_approval_request_workspaceId_status_createdAt_idx";

CREATE INDEX "admin_approval_request_workspaceId_status_priority_createdAt_idx"
ON "admin_approval_request"("workspaceId", "status", "priority", "createdAt");

CREATE INDEX "admin_approval_request_workspaceId_source_status_createdAt_idx"
ON "admin_approval_request"("workspaceId", "source", "status", "createdAt");

CREATE INDEX "admin_approval_request_assignedReviewerId_status_dueAt_idx"
ON "admin_approval_request"("assignedReviewerId", "status", "dueAt");

CREATE INDEX "admin_approval_event_requestId_createdAt_idx"
ON "admin_approval_event"("requestId", "createdAt");

CREATE INDEX "admin_approval_event_workspaceId_createdAt_idx"
ON "admin_approval_event"("workspaceId", "createdAt");

CREATE INDEX "admin_approval_event_actorId_createdAt_idx"
ON "admin_approval_event"("actorId", "createdAt");
