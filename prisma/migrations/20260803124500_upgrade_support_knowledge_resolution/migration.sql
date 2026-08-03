-- AJ Logik Support Knowledge
-- Forward-only upgrade from the original bucket-based knowledge schema.
--
-- The migration intentionally preserves SupportKnowledgeBucket and existing
-- SupportKnowledgeEntry identifiers while evolving the entry contract used by
-- the deterministic customer Support Guide.

-- CreateEnum
CREATE TYPE "SupportKnowledgeStatus" AS ENUM (
  'DRAFT',
  'ACTIVE',
  'ARCHIVED'
);

-- CreateEnum
CREATE TYPE "SupportKnowledgeInteractionOutcome" AS ENUM (
  'ANSWERED',
  'CLARIFICATION_REQUIRED',
  'CONTEXT_REQUIRED',
  'HUMAN_SUPPORT_REQUIRED',
  'NO_MATCH'
);

-- Preserve the original bucket relationship under the canonical field name.
ALTER TABLE "support_knowledge_entry"
  RENAME COLUMN "bucketId" TO "supportKnowledgeBucketId";

ALTER TABLE "support_knowledge_entry"
  RENAME COLUMN "answer" TO "answerTemplate";

ALTER TABLE "support_knowledge_entry"
  RENAME COLUMN "followUp" TO "clarificationAnswer";

-- Add the governed Q&A fields.
ALTER TABLE "support_knowledge_entry"
  ADD COLUMN "category" TEXT,
  ADD COLUMN "primaryQuestion" TEXT,
  ADD COLUMN "escalationAnswer" TEXT,
  ADD COLUMN "synonyms" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "requiredContext" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "conditions" JSONB,
  ADD COLUMN "status" "SupportKnowledgeStatus",
  ADD COLUMN "confidenceThreshold" DOUBLE PRECISION NOT NULL DEFAULT 0.65,
  ADD COLUMN "version" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "archivedAt" TIMESTAMP(3);

-- Normalise nullable legacy arrays before enforcing the Prisma contract.
UPDATE "support_knowledge_entry"
SET "keywords" = ARRAY[]::TEXT[]
WHERE "keywords" IS NULL;

ALTER TABLE "support_knowledge_entry"
  ALTER COLUMN "keywords" SET NOT NULL;

-- Derive safe values for any existing legacy entries.
UPDATE "support_knowledge_entry"
SET
  "category" = COALESCE(
    NULLIF(UPPER(BTRIM("intent")), ''),
    'GENERAL'
  ),
  "primaryQuestion" = COALESCE(
    NULLIF(BTRIM("sampleQuestions"[1]), ''),
    NULLIF(BTRIM("title"), ''),
    'AJ Logik Support question'
  ),
  "status" = CASE
    WHEN "active" = false THEN 'ARCHIVED'::"SupportKnowledgeStatus"
    WHEN "verified" = true THEN 'ACTIVE'::"SupportKnowledgeStatus"
    ELSE 'DRAFT'::"SupportKnowledgeStatus"
  END,
  "archivedAt" = CASE
    WHEN "active" = false THEN CURRENT_TIMESTAMP
    ELSE NULL
  END;

ALTER TABLE "support_knowledge_entry"
  ALTER COLUMN "category" SET NOT NULL,
  ALTER COLUMN "primaryQuestion" SET NOT NULL,
  ALTER COLUMN "status" SET NOT NULL,
  ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- The evolved knowledge entry may exist without a bucket, while original rows
-- keep their current bucket assignment.
ALTER TABLE "support_knowledge_entry"
  DROP CONSTRAINT "support_knowledge_entry_bucketId_fkey";

ALTER TABLE "support_knowledge_entry"
  ALTER COLUMN "supportKnowledgeBucketId" DROP NOT NULL;

ALTER TABLE "support_knowledge_entry"
  ADD CONSTRAINT "support_knowledge_entry_supportKnowledgeBucketId_fkey"
  FOREIGN KEY ("supportKnowledgeBucketId")
  REFERENCES "support_knowledge_bucket"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;

-- CreateTable
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

  CONSTRAINT "support_knowledge_question_example_pkey"
    PRIMARY KEY ("id")
);

-- Preserve legacy sample questions as relational examples.
INSERT INTO "support_knowledge_question_example" (
  "id",
  "entryId",
  "text",
  "normalizedText",
  "locale",
  "weight",
  "active",
  "createdAt",
  "updatedAt"
)
SELECT
  'legacy_' || md5(
    entry."id" ||
    ':' ||
    example.ordinality::TEXT ||
    ':' ||
    example.text
  ),
  entry."id",
  BTRIM(example.text),
  BTRIM(
    regexp_replace(
      lower(example.text),
      '[^a-z0-9]+',
      ' ',
      'g'
    )
  ),
  'en-NG',
  1,
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "support_knowledge_entry" AS entry
CROSS JOIN LATERAL unnest(
  COALESCE(
    entry."sampleQuestions",
    ARRAY[]::TEXT[]
  )
) WITH ORDINALITY AS example(text, ordinality)
WHERE BTRIM(example.text) <> '';

-- CreateTable
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

  CONSTRAINT "support_knowledge_interaction_pkey"
    PRIMARY KEY ("id")
);

-- Remove fields superseded by the governed contract after their values have
-- been migrated.
ALTER TABLE "support_knowledge_entry"
  DROP COLUMN "sampleQuestions",
  DROP COLUMN "active",
  DROP COLUMN "verified";

-- Replace legacy indexes with the canonical query indexes.
-- PostgreSQL limits identifiers to 63 bytes. The original
-- workspaceId_active_verified_priority_idx name was stored with its final
-- character truncated to "_id". Drop both representations defensively.
DROP INDEX IF EXISTS "support_knowledge_entry_workspaceId_intent_idx";
DROP INDEX IF EXISTS "support_knowledge_entry_workspaceId_active_verified_priority_id";
DROP INDEX IF EXISTS "support_knowledge_entry_workspaceId_active_verified_priority_idx";
DROP INDEX IF EXISTS "support_knowledge_entry_bucketId_priority_idx";

CREATE INDEX "support_knowledge_entry_workspaceId_status_priority_idx"
  ON "support_knowledge_entry"("workspaceId", "status", "priority");

CREATE INDEX "support_knowledge_entry_workspaceId_intent_status_idx"
  ON "support_knowledge_entry"("workspaceId", "intent", "status");

CREATE INDEX "support_knowledge_entry_workspaceId_category_status_idx"
  ON "support_knowledge_entry"("workspaceId", "category", "status");

CREATE INDEX "support_knowledge_entry_supportKnowledgeBucketId_priority_idx"
  ON "support_knowledge_entry"("supportKnowledgeBucketId", "priority");

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

-- AddForeignKey
ALTER TABLE "support_knowledge_question_example"
  ADD CONSTRAINT "support_knowledge_question_example_entryId_fkey"
  FOREIGN KEY ("entryId")
  REFERENCES "support_knowledge_entry"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_knowledge_interaction"
  ADD CONSTRAINT "support_knowledge_interaction_workspaceId_fkey"
  FOREIGN KEY ("workspaceId")
  REFERENCES "workspace"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_knowledge_interaction"
  ADD CONSTRAINT "support_knowledge_interaction_entryId_fkey"
  FOREIGN KEY ("entryId")
  REFERENCES "support_knowledge_entry"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;
