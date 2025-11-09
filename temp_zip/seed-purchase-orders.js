const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Helper to generate random date within a range
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

// Helper to generate PO number
function generatePONumber(index) {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `PO-${year}${month}-${String(index).padStart(4, '0')}`
}

async function seedPurchaseOrders() {
  try {
    console.log('🔄 Starting Purchase Order seed...')
    
    // Fetch all vendors, products, categories, and brands
    const vendors = await prisma.vendor.findMany()
    const products = await prisma.product.findMany({
      include: {
        category: true,
        brand: true,
        subcategory: true
      }
    })
    
    if (vendors.length === 0 || products.length === 0) {
      console.log('⚠️  No vendors or products found. Please seed those first.')
      return
    }
    
    console.log(`📦 Found ${vendors.length} vendors and ${products.length} products`)
    
    // Clear existing POs and inventory
    await prisma.purchaseOrderItem.deleteMany({})
    await prisma.purchaseOrder.deleteMany({})
    await prisma.inventory.deleteMany({})
    console.log('🗑️  Cleared existing PO and inventory data')
    
    // Date ranges for realistic data (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    const now = new Date()
    
    // Generate 30-50 purchase orders
    const numberOfPOs = 30 + Math.floor(Math.random() * 21)
    const purchaseOrders = []
    
    console.log(`📝 Generating ${numberOfPOs} purchase orders...`)
    
    for (let i = 0; i < numberOfPOs; i++) {
      const vendor = vendors[Math.floor(Math.random() * vendors.length)]
      const orderDate = randomDate(sixMonthsAgo, now)
      
      // Expected date is 7-30 days after order date
      const expectedDate = new Date(orderDate)
      expectedDate.setDate(expectedDate.getDate() + 7 + Math.floor(Math.random() * 24))
      
      // Determine status and received date
      let status = 'pending'
      let receivedDate = null
      
      const statusRoll = Math.random()
      if (statusRoll < 0.70) {
        // 70% received
        status = 'received'
        receivedDate = new Date(expectedDate)
        // Received 0-5 days after expected date
        receivedDate.setDate(receivedDate.getDate() + Math.floor(Math.random() * 6))
      } else if (statusRoll < 0.95) {
        // 25% pending
        status = 'pending'
      } else {
        // 5% cancelled
        status = 'cancelled'
      }
      
      // Select 3-12 random products for this PO
      const numItems = 3 + Math.floor(Math.random() * 10)
      const selectedProducts = []
      const usedProductIds = new Set()
      
      while (selectedProducts.length < numItems && selectedProducts.length < products.length) {
        const product = products[Math.floor(Math.random() * products.length)]
        if (!usedProductIds.has(product.id)) {
          usedProductIds.add(product.id)
          
          // Quantity based on category
          let quantity
          const categoryName = product.category.name
          if (categoryName.includes('Beverage') || categoryName.includes('Snack')) {
            quantity = 50 + Math.floor(Math.random() * 200) // 50-250
          } else if (categoryName.includes('Dairy') || categoryName.includes('Produce')) {
            quantity = 20 + Math.floor(Math.random() * 80) // 20-100
          } else {
            quantity = 30 + Math.floor(Math.random() * 120) // 30-150
          }
          
          selectedProducts.push({
            productId: product.id,
            quantity: quantity,
            unitCost: product.cost
          })
        }
      }
      
      purchaseOrders.push({
        poNumber: generatePONumber(i + 1),
        vendorId: vendor.id,
        orderDate: orderDate,
        expectedDate: expectedDate,
        receivedDate: receivedDate,
        status: status,
        notes: status === 'cancelled' ? 'Order cancelled by vendor' : null,
        items: selectedProducts
      })
    }
    
    // Create POs in database
    console.log('💾 Creating purchase orders in database...')
    
    for (const po of purchaseOrders) {
      const items = po.items
      delete po.items
      
      await prisma.purchaseOrder.create({
        data: {
          ...po,
          items: {
            create: items
          }
        }
      })
    }
    
    console.log(`✅ Created ${purchaseOrders.length} purchase orders`)
    
    // Now create/update inventory based on received POs
    console.log('📦 Updating inventory from received purchase orders...')
    
    const receivedPOs = await prisma.purchaseOrder.findMany({
      where: {
        status: 'received'
      },
      include: {
        items: true
      }
    })
    
    // Group quantities by product
    const inventoryMap = new Map()
    
    for (const po of receivedPOs) {
      for (const item of po.items) {
        if (!inventoryMap.has(item.productId)) {
          inventoryMap.set(item.productId, {
            productId: item.productId,
            quantityOnHand: 0,
            lastRestocked: po.receivedDate
          })
        }
        
        const inv = inventoryMap.get(item.productId)
        inv.quantityOnHand += item.quantity
        
        // Update lastRestocked if this PO was received more recently
        if (po.receivedDate > inv.lastRestocked) {
          inv.lastRestocked = po.receivedDate
        }
      }
    }
    
    // Get product info for reorder levels
    const productMap = new Map(products.map(p => [p.id, p]))
    
    // Create inventory records
    const inventoryRecords = Array.from(inventoryMap.values()).map(inv => {
      const product = productMap.get(inv.productId)
      const categoryName = product.category.name
      
      // Set reorder levels based on category
      let reorderLevel, reorderQuantity
      if (categoryName.includes('Beverage') || categoryName.includes('Snack')) {
        reorderLevel = 100
        reorderQuantity = 200
      } else if (categoryName.includes('Dairy') || categoryName.includes('Produce')) {
        reorderLevel = 50
        reorderQuantity = 100
      } else {
        reorderLevel = 60
        reorderQuantity = 150
      }
      
      return {
        ...inv,
        reorderLevel,
        reorderQuantity
      }
    })
    
    await prisma.inventory.createMany({
      data: inventoryRecords
    })
    
    console.log(`✅ Created ${inventoryRecords.length} inventory records`)
    
    // Create inventory records for products not in any received PO (with 0 quantity)
    const productsWithInventory = new Set(inventoryRecords.map(inv => inv.productId))
    const productsWithoutInventory = products.filter(p => !productsWithInventory.has(p.id))
    
    if (productsWithoutInventory.length > 0) {
      const zeroInventoryRecords = productsWithoutInventory.map(product => {
        const categoryName = product.category.name
        
        let reorderLevel, reorderQuantity
        if (categoryName.includes('Beverage') || categoryName.includes('Snack')) {
          reorderLevel = 100
          reorderQuantity = 200
        } else if (categoryName.includes('Dairy') || categoryName.includes('Produce')) {
          reorderLevel = 50
          reorderQuantity = 100
        } else {
          reorderLevel = 60
          reorderQuantity = 150
        }
        
        return {
          productId: product.id,
          quantityOnHand: 0,
          reorderLevel,
          reorderQuantity,
          lastRestocked: null
        }
      })
      
      await prisma.inventory.createMany({
        data: zeroInventoryRecords
      })
      
      console.log(`✅ Created ${zeroInventoryRecords.length} zero-inventory records for products not yet received`)
    }
    
    // Calculate statistics
    const stats = await prisma.inventory.aggregate({
      _sum: {
        quantityOnHand: true
      },
      _avg: {
        quantityOnHand: true
      }
    })
    
    const allInventory = await prisma.inventory.findMany()
    const outOfStock = allInventory.filter(i => i.quantityOnHand === 0).length
    const lowStock = allInventory.filter(i => i.quantityOnHand > 0 && i.quantityOnHand < i.reorderLevel).length
    const normalStock = allInventory.filter(i => i.quantityOnHand >= i.reorderLevel).length
    
    const statusCounts = {
      received: purchaseOrders.filter(po => po.status === 'received').length,
      pending: purchaseOrders.filter(po => po.status === 'pending').length,
      cancelled: purchaseOrders.filter(po => po.status === 'cancelled').length
    }
    
    console.log('\n📊 Purchase Order Statistics:')
    console.log(`   Total POs: ${purchaseOrders.length}`)
    console.log(`   Received: ${statusCounts.received} (${((statusCounts.received / purchaseOrders.length) * 100).toFixed(1)}%)`)
    console.log(`   Pending: ${statusCounts.pending} (${((statusCounts.pending / purchaseOrders.length) * 100).toFixed(1)}%)`)
    console.log(`   Cancelled: ${statusCounts.cancelled} (${((statusCounts.cancelled / purchaseOrders.length) * 100).toFixed(1)}%)`)
    
    console.log('\n📦 Inventory Statistics:')
    console.log(`   Total Units in Warehouse: ${stats._sum.quantityOnHand}`)
    console.log(`   Average Units per Product: ${stats._avg.quantityOnHand.toFixed(2)}`)
    console.log(`   Out of Stock: ${outOfStock} products (${((outOfStock / allInventory.length) * 100).toFixed(1)}%)`)
    console.log(`   Low Stock: ${lowStock} products (${((lowStock / allInventory.length) * 100).toFixed(1)}%)`)
    console.log(`   Normal Stock: ${normalStock} products (${((normalStock / allInventory.length) * 100).toFixed(1)}%)`)
    
    console.log('\n✨ Purchase Order and Inventory seed completed successfully!')
    
  } catch (error) {
    console.error('❌ Error seeding purchase orders:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedPurchaseOrders()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })