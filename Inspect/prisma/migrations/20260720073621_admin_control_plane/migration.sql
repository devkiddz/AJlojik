-- CreateEnum
CREATE TYPE "StaffLevel" AS ENUM ('LEVEL_1', 'LEVEL_2', 'LEVEL_3');

-- CreateEnum
CREATE TYPE "AdminApprovalAction" AS ENUM ('DELETE', 'DELIVERY_STATUS_UPDATE', 'DELIVERY_EXCEPTION', 'PUBLISH_LIVE', 'OTHER');

-- CreateEnum
CREATE TYPE "AdminTargetType" AS ENUM ('PRODUCT', 'PROMOTION', 'EXPERIENCE', 'FEATURED_LAYOUT', 'ORDER', 'DELIVERY', 'TRACKING_EVENT', 'USER', 'STAFF', 'OTHER');

-- CreateEnum
CREATE TYPE "AdminApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'EXECUTED');

-- CreateEnum
CREATE TYPE "AdminTodoSource" AS ENUM ('SYSTEM', 'AI', 'STAFF', 'APPROVAL', 'DELIVERY', 'INVENTORY');

-- CreateEnum
CREATE TYPE "AdminTodoPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "AdminTodoStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "DeliveryMethod" AS ENUM ('AJ_DELIVERY', 'PERSONAL_COURIER', 'STORE_PICKUP');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING', 'ASSIGNED', 'BARCODE_SCANNED', 'PICKED_UP', 'IN_TRANSIT', 'ARRIVED', 'DELIVERED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DeliveryEventSource" AS ENUM ('SYSTEM', 'STAFF', 'DISPATCHER_SCAN', 'DISPATCHER_GPS', 'CUSTOMER', 'APPROVAL');

-- CreateTable
CREATE TABLE "staff_profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "level" "StaffLevel" NOT NULL,
    "employeeCode" TEXT NOT NULL,
    "title" TEXT,
    "department" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "invitedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_approval_request" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "reviewedById" TEXT,
    "action" "AdminApprovalAction" NOT NULL,
    "targetType" "AdminTargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "payload" JSONB,
    "status" "AdminApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "reviewNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "executedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_approval_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_audit_event" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "targetType" "AdminTargetType" NOT NULL,
    "targetId" TEXT,
    "summary" TEXT NOT NULL,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_audit_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_todo" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "assigneeId" TEXT,
    "createdById" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "source" "AdminTodoSource" NOT NULL DEFAULT 'SYSTEM',
    "priority" "AdminTodoPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "AdminTodoStatus" NOT NULL DEFAULT 'OPEN',
    "targetType" "AdminTargetType",
    "targetId" TEXT,
    "dueAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_todo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "method" "DeliveryMethod" NOT NULL,
    "status" "DeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "trackingCode" TEXT NOT NULL,
    "barcodeTokenHash" TEXT,
    "barcodeExpiresAt" TIMESTAMP(3),
    "dispatcherId" TEXT,
    "dispatcherName" TEXT,
    "dispatcherPhone" TEXT,
    "estimatedArrival" TIMESTAMP(3),
    "pickedUpAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "trackingEnabled" BOOLEAN NOT NULL DEFAULT false,
    "lastLatitude" DOUBLE PRECISION,
    "lastLongitude" DOUBLE PRECISION,
    "lastLocationAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_tracking_event" (
    "id" TEXT NOT NULL,
    "deliveryId" TEXT NOT NULL,
    "actorId" TEXT,
    "status" "DeliveryStatus" NOT NULL,
    "source" "DeliveryEventSource" NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "accuracyMeters" DOUBLE PRECISION,
    "note" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "delivery_tracking_event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "staff_profile_userId_key" ON "staff_profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "staff_profile_employeeCode_key" ON "staff_profile"("employeeCode");

-- CreateIndex
CREATE INDEX "staff_profile_workspaceId_level_active_idx" ON "staff_profile"("workspaceId", "level", "active");

-- CreateIndex
CREATE INDEX "admin_approval_request_workspaceId_status_createdAt_idx" ON "admin_approval_request"("workspaceId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "admin_approval_request_requestedById_createdAt_idx" ON "admin_approval_request"("requestedById", "createdAt");

-- CreateIndex
CREATE INDEX "admin_approval_request_targetType_targetId_idx" ON "admin_approval_request"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "admin_audit_event_workspaceId_createdAt_idx" ON "admin_audit_event"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "admin_audit_event_actorId_createdAt_idx" ON "admin_audit_event"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "admin_audit_event_targetType_targetId_idx" ON "admin_audit_event"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "admin_todo_workspaceId_status_priority_idx" ON "admin_todo"("workspaceId", "status", "priority");

-- CreateIndex
CREATE INDEX "admin_todo_assigneeId_status_idx" ON "admin_todo"("assigneeId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "delivery_orderId_key" ON "delivery"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "delivery_trackingCode_key" ON "delivery"("trackingCode");

-- CreateIndex
CREATE INDEX "delivery_workspaceId_status_createdAt_idx" ON "delivery"("workspaceId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "delivery_dispatcherId_status_idx" ON "delivery"("dispatcherId", "status");

-- CreateIndex
CREATE INDEX "delivery_tracking_event_deliveryId_createdAt_idx" ON "delivery_tracking_event"("deliveryId", "createdAt");

-- CreateIndex
CREATE INDEX "delivery_tracking_event_actorId_createdAt_idx" ON "delivery_tracking_event"("actorId", "createdAt");

-- AddForeignKey
ALTER TABLE "staff_profile" ADD CONSTRAINT "staff_profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_profile" ADD CONSTRAINT "staff_profile_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_profile" ADD CONSTRAINT "staff_profile_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_approval_request" ADD CONSTRAINT "admin_approval_request_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_approval_request" ADD CONSTRAINT "admin_approval_request_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_approval_request" ADD CONSTRAINT "admin_approval_request_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_audit_event" ADD CONSTRAINT "admin_audit_event_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_audit_event" ADD CONSTRAINT "admin_audit_event_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_todo" ADD CONSTRAINT "admin_todo_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_todo" ADD CONSTRAINT "admin_todo_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_todo" ADD CONSTRAINT "admin_todo_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery" ADD CONSTRAINT "delivery_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery" ADD CONSTRAINT "delivery_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery" ADD CONSTRAINT "delivery_dispatcherId_fkey" FOREIGN KEY ("dispatcherId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_tracking_event" ADD CONSTRAINT "delivery_tracking_event_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "delivery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_tracking_event" ADD CONSTRAINT "delivery_tracking_event_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
