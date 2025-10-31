CREATE TABLE "Inventory" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "quantityOnHand" INTEGER NOT NULL DEFAULT 0,
  "reorderLevel" INTEGER NOT NULL DEFAULT 0,
  "reorderQuantity" INTEGER NOT NULL DEFAULT 0,
  "lastRestocked" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Inventory_productId_key" ON "Inventory"("productId");
CREATE INDEX "Inventory_productId_idx" ON "Inventory"("productId");

ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;