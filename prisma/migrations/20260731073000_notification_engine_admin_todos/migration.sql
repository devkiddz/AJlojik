-- Extend the operational Todo source vocabulary before new workflows begin.
ALTER TYPE "AdminTodoSource" ADD VALUE IF NOT EXISTS 'ORDER';
ALTER TYPE "AdminTodoSource" ADD VALUE IF NOT EXISTS 'SHOPPING_LIST';
ALTER TYPE "AdminTodoSource" ADD VALUE IF NOT EXISTS 'SUPPORT';

-- Admin Todo runtime hardening.
ALTER TABLE "admin_todo"
ADD COLUMN "dedupeKey" TEXT,
ADD COLUMN "activeDedupeKey" TEXT,
ADD COLUMN "metadata" JSONB,
ADD COLUMN "snoozedUntil" TIMESTAMP(3),
ADD COLUMN "lastTriggeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "dismissedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "admin_todo_activeDedupeKey_key"
ON "admin_todo"("activeDedupeKey");

CREATE INDEX "admin_todo_workspaceId_status_snoozedUntil_priority_idx"
ON "admin_todo"("workspaceId", "status", "snoozedUntil", "priority");

CREATE INDEX "admin_todo_workspaceId_dedupeKey_idx"
ON "admin_todo"("workspaceId", "dedupeKey");

-- Customer notification domain.
CREATE TYPE "NotificationTopic" AS ENUM (
  'ORDER',
  'DELIVERY',
  'SHOPPING_LIST',
  'SUPPORT',
  'SYSTEM',
  'PROMOTION'
);

CREATE TYPE "NotificationPriority" AS ENUM (
  'LOW',
  'NORMAL',
  'HIGH',
  'URGENT'
);

CREATE TABLE "notification" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "topic" "NotificationTopic" NOT NULL,
  "priority" "NotificationPriority" NOT NULL DEFAULT 'NORMAL',
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "href" TEXT,
  "targetType" "AdminTargetType",
  "targetId" TEXT,
  "scopeKey" TEXT,
  "dedupeKey" TEXT NOT NULL,
  "metadata" JSONB,
  "readAt" TIMESTAMP(3),
  "archivedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "notification_preference" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "inAppEnabled" BOOLEAN NOT NULL DEFAULT true,
  "orderUpdates" BOOLEAN NOT NULL DEFAULT true,
  "deliveryUpdates" BOOLEAN NOT NULL DEFAULT true,
  "shoppingListUpdates" BOOLEAN NOT NULL DEFAULT true,
  "supportUpdates" BOOLEAN NOT NULL DEFAULT true,
  "systemUpdates" BOOLEAN NOT NULL DEFAULT true,
  "promotionUpdates" BOOLEAN NOT NULL DEFAULT false,
  "mutedUntil" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "notification_preference_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "notification_mute" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "scopeKey" TEXT NOT NULL,
  "topic" "NotificationTopic" NOT NULL,
  "targetType" "AdminTargetType",
  "targetId" TEXT,
  "mutedUntil" TIMESTAMP(3),
  "reason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "notification_mute_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "notification_workspaceId_userId_dedupeKey_key"
ON "notification"("workspaceId", "userId", "dedupeKey");

CREATE INDEX "notification_workspaceId_userId_archivedAt_createdAt_idx"
ON "notification"("workspaceId", "userId", "archivedAt", "createdAt");

CREATE INDEX "notification_workspaceId_userId_readAt_createdAt_idx"
ON "notification"("workspaceId", "userId", "readAt", "createdAt");

CREATE INDEX "notification_targetType_targetId_idx"
ON "notification"("targetType", "targetId");

CREATE UNIQUE INDEX "notification_preference_workspaceId_userId_key"
ON "notification_preference"("workspaceId", "userId");

CREATE INDEX "notification_preference_userId_updatedAt_idx"
ON "notification_preference"("userId", "updatedAt");

CREATE UNIQUE INDEX "notification_mute_workspaceId_userId_scopeKey_key"
ON "notification_mute"("workspaceId", "userId", "scopeKey");

CREATE INDEX "notification_mute_workspaceId_userId_topic_idx"
ON "notification_mute"("workspaceId", "userId", "topic");

CREATE INDEX "notification_mute_targetType_targetId_idx"
ON "notification_mute"("targetType", "targetId");

ALTER TABLE "notification"
ADD CONSTRAINT "notification_workspaceId_fkey"
FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "notification"
ADD CONSTRAINT "notification_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "user"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "notification_preference"
ADD CONSTRAINT "notification_preference_workspaceId_fkey"
FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "notification_preference"
ADD CONSTRAINT "notification_preference_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "user"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "notification_mute"
ADD CONSTRAINT "notification_mute_workspaceId_fkey"
FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "notification_mute"
ADD CONSTRAINT "notification_mute_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "user"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
