import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function calculateMargin(cost: number, retail: number): number {
  if (retail === 0) return 0
  return ((retail - cost) / retail) * 100
}

const categories = [
  'Dairy & Eggs',
  'Meat & Seafood',
  'Produce',
  'Bakery',
  'Beverages',
  'Pantry Staples',
  'Snacks',
  'Frozen Foods',
  'Condiments & Sauces',
  'Breakfast & Cereal',
]

const subcategories = [
  { name: 'Milk & Cream', categoryName: 'Dairy & Eggs' },
  { name: 'Cheese', categoryName: 'Dairy & Eggs' },
  { name: 'Yogurt', categoryName: 'Dairy & Eggs' },
  { name: 'Eggs', categoryName: 'Dairy & Eggs' },
  { name: 'Beef', categoryName: 'Meat & Seafood' },
  { name: 'Chicken', categoryName: 'Meat & Seafood' },
  { name: 'Pork', categoryName: 'Meat & Seafood' },
  { name: 'Fish', categoryName: 'Meat & Seafood' },
  { name: 'Fresh Vegetables', categoryName: 'Produce' },
  { name: 'Fresh Fruits', categoryName: 'Produce' },
  { name: 'Bread', categoryName: 'Bakery' },
  { name: 'Pastries', categoryName: 'Bakery' },
  { name: 'Soft Drinks', categoryName: 'Beverages' },
  { name: 'Coffee & Tea', categoryName: 'Beverages' },
  { name: 'Juice', categoryName: 'Beverages' },
  { name: 'Pasta & Rice', categoryName: 'Pantry Staples' },
  { name: 'Canned Goods', categoryName: 'Pantry Staples' },
  { name: 'Baking Supplies', categoryName: 'Pantry Staples' },
  { name: 'Chips & Crackers', categoryName: 'Snacks' },
  { name: 'Candy & Chocolate', categoryName: 'Snacks' },
  { name: 'Frozen Meals', categoryName: 'Frozen Foods' },
  { name: 'Ice Cream', categoryName: 'Frozen Foods' },
  { name: 'Ketchup & Mustard', categoryName: 'Condiments & Sauces' },
  { name: 'Salad Dressing', categoryName: 'Condiments & Sauces' },
  { name: 'Cereal', categoryName: 'Breakfast & Cereal' },
  { name: 'Oatmeal', categoryName: 'Breakfast & Cereal' },
]

const brands = [
  'Kraft',
  'Nestle',
  'General Mills',
  'Kellogg\'s',
  'Coca-Cola',
  'PepsiCo',
  'Tyson',
  'Perdue',
  'Dole',
  'Ocean Spray',
  'Hillshire Farm',
  'Oscar Mayer',
  'Lay\'s',
  'Doritos',
  'Ben & Jerry\'s',
  'Häagen-Dazs',
  'Starbucks',
  'Folgers',
  'Land O\'Lakes',
  'Daisy',
  'Tropicana',
  'Minute Maid',
  'Heinz',
  'Hunt\'s',
  'Campbell\'s',
  'Progresso',
  'Barilla',
  'Mueller\'s',
  'Uncle Ben\'s',
  'Quaker',
]

const products = [
  // Dairy & Eggs - Milk & Cream
  { name: 'Whole Milk', brand: 'Land O\'Lakes', subcategory: 'Milk & Cream', category: 'Dairy & Eggs', cost: 2.50, retail: 4.99, packageSize: 1, unit: 'gal', casePack: 4, storage: 'Refrigerated', description: 'Fresh whole milk, vitamin D fortified' },
  { name: '2% Reduced Fat Milk', brand: 'Land O\'Lakes', subcategory: 'Milk & Cream', category: 'Dairy & Eggs', cost: 2.40, retail: 4.79, packageSize: 1, unit: 'gal', casePack: 4, storage: 'Refrigerated', description: '2% milk fat content' },
  { name: 'Heavy Whipping Cream', brand: 'Land O\'Lakes', subcategory: 'Milk & Cream', category: 'Dairy & Eggs', cost: 3.20, retail: 5.99, packageSize: 16, unit: 'oz', casePack: 12, storage: 'Refrigerated', description: 'Ultra-pasteurized heavy cream' },
  { name: 'Half and Half', brand: 'Land O\'Lakes', subcategory: 'Milk & Cream', category: 'Dairy & Eggs', cost: 2.00, retail: 3.99, packageSize: 32, unit: 'oz', casePack: 12, storage: 'Refrigerated', description: 'Perfect for coffee' },
  
  // Dairy & Eggs - Cheese
  { name: 'Cheddar Cheese Block', brand: 'Kraft', subcategory: 'Cheese', category: 'Dairy & Eggs', cost: 3.50, retail: 6.99, packageSize: 16, unit: 'oz', casePack: 12, storage: 'Refrigerated', description: 'Sharp cheddar cheese' },
  { name: 'Mozzarella Shredded', brand: 'Kraft', subcategory: 'Cheese', category: 'Dairy & Eggs', cost: 2.80, retail: 5.49, packageSize: 8, unit: 'oz', casePack: 12, storage: 'Refrigerated', description: 'Low-moisture part-skim mozzarella' },
  { name: 'American Cheese Singles', brand: 'Kraft', subcategory: 'Cheese', category: 'Dairy & Eggs', cost: 2.20, retail: 4.49, packageSize: 16, unit: 'oz', casePack: 12, storage: 'Refrigerated', description: 'Individually wrapped slices' },
  { name: 'Cream Cheese', brand: 'Kraft', subcategory: 'Cheese', category: 'Dairy & Eggs', cost: 1.50, retail: 2.99, packageSize: 8, unit: 'oz', casePack: 24, storage: 'Refrigerated', description: 'Original cream cheese spread' },
  
  // Dairy & Eggs - Yogurt
  { name: 'Greek Yogurt Vanilla', brand: 'Daisy', subcategory: 'Yogurt', category: 'Dairy & Eggs', cost: 0.80, retail: 1.49, packageSize: 6, unit: 'oz', casePack: 24, storage: 'Refrigerated', description: 'Non-fat Greek yogurt' },
  { name: 'Greek Yogurt Strawberry', brand: 'Daisy', subcategory: 'Yogurt', category: 'Dairy & Eggs', cost: 0.80, retail: 1.49, packageSize: 6, unit: 'oz', casePack: 24, storage: 'Refrigerated', description: 'Low-fat Greek yogurt with real fruit' },
  
  // Dairy & Eggs - Eggs
  { name: 'Large White Eggs', brand: 'Land O\'Lakes', subcategory: 'Eggs', category: 'Dairy & Eggs', cost: 2.50, retail: 4.99, packageSize: 12, unit: 'each', casePack: 15, storage: 'Refrigerated', description: 'Grade A large eggs' },
  { name: 'Organic Large Brown Eggs', brand: 'Land O\'Lakes', subcategory: 'Eggs', category: 'Dairy & Eggs', cost: 4.00, retail: 7.99, packageSize: 12, unit: 'each', casePack: 15, storage: 'Refrigerated', description: 'Certified organic, cage-free' },
  
  // Meat & Seafood - Beef
  { name: 'Ground Beef 80/20', brand: 'Tyson', subcategory: 'Beef', category: 'Meat & Seafood', cost: 3.99, retail: 6.99, packageSize: 1, unit: 'lb', casePack: 10, storage: 'Refrigerated', description: '80% lean ground beef' },
  { name: 'Ribeye Steak', brand: 'Tyson', subcategory: 'Beef', category: 'Meat & Seafood', cost: 9.99, retail: 16.99, packageSize: 1, unit: 'lb', casePack: 8, storage: 'Refrigerated', description: 'USDA Choice ribeye' },
  { name: 'Beef Chuck Roast', brand: 'Tyson', subcategory: 'Beef', category: 'Meat & Seafood', cost: 5.49, retail: 9.99, packageSize: 3, unit: 'lb', casePack: 6, storage: 'Refrigerated', description: 'Perfect for pot roast' },
  
  // Meat & Seafood - Chicken
  { name: 'Boneless Chicken Breast', brand: 'Perdue', subcategory: 'Chicken', category: 'Meat & Seafood', cost: 3.99, retail: 7.99, packageSize: 2, unit: 'lb', casePack: 10, storage: 'Refrigerated', description: 'Fresh, never frozen' },
  { name: 'Chicken Thighs', brand: 'Perdue', subcategory: 'Chicken', category: 'Meat & Seafood', cost: 2.49, retail: 4.99, packageSize: 2, unit: 'lb', casePack: 10, storage: 'Refrigerated', description: 'Bone-in, skin-on' },
  { name: 'Whole Roasting Chicken', brand: 'Perdue', subcategory: 'Chicken', category: 'Meat & Seafood', cost: 5.99, retail: 11.99, packageSize: 5, unit: 'lb', casePack: 6, storage: 'Refrigerated', description: 'Perfect for roasting' },
  { name: 'Chicken Wings', brand: 'Tyson', subcategory: 'Chicken', category: 'Meat & Seafood', cost: 4.99, retail: 8.99, packageSize: 3, unit: 'lb', casePack: 8, storage: 'Frozen', description: 'Individually frozen wings' },
  
  // Meat & Seafood - Pork
  { name: 'Pork Chops', brand: 'Tyson', subcategory: 'Pork', category: 'Meat & Seafood', cost: 4.49, retail: 7.99, packageSize: 1.5, unit: 'lb', casePack: 10, storage: 'Refrigerated', description: 'Bone-in center cut' },
  { name: 'Ground Pork', brand: 'Tyson', subcategory: 'Pork', category: 'Meat & Seafood', cost: 2.99, retail: 5.49, packageSize: 1, unit: 'lb', casePack: 12, storage: 'Refrigerated', description: 'Fresh ground pork' },
  { name: 'Bacon', brand: 'Oscar Mayer', subcategory: 'Pork', category: 'Meat & Seafood', cost: 4.50, retail: 7.99, packageSize: 16, unit: 'oz', casePack: 12, storage: 'Refrigerated', description: 'Thick cut bacon' },
  { name: 'Ham Slices', brand: 'Hillshire Farm', subcategory: 'Pork', category: 'Meat & Seafood', cost: 3.50, retail: 6.49, packageSize: 16, unit: 'oz', casePack: 12, storage: 'Refrigerated', description: 'Deli-style ham' },
  
  // Meat & Seafood - Fish
  { name: 'Atlantic Salmon Fillet', brand: 'Ocean Spray', subcategory: 'Fish', category: 'Meat & Seafood', cost: 8.99, retail: 14.99, packageSize: 1, unit: 'lb', casePack: 8, storage: 'Refrigerated', description: 'Farm-raised salmon' },
  { name: 'Tilapia Fillets', brand: 'Ocean Spray', subcategory: 'Fish', category: 'Meat & Seafood', cost: 5.99, retail: 9.99, packageSize: 1, unit: 'lb', casePack: 10, storage: 'Frozen', description: 'Individually frozen fillets' },
  
  // Produce - Fresh Vegetables
  { name: 'Organic Carrots', brand: 'Dole', subcategory: 'Fresh Vegetables', category: 'Produce', cost: 1.50, retail: 2.99, packageSize: 2, unit: 'lb', casePack: 12, storage: 'Refrigerated', description: 'Fresh organic carrots' },
  { name: 'Romaine Lettuce', brand: 'Dole', subcategory: 'Fresh Vegetables', category: 'Produce', cost: 1.20, retail: 2.49, packageSize: 1, unit: 'each', casePack: 24, storage: 'Refrigerated', description: 'Fresh romaine hearts' },
  { name: 'Baby Spinach', brand: 'Dole', subcategory: 'Fresh Vegetables', category: 'Produce', cost: 2.00, retail: 3.99, packageSize: 10, unit: 'oz', casePack: 12, storage: 'Refrigerated', description: 'Pre-washed baby spinach' },
  { name: 'Broccoli Crowns', brand: 'Dole', subcategory: 'Fresh Vegetables', category: 'Produce', cost: 1.80, retail: 3.49, packageSize: 1, unit: 'lb', casePack: 12, storage: 'Refrigerated', description: 'Fresh broccoli' },
  { name: 'Cherry Tomatoes', brand: 'Dole', subcategory: 'Fresh Vegetables', category: 'Produce', cost: 2.50, retail: 4.49, packageSize: 1, unit: 'lb', casePack: 12, storage: 'Refrigerated', description: 'Sweet cherry tomatoes' },
  { name: 'Bell Peppers Mixed', brand: 'Dole', subcategory: 'Fresh Vegetables', category: 'Produce', cost: 3.00, retail: 5.99, packageSize: 3, unit: 'pack', casePack: 12, storage: 'Refrigerated', description: 'Red, yellow, green peppers' },
  
  // Produce - Fresh Fruits
  { name: 'Bananas', brand: 'Dole', subcategory: 'Fresh Fruits', category: 'Produce', cost: 0.40, retail: 0.79, packageSize: 1, unit: 'lb', casePack: 40, storage: 'Room Temperature', description: 'Fresh yellow bananas' },
  { name: 'Apples Gala', brand: 'Dole', subcategory: 'Fresh Fruits', category: 'Produce', cost: 1.20, retail: 2.49, packageSize: 3, unit: 'lb', casePack: 10, storage: 'Refrigerated', description: 'Sweet Gala apples' },
  { name: 'Strawberries', brand: 'Dole', subcategory: 'Fresh Fruits', category: 'Produce', cost: 2.50, retail: 4.99, packageSize: 1, unit: 'lb', casePack: 12, storage: 'Refrigerated', description: 'Fresh strawberries' },
  { name: 'Blueberries', brand: 'Dole', subcategory: 'Fresh Fruits', category: 'Produce', cost: 3.50, retail: 6.99, packageSize: 18, unit: 'oz', casePack: 12, storage: 'Refrigerated', description: 'Fresh blueberries' },
  { name: 'Oranges Navel', brand: 'Dole', subcategory: 'Fresh Fruits', category: 'Produce', cost: 1.50, retail: 2.99, packageSize: 4, unit: 'lb', casePack: 10, storage: 'Room Temperature', description: 'Seedless navel oranges' },
  { name: 'Grapes Red Seedless', brand: 'Dole', subcategory: 'Fresh Fruits', category: 'Produce', cost: 2.80, retail: 5.49, packageSize: 2, unit: 'lb', casePack: 10, storage: 'Refrigerated', description: 'Sweet red grapes' },
  
  // Bakery - Bread
  { name: 'White Sandwich Bread', brand: 'General Mills', subcategory: 'Bread', category: 'Bakery', cost: 1.50, retail: 2.99, packageSize: 20, unit: 'oz', casePack: 12, storage: 'Room Temperature', description: 'Soft white bread' },
  { name: 'Whole Wheat Bread', brand: 'General Mills', subcategory: 'Bread', category: 'Bakery', cost: 1.80, retail: 3.49, packageSize: 20, unit: 'oz', casePack: 12, storage: 'Room Temperature', description: '100% whole wheat' },
  { name: 'Hamburger Buns', brand: 'General Mills', subcategory: 'Bread', category: 'Bakery', cost: 1.20, retail: 2.49, packageSize: 8, unit: 'pack', casePack: 12, storage: 'Room Temperature', description: 'Soft hamburger buns' },
  { name: 'Hot Dog Buns', brand: 'General Mills', subcategory: 'Bread', category: 'Bakery', cost: 1.20, retail: 2.49, packageSize: 8, unit: 'pack', casePack: 12, storage: 'Room Temperature', description: 'Soft hot dog buns' },
  
  // Bakery - Pastries
  { name: 'Glazed Donuts', brand: 'General Mills', subcategory: 'Pastries', category: 'Bakery', cost: 2.50, retail: 4.99, packageSize: 6, unit: 'pack', casePack: 12, storage: 'Room Temperature', description: 'Classic glazed donuts' },
  { name: 'Chocolate Chip Muffins', brand: 'General Mills', subcategory: 'Pastries', category: 'Bakery', cost: 3.00, retail: 5.99, packageSize: 4, unit: 'pack', casePack: 12, storage: 'Room Temperature', description: 'Fresh-baked muffins' },
  
  // Beverages - Soft Drinks
  { name: 'Coca-Cola Classic', brand: 'Coca-Cola', subcategory: 'Soft Drinks', category: 'Beverages', cost: 4.50, retail: 7.99, packageSize: 12, unit: 'pack', casePack: 4, storage: 'Room Temperature', description: '12 oz cans, 12-pack' },
  { name: 'Sprite', brand: 'Coca-Cola', subcategory: 'Soft Drinks', category: 'Beverages', cost: 4.50, retail: 7.99, packageSize: 12, unit: 'pack', casePack: 4, storage: 'Room Temperature', description: 'Lemon-lime soda' },
  { name: 'Pepsi', brand: 'PepsiCo', subcategory: 'Soft Drinks', category: 'Beverages', cost: 4.50, retail: 7.99, packageSize: 12, unit: 'pack', casePack: 4, storage: 'Room Temperature', description: '12 oz cans, 12-pack' },
  { name: 'Mountain Dew', brand: 'PepsiCo', subcategory: 'Soft Drinks', category: 'Beverages', cost: 4.50, retail: 7.99, packageSize: 12, unit: 'pack', casePack: 4, storage: 'Room Temperature', description: 'Citrus soda' },
  { name: 'Dr Pepper', brand: 'PepsiCo', subcategory: 'Soft Drinks', category: 'Beverages', cost: 4.50, retail: 7.99, packageSize: 12, unit: 'pack', casePack: 4, storage: 'Room Temperature', description: '12 oz cans, 12-pack' },
  
  // Beverages - Coffee & Tea
  { name: 'Ground Coffee Classic Roast', brand: 'Folgers', subcategory: 'Coffee & Tea', category: 'Beverages', cost: 5.99, retail: 9.99, packageSize: 30.5, unit: 'oz', casePack: 6, storage: 'Room Temperature', description: 'Medium roast ground coffee' },
  { name: 'Pike Place Roast', brand: 'Starbucks', subcategory: 'Coffee & Tea', category: 'Beverages', cost: 7.99, retail: 12.99, packageSize: 20, unit: 'oz', casePack: 6, storage: 'Room Temperature', description: 'Smooth, balanced medium roast' },
  { name: 'K-Cup Breakfast Blend', brand: 'Folgers', subcategory: 'Coffee & Tea', category: 'Beverages', cost: 8.99, retail: 14.99, packageSize: 12, unit: 'pack', casePack: 6, storage: 'Room Temperature', description: 'Compatible with Keurig brewers' },
  
  // Beverages - Juice
  { name: 'Orange Juice', brand: 'Tropicana', subcategory: 'Juice', category: 'Beverages', cost: 3.50, retail: 5.99, packageSize: 52, unit: 'oz', casePack: 8, storage: 'Refrigerated', description: '100% pure squeezed orange juice' },
  { name: 'Apple Juice', brand: 'Minute Maid', subcategory: 'Juice', category: 'Beverages', cost: 2.50, retail: 4.49, packageSize: 64, unit: 'oz', casePack: 8, storage: 'Refrigerated', description: '100% apple juice' },
  { name: 'Cranberry Juice Cocktail', brand: 'Ocean Spray', subcategory: 'Juice', category: 'Beverages', cost: 2.80, retail: 4.99, packageSize: 64, unit: 'oz', casePack: 8, storage: 'Room Temperature', description: 'Cranberry juice blend' },
  
  // Pantry Staples - Pasta & Rice
  { name: 'Spaghetti Pasta', brand: 'Barilla', subcategory: 'Pasta & Rice', category: 'Pantry Staples', cost: 1.20, retail: 1.99, packageSize: 16, unit: 'oz', casePack: 12, storage: 'Dry/Shelf-stable', description: 'Classic spaghetti pasta' },
  { name: 'Penne Pasta', brand: 'Barilla', subcategory: 'Pasta & Rice', category: 'Pantry Staples', cost: 1.20, retail: 1.99, packageSize: 16, unit: 'oz', casePack: 12, storage: 'Dry/Shelf-stable', description: 'Penne rigate pasta' },
  { name: 'Elbow Macaroni', brand: 'Mueller\'s', subcategory: 'Pasta & Rice', category: 'Pantry Staples', cost: 0.90, retail: 1.49, packageSize: 16, unit: 'oz', casePack: 12, storage: 'Dry/Shelf-stable', description: 'Elbow macaroni pasta' },
  { name: 'White Rice Long Grain', brand: 'Uncle Ben\'s', subcategory: 'Pasta & Rice', category: 'Pantry Staples', cost: 2.50, retail: 4.49, packageSize: 32, unit: 'oz', casePack: 12, storage: 'Dry/Shelf-stable', description: 'Enriched long grain white rice' },
  { name: 'Brown Rice', brand: 'Uncle Ben\'s', subcategory: 'Pasta & Rice', category: 'Pantry Staples', cost: 2.80, retail: 4.99, packageSize: 32, unit: 'oz', casePack: 12, storage: 'Dry/Shelf-stable', description: 'Whole grain brown rice' },
  
  // Pantry Staples - Canned Goods
  { name: 'Tomato Sauce', brand: 'Hunt\'s', subcategory: 'Canned Goods', category: 'Pantry Staples', cost: 0.80, retail: 1.29, packageSize: 15, unit: 'oz', casePack: 24, storage: 'Dry/Shelf-stable', description: 'No salt added tomato sauce' },
  { name: 'Diced Tomatoes', brand: 'Hunt\'s', subcategory: 'Canned Goods', category: 'Pantry Staples', cost: 1.00, retail: 1.79, packageSize: 14.5, unit: 'oz', casePack: 24, storage: 'Dry/Shelf-stable', description: 'Fire roasted diced tomatoes' },
  { name: 'Black Beans', brand: 'Campbell\'s', subcategory: 'Canned Goods', category: 'Pantry Staples', cost: 0.70, retail: 1.19, packageSize: 15, unit: 'oz', casePack: 24, storage: 'Dry/Shelf-stable', description: 'Low sodium black beans' },
  { name: 'Corn Whole Kernel', brand: 'Campbell\'s', subcategory: 'Canned Goods', category: 'Pantry Staples', cost: 0.60, retail: 0.99, packageSize: 15, unit: 'oz', casePack: 24, storage: 'Dry/Shelf-stable', description: 'Sweet corn' },
  { name: 'Green Beans', brand: 'Campbell\'s', subcategory: 'Canned Goods', category: 'Pantry Staples', cost: 0.60, retail: 0.99, packageSize: 14.5, unit: 'oz', casePack: 24, storage: 'Dry/Shelf-stable', description: 'Cut green beans' },
  { name: 'Chicken Noodle Soup', brand: 'Campbell\'s', subcategory: 'Canned Goods', category: 'Pantry Staples', cost: 1.20, retail: 1.99, packageSize: 10.75, unit: 'oz', casePack: 12, storage: 'Dry/Shelf-stable', description: 'Condensed soup' },
  { name: 'Tomato Soup', brand: 'Campbell\'s', subcategory: 'Canned Goods', category: 'Pantry Staples', cost: 1.20, retail: 1.99, packageSize: 10.75, unit: 'oz', casePack: 12, storage: 'Dry/Shelf-stable', description: 'Classic tomato soup' },
  { name: 'Minestrone Soup', brand: 'Progresso', subcategory: 'Canned Goods', category: 'Pantry Staples', cost: 1.80, retail: 2.99, packageSize: 18.5, unit: 'oz', casePack: 12, storage: 'Dry/Shelf-stable', description: 'Italian-style vegetable soup' },
  { name: 'Tuna Chunk Light', brand: 'Ocean Spray', subcategory: 'Canned Goods', category: 'Pantry Staples', cost: 1.00, retail: 1.79, packageSize: 5, unit: 'oz', casePack: 24, storage: 'Dry/Shelf-stable', description: 'Chunk light tuna in water' },
  
  // Pantry Staples - Baking Supplies
  { name: 'All-Purpose Flour', brand: 'General Mills', subcategory: 'Baking Supplies', category: 'Pantry Staples', cost: 2.50, retail: 4.49, packageSize: 5, unit: 'lb', casePack: 8, storage: 'Dry/Shelf-stable', description: 'Enriched bleached flour' },
  { name: 'Granulated Sugar', brand: 'General Mills', subcategory: 'Baking Supplies', category: 'Pantry Staples', cost: 2.80, retail: 4.99, packageSize: 4, unit: 'lb', casePack: 10, storage: 'Dry/Shelf-stable', description: 'Pure cane sugar' },
  { name: 'Brown Sugar', brand: 'General Mills', subcategory: 'Baking Supplies', category: 'Pantry Staples', cost: 2.20, retail: 3.99, packageSize: 2, unit: 'lb', casePack: 12, storage: 'Dry/Shelf-stable', description: 'Light brown sugar' },
  { name: 'Baking Powder', brand: 'General Mills', subcategory: 'Baking Supplies', category: 'Pantry Staples', cost: 1.50, retail: 2.49, packageSize: 10, unit: 'oz', casePack: 12, storage: 'Dry/Shelf-stable', description: 'Double acting baking powder' },
  { name: 'Vanilla Extract', brand: 'General Mills', subcategory: 'Baking Supplies', category: 'Pantry Staples', cost: 3.50, retail: 5.99, packageSize: 2, unit: 'oz', casePack: 12, storage: 'Dry/Shelf-stable', description: 'Pure vanilla extract' },
  
  // Snacks - Chips & Crackers
  { name: 'Classic Potato Chips', brand: 'Lay\'s', subcategory: 'Chips & Crackers', category: 'Snacks', cost: 2.50, retail: 3.99, packageSize: 10, unit: 'oz', casePack: 12, storage: 'Dry/Shelf-stable', description: 'Original flavor chips' },
  { name: 'Barbecue Potato Chips', brand: 'Lay\'s', subcategory: 'Chips & Crackers', category: 'Snacks', cost: 2.50, retail: 3.99, packageSize: 10, unit: 'oz', casePack: 12, storage: 'Dry/Shelf-stable', description: 'BBQ flavored chips' },
  { name: 'Sour Cream & Onion Chips', brand: 'Lay\'s', subcategory: 'Chips & Crackers', category: 'Snacks', cost: 2.50, retail: 3.99, packageSize: 10, unit: 'oz', casePack: 12, storage: 'Dry/Shelf-stable', description: 'Sour cream & onion flavor' },
  { name: 'Nacho Cheese Doritos', brand: 'Doritos', subcategory: 'Chips & Crackers', category: 'Snacks', cost: 2.80, retail: 4.49, packageSize: 11, unit: 'oz', casePack: 12, storage: 'Dry/Shelf-stable', description: 'Nacho cheese tortilla chips' },
  { name: 'Cool Ranch Doritos', brand: 'Doritos', subcategory: 'Chips & Crackers', category: 'Snacks', cost: 2.80, retail: 4.49, packageSize: 11, unit: 'oz', casePack: 12, storage: 'Dry/Shelf-stable', description: 'Cool Ranch flavor' },
  { name: 'Ritz Crackers', brand: 'Kraft', subcategory: 'Chips & Crackers', category: 'Snacks', cost: 2.00, retail: 3.49, packageSize: 13.7, unit: 'oz', casePack: 12, storage: 'Dry/Shelf-stable', description: 'Buttery round crackers' },
  { name: 'Wheat Thins', brand: 'Kraft', subcategory: 'Chips & Crackers', category: 'Snacks', cost: 2.20, retail: 3.79, packageSize: 9, unit: 'oz', casePack: 12, storage: 'Dry/Shelf-stable', description: 'Whole grain wheat crackers' },
  
  // Snacks - Candy & Chocolate
  { name: 'M&M\'s Milk Chocolate', brand: 'Nestle', subcategory: 'Candy & Chocolate', category: 'Snacks', cost: 2.00, retail: 3.49, packageSize: 10.7, unit: 'oz', casePack: 12, storage: 'Dry/Shelf-stable', description: 'Milk chocolate candies' },
  { name: 'Snickers Bar', brand: 'Nestle', subcategory: 'Candy & Chocolate', category: 'Snacks', cost: 1.50, retail: 2.49, packageSize: 3.29, unit: 'oz', casePack: 24, storage: 'Dry/Shelf-stable', description: 'Chocolate peanut nougat bar' },
  { name: 'Reese\'s Peanut Butter Cups', brand: 'Nestle', subcategory: 'Candy & Chocolate', category: 'Snacks', cost: 1.80, retail: 2.99, packageSize: 6, unit: 'pack', casePack: 24, storage: 'Dry/Shelf-stable', description: 'Chocolate peanut butter cups' },
  { name: 'Kit Kat Bar', brand: 'Nestle', subcategory: 'Candy & Chocolate', category: 'Snacks', cost: 1.50, retail: 2.49, packageSize: 3, unit: 'oz', casePack: 24, storage: 'Dry/Shelf-stable', description: 'Crispy wafer chocolate bar' },
  
  // Frozen Foods - Frozen Meals
  { name: 'Stouffer\'s Lasagna', brand: 'Nestle', subcategory: 'Frozen Meals', category: 'Frozen Foods', cost: 4.50, retail: 7.99, packageSize: 38, unit: 'oz', casePack: 8, storage: 'Frozen', description: 'Classic meat lasagna' },
  { name: 'Lean Cuisine Chicken', brand: 'Nestle', subcategory: 'Frozen Meals', category: 'Frozen Foods', cost: 2.50, retail: 3.99, packageSize: 9, unit: 'oz', casePack: 12, storage: 'Frozen', description: 'Grilled chicken meal' },
  { name: 'Hungry Man Turkey Dinner', brand: 'Nestle', subcategory: 'Frozen Meals', category: 'Frozen Foods', cost: 3.50, retail: 5.99, packageSize: 16, unit: 'oz', casePack: 8, storage: 'Frozen', description: 'Complete turkey dinner' },
  
  // Frozen Foods - Ice Cream
  { name: 'Vanilla Ice Cream', brand: 'Ben & Jerry\'s', subcategory: 'Ice Cream', category: 'Frozen Foods', cost: 3.50, retail: 5.99, packageSize: 16, unit: 'oz', casePack: 8, storage: 'Frozen', description: 'Classic vanilla ice cream' },
  { name: 'Chocolate Fudge Brownie', brand: 'Ben & Jerry\'s', subcategory: 'Ice Cream', category: 'Frozen Foods', cost: 3.80, retail: 6.49, packageSize: 16, unit: 'oz', casePack: 8, storage: 'Frozen', description: 'Chocolate with fudge brownies' },
  { name: 'Strawberry Ice Cream', brand: 'Häagen-Dazs', subcategory: 'Ice Cream', category: 'Frozen Foods', cost: 4.00, retail: 6.99, packageSize: 14, unit: 'oz', casePack: 8, storage: 'Frozen', description: 'Premium strawberry ice cream' },
  { name: 'Vanilla Bean', brand: 'Häagen-Dazs', subcategory: 'Ice Cream', category: 'Frozen Foods', cost: 4.00, retail: 6.99, packageSize: 14, unit: 'oz', casePack: 8, storage: 'Frozen', description: 'Vanilla bean ice cream' },
  
  // Condiments & Sauces - Ketchup & Mustard
  { name: 'Tomato Ketchup', brand: 'Heinz', subcategory: 'Ketchup & Mustard', category: 'Condiments & Sauces', cost: 2.20, retail: 3.49, packageSize: 32, unit: 'oz', casePack: 12, storage: 'Dry/Shelf-stable', description: 'Classic tomato ketchup' },
  { name: 'Yellow Mustard', brand: 'Heinz', subcategory: 'Ketchup & Mustard', category: 'Condiments & Sauces', cost: 1.50, retail: 2.49, packageSize: 20, unit: 'oz', casePack: 12, storage: 'Dry/Shelf-stable', description: 'Classic yellow mustard' },
  { name: 'Dijon Mustard', brand: 'Heinz', subcategory: 'Ketchup & Mustard', category: 'Condiments & Sauces', cost: 2.00, retail: 3.29, packageSize: 12, unit: 'oz', casePack: 12, storage: 'Dry/Shelf-stable', description: 'Stone ground Dijon' },
  
  // Condiments & Sauces - Salad Dressing
  { name: 'Ranch Dressing', brand: 'Kraft', subcategory: 'Salad Dressing', category: 'Condiments & Sauces', cost: 2.50, retail: 3.99, packageSize: 16, unit: 'oz', casePack: 12, storage: 'Refrigerated', description: 'Creamy ranch dressing' },
  { name: 'Italian Dressing', brand: 'Kraft', subcategory: 'Salad Dressing', category: 'Condiments & Sauces', cost: 2.20, retail: 3.49, packageSize: 16, unit: 'oz', casePack: 12, storage: 'Dry/Shelf-stable', description: 'Zesty Italian dressing' },
  { name: 'Caesar Dressing', brand: 'Kraft', subcategory: 'Salad Dressing', category: 'Condiments & Sauces', cost: 2.80, retail: 4.29, packageSize: 16, unit: 'oz', casePack: 12, storage: 'Refrigerated', description: 'Creamy Caesar dressing' },
  
  // Breakfast & Cereal - Cereal
  { name: 'Cheerios Original', brand: 'General Mills', subcategory: 'Cereal', category: 'Breakfast & Cereal', cost: 3.50, retail: 5.49, packageSize: 18, unit: 'oz', casePack: 10, storage: 'Dry/Shelf-stable', description: 'Whole grain oat cereal' },
  { name: 'Frosted Flakes', brand: 'Kellogg\'s', subcategory: 'Cereal', category: 'Breakfast & Cereal', cost: 3.20, retail: 4.99, packageSize: 24, unit: 'oz', casePack: 10, storage: 'Dry/Shelf-stable', description: 'Sugar frosted corn flakes' },
  { name: 'Corn Flakes', brand: 'Kellogg\'s', subcategory: 'Cereal', category: 'Breakfast & Cereal', cost: 2.80, retail: 4.29, packageSize: 18, unit: 'oz', casePack: 10, storage: 'Dry/Shelf-stable', description: 'Original corn flakes' },
  { name: 'Fruit Loops', brand: 'Kellogg\'s', subcategory: 'Cereal', category: 'Breakfast & Cereal', cost: 3.00, retail: 4.79, packageSize: 19.4, unit: 'oz', casePack: 10, storage: 'Dry/Shelf-stable', description: 'Fruit flavored loops' },
  
  // Breakfast & Cereal - Oatmeal
  { name: 'Quick Oats', brand: 'Quaker', subcategory: 'Oatmeal', category: 'Breakfast & Cereal', cost: 3.50, retail: 5.99, packageSize: 42, unit: 'oz', casePack: 12, storage: 'Dry/Shelf-stable', description: 'Quick cooking oats' },
  { name: 'Instant Oatmeal Maple', brand: 'Quaker', subcategory: 'Oatmeal', category: 'Breakfast & Cereal', cost: 3.20, retail: 5.49, packageSize: 15.1, unit: 'oz', casePack: 12, storage: 'Dry/Shelf-stable', description: 'Maple & brown sugar flavor' },
]

async function main() {
  console.log('Starting comprehensive food database seed...')

  // Create all categories
  console.log('\nCreating categories...')
  const categoryMap = new Map()
  for (const categoryName of categories) {
    const category = await prisma.category.create({
      data: { name: categoryName },
    })
    categoryMap.set(categoryName, category)
    console.log(`  ✓ ${categoryName}`)
  }

  // Create all subcategories
  console.log('\nCreating subcategories...')
  const subcategoryMap = new Map()
  for (const sub of subcategories) {
    const subcategory = await prisma.subcategory.create({
      data: { name: sub.name },
    })
    subcategoryMap.set(sub.name, subcategory)
    console.log(`  ✓ ${sub.name}`)
  }

  // Create all brands
  console.log('\nCreating brands...')
  const brandMap = new Map()
  for (const brandName of brands) {
    const brand = await prisma.brand.create({
      data: { name: brandName },
    })
    brandMap.set(brandName, brand)
    console.log(`  ✓ ${brandName}`)
  }

  // Create all products
  console.log('\nCreating products...')
  let productCount = 0
  for (const prod of products) {
    const category = categoryMap.get(prod.category)
    const subcategory = subcategoryMap.get(prod.subcategory)
    const brand = brandMap.get(prod.brand)

    if (!category) {
      console.log(`  ✗ Skipping ${prod.name}: Category not found`)
      continue
    }

    const sku = `SKU-${Math.floor(Math.random() * 90000) + 10000}`
    
    const product = await prisma.product.create({
      data: {
        sku,
        name: prod.name,
        description: prod.description,
        cost: prod.cost,
        retailPrice: prod.retail,
        categoryId: category.id,
        subcategoryId: subcategory?.id || null,
        brandId: brand?.id || null,
        unitOfMeasurement: prod.unit,
        packageSize: prod.packageSize,
        casePackCount: prod.casePack,
        storageType: prod.storage,
      },
    })

    // Create initial changelog
    await prisma.productChangeLog.create({
      data: {
        productId: product.id,
        changeType: 'created',
        newCost: prod.cost,
        newRetail: prod.retail,
        newMargin: calculateMargin(prod.cost, prod.retail),
        newDescription: prod.description,
        changedAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000), // Within last 60 days
      },
    })

    // Randomly add 0-2 price changes for some realism
    const numChanges = Math.floor(Math.random() * 3)
    let currentCost = prod.cost
    let currentRetail = prod.retail

    for (let i = 0; i < numChanges; i++) {
      const changeTypeRandom = Math.random()
      let changeType = 'price_increase'
      let newCost = currentCost
      let newRetail = currentRetail

      if (changeTypeRandom < 0.4) {
        // Price increase
        newRetail = parseFloat((currentRetail * (1 + Math.random() * 0.15)).toFixed(2))
        changeType = 'price_increase'
      } else if (changeTypeRandom < 0.7) {
        // Cost change
        newCost = parseFloat((currentCost * (1 + (Math.random() - 0.5) * 0.2)).toFixed(2))
        changeType = 'cost_change'
      } else {
        // Price decrease
        newRetail = parseFloat((currentRetail * (1 - Math.random() * 0.1)).toFixed(2))
        changeType = 'price_decrease'
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
          changedAt: new Date(Date.now() - Math.random() * 45 * 24 * 60 * 60 * 1000), // Within last 45 days
        },
      })

      currentCost = newCost
      currentRetail = newRetail
    }

    // Update product with final prices if there were changes
    if (numChanges > 0) {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          cost: currentCost,
          retailPrice: currentRetail,
        },
      })
    }

    productCount++
    console.log(`  ✓ ${productCount}/100: ${prod.name}`)
  }

  console.log('\n✅ Seed completed successfully!')
  console.log(`\nSummary:`)
  console.log(`  Categories: ${categories.length}`)
  console.log(`  Subcategories: ${subcategories.length}`)
  console.log(`  Brands: ${brands.length}`)
  console.log(`  Products: ${productCount}`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })