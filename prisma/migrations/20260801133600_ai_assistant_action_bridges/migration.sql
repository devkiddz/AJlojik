-- CreateEnum
CREATE TYPE "AiAssistantActionType" AS ENUM (
  'SHOPPING_LIST_CREATE',
  'ADMIN_TODO_CREATE',
  'PRODUCT_REVISION_SUBMIT',
  'CAMPAIGN_DRAFT_CREATE'
);

-- CreateEnum
CREATE TYPE "AiAssistantApplicationStatus" AS ENUM (
  'PENDING',
  'APPLIED',
  'FAILED'
);

-- CreateTable
CREATE TABLE "ai_assistant_application" (
  "id" TEXT NOT NULL,
  "messageId" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "vendorProfileId" TEXT,
  "actionType" "AiAssistantActionType" NOT NULL,
  "status" "AiAssistantApplicationStatus" NOT NULL DEFAULT 'PENDING',
  "idempotencyKey" TEXT NOT NULL,
  "requestPayload" JSONB NOT NULL,
  "resultPayload" JSONB,
  "targetType" "AdminTargetType",
  "targetId" TEXT,
  "error" TEXT,
  "appliedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ai_assistant_application_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ai_assistant_application_idempotencyKey_key"
ON "ai_assistant_application"("idempotencyKey");

-- CreateIndex
CREATE INDEX "ai_assistant_application_messageId_createdAt_idx"
ON "ai_assistant_application"("messageId", "createdAt");

-- CreateIndex
CREATE INDEX "ai_assistant_application_workspaceId_userId_createdAt_idx"
ON "ai_assistant_application"("workspaceId", "userId", "createdAt");

-- CreateIndex
CREATE INDEX "ai_assistant_application_vendorProfileId_createdAt_idx"
ON "ai_assistant_application"("vendorProfileId", "createdAt");

-- CreateIndex
CREATE INDEX "ai_assistant_application_status_createdAt_idx"
ON "ai_assistant_application"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "ai_assistant_application"
ADD CONSTRAINT "ai_assistant_application_messageId_fkey"
FOREIGN KEY ("messageId")
REFERENCES "ai_assistant_message"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_assistant_application"
ADD CONSTRAINT "ai_assistant_application_workspaceId_fkey"
FOREIGN KEY ("workspaceId")
REFERENCES "workspace"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_assistant_application"
ADD CONSTRAINT "ai_assistant_application_userId_fkey"
FOREIGN KEY ("userId")
REFERENCES "user"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_assistant_application"
ADD CONSTRAINT "ai_assistant_application_vendorProfileId_fkey"
FOREIGN KEY ("vendorProfileId")
REFERENCES "vendor_profile"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
