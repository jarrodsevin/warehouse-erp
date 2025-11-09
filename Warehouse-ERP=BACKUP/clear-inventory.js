const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function clearInventory() {
  try {
    console.log('🗑️  Clearing inventory data...')
    
    const result = await prisma.inventory.deleteMany({})
    
    console.log(`✅ Deleted ${result.count} inventory records`)
    console.log('✨ Inventory cleared successfully!')
    
  } catch (error) {
    console.error('❌ Error clearing inventory:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

clearInventory()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })