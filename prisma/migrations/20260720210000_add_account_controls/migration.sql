ALTER TABLE "user"
ADD COLUMN "accountState" TEXT NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN "lockedUntil" TIMESTAMP(3),
ADD COLUMN "restrictionReason" TEXT,
ADD COLUMN "isGhostDeveloper" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "user_accountState_idx" ON "user"("accountState");
