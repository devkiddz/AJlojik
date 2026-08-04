-- AJ Journey State Engine — Stage 1
ALTER TABLE "ai_assistant_session"
ADD COLUMN "journeyState" JSONB,
ADD COLUMN "journeyStateVersion" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "journeyStage" TEXT NOT NULL DEFAULT 'UNDERSTANDING',
ADD COLUMN "journeyStateUpdatedAt" TIMESTAMP(3);
