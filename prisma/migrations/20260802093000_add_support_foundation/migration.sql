CREATE TYPE "SupportCaseCategory" AS ENUM ('ORDER', 'DELIVERY', 'PAYMENT', 'PRODUCT', 'ACCOUNT', 'VENDOR', 'SHOPPING_LIST', 'TECHNICAL', 'OTHER');
CREATE TYPE "SupportCasePriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');
CREATE TYPE "SupportCaseStatus" AS ENUM ('NEW', 'TRIAGED', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'WAITING_VENDOR', 'WAITING_INTERNAL', 'RESOLVED', 'CUSTOMER_CONFIRMED', 'CLOSED');
CREATE TYPE "SupportEscalationStatus" AS ENUM ('OPEN', 'ACKNOWLEDGED', 'RESOLVED', 'CANCELLED');
CREATE TYPE "SupportResolutionType" AS ENUM ('INFORMATION', 'DELIVERY_FOLLOWUP', 'ORDER_ADJUSTMENT', 'REFUND_REQUEST', 'REPLACEMENT', 'TECHNICAL_FIX', 'OTHER');
CREATE TYPE "SupportResolutionStatus" AS ENUM ('PROPOSED', 'APPROVED', 'APPLIED', 'REJECTED', 'FAILED');

CREATE TABLE "support_case" (
  "id" TEXT NOT NULL,
  "caseNumber" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "conversationId" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "vendorProfileId" TEXT,
  "orderId" TEXT,
  "deliveryId" TEXT,
  "assignedAgentId" TEXT,
  "category" "SupportCaseCategory" NOT NULL,
  "priority" "SupportCasePriority" NOT NULL DEFAULT 'NORMAL',
  "status" "SupportCaseStatus" NOT NULL DEFAULT 'NEW',
  "subject" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "metadata" JSONB,
  "assignedAt" TIMESTAMP(3),
  "firstResponseAt" TIMESTAMP(3),
  "dueAt" TIMESTAMP(3),
  "resolvedAt" TIMESTAMP(3),
  "customerConfirmedAt" TIMESTAMP(3),
  "closedAt" TIMESTAMP(3),
  "resolutionSummary" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "support_case_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "support_assignment" (
  "id" TEXT NOT NULL,
  "caseId" TEXT NOT NULL,
  "agentId" TEXT NOT NULL,
  "assignedById" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "reason" TEXT,
  "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "releasedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "support_assignment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "support_note" (
  "id" TEXT NOT NULL,
  "caseId" TEXT NOT NULL,
  "authorId" TEXT,
  "body" TEXT NOT NULL,
  "internal" BOOLEAN NOT NULL DEFAULT true,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "support_note_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "support_escalation" (
  "id" TEXT NOT NULL,
  "caseId" TEXT NOT NULL,
  "actorId" TEXT,
  "fromPriority" "SupportCasePriority" NOT NULL,
  "toPriority" "SupportCasePriority" NOT NULL,
  "status" "SupportEscalationStatus" NOT NULL DEFAULT 'OPEN',
  "reason" TEXT NOT NULL,
  "metadata" JSONB,
  "resolvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "support_escalation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "support_status_history" (
  "id" TEXT NOT NULL,
  "caseId" TEXT NOT NULL,
  "actorId" TEXT,
  "fromStatus" "SupportCaseStatus",
  "toStatus" "SupportCaseStatus" NOT NULL,
  "note" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "support_status_history_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "support_sla" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "scopeKey" TEXT NOT NULL,
  "category" "SupportCaseCategory",
  "priority" "SupportCasePriority" NOT NULL,
  "firstResponseMinutes" INTEGER NOT NULL,
  "resolutionMinutes" INTEGER NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "support_sla_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "support_resolution" (
  "id" TEXT NOT NULL,
  "caseId" TEXT NOT NULL,
  "proposedById" TEXT,
  "approvedById" TEXT,
  "type" "SupportResolutionType" NOT NULL,
  "status" "SupportResolutionStatus" NOT NULL DEFAULT 'PROPOSED',
  "summary" TEXT NOT NULL,
  "actionPayload" JSONB,
  "resultPayload" JSONB,
  "failureReason" TEXT,
  "proposedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "approvedAt" TIMESTAMP(3),
  "appliedAt" TIMESTAMP(3),
  "failedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "support_resolution_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "support_feedback" (
  "id" TEXT NOT NULL,
  "caseId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "rating" INTEGER NOT NULL,
  "comment" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "support_feedback_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "support_case_caseNumber_key" ON "support_case"("caseNumber");
CREATE UNIQUE INDEX "support_case_conversationId_key" ON "support_case"("conversationId");
CREATE INDEX "support_case_workspaceId_status_priority_updatedAt_idx" ON "support_case"("workspaceId", "status", "priority", "updatedAt");
CREATE INDEX "support_case_customerId_updatedAt_idx" ON "support_case"("customerId", "updatedAt");
CREATE INDEX "support_case_assignedAgentId_status_dueAt_idx" ON "support_case"("assignedAgentId", "status", "dueAt");
CREATE INDEX "support_case_vendorProfileId_status_idx" ON "support_case"("vendorProfileId", "status");
CREATE INDEX "support_case_orderId_idx" ON "support_case"("orderId");
CREATE INDEX "support_case_deliveryId_idx" ON "support_case"("deliveryId");

CREATE INDEX "support_assignment_caseId_active_assignedAt_idx" ON "support_assignment"("caseId", "active", "assignedAt");
CREATE INDEX "support_assignment_agentId_active_idx" ON "support_assignment"("agentId", "active");
CREATE INDEX "support_note_caseId_createdAt_idx" ON "support_note"("caseId", "createdAt");
CREATE INDEX "support_note_authorId_createdAt_idx" ON "support_note"("authorId", "createdAt");
CREATE INDEX "support_escalation_caseId_status_createdAt_idx" ON "support_escalation"("caseId", "status", "createdAt");
CREATE INDEX "support_escalation_actorId_createdAt_idx" ON "support_escalation"("actorId", "createdAt");
CREATE INDEX "support_status_history_caseId_createdAt_idx" ON "support_status_history"("caseId", "createdAt");
CREATE INDEX "support_status_history_actorId_createdAt_idx" ON "support_status_history"("actorId", "createdAt");
CREATE UNIQUE INDEX "support_sla_workspaceId_scopeKey_key" ON "support_sla"("workspaceId", "scopeKey");
CREATE INDEX "support_sla_workspaceId_category_priority_active_idx" ON "support_sla"("workspaceId", "category", "priority", "active");
CREATE INDEX "support_resolution_caseId_status_proposedAt_idx" ON "support_resolution"("caseId", "status", "proposedAt");
CREATE INDEX "support_resolution_proposedById_proposedAt_idx" ON "support_resolution"("proposedById", "proposedAt");
CREATE INDEX "support_resolution_approvedById_approvedAt_idx" ON "support_resolution"("approvedById", "approvedAt");
CREATE UNIQUE INDEX "support_feedback_caseId_key" ON "support_feedback"("caseId");
CREATE INDEX "support_feedback_userId_createdAt_idx" ON "support_feedback"("userId", "createdAt");

ALTER TABLE "support_case" ADD CONSTRAINT "support_case_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "support_case" ADD CONSTRAINT "support_case_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "communication_conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "support_case" ADD CONSTRAINT "support_case_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "support_case" ADD CONSTRAINT "support_case_vendorProfileId_fkey" FOREIGN KEY ("vendorProfileId") REFERENCES "vendor_profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "support_case" ADD CONSTRAINT "support_case_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "support_case" ADD CONSTRAINT "support_case_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "delivery"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "support_case" ADD CONSTRAINT "support_case_assignedAgentId_fkey" FOREIGN KEY ("assignedAgentId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "support_assignment" ADD CONSTRAINT "support_assignment_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "support_case"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "support_assignment" ADD CONSTRAINT "support_assignment_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "support_assignment" ADD CONSTRAINT "support_assignment_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "support_note" ADD CONSTRAINT "support_note_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "support_case"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "support_note" ADD CONSTRAINT "support_note_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "support_escalation" ADD CONSTRAINT "support_escalation_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "support_case"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "support_escalation" ADD CONSTRAINT "support_escalation_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "support_status_history" ADD CONSTRAINT "support_status_history_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "support_case"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "support_status_history" ADD CONSTRAINT "support_status_history_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "support_sla" ADD CONSTRAINT "support_sla_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "support_resolution" ADD CONSTRAINT "support_resolution_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "support_case"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "support_resolution" ADD CONSTRAINT "support_resolution_proposedById_fkey" FOREIGN KEY ("proposedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "support_resolution" ADD CONSTRAINT "support_resolution_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "support_feedback" ADD CONSTRAINT "support_feedback_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "support_case"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "support_feedback" ADD CONSTRAINT "support_feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
