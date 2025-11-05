/*
  Warnings:

  - You are about to drop the column `guestToken` on the `Order` table. All the data in the column will be lost.
  - Added the required column `line1` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `province` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recipientName` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Order_guestToken_key";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "guestToken",
ADD COLUMN     "city" TEXT NOT NULL DEFAULT 'TPHCM',
ADD COLUMN     "country" TEXT NOT NULL DEFAULT 'Việt Nam',
ADD COLUMN     "email" TEXT,
ADD COLUMN     "line1" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "province" TEXT NOT NULL,
ADD COLUMN     "recipientName" TEXT NOT NULL;

-- RenameIndex
ALTER INDEX "idx_order_createdAt" RENAME TO "Order_createdAt_idx";

-- RenameIndex
ALTER INDEX "idx_order_number" RENAME TO "Order_orderNumber_idx";

-- RenameIndex
ALTER INDEX "idx_order_status" RENAME TO "Order_status_idx";

-- RenameIndex
ALTER INDEX "idx_order_user" RENAME TO "Order_userId_idx";
