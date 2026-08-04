-- AJ Living Intelligence Phase 2
-- Persist Journey goals, active plans and plan-version lineage.

ALTER TABLE "ai_assistant_session"
  ADD COLUMN "journeyGoal" TEXT,
  ADD COLUMN "activePlanMessageId" TEXT,
  ADD COLUMN "currentPlanVersion" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "lastRefinedAt" TIMESTAMP(3);

ALTER TABLE "ai_assistant_message"
  ADD COLUMN "journeyVersion" INTEGER,
  ADD COLUMN "previousPlanMessageId" TEXT,
  ADD COLUMN "isPlanSnapshot" BOOLEAN NOT NULL DEFAULT false;

WITH ranked_plans AS (
  SELECT
    "id",
    "sessionId",
    CAST(
      ROW_NUMBER() OVER (
        PARTITION BY "sessionId"
        ORDER BY "createdAt" ASC, "id" ASC
      ) AS INTEGER
    ) AS "journeyVersion",
    LAG("id") OVER (
      PARTITION BY "sessionId"
      ORDER BY "createdAt" ASC, "id" ASC
    ) AS "previousPlanMessageId"
  FROM "ai_assistant_message"
  WHERE "role" = 'ASSISTANT'
)
UPDATE "ai_assistant_message" AS message
SET
  "journeyVersion" = ranked."journeyVersion",
  "previousPlanMessageId" = ranked."previousPlanMessageId",
  "isPlanSnapshot" = TRUE
FROM ranked_plans AS ranked
WHERE message."id" = ranked."id";

UPDATE "ai_assistant_session"
SET "journeyGoal" = "title"
WHERE "journeyGoal" IS NULL;

WITH latest_plans AS (
  SELECT DISTINCT ON ("sessionId")
    "sessionId",
    "id",
    "journeyVersion",
    "createdAt"
  FROM "ai_assistant_message"
  WHERE
    "role" = 'ASSISTANT'
    AND "journeyVersion" IS NOT NULL
  ORDER BY
    "sessionId",
    "journeyVersion" DESC,
    "createdAt" DESC,
    "id" DESC
)
UPDATE "ai_assistant_session" AS session
SET
  "activePlanMessageId" = latest."id",
  "currentPlanVersion" = latest."journeyVersion",
  "lastRefinedAt" = latest."createdAt"
FROM latest_plans AS latest
WHERE session."id" = latest."sessionId";

CREATE INDEX "ai_assistant_session_activePlanMessageId_idx"
  ON "ai_assistant_session"("activePlanMessageId");

CREATE UNIQUE INDEX "ai_assistant_message_sessionId_journeyVersion_key"
  ON "ai_assistant_message"("sessionId", "journeyVersion");

CREATE INDEX "ai_assistant_message_previousPlanMessageId_idx"
  ON "ai_assistant_message"("previousPlanMessageId");

CREATE INDEX "ai_assistant_message_sessionId_isPlanSnapshot_createdAt_idx"
  ON "ai_assistant_message"(
    "sessionId",
    "isPlanSnapshot",
    "createdAt"
  );
