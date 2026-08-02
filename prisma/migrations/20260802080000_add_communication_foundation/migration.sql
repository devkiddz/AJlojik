CREATE TYPE "CommunicationConversationType" AS ENUM ('CUSTOMER_VENDOR', 'SUPPORT_CASE');
CREATE TYPE "CommunicationConversationStatus" AS ENUM ('OPEN', 'ARCHIVED', 'CLOSED', 'RESTRICTED');
CREATE TYPE "CommunicationParticipantRole" AS ENUM ('CUSTOMER', 'VENDOR_MEMBER', 'SUPPORT_AGENT', 'ADMIN', 'SYSTEM');
CREATE TYPE "CommunicationParticipantStatus" AS ENUM ('ACTIVE', 'LEFT', 'REMOVED');
CREATE TYPE "CommunicationMessageType" AS ENUM ('TEXT', 'SYSTEM', 'EVENT');
CREATE TYPE "CommunicationAttachmentStatus" AS ENUM ('PENDING', 'READY', 'QUARANTINED', 'REMOVED');

CREATE TABLE "communication_conversation" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "type" "CommunicationConversationType" NOT NULL,
  "status" "CommunicationConversationStatus" NOT NULL DEFAULT 'OPEN',
  "subject" TEXT,
  "vendorProfileId" TEXT,
  "createdById" TEXT NOT NULL,
  "dedupeKey" TEXT,
  "metadata" JSONB,
  "lastMessageAt" TIMESTAMP(3),
  "closedAt" TIMESTAMP(3),
  "restrictedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "communication_conversation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "communication_participant" (
  "id" TEXT NOT NULL,
  "conversationId" TEXT NOT NULL,
  "userId" TEXT,
  "vendorProfileId" TEXT,
  "role" "CommunicationParticipantRole" NOT NULL,
  "status" "CommunicationParticipantStatus" NOT NULL DEFAULT 'ACTIVE',
  "unreadCount" INTEGER NOT NULL DEFAULT 0,
  "lastReadAt" TIMESTAMP(3),
  "mutedUntil" TIMESTAMP(3),
  "archivedAt" TIMESTAMP(3),
  "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "leftAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "communication_participant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "communication_context" (
  "id" TEXT NOT NULL,
  "conversationId" TEXT NOT NULL,
  "orderId" TEXT,
  "productId" TEXT,
  "orderItemIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "source" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "communication_context_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "communication_message" (
  "id" TEXT NOT NULL,
  "conversationId" TEXT NOT NULL,
  "senderId" TEXT,
  "senderRole" "CommunicationParticipantRole" NOT NULL,
  "type" "CommunicationMessageType" NOT NULL DEFAULT 'TEXT',
  "body" TEXT NOT NULL,
  "replyToMessageId" TEXT,
  "metadata" JSONB,
  "editedAt" TIMESTAMP(3),
  "removedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "communication_message_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "communication_attachment" (
  "id" TEXT NOT NULL,
  "messageId" TEXT NOT NULL,
  "uploadedById" TEXT,
  "fileName" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "byteSize" INTEGER NOT NULL,
  "storageProvider" TEXT NOT NULL,
  "storageKey" TEXT NOT NULL,
  "checksum" TEXT,
  "status" "CommunicationAttachmentStatus" NOT NULL DEFAULT 'PENDING',
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "communication_attachment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "communication_status_history" (
  "id" TEXT NOT NULL,
  "conversationId" TEXT NOT NULL,
  "actorId" TEXT,
  "fromStatus" "CommunicationConversationStatus",
  "toStatus" "CommunicationConversationStatus" NOT NULL,
  "reason" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "communication_status_history_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "communication_conversation_workspaceId_dedupeKey_key" ON "communication_conversation"("workspaceId", "dedupeKey");
CREATE INDEX "communication_conversation_workspaceId_status_lastMessageAt_idx" ON "communication_conversation"("workspaceId", "status", "lastMessageAt");
CREATE INDEX "communication_conversation_workspaceId_type_updatedAt_idx" ON "communication_conversation"("workspaceId", "type", "updatedAt");
CREATE INDEX "communication_conversation_vendorProfileId_status_lastMessageAt_idx" ON "communication_conversation"("vendorProfileId", "status", "lastMessageAt");
CREATE INDEX "communication_conversation_createdById_createdAt_idx" ON "communication_conversation"("createdById", "createdAt");

CREATE UNIQUE INDEX "communication_participant_conversationId_userId_role_key" ON "communication_participant"("conversationId", "userId", "role");
CREATE UNIQUE INDEX "communication_participant_conversationId_vendorProfileId_role_key" ON "communication_participant"("conversationId", "vendorProfileId", "role");
CREATE INDEX "communication_participant_userId_status_updatedAt_idx" ON "communication_participant"("userId", "status", "updatedAt");
CREATE INDEX "communication_participant_vendorProfileId_status_updatedAt_idx" ON "communication_participant"("vendorProfileId", "status", "updatedAt");
CREATE INDEX "communication_participant_conversationId_status_idx" ON "communication_participant"("conversationId", "status");

CREATE UNIQUE INDEX "communication_context_conversationId_key" ON "communication_context"("conversationId");
CREATE INDEX "communication_context_orderId_idx" ON "communication_context"("orderId");
CREATE INDEX "communication_context_productId_idx" ON "communication_context"("productId");

CREATE INDEX "communication_message_conversationId_createdAt_idx" ON "communication_message"("conversationId", "createdAt");
CREATE INDEX "communication_message_senderId_createdAt_idx" ON "communication_message"("senderId", "createdAt");
CREATE INDEX "communication_message_replyToMessageId_idx" ON "communication_message"("replyToMessageId");

CREATE UNIQUE INDEX "communication_attachment_storageKey_key" ON "communication_attachment"("storageKey");
CREATE INDEX "communication_attachment_messageId_status_idx" ON "communication_attachment"("messageId", "status");
CREATE INDEX "communication_attachment_uploadedById_createdAt_idx" ON "communication_attachment"("uploadedById", "createdAt");

CREATE INDEX "communication_status_history_conversationId_createdAt_idx" ON "communication_status_history"("conversationId", "createdAt");
CREATE INDEX "communication_status_history_actorId_createdAt_idx" ON "communication_status_history"("actorId", "createdAt");

ALTER TABLE "communication_conversation" ADD CONSTRAINT "communication_conversation_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "communication_conversation" ADD CONSTRAINT "communication_conversation_vendorProfileId_fkey" FOREIGN KEY ("vendorProfileId") REFERENCES "vendor_profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "communication_conversation" ADD CONSTRAINT "communication_conversation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "communication_participant" ADD CONSTRAINT "communication_participant_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "communication_conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "communication_participant" ADD CONSTRAINT "communication_participant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "communication_participant" ADD CONSTRAINT "communication_participant_vendorProfileId_fkey" FOREIGN KEY ("vendorProfileId") REFERENCES "vendor_profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "communication_context" ADD CONSTRAINT "communication_context_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "communication_conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "communication_context" ADD CONSTRAINT "communication_context_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "communication_context" ADD CONSTRAINT "communication_context_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "communication_message" ADD CONSTRAINT "communication_message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "communication_conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "communication_message" ADD CONSTRAINT "communication_message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "communication_message" ADD CONSTRAINT "communication_message_replyToMessageId_fkey" FOREIGN KEY ("replyToMessageId") REFERENCES "communication_message"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "communication_attachment" ADD CONSTRAINT "communication_attachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "communication_message"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "communication_attachment" ADD CONSTRAINT "communication_attachment_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "communication_status_history" ADD CONSTRAINT "communication_status_history_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "communication_conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "communication_status_history" ADD CONSTRAINT "communication_status_history_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
