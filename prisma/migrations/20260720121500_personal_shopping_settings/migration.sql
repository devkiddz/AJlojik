ALTER TABLE "experience_profile"
ADD COLUMN "shoppingLists" JSONB,
ADD COLUMN "experienceDensity" TEXT NOT NULL DEFAULT 'immersive',
ADD COLUMN "autoplayPreviews" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "discoveryEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "recommendationMode" TEXT NOT NULL DEFAULT 'balanced',
ADD COLUMN "shoppingNotifications" BOOLEAN NOT NULL DEFAULT true;
