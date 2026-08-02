-- CreateEnum
CREATE TYPE "SupportLiveEventType" AS ENUM (
  'MESSAGE_CREATED',
  'CASE_UPDATED',
  'CONVERSATION_READ'
);

-- CreateTable
CREATE TABLE "support_live_event" (
  "id" SERIAL NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "caseId" TEXT NOT NULL,
  "conversationId" TEXT NOT NULL,
  "type" "SupportLiveEventType" NOT NULL,
  "actorId" TEXT,
  "payload" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "support_live_event_pkey"
    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "support_live_event_caseId_id_idx"
  ON "support_live_event"("caseId", "id");

-- CreateIndex
CREATE INDEX "support_live_event_workspaceId_id_idx"
  ON "support_live_event"("workspaceId", "id");

-- CreateIndex
CREATE INDEX "support_live_event_conversationId_id_idx"
  ON "support_live_event"("conversationId", "id");

-- AddForeignKey
ALTER TABLE "support_live_event"
  ADD CONSTRAINT "support_live_event_caseId_fkey"
  FOREIGN KEY ("caseId")
  REFERENCES "support_case"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;
