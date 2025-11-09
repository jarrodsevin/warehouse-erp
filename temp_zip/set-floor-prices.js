const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setFloorPrices() {
  try {
    console.log('💰 Setting floor prices for all products...');

    // Get all products
    const products = await prisma.product.findMany();
    console.log(`📦 Found ${products.length} products`);

    // Update each product with floor price = cost * 1.15
    let updated = 0;
    for (const product of products) {
      const floorPrice = product.cost * 1.15;
      
      await prisma.product.update({
        where: { id: product.id },
        data: { floorPrice: floorPrice }
      });
      
      updated++;
      if (updated % 10 === 0) {
        console.log(`   Updated ${updated}/${products.length} products...`);
      }
    }

    console.log(`✅ Successfully set floor prices for ${updated} products`);
    console.log(`   Formula: Floor Price = Cost × 1.15 (15% markup minimum)`);

    // Show some examples
    const sampleProducts = await prisma.product.findMany({
      take: 5,
      select: {
        name: true,
        cost: true,
        floorPrice: true,
        retailPrice: true
      }
    });

    console.log('\n📊 Sample Products:');
    sampleProducts.forEach(p => {
      const margin = ((p.retailPrice - p.floorPrice) / p.retailPrice * 100).toFixed(1);
      console.log(`   ${p.name}`);
      console.log(`      Cost: $${p.cost.toFixed(2)} | Floor: $${p.floorPrice.toFixed(2)} | Retail: $${p.retailPrice.toFixed(2)} | Room: ${margin}%`);
    });

    console.log('\n✨ Floor price setup complete!');

  } catch (error) {
    console.error('❌ Error setting floor prices:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

setFloorPrices()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });