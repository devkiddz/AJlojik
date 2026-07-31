/*
  Warnings:

  - A unique constraint covering the columns `[workspaceId,userId]` on the table `cart` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[workspaceId,userId]` on the table `wishlist` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `workspaceId` to the `cart` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspaceId` to the `order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspaceId` to the `wishlist` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "cart_userId_key";

-- DropIndex
DROP INDEX "wishlist_userId_key";

-- AlterTable
ALTER TABLE "cart" ADD COLUMN     "workspaceId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "order" ADD COLUMN     "dataSource" "DataSource" NOT NULL DEFAULT 'REAL',
ADD COLUMN     "mode" "WorkspaceMode" NOT NULL DEFAULT 'LIVE',
ADD COLUMN     "workspaceId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "wishlist" ADD COLUMN     "workspaceId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "cart_workspaceId_idx" ON "cart"("workspaceId");

-- CreateIndex
CREATE INDEX "cart_userId_idx" ON "cart"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "cart_workspaceId_userId_key" ON "cart"("workspaceId", "userId");

-- CreateIndex
CREATE INDEX "order_workspaceId_idx" ON "order"("workspaceId");

-- CreateIndex
CREATE INDEX "order_workspaceId_status_idx" ON "order"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "wishlist_workspaceId_idx" ON "wishlist"("workspaceId");

-- CreateIndex
CREATE INDEX "wishlist_userId_idx" ON "wishlist"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "wishlist_workspaceId_userId_key" ON "wishlist"("workspaceId", "userId");

-- AddForeignKey
ALTER TABLE "cart" ADD CONSTRAINT "cart_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
