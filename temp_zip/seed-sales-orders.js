const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting sales order seeding...');

  // Fetch all customers and products
  const customers = await prisma.customer.findMany({
    include: { salesOrders: true }
  });
  
  const products = await prisma.product.findMany({
    include: { inventory: true }
  });

  if (customers.length === 0) {
    console.log('No customers found. Please run customer seed first.');
    return;
  }

  if (products.length === 0) {
    console.log('No products found. Please run product seed first.');
    return;
  }

  console.log(`Found ${customers.length} customers and ${products.length} products`);

  // Reset all customer balances to 0 before seeding
  console.log('Resetting customer balances...');
  await prisma.customer.updateMany({
    data: { currentBalance: 0 }
  });

  // Sample customer names for acceptance signatures
  const customerRepNames = [
    'John Smith', 'Maria Garcia', 'David Johnson', 'Sarah Williams',
    'Michael Brown', 'Jennifer Davis', 'Robert Miller', 'Lisa Wilson',
    'James Martinez', 'Patricia Anderson', 'Christopher Taylor', 'Nancy Thomas'
  ];

  // Generate dates over last 6 months
  const now = new Date();
  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(now.getMonth() - 6);

  // Determine number of orders (30-50)
  const numberOfOrders = Math.floor(Math.random() * 21) + 30;
  console.log(`Creating ${numberOfOrders} sales orders...`);

  let ordersCreated = 0;
  let totalRevenue = 0;

  for (let i = 0; i < numberOfOrders; i++) {
    // Pick a random customer
    const customer = customers[Math.floor(Math.random() * customers.length)];
    
    // Generate random date in last 6 months
    const orderDate = new Date(
      sixMonthsAgo.getTime() + Math.random() * (now.getTime() - sixMonthsAgo.getTime())
    );

    // Determine number of items (1-8 items per order)
    const numItems = Math.floor(Math.random() * 8) + 1;
    
    // Select random products for this order
    const selectedProducts = [];
    const availableProducts = [...products];
    
    for (let j = 0; j < numItems && availableProducts.length > 0; j++) {
      const randomIndex = Math.floor(Math.random() * availableProducts.length);
      const product = availableProducts.splice(randomIndex, 1)[0];
      selectedProducts.push(product);
    }

    // Create order items with realistic pricing
    const orderItems = [];
    let subtotal = 0;

    for (const product of selectedProducts) {
      // Calculate floor price (use database value or cost * 1.15)
      const floorPrice = product.floorPrice ?? (product.cost * 1.15);
      
      // Determine quantity based on product type (1-20 units)
      let quantity;
      if (product.inventory && product.inventory.quantityOnHand > 0) {
        // Don't exceed available stock
        const maxQty = Math.min(20, product.inventory.quantityOnHand);
        quantity = Math.floor(Math.random() * maxQty) + 1;
      } else {
        quantity = Math.floor(Math.random() * 10) + 1;
      }

      // Pricing strategy: 80% at retail, 20% discounted (but always above floor)
      let unitPrice;
      if (Math.random() < 0.8) {
        // Full retail price
        unitPrice = product.retailPrice;
      } else {
        // Discounted: between floor price and retail
        const discountRange = product.retailPrice - floorPrice;
        unitPrice = floorPrice + (Math.random() * discountRange);
        // Round to 2 decimals
        unitPrice = Math.round(unitPrice * 100) / 100;
      }

      // Ensure we never go below floor price
      if (unitPrice < floorPrice) {
        unitPrice = floorPrice;
      }

      const lineTotal = quantity * unitPrice;
      subtotal += lineTotal;

      orderItems.push({
        productId: product.id,
        quantity,
        unitPrice,
        lineTotal
      });
    }

    const total = subtotal;

    // Check if order would exceed credit limit
    const newBalance = customer.currentBalance + total;
    
    // 95% of orders stay within credit limit, 5% exceed (realistic business scenario)
    if (newBalance > customer.creditLimit && Math.random() > 0.05) {
      // Skip this order if it exceeds limit (customer declined)
      continue;
    }

    // Generate SO number (SO-YYYYMM-###)
    const soNumber = `SO-${orderDate.getFullYear()}${String(orderDate.getMonth() + 1).padStart(2, '0')}-${String(ordersCreated + 1).padStart(3, '0')}`;

    // Generate acceptance data
    const acceptedAt = new Date(orderDate.getTime() + Math.random() * 3600000); // Within 1 hour of order
    const printedName = customerRepNames[Math.floor(Math.random() * customerRepNames.length)];
    
    // Generate a simple signature (base64 encoded placeholder)
    // In real scenario, this would be actual signature canvas data
    const signatureData = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`;

    // Create the sales order
    try {
      const salesOrder = await prisma.salesOrder.create({
        data: {
          soNumber,
          customerId: customer.id,
          orderDate,
          status: 'fulfilled',
          subtotal,
          total,
          notes: Math.random() < 0.3 ? generateRandomNote() : null,
          orderAccepted: true,
          printedName,
          signature: signatureData,
          acceptedAt,
          items: {
            create: orderItems
          }
        }
      });

      // Update customer balance
      await prisma.customer.update({
        where: { id: customer.id },
        data: {
          currentBalance: {
            increment: total
          }
        }
      });

      // Update inventory quantities (reduce stock)
      for (const item of orderItems) {
        const product = products.find(p => p.id === item.productId);
        if (product && product.inventory) {
          await prisma.inventory.update({
            where: { productId: item.productId },
            data: {
              quantityOnHand: {
                decrement: item.quantity
              }
            }
          });
        }
      }

      ordersCreated++;
      totalRevenue += total;
      
      console.log(`✓ Created ${soNumber} for ${customer.name} - ${orderItems.length} items - $${total.toFixed(2)}`);
    } catch (error) {
      console.error(`Error creating order for ${customer.name}:`, error.message);
    }
  }

  console.log('\n=== Sales Order Seeding Complete ===');
  console.log(`Total Orders Created: ${ordersCreated}`);
  console.log(`Total Revenue: $${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
  console.log(`Average Order Value: $${(totalRevenue / ordersCreated).toFixed(2)}`);

  // Show customer balance summary
  const updatedCustomers = await prisma.customer.findMany({
    orderBy: { currentBalance: 'desc' }
  });

  console.log('\n=== Customer Balance Summary ===');
  for (const cust of updatedCustomers) {
    const utilization = (cust.currentBalance / cust.creditLimit * 100).toFixed(1);
    const available = cust.creditLimit - cust.currentBalance;
    console.log(`${cust.name}: Balance: $${cust.currentBalance.toFixed(2)} | Available: $${available.toFixed(2)} | Utilization: ${utilization}%`);
  }
}

function generateRandomNote() {
  const notes = [
    'Rush delivery requested',
    'Regular weekly order',
    'Special promotion order',
    'Customer requested substitution on unavailable items',
    'Delivery to back entrance',
    'Contact manager upon arrival',
    'Part of monthly contract',
    'Trial order for new location',
    'Holiday season stock-up',
    'Replacement for damaged goods'
  ];
  return notes[Math.floor(Math.random() * notes.length)];
}

main()
  .catch((e) => {
    console.error('Error seeding sales orders:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });