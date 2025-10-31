const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const vendors = [
  {
    name: 'Sysco Corporation',
    contactName: 'John Williams',
    email: 'jwilliams@sysco.com',
    phone: '(555) 123-4567',
    terms: 'Net 30',
    notes: 'Full-line food distributor - primary vendor for produce and dry goods'
  },
  {
    name: 'US Foods',
    contactName: 'Sarah Martinez',
    email: 'smartinez@usfoods.com',
    phone: '(555) 234-5678',
    terms: 'Net 30',
    notes: 'Broad line distributor - good for frozen and dairy products'
  },
  {
    name: 'Performance Food Group',
    contactName: 'Michael Chen',
    email: 'mchen@pfgc.com',
    phone: '(555) 345-6789',
    terms: 'Net 45',
    notes: 'Specialty foods and beverages'
  },
  {
    name: 'Gordon Food Service',
    contactName: 'Emily Johnson',
    email: 'ejohnson@gfs.com',
    phone: '(555) 456-7890',
    terms: 'Net 30',
    notes: 'Great pricing on bulk items and paper goods'
  },
  {
    name: 'Coca-Cola Bottling Co.',
    contactName: 'David Rodriguez',
    email: 'drodriguez@coca-cola.com',
    phone: '(555) 567-8901',
    terms: 'Net 15',
    notes: 'Exclusive Coca-Cola products supplier'
  },
  {
    name: 'PepsiCo Beverages',
    contactName: 'Jennifer Taylor',
    email: 'jtaylor@pepsi.com',
    phone: '(555) 678-9012',
    terms: 'Net 15',
    notes: 'PepsiCo beverage line and Frito-Lay snacks'
  },
  {
    name: 'Local Dairy Farms Co-op',
    contactName: 'Robert Anderson',
    email: 'randerson@localdairy.com',
    phone: '(555) 789-0123',
    terms: 'Net 21',
    notes: 'Fresh local dairy products - twice weekly deliveries'
  },
  {
    name: 'Fresh Valley Produce',
    contactName: 'Lisa Thompson',
    email: 'lthompson@freshvalley.com',
    phone: '(555) 890-1234',
    terms: 'Net 14',
    notes: 'Organic and conventional produce - daily deliveries available'
  },
  {
    name: 'Premium Meats & Seafood',
    contactName: 'James Wilson',
    email: 'jwilson@premiummeats.com',
    phone: '(555) 901-2345',
    terms: 'COD',
    notes: 'High-quality meat and seafood - requires cash on delivery'
  },
  {
    name: 'Bakery Supplies Inc.',
    contactName: 'Patricia Moore',
    email: 'pmoore@bakerysupplies.com',
    phone: '(555) 012-3456',
    terms: 'Net 30',
    notes: 'Bakery ingredients and fresh bread products'
  }
]

async function seedVendors() {
  try {
    console.log('🔄 Starting vendor seed...')
    
    // Clear existing vendors
    await prisma.vendor.deleteMany({})
    console.log('🗑️  Cleared existing vendor data')
    
    // Create vendors
    const result = await prisma.vendor.createMany({
      data: vendors
    })
    
    console.log(`✅ Created ${result.count} vendors`)
    
    // Display created vendors
    const createdVendors = await prisma.vendor.findMany({
      orderBy: {
        name: 'asc'
      }
    })
    
    console.log('\n📋 Created Vendors:')
    createdVendors.forEach((vendor, index) => {
      console.log(`   ${index + 1}. ${vendor.name} (${vendor.contactName}) - ${vendor.terms}`)
    })
    
    console.log('\n✨ Vendor seed completed successfully!')
    
  } catch (error) {
    console.error('❌ Error seeding vendors:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedVendors()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })