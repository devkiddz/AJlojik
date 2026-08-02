CREATE TYPE "SupportCommerceActionType" AS ENUM (
  'REFUND_REQUEST',
  'ORDER_CANCELLATION',
  'DELIVERY_RETRY',
  'PAYMENT_REVIEW',
  'INVENTORY_REVIEW',
  'VENDOR_FOLLOWUP'
);

CREATE TYPE "SupportCommerceActionStatus" AS ENUM (
  'PREPARED',
  'APPROVED',
  'REJECTED',
  'APPLIED',
  'FAILED',
  'CANCELLED'
);

CREATE TABLE "support_commerce_action" (
  "id" TEXT NOT NULL,
  "caseId" TEXT NOT NULL,
  "requestedById" TEXT,
  "approvedById" TEXT,
  "executedById" TEXT,
  "type" "SupportCommerceActionType" NOT NULL,
  "status" "SupportCommerceActionStatus" NOT NULL DEFAULT 'PREPARED',
  "requestedAmount" DECIMAL(12,2),
  "currency" TEXT,
  "reason" TEXT NOT NULL,
  "requestPayload" JSONB,
  "resultPayload" JSONB,
  "failureReason" TEXT,
  "preparedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "approvedAt" TIMESTAMP(3),
  "rejectedAt" TIMESTAMP(3),
  "appliedAt" TIMESTAMP(3),
  "failedAt" TIMESTAMP(3),
  "cancelledAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "support_commerce_action_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "support_commerce_action_caseId_status_preparedAt_idx"
  ON "support_commerce_action"("caseId", "status", "preparedAt");

CREATE INDEX "support_commerce_action_requestedById_preparedAt_idx"
  ON "support_commerce_action"("requestedById", "preparedAt");

CREATE INDEX "support_commerce_action_approvedById_approvedAt_idx"
  ON "support_commerce_action"("approvedById", "approvedAt");

ALTER TABLE "support_commerce_action"
  ADD CONSTRAINT "support_commerce_action_caseId_fkey"
  FOREIGN KEY ("caseId") REFERENCES "support_case"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "support_commerce_action"
  ADD CONSTRAINT "support_commerce_action_requestedById_fkey"
  FOREIGN KEY ("requestedById") REFERENCES "user"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "support_commerce_action"
  ADD CONSTRAINT "support_commerce_action_approvedById_fkey"
  FOREIGN KEY ("approvedById") REFERENCES "user"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "support_commerce_action"
  ADD CONSTRAINT "support_commerce_action_executedById_fkey"
  FOREIGN KEY ("executedById") REFERENCES "user"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
