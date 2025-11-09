const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runMigration() {
  console.log('🔧 Starting sales system migration...\n');
  
  try {
    // Add floorPrice to Product table
    console.log('1️⃣ Adding floorPrice to Product table...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "floorPrice" DOUBLE PRECISION NOT NULL DEFAULT 0;
    `);
    console.log('✅ Product table updated\n');

    // Add cost tracking to Inventory table
    console.log('2️⃣ Adding cost tracking to Inventory table...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Inventory" ADD COLUMN IF NOT EXISTS "currentCost" DOUBLE PRECISION NOT NULL DEFAULT 0;
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Inventory" ADD COLUMN IF NOT EXISTS "lastCostUpdate" TIMESTAMP(3);
    `);
    console.log('✅ Inventory table updated\n');

    // Create Customer table
    console.log('3️⃣ Creating Customer table...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Customer" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "email" TEXT,
        "phone" TEXT,
        "address" TEXT,
        "customerGroup" TEXT NOT NULL,
        "customerCategory" TEXT NOT NULL,
        "creditLimit" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "currentBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "paymentTerms" TEXT,
        "status" TEXT NOT NULL DEFAULT 'active',
        "notes" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log('✅ Customer table created\n');

    // Create SalesOrder table
    console.log('4️⃣ Creating SalesOrder table...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "SalesOrder" (
        "id" TEXT NOT NULL,
        "soNumber" TEXT NOT NULL,
        "customerId" TEXT NOT NULL,
        "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "status" TEXT NOT NULL DEFAULT 'fulfilled',
        "subtotal" DOUBLE PRECISION NOT NULL,
        "total" DOUBLE PRECISION NOT NULL,
        "notes" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "SalesOrder_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log('✅ SalesOrder table created\n');

    // Create SalesOrderItem table
    console.log('5️⃣ Creating SalesOrderItem table...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "SalesOrderItem" (
        "id" TEXT NOT NULL,
        "salesOrderId" TEXT NOT NULL,
        "productId" TEXT NOT NULL,
        "quantity" INTEGER NOT NULL,
        "unitPrice" DOUBLE PRECISION NOT NULL,
        "lineTotal" DOUBLE PRECISION NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "SalesOrderItem_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log('✅ SalesOrderItem table created\n');

    // Create Payment table
    console.log('6️⃣ Creating Payment table...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Payment" (
        "id" TEXT NOT NULL,
        "customerId" TEXT NOT NULL,
        "amount" DOUBLE PRECISION NOT NULL,
        "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "paymentMethod" TEXT,
        "referenceNumber" TEXT,
        "notes" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log('✅ Payment table created\n');

    // Create unique indexes
    console.log('7️⃣ Creating indexes...');
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "SalesOrder_soNumber_key" ON "SalesOrder"("soNumber");
    `);
    console.log('✅ Indexes created\n');

    // Add foreign key constraints (these will fail silently if they already exist)
    console.log('8️⃣ Adding foreign key constraints...');
    
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "SalesOrder" 
        ADD CONSTRAINT "SalesOrder_customerId_fkey" 
        FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      `);
    } catch (e) {
      if (!e.message.includes('already exists')) throw e;
    }

    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "SalesOrderItem" 
        ADD CONSTRAINT "SalesOrderItem_salesOrderId_fkey" 
        FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `);
    } catch (e) {
      if (!e.message.includes('already exists')) throw e;
    }

    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "SalesOrderItem" 
        ADD CONSTRAINT "SalesOrderItem_productId_fkey" 
        FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      `);
    } catch (e) {
      if (!e.message.includes('already exists')) throw e;
    }

    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "Payment" 
        ADD CONSTRAINT "Payment_customerId_fkey" 
        FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      `);
    } catch (e) {
      if (!e.message.includes('already exists')) throw e;
    }

    console.log('✅ Foreign keys added\n');

    console.log('✨ Migration completed successfully!\n');
    console.log('📝 Next steps:');
    console.log('   1. Update your prisma/schema.prisma with the new models');
    console.log('   2. Run: npx prisma generate');
    console.log('   3. Run: node seed-customers.js\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

runMigration();
