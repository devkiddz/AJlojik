
CREATE TYPE "IntelligenceResolutionType" AS ENUM ('PRODUCT_DISCOVERY','PRODUCT_COMPARISON','PRODUCT_PAIRING','SHOPPING_PLAN','BASKET_OPTIMIZATION','SHOPPING_LIST_PREPARATION','DELIVERY_SUPPORT','CATALOG_IMPROVEMENT','PRODUCT_DRAFT','PRODUCT_REVISION','CAMPAIGN_PLAN','INVENTORY_INTERVENTION','REVIEW_MODERATION','VENDOR_INTERVENTION','OPERATIONS_BRIEF','GOVERNANCE_EXPLANATION','CUSTOM');
CREATE TYPE "IntelligenceResolutionStatus" AS ENUM ('COLLECTING','PLANNING','READY','AWAITING_REVIEW','APPROVED','EXECUTING','APPLIED','PARTIALLY_APPLIED','BLOCKED','DISMISSED','STALE','ARCHIVED');
CREATE TYPE "IntelligenceRiskLevel" AS ENUM ('LOW','MEDIUM','HIGH','CRITICAL');
CREATE TYPE "IntelligenceUpdateType" AS ENUM ('GOAL_CAPTURED','CONTEXT_COLLECTED','CONSTRAINT_IDENTIFIED','ASSUMPTION_ADDED','EVIDENCE_FOUND','PLAN_UPDATED','ACTION_PREPARED','APPROVAL_REQUIRED','ACTION_APPROVED','EXECUTION_STARTED','ACTION_APPLIED','ACTION_FAILED','OUTCOME_VERIFIED','RESOLUTION_COMPLETED','RESOLUTION_BLOCKED','RESOLUTION_DISMISSED','RESOLUTION_ARCHIVED');
CREATE TYPE "IntelligenceAuthorityClass" AS ENUM ('READ_ONLY','RECOMMEND','PREPARE','APPLY_REVERSIBLE','REQUIRE_CONFIRMATION','REQUIRE_APPROVAL','PROHIBITED');
CREATE TYPE "IntelligencePreparedActionStatus" AS ENUM ('PREPARED','AWAITING_CONFIRMATION','AWAITING_APPROVAL','APPROVED','EXECUTING','APPLIED','FAILED','CANCELLED');

CREATE TABLE "intelligence_resolution" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "ownerUserId" TEXT NOT NULL,
  "vendorProfileId" TEXT,
  "audience" "AiAssistantAudience" NOT NULL,
  "type" "IntelligenceResolutionType" NOT NULL,
  "status" "IntelligenceResolutionStatus" NOT NULL DEFAULT 'COLLECTING',
  "title" TEXT NOT NULL,
  "objective" TEXT NOT NULL,
  "expectedOutcome" TEXT NOT NULL,
  "contextSnapshot" JSONB NOT NULL,
  "constraints" JSONB NOT NULL,
  "assumptions" JSONB NOT NULL,
  "evidence" JSONB NOT NULL,
  "recommendations" JSONB NOT NULL,
  "plan" JSONB NOT NULL,
  "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "riskLevel" "IntelligenceRiskLevel" NOT NULL DEFAULT 'LOW',
  "completion" INTEGER NOT NULL DEFAULT 0,
  "blockedReason" TEXT,
  "expiresAt" TIMESTAMP(3),
  "resolvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "intelligence_resolution_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "intelligence_resolution_update" (
  "id" TEXT NOT NULL,
  "resolutionId" TEXT NOT NULL,
  "type" "IntelligenceUpdateType" NOT NULL,
  "title" TEXT NOT NULL,
  "detail" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "intelligence_resolution_update_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "intelligence_resolution_session" (
  "resolutionId" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "attachedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "intelligence_resolution_session_pkey" PRIMARY KEY ("resolutionId","sessionId")
);

CREATE TABLE "intelligence_prepared_action" (
  "id" TEXT NOT NULL,
  "resolutionId" TEXT NOT NULL,
  "applicationId" TEXT,
  "approvedByUserId" TEXT,
  "actionType" TEXT NOT NULL,
  "authorityClass" "IntelligenceAuthorityClass" NOT NULL,
  "status" "IntelligencePreparedActionStatus" NOT NULL DEFAULT 'PREPARED',
  "label" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "targetType" TEXT,
  "targetId" TEXT,
  "input" JSONB NOT NULL,
  "preview" JSONB NOT NULL,
  "validation" JSONB NOT NULL,
  "idempotencyKey" TEXT NOT NULL,
  "approvedAt" TIMESTAMP(3),
  "appliedAt" TIMESTAMP(3),
  "error" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "intelligence_prepared_action_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "intelligence_resolution_workspaceId_ownerUserId_audience_status_updatedAt_idx" ON "intelligence_resolution"("workspaceId","ownerUserId","audience","status","updatedAt");
CREATE INDEX "intelligence_resolution_vendorProfileId_status_updatedAt_idx" ON "intelligence_resolution"("vendorProfileId","status","updatedAt");
CREATE INDEX "intelligence_resolution_type_status_updatedAt_idx" ON "intelligence_resolution"("type","status","updatedAt");
CREATE INDEX "intelligence_resolution_expiresAt_idx" ON "intelligence_resolution"("expiresAt");
CREATE INDEX "intelligence_resolution_update_resolutionId_createdAt_idx" ON "intelligence_resolution_update"("resolutionId","createdAt");
CREATE INDEX "intelligence_resolution_update_type_createdAt_idx" ON "intelligence_resolution_update"("type","createdAt");
CREATE INDEX "intelligence_resolution_session_sessionId_attachedAt_idx" ON "intelligence_resolution_session"("sessionId","attachedAt");
CREATE UNIQUE INDEX "intelligence_prepared_action_applicationId_key" ON "intelligence_prepared_action"("applicationId");
CREATE UNIQUE INDEX "intelligence_prepared_action_idempotencyKey_key" ON "intelligence_prepared_action"("idempotencyKey");
CREATE INDEX "intelligence_prepared_action_resolutionId_status_createdAt_idx" ON "intelligence_prepared_action"("resolutionId","status","createdAt");
CREATE INDEX "intelligence_prepared_action_approvedByUserId_createdAt_idx" ON "intelligence_prepared_action"("approvedByUserId","createdAt");
CREATE INDEX "intelligence_prepared_action_status_createdAt_idx" ON "intelligence_prepared_action"("status","createdAt");

ALTER TABLE "intelligence_resolution" ADD CONSTRAINT "intelligence_resolution_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "intelligence_resolution" ADD CONSTRAINT "intelligence_resolution_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "intelligence_resolution" ADD CONSTRAINT "intelligence_resolution_vendorProfileId_fkey" FOREIGN KEY ("vendorProfileId") REFERENCES "vendor_profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "intelligence_resolution_update" ADD CONSTRAINT "intelligence_resolution_update_resolutionId_fkey" FOREIGN KEY ("resolutionId") REFERENCES "intelligence_resolution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "intelligence_resolution_session" ADD CONSTRAINT "intelligence_resolution_session_resolutionId_fkey" FOREIGN KEY ("resolutionId") REFERENCES "intelligence_resolution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "intelligence_resolution_session" ADD CONSTRAINT "intelligence_resolution_session_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ai_assistant_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "intelligence_prepared_action" ADD CONSTRAINT "intelligence_prepared_action_resolutionId_fkey" FOREIGN KEY ("resolutionId") REFERENCES "intelligence_resolution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "intelligence_prepared_action" ADD CONSTRAINT "intelligence_prepared_action_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "ai_assistant_application"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "intelligence_prepared_action" ADD CONSTRAINT "intelligence_prepared_action_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
