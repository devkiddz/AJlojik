CREATE TYPE "ShoppingListPreparationStatus" AS ENUM (
  'SUBMITTED',
  'IN_PREPARATION',
  'AWAITING_CUSTOMER_APPROVAL',
  'READY_FOR_CHECKOUT',
  'ORDER_CREATED',
  'COMPLETED',
  'CANCELLED'
);

CREATE TYPE "ShoppingListPreparationCustomerDecision" AS ENUM (
  'PENDING',
  'APPROVED',
  'CHANGES_REQUESTED',
  'CANCELLED'
);

CREATE TYPE "ShoppingListPreparationItemStatus" AS ENUM (
  'PENDING',
  'AVAILABLE',
  'PARTIALLY_AVAILABLE',
  'SUBSTITUTED',
  'PRICE_CHANGED',
  'UNAVAILABLE',
  'PREPARED',
  'REMOVED'
);

CREATE TYPE "ShoppingListPreparationItemDecision" AS ENUM (
  'PENDING',
  'NOT_REQUIRED',
  'APPROVED',
  'REJECTED'
);

CREATE TABLE "shopping_list_preparation_request" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "shoppingListId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "assignedStaffId" TEXT,
  "orderId" TEXT,
  "status" "ShoppingListPreparationStatus" NOT NULL DEFAULT 'SUBMITTED',
  "customerDecision" "ShoppingListPreparationCustomerDecision" NOT NULL DEFAULT 'PENDING',
  "priority" INTEGER NOT NULL DEFAULT 0,
  "customerNote" TEXT,
  "staffNote" TEXT,
  "customerDecisionNote" TEXT,
  "originalEstimatedTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "quotedSubtotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "approvedTotal" DECIMAL(12,2),
  "quoteVersion" INTEGER NOT NULL DEFAULT 1,
  "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "startedAt" TIMESTAMP(3),
  "approvalRequestedAt" TIMESTAMP(3),
  "customerRespondedAt" TIMESTAMP(3),
  "readyAt" TIMESTAMP(3),
  "convertedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "cancelledAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "shopping_list_preparation_request_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "shopping_list_preparation_item" (
  "id" TEXT NOT NULL,
  "requestId" TEXT NOT NULL,
  "sourceShoppingListItemId" TEXT,
  "productId" TEXT NOT NULL,
  "originalVariantId" TEXT,
  "resolvedVariantId" TEXT,
  "vendorProfileId" TEXT,
  "resolvedById" TEXT,
  "productName" TEXT NOT NULL,
  "originalVariantLabel" TEXT,
  "resolvedVariantLabel" TEXT,
  "image" TEXT,
  "requestedQuantity" INTEGER NOT NULL DEFAULT 1,
  "preparedQuantity" INTEGER NOT NULL DEFAULT 1,
  "originalUnitPrice" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "quotedUnitPrice" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "status" "ShoppingListPreparationItemStatus" NOT NULL DEFAULT 'PENDING',
  "customerDecision" "ShoppingListPreparationItemDecision" NOT NULL DEFAULT 'PENDING',
  "substitutionReason" TEXT,
  "staffNote" TEXT,
  "customerNote" TEXT,
  "position" INTEGER NOT NULL DEFAULT 0,
  "resolvedAt" TIMESTAMP(3),
  "customerRespondedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "shopping_list_preparation_item_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "shopping_list_preparation_event" (
  "id" TEXT NOT NULL,
  "requestId" TEXT NOT NULL,
  "actorId" TEXT,
  "type" TEXT NOT NULL,
  "fromStatus" "ShoppingListPreparationStatus",
  "toStatus" "ShoppingListPreparationStatus",
  "note" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "shopping_list_preparation_event_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "shopping_list_preparation_request_orderId_key"
  ON "shopping_list_preparation_request"("orderId");

CREATE INDEX "shopping_list_preparation_request_workspaceId_status_submittedAt_idx"
  ON "shopping_list_preparation_request"("workspaceId", "status", "submittedAt");

CREATE INDEX "shopping_list_preparation_request_userId_updatedAt_idx"
  ON "shopping_list_preparation_request"("userId", "updatedAt");

CREATE INDEX "shopping_list_preparation_request_shoppingListId_status_idx"
  ON "shopping_list_preparation_request"("shoppingListId", "status");

CREATE INDEX "shopping_list_preparation_request_assignedStaffId_status_idx"
  ON "shopping_list_preparation_request"("assignedStaffId", "status");

CREATE INDEX "shopping_list_preparation_item_requestId_position_idx"
  ON "shopping_list_preparation_item"("requestId", "position");

CREATE INDEX "shopping_list_preparation_item_productId_idx"
  ON "shopping_list_preparation_item"("productId");

CREATE INDEX "shopping_list_preparation_item_resolvedVariantId_idx"
  ON "shopping_list_preparation_item"("resolvedVariantId");

CREATE INDEX "shopping_list_preparation_item_vendorProfileId_idx"
  ON "shopping_list_preparation_item"("vendorProfileId");

CREATE INDEX "shopping_list_preparation_event_requestId_createdAt_idx"
  ON "shopping_list_preparation_event"("requestId", "createdAt");

ALTER TABLE "shopping_list_preparation_request"
  ADD CONSTRAINT "shopping_list_preparation_request_workspaceId_fkey"
  FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "shopping_list_preparation_request"
  ADD CONSTRAINT "shopping_list_preparation_request_shoppingListId_fkey"
  FOREIGN KEY ("shoppingListId") REFERENCES "shopping_list"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "shopping_list_preparation_request"
  ADD CONSTRAINT "shopping_list_preparation_request_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "user"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "shopping_list_preparation_request"
  ADD CONSTRAINT "shopping_list_preparation_request_assignedStaffId_fkey"
  FOREIGN KEY ("assignedStaffId") REFERENCES "user"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "shopping_list_preparation_request"
  ADD CONSTRAINT "shopping_list_preparation_request_orderId_fkey"
  FOREIGN KEY ("orderId") REFERENCES "order"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "shopping_list_preparation_item"
  ADD CONSTRAINT "shopping_list_preparation_item_requestId_fkey"
  FOREIGN KEY ("requestId") REFERENCES "shopping_list_preparation_request"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "shopping_list_preparation_item"
  ADD CONSTRAINT "shopping_list_preparation_item_sourceShoppingListItemId_fkey"
  FOREIGN KEY ("sourceShoppingListItemId") REFERENCES "shopping_list_item"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "shopping_list_preparation_item"
  ADD CONSTRAINT "shopping_list_preparation_item_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "product"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "shopping_list_preparation_item"
  ADD CONSTRAINT "shopping_list_preparation_item_originalVariantId_fkey"
  FOREIGN KEY ("originalVariantId") REFERENCES "product_variant"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "shopping_list_preparation_item"
  ADD CONSTRAINT "shopping_list_preparation_item_resolvedVariantId_fkey"
  FOREIGN KEY ("resolvedVariantId") REFERENCES "product_variant"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "shopping_list_preparation_item"
  ADD CONSTRAINT "shopping_list_preparation_item_vendorProfileId_fkey"
  FOREIGN KEY ("vendorProfileId") REFERENCES "vendor_profile"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "shopping_list_preparation_item"
  ADD CONSTRAINT "shopping_list_preparation_item_resolvedById_fkey"
  FOREIGN KEY ("resolvedById") REFERENCES "user"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "shopping_list_preparation_event"
  ADD CONSTRAINT "shopping_list_preparation_event_requestId_fkey"
  FOREIGN KEY ("requestId") REFERENCES "shopping_list_preparation_request"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "shopping_list_preparation_event"
  ADD CONSTRAINT "shopping_list_preparation_event_actorId_fkey"
  FOREIGN KEY ("actorId") REFERENCES "user"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
