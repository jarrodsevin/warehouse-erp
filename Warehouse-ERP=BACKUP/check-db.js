const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    const vendorCount = await prisma.vendor.count();
    const productCount = await prisma.product.count();
    const categoryCount = await prisma.category.count();
    const customerCount = await prisma.customer.count();
    
    console.log('Database Status:');
    console.log('================');
    console.log('Vendors:', vendorCount);
    console.log('Products:', productCount);
    console.log('Categories:', categoryCount);
    console.log('Customers:', customerCount);
    
    if (productCount === 0) {
      console.log('\n⚠️  No products found! You need to seed the database.');
    }
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();