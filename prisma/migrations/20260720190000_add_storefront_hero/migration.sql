CREATE TABLE "storefront_hero" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "mediaType" TEXT NOT NULL DEFAULT 'VIDEO',
    "mediaUrl" TEXT,
    "posterUrl" TEXT,
    "eyebrow" TEXT NOT NULL DEFAULT 'Your personal shopping experience',
    "title" TEXT NOT NULL DEFAULT 'Every beautiful moment starts here.',
    "summary" TEXT,
    "primaryLabel" TEXT NOT NULL DEFAULT 'Create your experience',
    "primaryHref" TEXT NOT NULL DEFAULT '/sign-up',
    "secondaryLabel" TEXT NOT NULL DEFAULT 'Sign in',
    "secondaryHref" TEXT NOT NULL DEFAULT '/sign-in',
    "autoplay" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "storefront_hero_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "storefront_hero_workspaceId_key" ON "storefront_hero"("workspaceId");
ALTER TABLE "storefront_hero" ADD CONSTRAINT "storefront_hero_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
