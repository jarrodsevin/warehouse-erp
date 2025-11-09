-- CreateTable
CREATE TABLE "SalesVisit" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "visitDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "images" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesVisit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SalesVisit_customerId_idx" ON "SalesVisit"("customerId");

-- CreateIndex
CREATE INDEX "SalesVisit_visitDate_idx" ON "SalesVisit"("visitDate");

-- AddForeignKey
ALTER TABLE "SalesVisit" ADD CONSTRAINT "SalesVisit_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
