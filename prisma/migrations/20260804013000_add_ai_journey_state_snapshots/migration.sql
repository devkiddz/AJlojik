-- AJ MS12.3 — State-Aware Planning and Controlled Journey Transitions

ALTER TABLE "ai_assistant_session"
ADD COLUMN "journeyLastTransition" JSONB;

ALTER TABLE "ai_assistant_message"
ADD COLUMN "journeyStateSnapshot" JSONB,
ADD COLUMN "journeyStageSnapshot" TEXT,
ADD COLUMN "journeyStateVersionSnapshot" INTEGER,
ADD COLUMN "journeyTransition" JSONB;

UPDATE "ai_assistant_message" AS message
SET
  "journeyStateSnapshot" = session."journeyState",
  "journeyStageSnapshot" = session."journeyStage",
  "journeyStateVersionSnapshot" = session."journeyStateVersion"
FROM "ai_assistant_session" AS session
WHERE
  session."activePlanMessageId" = message."id"
  AND session."journeyState" IS NOT NULL;

CREATE INDEX "ai_assistant_message_sessionId_journeyStateVersionSnapshot_idx"
ON "ai_assistant_message"(
  "sessionId",
  "journeyStateVersionSnapshot"
);
