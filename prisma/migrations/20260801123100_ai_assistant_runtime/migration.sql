-- CreateEnum
CREATE TYPE "AiAssistantAudience" AS ENUM (
  'CUSTOMER',
  'ADMIN',
  'VENDOR'
);

-- CreateEnum
CREATE TYPE "AiAssistantSessionStatus" AS ENUM (
  'ACTIVE',
  'ARCHIVED'
);

-- CreateEnum
CREATE TYPE "AiAssistantMessageRole" AS ENUM (
  'USER',
  'ASSISTANT',
  'SYSTEM'
);

-- CreateEnum
CREATE TYPE "AiAssistantOutputType" AS ENUM (
  'RECOMMENDATION',
  'COMPARISON',
  'PAIRING',
  'SHOPPING_PLAN',
  'CATALOG_DRAFT',
  'CAMPAIGN_DRAFT',
  'OPERATIONS_BRIEF',
  'GOVERNANCE_EXPLANATION'
);

-- CreateEnum
CREATE TYPE "AiAssistantFeedback" AS ENUM (
  'HELPFUL',
  'NOT_HELPFUL',
  'APPLIED',
  'DISMISSED'
);

-- CreateTable
CREATE TABLE "ai_assistant_session" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "vendorProfileId" TEXT,
  "audience" "AiAssistantAudience" NOT NULL,
  "title" TEXT NOT NULL,
  "status" "AiAssistantSessionStatus" NOT NULL DEFAULT 'ACTIVE',
  "contextSnapshot" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ai_assistant_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_assistant_message" (
  "id" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "role" "AiAssistantMessageRole" NOT NULL,
  "content" TEXT NOT NULL,
  "outputType" "AiAssistantOutputType",
  "payload" JSONB,
  "provider" TEXT NOT NULL DEFAULT 'RCENTZ_LOCAL_V1',
  "confidence" DOUBLE PRECISION,
  "feedback" "AiAssistantFeedback",
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ai_assistant_message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ai_assistant_session_workspaceId_userId_audience_updatedAt_idx"
ON "ai_assistant_session"(
  "workspaceId",
  "userId",
  "audience",
  "updatedAt"
);

-- CreateIndex
CREATE INDEX "ai_assistant_session_vendorProfileId_updatedAt_idx"
ON "ai_assistant_session"(
  "vendorProfileId",
  "updatedAt"
);

-- CreateIndex
CREATE INDEX "ai_assistant_message_sessionId_createdAt_idx"
ON "ai_assistant_message"(
  "sessionId",
  "createdAt"
);

-- AddForeignKey
ALTER TABLE "ai_assistant_session"
ADD CONSTRAINT "ai_assistant_session_workspaceId_fkey"
FOREIGN KEY ("workspaceId")
REFERENCES "workspace"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_assistant_session"
ADD CONSTRAINT "ai_assistant_session_userId_fkey"
FOREIGN KEY ("userId")
REFERENCES "user"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_assistant_session"
ADD CONSTRAINT "ai_assistant_session_vendorProfileId_fkey"
FOREIGN KEY ("vendorProfileId")
REFERENCES "vendor_profile"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_assistant_message"
ADD CONSTRAINT "ai_assistant_message_sessionId_fkey"
FOREIGN KEY ("sessionId")
REFERENCES "ai_assistant_session"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;
