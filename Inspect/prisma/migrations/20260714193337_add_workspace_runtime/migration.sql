-- CreateEnum
CREATE TYPE "WorkspaceMode" AS ENUM ('LIVE', 'DEMO', 'PRACTICE', 'SANDBOX');

-- CreateEnum
CREATE TYPE "WorkspaceRole" AS ENUM ('MEMBER', 'PREMIUM_MEMBER', 'SUPPORT', 'MODERATOR', 'MANAGER', 'ADMIN', 'OWNER', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "DataSource" AS ENUM ('REAL', 'DEMO', 'PRACTICE', 'SYNTHETIC', 'IMPORTED');

-- CreateEnum
CREATE TYPE "DemoScenarioType" AS ENUM ('EMPTY', 'RETAIL', 'SUPERMARKET', 'FASHION', 'HOSPITALITY', 'EVENTS', 'CUSTOM');

-- CreateEnum
CREATE TYPE "DemoProvisionStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'RESETTING');

-- CreateEnum
CREATE TYPE "ExperienceEventType" AS ENUM ('PAGE_VIEW', 'PRODUCT_VIEW', 'CATEGORY_VIEW', 'SEARCH', 'COLLECTION_CLICK', 'CAMPAIGN_VIEW', 'CAMPAIGN_CLICK', 'ADD_TO_CART', 'REMOVE_FROM_CART', 'UPDATE_CART_QUANTITY', 'ADD_TO_WISHLIST', 'REMOVE_FROM_WISHLIST', 'COUPON_APPLIED', 'COUPON_REJECTED', 'CHECKOUT_STARTED', 'PAYMENT_STARTED', 'PAYMENT_COMPLETED', 'PAYMENT_FAILED', 'ORDER_COMPLETED', 'DELIVERY_VIEWED', 'DELIVERY_STARTED', 'DELIVERY_COMPLETED', 'REVIEW_CREATED', 'REVIEW_APPROVED', 'REVIEW_REJECTED', 'PRODUCT_CREATED', 'PRODUCT_UPDATED', 'STOCK_ADJUSTED', 'DEMO_STARTED', 'DEMO_RESET', 'WORKSPACE_SWITCHED');

-- CreateTable
CREATE TABLE "workspace" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mode" "WorkspaceMode" NOT NULL DEFAULT 'LIVE',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "resettable" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_membership" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "WorkspaceRole" NOT NULL DEFAULT 'MEMBER',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspace_membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demo_wallet" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "balance" DECIMAL(14,2) NOT NULL DEFAULT 500000,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "demo_wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experience_event" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "type" "ExperienceEventType" NOT NULL,
    "source" TEXT,
    "dataSource" "DataSource" NOT NULL DEFAULT 'REAL',
    "productId" TEXT,
    "categorySlug" TEXT,
    "collectionId" TEXT,
    "campaignId" TEXT,
    "searchTerm" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "experience_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demo_scenario" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "DemoScenarioType" NOT NULL,
    "description" TEXT,
    "configuration" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "demo_scenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demo_provision" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "status" "DemoProvisionStatus" NOT NULL DEFAULT 'PENDING',
    "seededRecords" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "demo_provision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "workspace_slug_key" ON "workspace"("slug");

-- CreateIndex
CREATE INDEX "workspace_mode_active_idx" ON "workspace"("mode", "active");

-- CreateIndex
CREATE INDEX "workspace_membership_userId_idx" ON "workspace_membership"("userId");

-- CreateIndex
CREATE INDEX "workspace_membership_workspaceId_role_idx" ON "workspace_membership"("workspaceId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_membership_workspaceId_userId_key" ON "workspace_membership"("workspaceId", "userId");

-- CreateIndex
CREATE INDEX "demo_wallet_userId_idx" ON "demo_wallet"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "demo_wallet_workspaceId_userId_key" ON "demo_wallet"("workspaceId", "userId");

-- CreateIndex
CREATE INDEX "experience_event_workspaceId_createdAt_idx" ON "experience_event"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "experience_event_workspaceId_type_createdAt_idx" ON "experience_event"("workspaceId", "type", "createdAt");

-- CreateIndex
CREATE INDEX "experience_event_userId_createdAt_idx" ON "experience_event"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "experience_event_productId_idx" ON "experience_event"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "demo_scenario_slug_key" ON "demo_scenario"("slug");

-- CreateIndex
CREATE INDEX "demo_provision_workspaceId_idx" ON "demo_provision"("workspaceId");

-- CreateIndex
CREATE INDEX "demo_provision_scenarioId_idx" ON "demo_provision"("scenarioId");

-- CreateIndex
CREATE INDEX "demo_provision_status_idx" ON "demo_provision"("status");

-- AddForeignKey
ALTER TABLE "workspace_membership" ADD CONSTRAINT "workspace_membership_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_membership" ADD CONSTRAINT "workspace_membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demo_wallet" ADD CONSTRAINT "demo_wallet_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demo_wallet" ADD CONSTRAINT "demo_wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experience_event" ADD CONSTRAINT "experience_event_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experience_event" ADD CONSTRAINT "experience_event_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demo_provision" ADD CONSTRAINT "demo_provision_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demo_provision" ADD CONSTRAINT "demo_provision_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "demo_scenario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
