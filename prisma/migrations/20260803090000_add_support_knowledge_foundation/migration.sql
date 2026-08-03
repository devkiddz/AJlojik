-- AJ Logik Support Auto Response
-- Phase 1: database-backed knowledge foundation

CREATE TYPE "SupportKnowledgeStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');
CREATE TYPE "SupportKnowledgeInteractionOutcome" AS ENUM (
  'ANSWERED',
  'CLARIFICATION_REQUIRED',
  'CONTEXT_REQUIRED',
  'HUMAN_SUPPORT_REQUIRED',
  'NO_MATCH'
);

CREATE TABLE "support_knowledge_entry" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "intent" TEXT NOT NULL,
  "primaryQuestion" TEXT NOT NULL,
  "answerTemplate" TEXT NOT NULL,
  "clarificationAnswer" TEXT,
  "escalationAnswer" TEXT,
  "keywords" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "synonyms" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "requiredContext" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "conditions" JSONB,
  "actions" JSONB,
  "status" "SupportKnowledgeStatus" NOT NULL DEFAULT 'DRAFT',
  "priority" INTEGER NOT NULL DEFAULT 0,
  "confidenceThreshold" DOUBLE PRECISION NOT NULL DEFAULT 0.65,
  "version" INTEGER NOT NULL DEFAULT 1,
  "publishedAt" TIMESTAMP(3),
  "archivedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "support_knowledge_entry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "support_knowledge_question_example" (
  "id" TEXT NOT NULL,
  "entryId" TEXT NOT NULL,
  "text" TEXT NOT NULL,
  "normalizedText" TEXT NOT NULL,
  "locale" TEXT NOT NULL DEFAULT 'en-NG',
  "weight" DOUBLE PRECISION NOT NULL DEFAULT 1,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "support_knowledge_question_example_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "support_knowledge_interaction" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "customerId" TEXT,
  "supportCaseId" TEXT,
  "entryId" TEXT,
  "question" TEXT NOT NULL,
  "normalizedQuestion" TEXT NOT NULL,
  "matchedIntent" TEXT,
  "confidence" DOUBLE PRECISION,
  "outcome" "SupportKnowledgeInteractionOutcome" NOT NULL,
  "answer" TEXT,
  "feedbackHelpful" BOOLEAN,
  "feedbackReason" TEXT,
  "humanRequested" BOOLEAN NOT NULL DEFAULT false,
  "pathname" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "support_knowledge_interaction_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "support_knowledge_entry_workspaceId_slug_key"
  ON "support_knowledge_entry"("workspaceId", "slug");
CREATE INDEX "support_knowledge_entry_workspaceId_status_priority_idx"
  ON "support_knowledge_entry"("workspaceId", "status", "priority");
CREATE INDEX "support_knowledge_entry_workspaceId_intent_status_idx"
  ON "support_knowledge_entry"("workspaceId", "intent", "status");
CREATE INDEX "support_knowledge_entry_workspaceId_category_status_idx"
  ON "support_knowledge_entry"("workspaceId", "category", "status");

CREATE UNIQUE INDEX "support_knowledge_question_example_entryId_normalizedText_key"
  ON "support_knowledge_question_example"("entryId", "normalizedText");
CREATE INDEX "support_knowledge_question_example_entryId_active_idx"
  ON "support_knowledge_question_example"("entryId", "active");
CREATE INDEX "support_knowledge_question_example_normalizedText_idx"
  ON "support_knowledge_question_example"("normalizedText");

CREATE INDEX "support_knowledge_interaction_workspaceId_createdAt_idx"
  ON "support_knowledge_interaction"("workspaceId", "createdAt");
CREATE INDEX "support_knowledge_interaction_workspaceId_outcome_createdAt_idx"
  ON "support_knowledge_interaction"("workspaceId", "outcome", "createdAt");
CREATE INDEX "support_knowledge_interaction_workspaceId_matchedIntent_createdAt_idx"
  ON "support_knowledge_interaction"("workspaceId", "matchedIntent", "createdAt");
CREATE INDEX "support_knowledge_interaction_entryId_createdAt_idx"
  ON "support_knowledge_interaction"("entryId", "createdAt");
CREATE INDEX "support_knowledge_interaction_customerId_createdAt_idx"
  ON "support_knowledge_interaction"("customerId", "createdAt");
CREATE INDEX "support_knowledge_interaction_supportCaseId_idx"
  ON "support_knowledge_interaction"("supportCaseId");

ALTER TABLE "support_knowledge_entry"
  ADD CONSTRAINT "support_knowledge_entry_workspaceId_fkey"
  FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "support_knowledge_interaction"
  ADD CONSTRAINT "support_knowledge_interaction_workspaceId_fkey"
  FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "support_knowledge_question_example"
  ADD CONSTRAINT "support_knowledge_question_example_entryId_fkey"
  FOREIGN KEY ("entryId") REFERENCES "support_knowledge_entry"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "support_knowledge_interaction"
  ADD CONSTRAINT "support_knowledge_interaction_entryId_fkey"
  FOREIGN KEY ("entryId") REFERENCES "support_knowledge_entry"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
