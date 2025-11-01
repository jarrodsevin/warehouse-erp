const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://neondb_owner:npg_hLy07adclIGB@ep-quiet-dust-ah0i6oxm-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require'
    }
  }
});

async function checkData() {
  const productCount = await prisma.product.count();
  const vendorCount = await prisma.vendor.count();
  const customerCount = await prisma.customer.count();
  
  console.log('Neon Database Contents:');
  console.log('Products:', productCount);
  console.log('Vendors:', vendorCount);
  console.log('Customers:', customerCount);
  
  await prisma.$disconnect();
}

checkData();