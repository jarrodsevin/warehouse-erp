-- CreateVendorFields 
ALTER TABLE "Vendor" ADD COLUMN "address" TEXT; 
ALTER TABLE "Vendor" ADD COLUMN "contactPerson" TEXT; 
ALTER TABLE "Vendor" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'active'; 
