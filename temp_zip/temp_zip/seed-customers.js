const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const customers = [
  {
    name: "Amazon Fresh Distribution",
    email: "orders@amazonfresh.com",
    phone: "1-800-AMAZON1",
    address: "410 Terry Ave N, Seattle, WA 98109",
    customerGroup: "Amazon",
    customerCategory: "Amazon",
    creditLimit: 500000,
    currentBalance: 0,
    paymentTerms: "Net 30",
    status: "active",
    notes: "Primary Amazon distribution channel"
  },
  {
    name: "Amazon Whole Foods Supply",
    email: "wholesale@wholefoods.com",
    phone: "1-844-936-2434",
    address: "550 Bowie St, Austin, TX 78703",
    customerGroup: "Amazon",
    customerCategory: "Amazon",
    creditLimit: 750000,
    currentBalance: 0,
    paymentTerms: "Net 30",
    status: "active",
    notes: "Whole Foods procurement division"
  },
  {
    name: "ShopRite Supermarkets Inc.",
    email: "purchasing@shoprite.com",
    phone: "(908) 527-3300",
    address: "176 N Main St, Florida, NY 10921",
    customerGroup: "Shoprite",
    customerCategory: "US Mainstream",
    creditLimit: 300000,
    currentBalance: 0,
    paymentTerms: "Net 45",
    status: "active",
    notes: "Northeast regional chain"
  },
  {
    name: "ShopRite of Parsippany",
    email: "parsippany@shoprite.com",
    phone: "(973) 335-5000",
    address: "351 State Route 10 East, Parsippany, NJ 07054",
    customerGroup: "Shoprite",
    customerCategory: "US Mainstream",
    creditLimit: 150000,
    currentBalance: 0,
    paymentTerms: "Net 45",
    status: "active",
    notes: "Individual store location"
  },
  {
    name: "Costco Wholesale Corporation",
    email: "supplier@costco.com",
    phone: "(425) 313-8100",
    address: "999 Lake Drive, Issaquah, WA 98027",
    customerGroup: "Costco",
    customerCategory: "Costco",
    creditLimit: 1000000,
    currentBalance: 0,
    paymentTerms: "Net 60",
    status: "active",
    notes: "Corporate warehouse club buyer"
  },
  {
    name: "Costco Business Center - Los Angeles",
    email: "labusiness@costco.com",
    phone: "(323) 868-3000",
    address: "1810 S. San Pedro St, Los Angeles, CA 90015",
    customerGroup: "Costco",
    customerCategory: "Club",
    creditLimit: 400000,
    currentBalance: 0,
    paymentTerms: "Net 60",
    status: "active",
    notes: "Business center location"
  },
  {
    name: "Patel Brothers Wholesale",
    email: "wholesale@patelbrothers.com",
    phone: "(630) 860-7777",
    address: "1600 East Higgins Road, Elk Grove Village, IL 60007",
    customerGroup: "Other Ethnic",
    customerCategory: "Ethnic",
    creditLimit: 200000,
    currentBalance: 0,
    paymentTerms: "Net 30",
    status: "active",
    notes: "Leading Indian grocery chain"
  },
  {
    name: "H Mart Distribution Center",
    email: "purchasing@hmart.com",
    phone: "(201) 933-1717",
    address: "1 Blanchard Road, Burlington, MA 01803",
    customerGroup: "Other Ethnic",
    customerCategory: "Ethnic",
    creditLimit: 350000,
    currentBalance: 0,
    paymentTerms: "Net 30",
    status: "active",
    notes: "Korean-American supermarket chain"
  },
  {
    name: "99 Ranch Market",
    email: "orders@99ranch.com",
    phone: "(626) 964-0888",
    address: "1015 Corporate Way, Fremont, CA 94539",
    customerGroup: "Other Ethnic",
    customerCategory: "Ethnic",
    creditLimit: 250000,
    currentBalance: 0,
    paymentTerms: "Net 45",
    status: "active",
    notes: "Asian-American supermarket chain"
  },
  {
    name: "El Super Markets",
    email: "compras@elsupermercados.com",
    phone: "(323) 887-8800",
    address: "1380 Corporate Center Curve, Los Angeles, CA 90038",
    customerGroup: "Other Ethnic",
    customerCategory: "Ethnic",
    creditLimit: 180000,
    currentBalance: 0,
    paymentTerms: "Net 30",
    status: "active",
    notes: "Hispanic grocery chain"
  },
  {
    name: "Loblaws Companies Limited",
    email: "procurement@loblaw.ca",
    phone: "+1 (416) 922-2500",
    address: "1 President's Choice Circle, Brampton, ON L6Y 5S5",
    customerGroup: "Other Ethnic",
    customerCategory: "Canadian Mainstream",
    creditLimit: 450000,
    currentBalance: 0,
    paymentTerms: "Net 45",
    status: "active",
    notes: "Canada's largest food retailer"
  },
  {
    name: "Metro Inc. Distribution",
    email: "suppliers@metro.ca",
    phone: "+1 (514) 643-1000",
    address: "11011 Boulevard Maurice-Duplessis, Montreal, QC H1C 1V6",
    customerGroup: "Other Ethnic",
    customerCategory: "Canadian Mainstream",
    creditLimit: 320000,
    currentBalance: 0,
    paymentTerms: "Net 45",
    status: "active",
    notes: "Major Canadian food retailer"
  },
  {
    name: "BJ's Wholesale Club",
    email: "vendors@bjs.com",
    phone: "(508) 651-7400",
    address: "25 Research Drive, Westborough, MA 01581",
    customerGroup: "Other Ethnic",
    customerCategory: "Club",
    creditLimit: 400000,
    currentBalance: 0,
    paymentTerms: "Net 60",
    status: "active",
    notes: "East Coast warehouse club"
  },
  {
    name: "Sam's Club Distribution",
    email: "supplier.inquiry@samsclub.com",
    phone: "(479) 277-7000",
    address: "2101 SE Simple Savings Drive, Bentonville, AR 72716",
    customerGroup: "Other Ethnic",
    customerCategory: "Club",
    creditLimit: 800000,
    currentBalance: 0,
    paymentTerms: "Net 60",
    status: "active",
    notes: "Walmart's warehouse club division"
  },
  {
    name: "Kroger Distribution Center",
    email: "vendorservices@kroger.com",
    phone: "(513) 762-4000",
    address: "1014 Vine Street, Cincinnati, OH 45202",
    customerGroup: "Other Ethnic",
    customerCategory: "US Mainstream",
    creditLimit: 600000,
    currentBalance: 0,
    paymentTerms: "Net 45",
    status: "active",
    notes: "America's largest supermarket chain"
  }
];

async function seedCustomers() {
  console.log('🌱 Starting customer seed...');
  
  try {
    console.log('Clearing existing customers...');
    await prisma.payment.deleteMany({});
    await prisma.customer.deleteMany({});
    
    console.log('Creating customers...');
    for (const customer of customers) {
      await prisma.customer.create({
        data: customer
      });
      console.log(`✅ Created: ${customer.name}`);
    }
    
    const count = await prisma.customer.count();
    console.log(`\n✨ Successfully created ${count} customers!`);
    
    const groups = await prisma.customer.groupBy({
      by: ['customerGroup'],
      _count: true
    });
    
    console.log('\n📊 Customers by Group:');
    groups.forEach(g => {
      console.log(`   ${g.customerGroup}: ${g._count} customers`);
    });
    
    const categories = await prisma.customer.groupBy({
      by: ['customerCategory'],
      _count: true
    });
    
    console.log('\n📊 Customers by Category:');
    categories.forEach(c => {
      console.log(`   ${c.customerCategory}: ${c._count} customers`);
    });
    
  } catch (error) {
    console.error('❌ Error seeding customers:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedCustomers();