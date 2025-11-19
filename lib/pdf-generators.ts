// lib/pdf-generators.ts
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type Category = {
  id: string
  name: string
}

type Subcategory = {
  id: string
  name: string
}

type Brand = {
  id: string
  name: string
}

type Vendor = {
  id: string
  name: string
}

type Product = {
  id: string
  sku: string
  name: string
  cost: number
  retailPrice: number
  category: Category
  subcategory: Subcategory | null
  brand: Brand | null
  vendor?: Vendor | null
  inventory?: {
    quantityOnHand: number
    reorderLevel: number
    reorderQuantity: number
  } | null
}

type ProductWithMetrics = Product & {
  profit: number
  margin: number
  markup: number
}

type FilterConfig = {
  categories?: string[]
  subcategories?: string[]
  brands?: string[]
  vendors?: string[]
  sortBy?: 'profit' | 'margin' | 'markup' | 'name'
  sortOrder?: 'asc' | 'desc'
  stockStatus?: 'all' | 'in-stock' | 'low-stock' | 'out-of-stock'
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calculateMetrics(product: Product): ProductWithMetrics {
  const profit = product.retailPrice - product.cost
  const margin = product.retailPrice > 0 
    ? ((product.retailPrice - product.cost) / product.retailPrice) * 100 
    : 0
  const markup = product.cost > 0 
    ? ((product.retailPrice - product.cost) / product.cost) * 100 
    : 0

  return {
    ...product,
    profit,
    margin,
    markup,
  }
}

function applyFilters(products: Product[], filters: FilterConfig): ProductWithMetrics[] {
  return products
    .filter(product => {
      // Category filter
      if (filters.categories && filters.categories.length > 0) {
        if (!filters.categories.includes(product.category.id)) return false
      }

      // Subcategory filter
      if (filters.subcategories && filters.subcategories.length > 0) {
        if (!product.subcategory || !filters.subcategories.includes(product.subcategory.id)) return false
      }

      // Brand filter
      if (filters.brands && filters.brands.length > 0) {
        if (!product.brand || !filters.brands.includes(product.brand.id)) return false
      }

      // Vendor filter
      if (filters.vendors && filters.vendors.length > 0) {
        if (!product.vendor || !filters.vendors.includes(product.vendor.id)) return false
      }

      // Stock status filter
      if (filters.stockStatus && filters.stockStatus !== 'all' && product.inventory) {
        const qty = product.inventory.quantityOnHand
        const reorder = product.inventory.reorderLevel

        if (filters.stockStatus === 'out-of-stock' && qty > 0) return false
        if (filters.stockStatus === 'low-stock' && (qty === 0 || qty > reorder)) return false
        if (filters.stockStatus === 'in-stock' && qty <= reorder) return false
      }

      return true
    })
    .map(calculateMetrics)
    .sort((a, b) => {
      const sortBy = filters.sortBy || 'profit'
      const sortOrder = filters.sortOrder || 'desc'
      
      let aValue: number | string = a[sortBy as keyof ProductWithMetrics] as number
      let bValue: number | string = b[sortBy as keyof ProductWithMetrics] as number

      if (sortBy === 'name') {
        aValue = a.name
        bValue = b.name
        return sortOrder === 'desc' 
          ? bValue.localeCompare(aValue) 
          : aValue.localeCompare(bValue)
      }

      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue
    })
}

// ============================================================================
// PDF GENERATOR: PRODUCT PROFITABILITY
// ============================================================================

export async function generateProductProfitabilityPDF(
  products: Product[],
  filters: FilterConfig = {}
): Promise<jsPDF> {
  const filteredProducts = applyFilters(products, filters)

  const doc = new jsPDF({
    orientation: 'landscape',
  })

  // Header
  doc.setFontSize(18)
  doc.text('Product Profitability Report', 14, 20)

  // Summary stats
  const totalProducts = filteredProducts.length
  const avgProfit = totalProducts > 0
    ? filteredProducts.reduce((sum, p) => sum + p.profit, 0) / totalProducts
    : 0
  const avgMargin = totalProducts > 0
    ? filteredProducts.reduce((sum, p) => sum + p.margin, 0) / totalProducts
    : 0

  doc.setFontSize(10)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28)
  doc.text(`Total Products: ${totalProducts}`, 14, 33)
  doc.text(`Average Profit: $${avgProfit.toFixed(2)}`, 14, 38)
  doc.text(`Average Margin: ${avgMargin.toFixed(2)}%`, 14, 43)

  // Table
  const tableData = filteredProducts.map((product, index) => [
    `#${index + 1}`,
    product.sku,
    product.name,
    product.brand?.name || '-',
    product.category.name,
    product.subcategory?.name || '-',
    `$${product.cost.toFixed(2)}`,
    `$${product.retailPrice.toFixed(2)}`,
    `$${product.profit.toFixed(2)}`,
    `${product.margin.toFixed(2)}%`,
    `${product.markup.toFixed(2)}%`,
  ])

  autoTable(doc, {
    startY: 50,
    head: [[
      'Rank',
      'SKU',
      'Product',
      'Brand',
      'Category',
      'Subcategory',
      'Cost',
      'Retail',
      'Profit',
      'Margin %',
      'Markup %',
    ]],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [34, 197, 94],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 25 },
      2: { cellWidth: 50 },
      3: { cellWidth: 25 },
      4: { cellWidth: 25 },
      5: { cellWidth: 25 },
      6: { cellWidth: 20 },
      7: { cellWidth: 20 },
      8: { cellWidth: 20 },
      9: { cellWidth: 20 },
      10: { cellWidth: 20 },
    },
  })

  return doc
}

// ============================================================================
// PDF GENERATOR: CATEGORY ANALYSIS
// ============================================================================

export async function generateCategoryAnalysisPDF(
  products: Product[],
  filters: FilterConfig = {}
): Promise<jsPDF> {
  // First apply any pre-filters to products
  const filteredProducts = applyFilters(products, filters)

  // Group by category
  const categoryMap = new Map<string, ProductWithMetrics[]>()
  filteredProducts.forEach(product => {
    if (!categoryMap.has(product.category.id)) {
      categoryMap.set(product.category.id, [])
    }
    categoryMap.get(product.category.id)!.push(product)
  })

  // Calculate category metrics
  const categoryMetrics = Array.from(categoryMap.entries()).map(([_, products]) => {
    const avgMargin = products.reduce((sum, p) => sum + p.margin, 0) / products.length
    const avgMarkup = products.reduce((sum, p) => sum + p.markup, 0) / products.length
    const avgProfit = products.reduce((sum, p) => sum + p.profit, 0) / products.length

    return {
      category: products[0].category,
      productCount: products.length,
      avgMargin,
      avgMarkup,
      avgProfit,
    }
  }).sort((a, b) => b.avgMargin - a.avgMargin)

  const doc = new jsPDF({
    orientation: 'landscape',
  })

  // Header
  doc.setFontSize(18)
  doc.text('Category Profitability Analysis', 14, 20)

  doc.setFontSize(10)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28)
  doc.text(`Total Categories: ${categoryMetrics.length}`, 14, 33)

  // Table
  const tableData = categoryMetrics.map((cat, index) => [
    `#${index + 1}`,
    cat.category.name,
    cat.productCount.toString(),
    `${cat.avgMargin.toFixed(2)}%`,
    `${cat.avgMarkup.toFixed(2)}%`,
    `$${cat.avgProfit.toFixed(2)}`,
  ])

  autoTable(doc, {
    startY: 40,
    head: [[
      'Rank',
      'Category',
      'Products',
      'Avg Margin %',
      'Avg Markup %',
      'Avg Profit/Unit',
    ]],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
  })

  return doc
}

// ============================================================================
// PDF GENERATOR: SUBCATEGORY ANALYSIS
// ============================================================================

export async function generateSubcategoryAnalysisPDF(
  products: Product[],
  filters: FilterConfig = {}
): Promise<jsPDF> {
  const filteredProducts = applyFilters(products, filters)

  // Group by subcategory
  const subcategoryMap = new Map<string, ProductWithMetrics[]>()
  filteredProducts.forEach(product => {
    if (product.subcategory) {
      if (!subcategoryMap.has(product.subcategory.id)) {
        subcategoryMap.set(product.subcategory.id, [])
      }
      subcategoryMap.get(product.subcategory.id)!.push(product)
    }
  })

  // Calculate subcategory metrics
  const subcategoryMetrics = Array.from(subcategoryMap.entries()).map(([_, products]) => {
    const avgMargin = products.reduce((sum, p) => sum + p.margin, 0) / products.length
    const avgMarkup = products.reduce((sum, p) => sum + p.markup, 0) / products.length
    const avgProfit = products.reduce((sum, p) => sum + p.profit, 0) / products.length

    return {
      subcategory: products[0].subcategory!,
      category: products[0].category,
      productCount: products.length,
      avgMargin,
      avgMarkup,
      avgProfit,
    }
  }).sort((a, b) => b.avgMargin - a.avgMargin)

  const doc = new jsPDF({
    orientation: 'landscape',
  })

  // Header
  doc.setFontSize(18)
  doc.text('Subcategory Profitability Analysis', 14, 20)

  doc.setFontSize(10)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28)
  doc.text(`Total Subcategories: ${subcategoryMetrics.length}`, 14, 33)

  // Table
  const tableData = subcategoryMetrics.map((sub, index) => [
    `#${index + 1}`,
    sub.subcategory.name,
    sub.category.name,
    sub.productCount.toString(),
    `${sub.avgMargin.toFixed(2)}%`,
    `${sub.avgMarkup.toFixed(2)}%`,
    `$${sub.avgProfit.toFixed(2)}`,
  ])

  autoTable(doc, {
    startY: 40,
    head: [[
      'Rank',
      'Subcategory',
      'Category',
      'Products',
      'Avg Margin %',
      'Avg Markup %',
      'Avg Profit/Unit',
    ]],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [249, 115, 22],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
  })

  return doc
}

// ============================================================================
// PDF GENERATOR: BRAND ANALYSIS
// ============================================================================

export async function generateBrandAnalysisPDF(
  products: Product[],
  filters: FilterConfig = {}
): Promise<jsPDF> {
  const filteredProducts = applyFilters(products, filters)

  // Group by brand
  const brandMap = new Map<string, ProductWithMetrics[]>()
  filteredProducts.forEach(product => {
    if (product.brand) {
      if (!brandMap.has(product.brand.id)) {
        brandMap.set(product.brand.id, [])
      }
      brandMap.get(product.brand.id)!.push(product)
    }
  })

  // Calculate brand metrics
  const brandMetrics = Array.from(brandMap.entries()).map(([_, products]) => {
    const avgMargin = products.reduce((sum, p) => sum + p.margin, 0) / products.length
    const avgMarkup = products.reduce((sum, p) => sum + p.markup, 0) / products.length
    const avgProfit = products.reduce((sum, p) => sum + p.profit, 0) / products.length

    return {
      brand: products[0].brand!,
      productCount: products.length,
      avgMargin,
      avgMarkup,
      avgProfit,
    }
  }).sort((a, b) => b.avgMargin - a.avgMargin)

  const doc = new jsPDF({
    orientation: 'landscape',
  })

  // Header
  doc.setFontSize(18)
  doc.text('Brand Profitability Analysis', 14, 20)

  doc.setFontSize(10)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28)
  doc.text(`Total Brands: ${brandMetrics.length}`, 14, 33)

  // Table
  const tableData = brandMetrics.map((brand, index) => [
    `#${index + 1}`,
    brand.brand.name,
    brand.productCount.toString(),
    `${brand.avgMargin.toFixed(2)}%`,
    `${brand.avgMarkup.toFixed(2)}%`,
    `$${brand.avgProfit.toFixed(2)}`,
  ])

  autoTable(doc, {
    startY: 40,
    head: [[
      'Rank',
      'Brand',
      'Products',
      'Avg Margin %',
      'Avg Markup %',
      'Avg Profit/Unit',
    ]],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [147, 51, 234],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
  })

  return doc
}

// ============================================================================
// PDF GENERATOR: VENDOR ANALYSIS
// ============================================================================

export async function generateVendorAnalysisPDF(
  products: Product[],
  filters: FilterConfig = {}
): Promise<jsPDF> {
  const filteredProducts = applyFilters(products, filters)

  // Group by vendor
  const vendorMap = new Map<string, ProductWithMetrics[]>()
  filteredProducts.forEach(product => {
    if (product.vendor) {
      if (!vendorMap.has(product.vendor.id)) {
        vendorMap.set(product.vendor.id, [])
      }
      vendorMap.get(product.vendor.id)!.push(product)
    }
  })

  // Calculate vendor metrics
  const vendorMetrics = Array.from(vendorMap.entries()).map(([_, products]) => {
    const avgMargin = products.reduce((sum, p) => sum + p.margin, 0) / products.length
    const avgMarkup = products.reduce((sum, p) => sum + p.markup, 0) / products.length
    const avgProfit = products.reduce((sum, p) => sum + p.profit, 0) / products.length

    return {
      vendor: products[0].vendor!,
      productCount: products.length,
      avgMargin,
      avgMarkup,
      avgProfit,
    }
  }).sort((a, b) => b.avgMargin - a.avgMargin)

  const doc = new jsPDF({
    orientation: 'landscape',
  })

  // Header
  doc.setFontSize(18)
  doc.text('Vendor Profitability Analysis', 14, 20)

  doc.setFontSize(10)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28)
  doc.text(`Total Vendors: ${vendorMetrics.length}`, 14, 33)

  // Table
  const tableData = vendorMetrics.map((vendor, index) => [
    `#${index + 1}`,
    vendor.vendor.name,
    vendor.productCount.toString(),
    `${vendor.avgMargin.toFixed(2)}%`,
    `${vendor.avgMarkup.toFixed(2)}%`,
    `$${vendor.avgProfit.toFixed(2)}`,
  ])

  autoTable(doc, {
    startY: 40,
    head: [[
      'Rank',
      'Vendor',
      'Products',
      'Avg Margin %',
      'Avg Markup %',
      'Avg Profit/Unit',
    ]],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [16, 185, 129],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
  })

  return doc
}

// ============================================================================
// PDF GENERATOR: INVENTORY STATUS
// ============================================================================

export async function generateInventoryStatusPDF(
  products: Product[],
  filters: FilterConfig = {}
): Promise<jsPDF> {
  const filteredProducts = applyFilters(products, filters)
    .filter(p => p.inventory) // Only products with inventory
    .sort((a, b) => {
      const aQty = a.inventory?.quantityOnHand || 0
      const bQty = b.inventory?.quantityOnHand || 0
      return aQty - bQty // Sort by quantity ascending (lowest first)
    })

  const doc = new jsPDF({
    orientation: 'landscape',
  })

  // Header
  doc.setFontSize(18)
  doc.text('Inventory Status Report', 14, 20)

  // Calculate summary stats
  const totalProducts = filteredProducts.length
  const outOfStock = filteredProducts.filter(p => (p.inventory?.quantityOnHand || 0) === 0).length
  const lowStock = filteredProducts.filter(p => {
    const qty = p.inventory?.quantityOnHand || 0
    const reorder = p.inventory?.reorderLevel || 0
    return qty > 0 && qty <= reorder
  }).length

  doc.setFontSize(10)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28)
  doc.text(`Total Products: ${totalProducts}`, 14, 33)
  doc.text(`Out of Stock: ${outOfStock}`, 14, 38)
  doc.text(`Low Stock: ${lowStock}`, 14, 43)

  // Table
  const tableData = filteredProducts.map(product => {
    const qty = product.inventory?.quantityOnHand || 0
    const reorder = product.inventory?.reorderLevel || 0
    const reorderQty = product.inventory?.reorderQuantity || 0
    
    let status = 'Normal'
    if (qty === 0) status = 'Out of Stock'
    else if (qty <= reorder) status = 'Low Stock'

    return [
      product.sku,
      product.name,
      product.category.name,
      product.brand?.name || '-',
      qty.toString(),
      reorder.toString(),
      reorderQty.toString(),
      status,
    ]
  })

  autoTable(doc, {
    startY: 50,
    head: [[
      'SKU',
      'Product',
      'Category',
      'Brand',
      'On Hand',
      'Reorder Level',
      'Reorder Qty',
      'Status',
    ]],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [6, 182, 212],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 60 },
      2: { cellWidth: 30 },
      3: { cellWidth: 30 },
      4: { cellWidth: 20 },
      5: { cellWidth: 25 },
      6: { cellWidth: 25 },
      7: { cellWidth: 30 },
    },
  })

  return doc
}