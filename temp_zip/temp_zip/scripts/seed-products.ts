import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const productNames = [
  'Wireless Bluetooth Headphones',
  'Stainless Steel Water Bottle',
  'Ergonomic Office Chair',
  'Portable Phone Charger',
  'LED Desk Lamp',
  'Mechanical Keyboard',
  'Yoga Mat',
  'Coffee Maker',
  'Smart Watch',
  'Laptop Stand',
  'USB-C Hub',
  'Noise Cancelling Earbuds',
  'Backpack',
  'Fitness Tracker',
  'Wireless Mouse',
]

const descriptions = [
  'High-quality product with premium materials',
  'Durable and long-lasting design',
  'Perfect for everyday use',
  'Lightweight and portable',
  'Energy efficient and eco-friendly',
  'Ergonomic design for maximum comfort',
  'Professional grade quality',
  'Easy to use and maintain',
]

function randomCost() {
  return parseFloat((Math.random() * 50 + 5).toFixed(2))
}

function randomRetail(cost: number) {
  const markup = Math.random() * 1.5 + 1.2 // 120% to 270% markup
  return parseFloat((cost * markup).toFixed(2))
}

function calculateMargin(cost: number, retail: number): number {
  if (retail === 0) return 0
  return ((retail - cost) / retail) * 100
}

async function main() {
  console.log('Starting seed...')

  // Get all categories
  const categories = await prisma.category.findMany()
  
  if (categories.length === 0) {
    console.error('No categories found! Please create categories first.')
    return
  }

  // Create products
  for (let i = 0; i < productNames.length; i++) {
    const cost = randomCost()
    const retailPrice = randomRetail(cost)
    const category = categories[Math.floor(Math.random() * categories.length)]
    const description = descriptions[Math.floor(Math.random() * descriptions.length)]
    const sku = `SKU-${Math.floor(Math.random() * 90000) + 10000}`

    console.log(`Creating product: ${productNames[i]}`)

    // Create product
    const product = await prisma.product.create({
      data: {
        sku,
        name: productNames[i],
        description,
        cost,
        retailPrice,
        categoryId: category.id,
      },
    })

    // Create initial changelog entry
    await prisma.productChangeLog.create({
      data: {
        productId: product.id,
        changeType: 'created',
        newCost: cost,
        newRetail: retailPrice,
        newMargin: calculateMargin(cost, retailPrice),
        newDescription: description,
        changedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
      },
    })

    // Add 1-3 random price changes
    const numChanges = Math.floor(Math.random() * 3) + 1
    let currentCost = cost
    let currentRetail = retailPrice

    for (let j = 0; j < numChanges; j++) {
      const changeTypeRandom = Math.random()
      let changeType = 'price_increase'
      let newCost = currentCost
      let newRetail = currentRetail

      if (changeTypeRandom < 0.33) {
        // Price increase
        newRetail = parseFloat((currentRetail * (1 + Math.random() * 0.2)).toFixed(2))
        changeType = 'price_increase'
      } else if (changeTypeRandom < 0.66) {
        // Price decrease
        newRetail = parseFloat((currentRetail * (1 - Math.random() * 0.15)).toFixed(2))
        changeType = 'price_decrease'
      } else {
        // Cost change
        newCost = parseFloat((currentCost * (1 + (Math.random() - 0.5) * 0.3)).toFixed(2))
        changeType = 'cost_change'
      }

      const oldMargin = calculateMargin(currentCost, currentRetail)
      const newMargin = calculateMargin(newCost, newRetail)

      await prisma.productChangeLog.create({
        data: {
          productId: product.id,
          changeType,
          oldCost: currentCost,
          newCost,
          oldRetail: currentRetail,
          newRetail,
          oldMargin,
          newMargin,
          changedAt: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000), // Random date within last 20 days
        },
      })

      currentCost = newCost
      currentRetail = newRetail
    }

    // Update product with final prices
    await prisma.product.update({
      where: { id: product.id },
      data: {
        cost: currentCost,
        retailPrice: currentRetail,
      },
    })
  }

  console.log('Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })