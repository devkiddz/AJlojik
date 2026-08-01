CREATE TYPE "IntelligenceProviderKind" AS ENUM ('DETERMINISTIC', 'EXTERNAL');
CREATE TYPE "IntelligenceProviderRunStatus" AS ENUM ('STARTED', 'SUCCEEDED', 'FAILED', 'FALLBACK');
CREATE TYPE "IntelligenceAuditSeverity" AS ENUM ('INFO', 'WARNING', 'ERROR');

CREATE TABLE "intelligence_provider_run" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "resolutionId" TEXT,
  "providerKey" TEXT NOT NULL,
  "providerKind" "IntelligenceProviderKind" NOT NULL,
  "operation" TEXT NOT NULL,
  "model" TEXT,
  "promptVersion" TEXT NOT NULL,
  "status" "IntelligenceProviderRunStatus" NOT NULL DEFAULT 'STARTED',
  "fallbackFrom" TEXT,
  "latencyMs" INTEGER,
  "inputTokens" INTEGER,
  "outputTokens" INTEGER,
  "costMicros" INTEGER,
  "requestHash" TEXT NOT NULL,
  "responseHash" TEXT,
  "errorCode" TEXT,
  "metadata" JSONB,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "intelligence_provider_run_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "intelligence_audit_event" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "resolutionId" TEXT,
  "preparedActionId" TEXT,
  "actorUserId" TEXT,
  "type" TEXT NOT NULL,
  "severity" "IntelligenceAuditSeverity" NOT NULL DEFAULT 'INFO',
  "traceId" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "intelligence_audit_event_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "intelligence_provider_run_workspaceId_createdAt_idx" ON "intelligence_provider_run"("workspaceId", "createdAt");
CREATE INDEX "intelligence_provider_run_providerKey_status_createdAt_idx" ON "intelligence_provider_run"("providerKey", "status", "createdAt");
CREATE INDEX "intelligence_provider_run_resolutionId_createdAt_idx" ON "intelligence_provider_run"("resolutionId", "createdAt");
CREATE INDEX "intelligence_audit_event_workspaceId_severity_createdAt_idx" ON "intelligence_audit_event"("workspaceId", "severity", "createdAt");
CREATE INDEX "intelligence_audit_event_resolutionId_createdAt_idx" ON "intelligence_audit_event"("resolutionId", "createdAt");
CREATE INDEX "intelligence_audit_event_preparedActionId_createdAt_idx" ON "intelligence_audit_event"("preparedActionId", "createdAt");
CREATE INDEX "intelligence_audit_event_traceId_idx" ON "intelligence_audit_event"("traceId");

ALTER TABLE "intelligence_provider_run" ADD CONSTRAINT "intelligence_provider_run_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "intelligence_provider_run" ADD CONSTRAINT "intelligence_provider_run_resolutionId_fkey" FOREIGN KEY ("resolutionId") REFERENCES "intelligence_resolution"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "intelligence_audit_event" ADD CONSTRAINT "intelligence_audit_event_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "intelligence_audit_event" ADD CONSTRAINT "intelligence_audit_event_resolutionId_fkey" FOREIGN KEY ("resolutionId") REFERENCES "intelligence_resolution"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "intelligence_audit_event" ADD CONSTRAINT "intelligence_audit_event_preparedActionId_fkey" FOREIGN KEY ("preparedActionId") REFERENCES "intelligence_prepared_action"("id") ON DELETE SET NULL ON UPDATE CASCADE;
