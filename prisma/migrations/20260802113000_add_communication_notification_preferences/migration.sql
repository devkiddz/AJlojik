ALTER TYPE "NotificationTopic"
  ADD VALUE IF NOT EXISTS 'COMMUNICATION';

ALTER TABLE "notification_preference"
  ADD COLUMN "communicationUpdates" BOOLEAN NOT NULL DEFAULT true;
