/*
  Warnings:

  - Added the required column `updatedAt` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "SalesOrder" ADD COLUMN     "acceptedAt" TIMESTAMP(3),
ADD COLUMN     "orderAccepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "printedName" TEXT,
ADD COLUMN     "signature" TEXT;
