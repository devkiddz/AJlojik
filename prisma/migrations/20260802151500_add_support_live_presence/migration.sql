-- ExtendEnum
ALTER TYPE "SupportLiveEventType"
  ADD VALUE IF NOT EXISTS 'PRESENCE_UPDATED';

ALTER TYPE "SupportLiveEventType"
  ADD VALUE IF NOT EXISTS 'TYPING_UPDATED';

ALTER TYPE "SupportLiveEventType"
  ADD VALUE IF NOT EXISTS 'UNREAD_UPDATED';

-- CreateEnum
CREATE TYPE "SupportLiveAudience" AS ENUM (
  'CUSTOMER',
  'AGENT'
);

-- CreateTable
CREATE TABLE "support_live_presence" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "caseId" TEXT NOT NULL,
  "conversationId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "audience" "SupportLiveAudience" NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "typingUntil" TIMESTAMP(3),
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "support_live_presence_pkey"
    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "support_live_presence_caseId_userId_audience_key"
  ON "support_live_presence"(
    "caseId",
    "userId",
    "audience"
  );

-- CreateIndex
CREATE INDEX "support_live_presence_caseId_expiresAt_idx"
  ON "support_live_presence"(
    "caseId",
    "expiresAt"
  );

-- CreateIndex
CREATE INDEX "support_live_presence_workspaceId_audience_expiresAt_idx"
  ON "support_live_presence"(
    "workspaceId",
    "audience",
    "expiresAt"
  );

-- CreateIndex
CREATE INDEX "support_live_presence_conversationId_expiresAt_idx"
  ON "support_live_presence"(
    "conversationId",
    "expiresAt"
  );

-- AddForeignKey
ALTER TABLE "support_live_presence"
  ADD CONSTRAINT "support_live_presence_caseId_fkey"
  FOREIGN KEY ("caseId")
  REFERENCES "support_case"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_live_presence"
  ADD CONSTRAINT "support_live_presence_userId_fkey"
  FOREIGN KEY ("userId")
  REFERENCES "user"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;
