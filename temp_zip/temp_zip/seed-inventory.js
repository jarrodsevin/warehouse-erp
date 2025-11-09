const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Helper function to generate realistic inventory based on product characteristics
function generateInventoryData(product) {
  // Base quantity ranges by category type (you can adjust these)
  const categoryRanges = {
    'Beverages': { min: 50, max: 500, reorder: 100 },
    'Snacks': { min: 40, max: 400, reorder: 80 },
    'Dairy': { min: 20, max: 200, reorder: 50 },
    'Bakery': { min: 10, max: 100, reorder: 30 },
    'Produce': { min: 15, max: 150, reorder: 40 },
    'Meat': { min: 10, max: 100, reorder: 25 },
    'Frozen': { min: 30, max: 300, reorder: 75 },
    'Pantry': { min: 50, max: 500, reorder: 100 },
    'Cleaning': { min: 25, max: 250, reorder: 60 },
    'Paper Goods': { min: 30, max: 300, reorder: 80 },
    'default': { min: 20, max: 200, reorder: 50 }
  }

  // Get range for this product's category or use default
  const range = categoryRanges[product.category?.name] || categoryRanges['default']
  
  // 10% chance of being out of stock
  if (Math.random() < 0.10) {
    return {
      quantityOnHand: 0,
      reorderLevel: range.reorder,
      reorderQuantity: Math.floor(range.max * 0.6), // Reorder to 60% of max
      lastRestocked: null
    }
  }
  
  // 15% chance of being low stock (below reorder level)
  if (Math.random() < 0.15) {
    const lowStock = Math.floor(Math.random() * range.reorder)
    return {
      quantityOnHand: lowStock,
      reorderLevel: range.reorder,
      reorderQuantity: Math.floor(range.max * 0.6),
      lastRestocked: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
    }
  }
  
  // 75% chance of normal stock levels
  const normalStock = Math.floor(range.min + Math.random() * (range.max - range.min))
  return {
    quantityOnHand: normalStock,
    reorderLevel: range.reorder,
    reorderQuantity: Math.floor(range.max * 0.6),
    lastRestocked: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000) // Random date within last 60 days
  }
}

async function seedInventory() {
  try {
    console.log('🔄 Starting inventory seed...')
    
    // Fetch all products with their categories
    const products = await prisma.product.findMany({
      include: {
        category: true,
        brand: true,
        subcategory: true
      }
    })
    
    if (products.length === 0) {
      console.log('⚠️  No products found. Please seed products first.')
      return
    }
    
    console.log(`📦 Found ${products.length} products. Generating inventory...`)
    
    // Delete existing inventory data
    await prisma.inventory.deleteMany({})
    console.log('🗑️  Cleared existing inventory data')
    
    // Generate inventory for each product
    const inventoryData = products.map(product => {
      const data = generateInventoryData(product)
      return {
        productId: product.id,
        ...data
      }
    })
    
    // Bulk create inventory records
    const result = await prisma.inventory.createMany({
      data: inventoryData
    })
    
    console.log(`✅ Created ${result.count} inventory records`)
    
    // Calculate and display statistics
    const stats = await prisma.inventory.aggregate({
      _sum: {
        quantityOnHand: true
      },
      _avg: {
        quantityOnHand: true
      }
    })
    
    const outOfStock = inventoryData.filter(i => i.quantityOnHand === 0).length
    const lowStock = inventoryData.filter(i => i.quantityOnHand > 0 && i.quantityOnHand < i.reorderLevel).length
    const normalStock = inventoryData.filter(i => i.quantityOnHand >= i.reorderLevel).length
    
    console.log('\n📊 Inventory Statistics:')
    console.log(`   Total Units in Warehouse: ${stats._sum.quantityOnHand}`)
    console.log(`   Average Units per Product: ${stats._avg.quantityOnHand.toFixed(2)}`)
    console.log(`   Out of Stock: ${outOfStock} products (${((outOfStock / products.length) * 100).toFixed(1)}%)`)
    console.log(`   Low Stock: ${lowStock} products (${((lowStock / products.length) * 100).toFixed(1)}%)`)
    console.log(`   Normal Stock: ${normalStock} products (${((normalStock / products.length) * 100).toFixed(1)}%)`)
    
    // Show sample inventory by category
    console.log('\n📋 Sample Inventory by Category:')
    const categories = await prisma.category.findMany({
      include: {
        products: {
          include: {
            inventory: true
          },
          take: 1
        }
      },
      take: 5
    })
    
    categories.forEach(cat => {
      if (cat.products.length > 0 && cat.products[0].inventory) {
        const inv = cat.products[0].inventory
        console.log(`   ${cat.name}: ${inv.quantityOnHand} units (reorder at ${inv.reorderLevel})`)
      }
    })
    
    console.log('\n✨ Inventory seed completed successfully!')
    
  } catch (error) {
    console.error('❌ Error seeding inventory:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seed
seedInventory()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })