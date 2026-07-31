-- CreateTable
CREATE TABLE "experience_profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "persona" TEXT NOT NULL DEFAULT 'new-member',
    "preferredCategorySlugs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "preferredBrandSlugs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "recentlyViewedProductIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "searchedTerms" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "clickedCollectionIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "recommendationScore" INTEGER NOT NULL DEFAULT 0,
    "engagementScore" INTEGER NOT NULL DEFAULT 0,
    "commerceScore" INTEGER NOT NULL DEFAULT 0,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "personalizationEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "experience_profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "experience_profile_userId_key" ON "experience_profile"("userId");

-- CreateIndex
CREATE INDEX "experience_profile_userId_idx" ON "experience_profile"("userId");

-- AddForeignKey
ALTER TABLE "experience_profile" ADD CONSTRAINT "experience_profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
