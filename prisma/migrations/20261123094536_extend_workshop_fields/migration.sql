-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "bodyJson" JSONB,
ADD COLUMN     "coverImageUrl" TEXT,
ADD COLUMN     "linkedProductId" INTEGER,
ADD COLUMN     "seoDescription" TEXT,
ADD COLUMN     "seoTitle" TEXT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "colorChoice" TEXT,
ADD COLUMN     "customDepthCm" INTEGER,
ADD COLUMN     "customHeightCm" INTEGER,
ADD COLUMN     "customWidthCm" INTEGER,
ADD COLUMN     "deliverDate" TIMESTAMP(3),
ADD COLUMN     "depositPaid" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "internalNote" TEXT,
ADD COLUMN     "invoiceUrl" TEXT,
ADD COLUMN     "isCustomSize" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "materialChoice" TEXT,
ADD COLUMN     "workshopStatus" TEXT NOT NULL DEFAULT 'new';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "allowCustomSize" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "colorOptions" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "defaultDepthCm" INTEGER,
ADD COLUMN     "defaultHeightCm" INTEGER,
ADD COLUMN     "defaultWidthCm" INTEGER,
ADD COLUMN     "materialOptions" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "priceNote" TEXT,
ADD COLUMN     "workshopCode" TEXT;

-- CreateTable
CREATE TABLE "Inquiry" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "district" TEXT,
    "city" TEXT NOT NULL DEFAULT 'TP.HCM',
    "roomType" TEXT,
    "budgetMin" INTEGER,
    "budgetMax" INTEGER,
    "note" TEXT,
    "source" TEXT NOT NULL DEFAULT 'web',
    "assignedTo" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shipment" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "scheduledDate" TIMESTAMP(3),
    "driverName" TEXT,
    "needsCrane" BOOLEAN NOT NULL DEFAULT false,
    "buildingFloor" INTEGER,
    "hasElevator" BOOLEAN NOT NULL DEFAULT true,
    "specialNote" TEXT,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DepositLog" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "method" TEXT,
    "note" TEXT,
    "recordedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DepositLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_inquiry_status" ON "Inquiry"("status");

-- CreateIndex
CREATE INDEX "idx_inquiry_source" ON "Inquiry"("source");

-- CreateIndex
CREATE INDEX "idx_inquiry_createdAt" ON "Inquiry"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Shipment_orderId_key" ON "Shipment"("orderId");

-- CreateIndex
CREATE INDEX "idx_shipment_status" ON "Shipment"("status");

-- CreateIndex
CREATE INDEX "idx_shipment_scheduledDate" ON "Shipment"("scheduledDate");

-- CreateIndex
CREATE INDEX "idx_depositlog_order" ON "DepositLog"("orderId");

-- CreateIndex
CREATE INDEX "Article_linkedProductId_idx" ON "Article"("linkedProductId");

-- CreateIndex
CREATE INDEX "Order_workshopStatus_idx" ON "Order"("workshopStatus");

-- CreateIndex
CREATE INDEX "idx_product_workshopCode" ON "Product"("workshopCode");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_variant_price" ON "ProductVariant"("price");

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_linkedProductId_fkey" FOREIGN KEY ("linkedProductId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepositLog" ADD CONSTRAINT "DepositLog_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
