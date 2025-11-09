const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function seedProducts() {
  try {
    console.log('🏭 Starting Product seed...')

    // Clear existing data
    await prisma.productChangeLog.deleteMany({})
    await prisma.product.deleteMany({})
    await prisma.subcategory.deleteMany({})
    await prisma.category.deleteMany({})
    await prisma.brand.deleteMany({})
    console.log('🗑️  Cleared existing products, categories, subcategories, and brands')

    // Create Categories
    const categories = await Promise.all([
      prisma.category.create({ data: { name: 'Beverages' } }),
      prisma.category.create({ data: { name: 'Dairy & Refrigerated' } }),
      prisma.category.create({ data: { name: 'Frozen Foods' } }),
      prisma.category.create({ data: { name: 'Meat & Seafood' } }),
      prisma.category.create({ data: { name: 'Produce' } }),
      prisma.category.create({ data: { name: 'Bakery' } }),
      prisma.category.create({ data: { name: 'Snacks' } }),
      prisma.category.create({ data: { name: 'Pantry Staples' } }),
    ])
    console.log(`✅ Created ${categories.length} categories`)

    // Create Subcategories
    const subcategories = await Promise.all([
      // Beverages
      prisma.subcategory.create({ data: { name: 'Soft Drinks' } }),
      prisma.subcategory.create({ data: { name: 'Juices' } }),
      prisma.subcategory.create({ data: { name: 'Water' } }),
      prisma.subcategory.create({ data: { name: 'Coffee & Tea' } }),
      // Dairy
      prisma.subcategory.create({ data: { name: 'Milk' } }),
      prisma.subcategory.create({ data: { name: 'Cheese' } }),
      prisma.subcategory.create({ data: { name: 'Yogurt' } }),
      prisma.subcategory.create({ data: { name: 'Butter & Eggs' } }),
      // Frozen
      prisma.subcategory.create({ data: { name: 'Ice Cream' } }),
      prisma.subcategory.create({ data: { name: 'Frozen Vegetables' } }),
      prisma.subcategory.create({ data: { name: 'Frozen Meals' } }),
      // Meat
      prisma.subcategory.create({ data: { name: 'Beef' } }),
      prisma.subcategory.create({ data: { name: 'Chicken' } }),
      prisma.subcategory.create({ data: { name: 'Seafood' } }),
      // Produce
      prisma.subcategory.create({ data: { name: 'Fresh Vegetables' } }),
      prisma.subcategory.create({ data: { name: 'Fresh Fruits' } }),
      // Bakery
      prisma.subcategory.create({ data: { name: 'Bread' } }),
      prisma.subcategory.create({ data: { name: 'Pastries' } }),
      // Snacks
      prisma.subcategory.create({ data: { name: 'Chips' } }),
      prisma.subcategory.create({ data: { name: 'Candy' } }),
      prisma.subcategory.create({ data: { name: 'Cookies' } }),
      // Pantry
      prisma.subcategory.create({ data: { name: 'Canned Goods' } }),
      prisma.subcategory.create({ data: { name: 'Pasta & Rice' } }),
      prisma.subcategory.create({ data: { name: 'Oils & Condiments' } }),
    ])
    console.log(`✅ Created ${subcategories.length} subcategories`)

    // Create Brands
    const brands = await Promise.all([
      prisma.brand.create({ data: { name: 'Coca-Cola' } }),
      prisma.brand.create({ data: { name: 'Pepsi' } }),
      prisma.brand.create({ data: { name: 'Nestle' } }),
      prisma.brand.create({ data: { name: 'Kraft' } }),
      prisma.brand.create({ data: { name: 'General Mills' } }),
      prisma.brand.create({ data: { name: 'Kelloggs' } }),
      prisma.brand.create({ data: { name: 'Unilever' } }),
      prisma.brand.create({ data: { name: 'Dole' } }),
      prisma.brand.create({ data: { name: 'Ocean Spray' } }),
      prisma.brand.create({ data: { name: 'Tropicana' } }),
      prisma.brand.create({ data: { name: 'Frito-Lay' } }),
      prisma.brand.create({ data: { name: 'Mars' } }),
      prisma.brand.create({ data: { name: "Hershey's" } }),
      prisma.brand.create({ data: { name: 'Nabisco' } }),
      prisma.brand.create({ data: { name: 'Private Label' } }),
    ])
    console.log(`✅ Created ${brands.length} brands`)

    // Helper to find by name
    const findCategory = (name) => categories.find(c => c.name === name)
    const findSubcategory = (name) => subcategories.find(s => s.name === name)
    const findBrand = (name) => brands.find(b => b.name === name)

    // Create Products
    const products = [
      // Beverages - Soft Drinks
      { sku: 'BEV-001', name: 'Coca-Cola Classic 12oz Can', cost: 0.35, retailPrice: 0.99, categoryId: findCategory('Beverages').id, subcategoryId: findSubcategory('Soft Drinks').id, brandId: findBrand('Coca-Cola').id, unitOfMeasurement: 'oz', packageSize: 12, casePackCount: 24, storageType: 'Ambient' },
      { sku: 'BEV-002', name: 'Pepsi 12oz Can', cost: 0.33, retailPrice: 0.95, categoryId: findCategory('Beverages').id, subcategoryId: findSubcategory('Soft Drinks').id, brandId: findBrand('Pepsi').id, unitOfMeasurement: 'oz', packageSize: 12, casePackCount: 24, storageType: 'Ambient' },
      { sku: 'BEV-003', name: 'Sprite 12oz Can', cost: 0.34, retailPrice: 0.99, categoryId: findCategory('Beverages').id, subcategoryId: findSubcategory('Soft Drinks').id, brandId: findBrand('Coca-Cola').id, unitOfMeasurement: 'oz', packageSize: 12, casePackCount: 24, storageType: 'Ambient' },
      { sku: 'BEV-004', name: 'Dr Pepper 12oz Can', cost: 0.36, retailPrice: 0.99, categoryId: findCategory('Beverages').id, subcategoryId: findSubcategory('Soft Drinks').id, brandId: findBrand('Pepsi').id, unitOfMeasurement: 'oz', packageSize: 12, casePackCount: 24, storageType: 'Ambient' },
      
      // Beverages - Juices
      { sku: 'BEV-011', name: 'Tropicana Orange Juice 64oz', cost: 3.20, retailPrice: 5.99, categoryId: findCategory('Beverages').id, subcategoryId: findSubcategory('Juices').id, brandId: findBrand('Tropicana').id, unitOfMeasurement: 'oz', packageSize: 64, casePackCount: 8, storageType: 'Refrigerated' },
      { sku: 'BEV-012', name: 'Ocean Spray Cranberry Juice 64oz', cost: 3.50, retailPrice: 6.49, categoryId: findCategory('Beverages').id, subcategoryId: findSubcategory('Juices').id, brandId: findBrand('Ocean Spray').id, unitOfMeasurement: 'oz', packageSize: 64, casePackCount: 8, storageType: 'Refrigerated' },
      { sku: 'BEV-013', name: 'Dole Pineapple Juice 46oz', cost: 2.80, retailPrice: 4.99, categoryId: findCategory('Beverages').id, subcategoryId: findSubcategory('Juices').id, brandId: findBrand('Dole').id, unitOfMeasurement: 'oz', packageSize: 46, casePackCount: 12, storageType: 'Ambient' },

      // Beverages - Water
      { sku: 'BEV-021', name: 'Bottled Spring Water 16.9oz', cost: 0.15, retailPrice: 0.99, categoryId: findCategory('Beverages').id, subcategoryId: findSubcategory('Water').id, brandId: findBrand('Private Label').id, unitOfMeasurement: 'oz', packageSize: 16.9, casePackCount: 24, storageType: 'Ambient' },
      { sku: 'BEV-022', name: 'Sparkling Water Lemon 12oz', cost: 0.45, retailPrice: 1.29, categoryId: findCategory('Beverages').id, subcategoryId: findSubcategory('Water').id, brandId: findBrand('Nestle').id, unitOfMeasurement: 'oz', packageSize: 12, casePackCount: 12, storageType: 'Ambient' },

      // Dairy - Milk
      { sku: 'DAI-001', name: 'Whole Milk Gallon', cost: 2.80, retailPrice: 4.99, categoryId: findCategory('Dairy & Refrigerated').id, subcategoryId: findSubcategory('Milk').id, brandId: findBrand('Private Label').id, unitOfMeasurement: 'gal', packageSize: 1, casePackCount: 4, storageType: 'Refrigerated' },
      { sku: 'DAI-002', name: '2% Milk Gallon', cost: 2.75, retailPrice: 4.89, categoryId: findCategory('Dairy & Refrigerated').id, subcategoryId: findSubcategory('Milk').id, brandId: findBrand('Private Label').id, unitOfMeasurement: 'gal', packageSize: 1, casePackCount: 4, storageType: 'Refrigerated' },
      { sku: 'DAI-003', name: 'Skim Milk Gallon', cost: 2.70, retailPrice: 4.79, categoryId: findCategory('Dairy & Refrigerated').id, subcategoryId: findSubcategory('Milk').id, brandId: findBrand('Private Label').id, unitOfMeasurement: 'gal', packageSize: 1, casePackCount: 4, storageType: 'Refrigerated' },

      // Dairy - Cheese
      { sku: 'DAI-011', name: 'Cheddar Cheese Block 8oz', cost: 2.20, retailPrice: 3.99, categoryId: findCategory('Dairy & Refrigerated').id, subcategoryId: findSubcategory('Cheese').id, brandId: findBrand('Kraft').id, unitOfMeasurement: 'oz', packageSize: 8, casePackCount: 12, storageType: 'Refrigerated' },
      { sku: 'DAI-012', name: 'Mozzarella Cheese 8oz', cost: 2.40, retailPrice: 4.29, categoryId: findCategory('Dairy & Refrigerated').id, subcategoryId: findSubcategory('Cheese').id, brandId: findBrand('Kraft').id, unitOfMeasurement: 'oz', packageSize: 8, casePackCount: 12, storageType: 'Refrigerated' },
      { sku: 'DAI-013', name: 'Swiss Cheese Slices 8oz', cost: 3.10, retailPrice: 5.49, categoryId: findCategory('Dairy & Refrigerated').id, subcategoryId: findSubcategory('Cheese').id, brandId: findBrand('Kraft').id, unitOfMeasurement: 'oz', packageSize: 8, casePackCount: 12, storageType: 'Refrigerated' },

      // Dairy - Yogurt
      { sku: 'DAI-021', name: 'Greek Yogurt Vanilla 6oz', cost: 0.65, retailPrice: 1.29, categoryId: findCategory('Dairy & Refrigerated').id, subcategoryId: findSubcategory('Yogurt').id, brandId: findBrand('Private Label').id, unitOfMeasurement: 'oz', packageSize: 6, casePackCount: 12, storageType: 'Refrigerated' },
      { sku: 'DAI-022', name: 'Greek Yogurt Strawberry 6oz', cost: 0.65, retailPrice: 1.29, categoryId: findCategory('Dairy & Refrigerated').id, subcategoryId: findSubcategory('Yogurt').id, brandId: findBrand('Private Label').id, unitOfMeasurement: 'oz', packageSize: 6, casePackCount: 12, storageType: 'Refrigerated' },

      // Frozen - Ice Cream
      { sku: 'FRZ-001', name: 'Vanilla Ice Cream 48oz', cost: 2.50, retailPrice: 4.99, categoryId: findCategory('Frozen Foods').id, subcategoryId: findSubcategory('Ice Cream').id, brandId: findBrand('Nestle').id, unitOfMeasurement: 'oz', packageSize: 48, casePackCount: 8, storageType: 'Frozen' },
      { sku: 'FRZ-002', name: 'Chocolate Ice Cream 48oz', cost: 2.50, retailPrice: 4.99, categoryId: findCategory('Frozen Foods').id, subcategoryId: findSubcategory('Ice Cream').id, brandId: findBrand('Nestle').id, unitOfMeasurement: 'oz', packageSize: 48, casePackCount: 8, storageType: 'Frozen' },
      { sku: 'FRZ-003', name: 'Strawberry Ice Cream 48oz', cost: 2.50, retailPrice: 4.99, categoryId: findCategory('Frozen Foods').id, subcategoryId: findSubcategory('Ice Cream').id, brandId: findBrand('Nestle').id, unitOfMeasurement: 'oz', packageSize: 48, casePackCount: 8, storageType: 'Frozen' },

      // Frozen - Vegetables
      { sku: 'FRZ-011', name: 'Frozen Broccoli 16oz', cost: 1.20, retailPrice: 2.49, categoryId: findCategory('Frozen Foods').id, subcategoryId: findSubcategory('Frozen Vegetables').id, brandId: findBrand('Private Label').id, unitOfMeasurement: 'oz', packageSize: 16, casePackCount: 12, storageType: 'Frozen' },
      { sku: 'FRZ-012', name: 'Frozen Mixed Vegetables 16oz', cost: 1.15, retailPrice: 2.39, categoryId: findCategory('Frozen Foods').id, subcategoryId: findSubcategory('Frozen Vegetables').id, brandId: findBrand('Private Label').id, unitOfMeasurement: 'oz', packageSize: 16, casePackCount: 12, storageType: 'Frozen' },
      { sku: 'FRZ-013', name: 'Frozen Corn 16oz', cost: 1.10, retailPrice: 2.29, categoryId: findCategory('Frozen Foods').id, subcategoryId: findSubcategory('Frozen Vegetables').id, brandId: findBrand('Private Label').id, unitOfMeasurement: 'oz', packageSize: 16, casePackCount: 12, storageType: 'Frozen' },

      // Meat - Beef
      { sku: 'MET-001', name: 'Ground Beef 80/20 1lb', cost: 4.50, retailPrice: 6.99, categoryId: findCategory('Meat & Seafood').id, subcategoryId: findSubcategory('Beef').id, brandId: findBrand('Private Label').id, unitOfMeasurement: 'lb', packageSize: 1, casePackCount: 10, storageType: 'Refrigerated' },
      { sku: 'MET-002', name: 'Ribeye Steak 12oz', cost: 10.50, retailPrice: 15.99, categoryId: findCategory('Meat & Seafood').id, subcategoryId: findSubcategory('Beef').id, brandId: findBrand('Private Label').id, unitOfMeasurement: 'oz', packageSize: 12, casePackCount: 8, storageType: 'Refrigerated' },

      // Meat - Chicken
      { sku: 'MET-011', name: 'Chicken Breast Boneless 1lb', cost: 3.20, retailPrice: 5.49, categoryId: findCategory('Meat & Seafood').id, subcategoryId: findSubcategory('Chicken').id, brandId: findBrand('Private Label').id, unitOfMeasurement: 'lb', packageSize: 1, casePackCount: 10, storageType: 'Refrigerated' },
      { sku: 'MET-012', name: 'Chicken Thighs 1lb', cost: 2.50, retailPrice: 4.29, categoryId: findCategory('Meat & Seafood').id, subcategoryId: findSubcategory('Chicken').id, brandId: findBrand('Private Label').id, unitOfMeasurement: 'lb', packageSize: 1, casePackCount: 10, storageType: 'Refrigerated' },
      { sku: 'MET-013', name: 'Whole Chicken 4-5lb', cost: 7.50, retailPrice: 11.99, categoryId: findCategory('Meat & Seafood').id, subcategoryId: findSubcategory('Chicken').id, brandId: findBrand('Private Label').id, unitOfMeasurement: 'lb', packageSize: 4.5, casePackCount: 6, storageType: 'Refrigerated' },

      // Meat - Seafood
      { sku: 'MET-021', name: 'Salmon Fillet 8oz', cost: 8.50, retailPrice: 13.99, categoryId: findCategory('Meat & Seafood').id, subcategoryId: findSubcategory('Seafood').id, brandId: findBrand('Private Label').id, unitOfMeasurement: 'oz', packageSize: 8, casePackCount: 10, storageType: 'Refrigerated' },
      { sku: 'MET-022', name: 'Shrimp Raw 16oz', cost: 9.50, retailPrice: 14.99, categoryId: findCategory('Meat & Seafood').id, subcategoryId: findSubcategory('Seafood').id, brandId: findBrand('Private Label').id, unitOfMeasurement: 'oz', packageSize: 16, casePackCount: 8, storageType: 'Frozen' },

      // Produce - Vegetables
      { sku: 'PRO-001', name: 'Bananas per lb', cost: 0.30, retailPrice: 0.59, categoryId: findCategory('Produce').id, subcategoryId: findSubcategory('Fresh Fruits').id, brandId: findBrand('Dole').id, unitOfMeasurement: 'lb', packageSize: 1, casePackCount: 40, storageType: 'Ambient' },
      { sku: 'PRO-002', name: 'Apples Gala per lb', cost: 0.85, retailPrice: 1.49, categoryId: findCategory('Produce').id, subcategoryId: findSubcategory('Fresh Fruits').id, brandId: findBrand('Private Label').id, unitOfMeasurement: 'lb', packageSize: 1, casePackCount: 40, storageType: 'Refrigerated' },
      { sku: 'PRO-003', name: 'Oranges per lb', cost: 0.65, retailPrice: 1.29, categoryId: findCategory('Produce').id, subcategoryId: findSubcategory('Fresh Fruits').id, brandId: findBrand('Private Label').id, unitOfMeasurement: 'lb', packageSize: 1, casePackCount: 40, storageType: 'Ambient' },
      { sku: 'PRO-011', name: 'Lettuce Head', cost: 0.80, retailPrice: 1.69, categoryId: findCategory('Produce').id, subcategoryId: findSubcategory('Fresh Vegetables').id, brandId: findBrand('Private Label').id, unitOfMeasurement: 'ea', packageSize: 1, casePackCount: 24, storageType: 'Refrigerated' },
      { sku: 'PRO-012', name: 'Tomatoes per lb', cost: 1.20, retailPrice: 2.29, categoryId: findCategory('Produce').id, subcategoryId: findSubcategory('Fresh Vegetables').id, brandId: findBrand('Private Label').id, unitOfMeasurement: 'lb', packageSize: 1, casePackCount: 25, storageType: 'Ambient' },
      { sku: 'PRO-013', name: 'Carrots 1lb Bag', cost: 0.70, retailPrice: 1.49, categoryId: findCategory('Produce').id, subcategoryId: findSubcategory('Fresh Vegetables').id, brandId: findBrand('Private Label').id, unitOfMeasurement: 'lb', packageSize: 1, casePackCount: 24, storageType: 'Refrigerated' },
      { sku: 'PRO-014', name: 'Potatoes 5lb Bag', cost: 2.50, retailPrice: 4.99, categoryId: findCategory('Produce').id, subcategoryId: findSubcategory('Fresh Vegetables').id, brandId: findBrand('Private Label').id, unitOfMeasurement: 'lb', packageSize: 5, casePackCount: 8, storageType: 'Ambient' },

      // Bakery - Bread
      { sku: 'BAK-001', name: 'White Bread Loaf 20oz', cost: 1.20, retailPrice: 2.49, categoryId: findCategory('Bakery').id, subcategoryId: findSubcategory('Bread').id, brandId: findBrand('Private Label').id, unitOfMeasurement: 'oz', packageSize: 20, casePackCount: 12, storageType: 'Ambient' },
      { sku: 'BAK-002', name: 'Wheat Bread Loaf 20oz', cost: 1.35, retailPrice: 2.79, categoryId: findCategory('Bakery').id, subcategoryId: findSubcategory('Bread').id, brandId: findBrand('Private Label').id, unitOfMeasurement: 'oz', packageSize: 20, casePackCount: 12, storageType: 'Ambient' },
      { sku: 'BAK-003', name: 'Hamburger Buns 8ct', cost: 1.50, retailPrice: 2.99, categoryId: findCategory('Bakery').id, subcategoryId: findSubcategory('Bread').id, brandId: findBrand('Private Label').id, unitOfMeasurement: 'ct', packageSize: 8, casePackCount: 12, storageType: 'Ambient' },

      // Bakery - Pastries
      { sku: 'BAK-011', name: 'Chocolate Donuts 6ct', cost: 2.20, retailPrice: 4.49, categoryId: findCategory('Bakery').id, subcategoryId: findSubcategory('Pastries').id, brandId: findBrand('Private Label').id, unitOfMeasurement: 'ct', packageSize: 6, casePackCount: 12, storageType: 'Ambient' },
      { sku: 'BAK-012', name: 'Glazed Donuts 6ct', cost: 2.00, retailPrice: 4.29, categoryId: findCategory('Bakery').id, subcategoryId: findSubcategory('Pastries').id, brandId: findBrand('Private Label').id, unitOfMeasurement: 'ct', packageSize: 6, casePackCount: 12, storageType: 'Ambient' },

      // Snacks - Chips
      { sku: 'SNK-001', name: "Lay's Classic Potato Chips 10oz", cost: 2.50, retailPrice: 4.99, categoryId: findCategory('Snacks').id, subcategoryId: findSubcategory('Chips').id, brandId: findBrand('Frito-Lay').id, unitOfMeasurement: 'oz', packageSize: 10, casePackCount: 12, storageType: 'Ambient' },
      { sku: 'SNK-002', name: 'Doritos Nacho Cheese 10oz', cost: 2.60, retailPrice: 4.99, categoryId: findCategory('Snacks').id, subcategoryId: findSubcategory('Chips').id, brandId: findBrand('Frito-Lay').id, unitOfMeasurement: 'oz', packageSize: 10, casePackCount: 12, storageType: 'Ambient' },
      { sku: 'SNK-003', name: 'Cheetos Crunchy 8.5oz', cost: 2.40, retailPrice: 4.79, categoryId: findCategory('Snacks').id, subcategoryId: findSubcategory('Chips').id, brandId: findBrand('Frito-Lay').id, unitOfMeasurement: 'oz', packageSize: 8.5, casePackCount: 12, storageType: 'Ambient' },

      // Snacks - Candy
      { sku: 'SNK-011', name: "M&M's Chocolate 10.7oz", cost: 3.20, retailPrice: 5.99, categoryId: findCategory('Snacks').id, subcategoryId: findSubcategory('Candy').id, brandId: findBrand('Mars').id, unitOfMeasurement: 'oz', packageSize: 10.7, casePackCount: 12, storageType: 'Ambient' },
      { sku: 'SNK-012', name: 'Snickers Bar 2-pack', cost: 1.10, retailPrice: 1.99, categoryId: findCategory('Snacks').id, subcategoryId: findSubcategory('Candy').id, brandId: findBrand('Mars').id, unitOfMeasurement: 'oz', packageSize: 3.29, casePackCount: 24, storageType: 'Ambient' },
      { sku: 'SNK-013', name: "Reese's Peanut Butter Cups 2-pack", cost: 1.15, retailPrice: 1.99, categoryId: findCategory('Snacks').id, subcategoryId: findSubcategory('Candy').id, brandId: findBrand("Hershey's").id, unitOfMeasurement: 'oz', packageSize: 1.5, casePackCount: 24, storageType: 'Ambient' },

      // Snacks - Cookies
      { sku: 'SNK-021', name: 'Oreo Cookies 14.3oz', cost: 2.80, retailPrice: 4.99, categoryId: findCategory('Snacks').id, subcategoryId: findSubcategory('Cookies').id, brandId: findBrand('Nabisco').id, unitOfMeasurement: 'oz', packageSize: 14.3, casePackCount: 12, storageType: 'Ambient' },
      { sku: 'SNK-022', name: 'Chips Ahoy 13oz', cost: 2.70, retailPrice: 4.89, categoryId: findCategory('Snacks').id, subcategoryId: findSubcategory('Cookies').id, brandId: findBrand('Nabisco').id, unitOfMeasurement: 'oz', packageSize: 13, casePackCount: 12, storageType: 'Ambient' },

      // Pantry - Canned Goods
      { sku: 'PAN-001', name: 'Canned Tomatoes 14.5oz', cost: 0.80, retailPrice: 1.49, categoryId: findCategory('Pantry Staples').id, subcategoryId: findSubcategory('Canned Goods').id, brandId: findBrand('Private Label').id, unitOfMeasurement: 'oz', packageSize: 14.5, casePackCount: 24, storageType: 'Ambient' },
      { sku: 'PAN-002', name: 'Canned Corn 15oz', cost: 0.70, retailPrice: 1.29, categoryId: findCategory('Pantry Staples').id, subcategoryId: findSubcategory('Canned Goods').id, brandId: findBrand('Private Label').id, unitOfMeasurement: 'oz', packageSize: 15, casePackCount: 24, storageType: 'Ambient' },
      { sku: 'PAN-003', name: 'Canned Green Beans 14.5oz', cost: 0.75, retailPrice: 1.39, categoryId: findCategory('Pantry Staples').id, subcategoryId: findSubcategory('Canned Goods').id, brandId: findBrand('Private Label').id, unitOfMeasurement: 'oz', packageSize: 14.5, casePackCount: 24, storageType: 'Ambient' },
      { sku: 'PAN-004', name: 'Chicken Noodle Soup 10.75oz', cost: 1.00, retailPrice: 1.89, categoryId: findCategory('Pantry Staples').id, subcategoryId: findSubcategory('Canned Goods').id, brandId: findBrand('Private Label').id, unitOfMeasurement: 'oz', packageSize: 10.75, casePackCount: 24, storageType: 'Ambient' },

      // Pantry - Pasta & Rice
      { sku: 'PAN-011', name: 'Spaghetti Pasta 16oz', cost: 1.20, retailPrice: 2.29, categoryId: findCategory('Pantry Staples').id, subcategoryId: findSubcategory('Pasta & Rice').id, brandId: findBrand('Private Label').id, unitOfMeasurement: 'oz', packageSize: 16, casePackCount: 20, storageType: 'Ambient' },
      { sku: 'PAN-012', name: 'Penne Pasta 16oz', cost: 1.25, retailPrice: 2.39, categoryId: findCategory('Pantry Staples').id, subcategoryId: findSubcategory('Pasta & Rice').id, brandId: findBrand('Private Label').id, unitOfMeasurement: 'oz', packageSize: 16, casePackCount: 20, storageType: 'Ambient' },
      { sku: 'PAN-013', name: 'White Rice 2lb', cost: 2.00, retailPrice: 3.99, categoryId: findCategory('Pantry Staples').id, subcategoryId: findSubcategory('Pasta & Rice').id, brandId: findBrand('Private Label').id, unitOfMeasurement: 'lb', packageSize: 2, casePackCount: 12, storageType: 'Ambient' },
      { sku: 'PAN-014', name: 'Brown Rice 2lb', cost: 2.40, retailPrice: 4.49, categoryId: findCategory('Pantry Staples').id, subcategoryId: findSubcategory('Pasta & Rice').id, brandId: findBrand('Private Label').id, unitOfMeasurement: 'lb', packageSize: 2, casePackCount: 12, storageType: 'Ambient' },

      // Pantry - Oils & Condiments
      { sku: 'PAN-021', name: 'Vegetable Oil 48oz', cost: 3.50, retailPrice: 6.49, categoryId: findCategory('Pantry Staples').id, subcategoryId: findSubcategory('Oils & Condiments').id, brandId: findBrand('Private Label').id, unitOfMeasurement: 'oz', packageSize: 48, casePackCount: 6, storageType: 'Ambient' },
      { sku: 'PAN-022', name: 'Olive Oil 17oz', cost: 4.50, retailPrice: 8.99, categoryId: findCategory('Pantry Staples').id, subcategoryId: findSubcategory('Oils & Condiments').id, brandId: findBrand('Private Label').id, unitOfMeasurement: 'oz', packageSize: 17, casePackCount: 12, storageType: 'Ambient' },
      { sku: 'PAN-023', name: 'Ketchup 20oz', cost: 1.80, retailPrice: 3.29, categoryId: findCategory('Pantry Staples').id, subcategoryId: findSubcategory('Oils & Condiments').id, brandId: findBrand('Kraft').id, unitOfMeasurement: 'oz', packageSize: 20, casePackCount: 12, storageType: 'Ambient' },
      { sku: 'PAN-024', name: 'Mustard 14oz', cost: 1.50, retailPrice: 2.79, categoryId: findCategory('Pantry Staples').id, subcategoryId: findSubcategory('Oils & Condiments').id, brandId: findBrand('Kraft').id, unitOfMeasurement: 'oz', packageSize: 14, casePackCount: 12, storageType: 'Ambient' },
      { sku: 'PAN-025', name: 'Mayonnaise 30oz', cost: 2.80, retailPrice: 4.99, categoryId: findCategory('Pantry Staples').id, subcategoryId: findSubcategory('Oils & Condiments').id, brandId: findBrand('Kraft').id, unitOfMeasurement: 'oz', packageSize: 30, casePackCount: 12, storageType: 'Refrigerated' },

      // Additional popular items to reach ~60+ products
      { sku: 'SNK-031', name: 'Pretzels 16oz', cost: 2.20, retailPrice: 3.99, categoryId: findCategory('Snacks').id, subcategoryId: findSubcategory('Chips').id, brandId: findBrand('Private Label').id, unitOfMeasurement: 'oz', packageSize: 16, casePackCount: 12, storageType: 'Ambient' },
      { sku: 'SNK-032', name: 'Popcorn Kernels 32oz', cost: 1.80, retailPrice: 3.49, categoryId: findCategory('Snacks').id, subcategoryId: findSubcategory('Chips').id, brandId: findBrand('Private Label').id, unitOfMeasurement: 'oz', packageSize: 32, casePackCount: 12, storageType: 'Ambient' },
      { sku: 'BEV-031', name: 'Energy Drink 16oz', cost: 1.20, retailPrice: 2.49, categoryId: findCategory('Beverages').id, subcategoryId: findSubcategory('Soft Drinks').id, brandId: findBrand('Private Label').id, unitOfMeasurement: 'oz', packageSize: 16, casePackCount: 24, storageType: 'Ambient' },
      { sku: 'BEV-032', name: 'Iced Tea 16oz', cost: 0.80, retailPrice: 1.79, categoryId: findCategory('Beverages').id, subcategoryId: findSubcategory('Coffee & Tea').id, brandId: findBrand('Private Label').id, unitOfMeasurement: 'oz', packageSize: 16, casePackCount: 24, storageType: 'Ambient' },
      { sku: 'DAI-031', name: 'Butter 1lb', cost: 3.50, retailPrice: 5.99, categoryId: findCategory('Dairy & Refrigerated').id, subcategoryId: findSubcategory('Butter & Eggs').id, brandId: findBrand('Private Label').id, unitOfMeasurement: 'lb', packageSize: 1, casePackCount: 12, storageType: 'Refrigerated' },
      { sku: 'DAI-032', name: 'Eggs Large Dozen', cost: 2.20, retailPrice: 3.99, categoryId: findCategory('Dairy & Refrigerated').id, subcategoryId: findSubcategory('Butter & Eggs').id, brandId: findBrand('Private Label').id, unitOfMeasurement: 'dz', packageSize: 12, casePackCount: 15, storageType: 'Refrigerated' },
      { sku: 'FRZ-021', name: 'Frozen Pizza 12 inch', cost: 3.50, retailPrice: 5.99, categoryId: findCategory('Frozen Foods').id, subcategoryId: findSubcategory('Frozen Meals').id, brandId: findBrand('Nestle').id, unitOfMeasurement: 'ea', packageSize: 1, casePackCount: 12, storageType: 'Frozen' },
      { sku: 'FRZ-022', name: 'Frozen Lasagna 38oz', cost: 4.20, retailPrice: 7.49, categoryId: findCategory('Frozen Foods').id, subcategoryId: findSubcategory('Frozen Meals').id, brandId: findBrand('Nestle').id, unitOfMeasurement: 'oz', packageSize: 38, casePackCount: 8, storageType: 'Frozen' },
    ]

    await prisma.product.createMany({ data: products })
    console.log(`✅ Created ${products.length} products`)

    console.log('\n✨ Product seed completed successfully!')
    console.log(`\n📊 Summary:`)
    console.log(`   Categories: ${categories.length}`)
    console.log(`   Subcategories: ${subcategories.length}`)
    console.log(`   Brands: ${brands.length}`)
    console.log(`   Products: ${products.length}`)

  } catch (error) {
    console.error('❌ Error seeding products:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedProducts()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })