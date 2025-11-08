'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ChangeLogTable from '@/app/components/ChangeLogTable'

export const dynamic = 'force-dynamic';

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

type Product = {
  id: string
  sku: string
  name: string
  description: string | null
  cost: number
  retailPrice: number
  category: Category
  subcategory: Subcategory | null
  brand: Brand | null
  unitOfMeasurement: string | null
  packageSize: number | null
  casePackCount: number | null
  storageType: string | null
  purchaseOrderItems: any[]
  changeLogs: any[]
  inventory: {
    quantityOnHand: number
  } | null
}

function calculateMarkup(cost: number, retail: number): string {
  if (cost === 0) return '0.00'
  return (((retail - cost) / cost) * 100).toFixed(2)
}

function calculateMargin(cost: number, retail: number): string {
  if (retail === 0) return '0.00'
  return (((retail - cost) / retail) * 100).toFixed(2)
}

function calculateProfit(cost: number, retail: number): string {
  return (retail - cost).toFixed(2)
}

export default function ViewProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [expandedPurchaseHistory, setExpandedPurchaseHistory] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/products')
        const data = await response.json()
        
        // Ensure data is an array
        if (Array.isArray(data)) {
          setProducts(data)
        } else {
          console.error('API returned non-array data:', data)
          setProducts([])
        }
      } catch (error) {
        console.error('Error fetching products:', error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const togglePurchaseHistory = (productId: string) => {
    setExpandedPurchaseHistory(prev => prev === productId ? null : productId)
  }

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const toggleSubcategory = (subcategoryId: string) => {
    setSelectedSubcategories(prev =>
      prev.includes(subcategoryId)
        ? prev.filter(id => id !== subcategoryId)
        : [...prev, subcategoryId]
    )
  }

  const toggleBrand = (brandId: string) => {
    setSelectedBrands(prev =>
      prev.includes(brandId)
        ? prev.filter(id => id !== brandId)
        : [...prev, brandId]
    )
  }

  // Extract unique categories, subcategories, and brands
  const allCategories = Array.from(
    new Map(products.filter(p => p.category).map(p => [p.category.id, p.category])).values()
  )

  const allSubcategories = Array.from(
    new Map(
      products
        .filter(p => p.subcategory)
        .map(p => [p.subcategory!.id, p.subcategory!])
    ).values()
  )

  const allBrands = Array.from(
    new Map(
      products
        .filter(p => p.brand)
        .map(p => [p.brand!.id, p.brand!])
    ).values()
  )

  // Filter products based on selections
  const baseFilteredProducts = products.filter(product => {
    const matchesCategory = 
      selectedCategories.length === 0 || 
      selectedCategories.includes(product.category.id)

    const matchesSubcategory = 
      selectedSubcategories.length === 0 || 
      (product.subcategory && selectedSubcategories.includes(product.subcategory.id))

    const matchesBrand = 
      selectedBrands.length === 0 || 
      (product.brand && selectedBrands.includes(product.brand.id))

    return matchesCategory && matchesSubcategory && matchesBrand
  })

  // Get available options based on current filters (bidirectional filtering)
  const availableSubcategories = selectedCategories.length > 0 || selectedBrands.length > 0
    ? allSubcategories.filter(sub => 
        products.some(p => {
          const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(p.category.id)
          const matchesBrand = selectedBrands.length === 0 || (p.brand && selectedBrands.includes(p.brand.id))
          return matchesCategory && matchesBrand && p.subcategory?.id === sub.id
        })
      )
    : allSubcategories

  const availableBrands = selectedCategories.length > 0 || selectedSubcategories.length > 0
    ? allBrands.filter(brand => 
        products.some(p => {
          const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(p.category.id)
          const matchesSubcategory = selectedSubcategories.length === 0 || (p.subcategory && selectedSubcategories.includes(p.subcategory.id))
          return matchesCategory && matchesSubcategory && p.brand?.id === brand.id
        })
      )
    : allBrands

  const availableCategories = selectedBrands.length > 0 || selectedSubcategories.length > 0
    ? allCategories.filter(category => 
        products.some(p => {
          const matchesBrand = selectedBrands.length === 0 || (p.brand && selectedBrands.includes(p.brand.id))
          const matchesSubcategory = selectedSubcategories.length === 0 || (p.subcategory && selectedSubcategories.includes(p.subcategory.id))
          return matchesBrand && matchesSubcategory && p.category.id === category.id
        })
      )
    : allCategories

  // Final filtered products with search
  const filteredProducts = baseFilteredProducts.filter(product => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      product.name.toLowerCase().includes(search) ||
      product.sku.toLowerCase().includes(search) ||
      (product.description?.toLowerCase().includes(search) ?? false) ||
      (product.brand?.name.toLowerCase().includes(search) ?? false) ||
      (product.subcategory?.name.toLowerCase().includes(search) ?? false)
    )
  })

const generatePDF = async () => {
  // Dynamic import to ensure it loads on client side
  const { jsPDF } = await import('jspdf')
  const autoTable = (await import('jspdf-autotable')).default
  
  const doc = new jsPDF({
    orientation: 'landscape',
  })
  
  doc.setFontSize(18)
  doc.text('Product Catalog', 14, 20)
  
  doc.setFontSize(10)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28)
  doc.text(`Total Products: ${filteredProducts.length}`, 14, 33)

  const tableData = filteredProducts.map(product => [
    product.sku,
    product.name,
    product.brand?.name || '-',
    product.category.name,
    product.subcategory?.name || '-',
    product.packageSize && product.unitOfMeasurement 
      ? `${product.packageSize} ${product.unitOfMeasurement}` 
      : '-',
    product.casePackCount?.toString() || '-',
    `$${product.cost.toFixed(2)}`,
    `$${product.retailPrice.toFixed(2)}`,
    `${calculateMarkup(product.cost, product.retailPrice)}%`,
    `${calculateMargin(product.cost, product.retailPrice)}%`,
    `$${calculateProfit(product.cost, product.retailPrice)}`,
  ])

  autoTable(doc, {
    startY: 40,
    head: [[
      'SKU',
      'Product Name',
      'Brand',
      'Category',
      'Subcategory',
      'Size',
      'Case Pack',
      'Cost',
      'Retail',
      'Markup %',
      'Margin %',
      'Profit',
    ]],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 45 },
      2: { cellWidth: 25 },
      3: { cellWidth: 25 },
      4: { cellWidth: 25 },
      5: { cellWidth: 20 },
      6: { cellWidth: 15 },
      7: { cellWidth: 18 },
      8: { cellWidth: 18 },
      9: { cellWidth: 18 },
      10: { cellWidth: 18 },
      11: { cellWidth: 18 },
    },
  })

  doc.save(`product-catalog-${new Date().toISOString().split('T')[0]}.pdf`)
}

  if (loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading products...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            View All Products
          </h1>
          <div className="flex gap-3">
            <button
              onClick={generatePDF}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              📄 Export PDF
            </button>
            <Link
              href="/products"
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300 rounded-lg transition-colors"
            >
              ← Back to Products
            </Link>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-gray-600">Filters & Search</h2>
              {(selectedCategories.length > 0 || selectedSubcategories.length > 0 || selectedBrands.length > 0) && (
                <span className="text-sm text-gray-600">
                  ({selectedCategories.length + selectedSubcategories.length + selectedBrands.length} active)
                </span>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300 rounded-lg transition-colors text-sm"
            >
              {showFilters ? '▼ Hide Filters' : '▶ Show Filters'}
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Search Products
            </label>
            <input
              type="text"
              placeholder="Search by name, SKU, brand, subcategory, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {showFilters && (
            <div>
              {/* Category Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Categories {selectedCategories.length > 0 && (
                    <span className="text-primary-600">({selectedCategories.length} selected)</span>
                  )}
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableCategories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => toggleCategory(category.id)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        selectedCategories.includes(category.id)
                          ? 'bg-blue-500 text-gray-900'
                          : 'bg-gray-700 text-gray-600 hover:bg-gray-600'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                  {selectedCategories.length > 0 && (
                    <button
                      onClick={() => setSelectedCategories([])}
                      className="px-4 py-2 rounded-lg bg-error-light text-error-dark hover:bg-red-500/30"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Subcategory Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Subcategories {selectedSubcategories.length > 0 && (
                    <span className="text-orange-400">({selectedSubcategories.length} selected)</span>
                  )}
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableSubcategories.map(subcategory => (
                    <button
                      key={subcategory.id}
                      onClick={() => toggleSubcategory(subcategory.id)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        selectedSubcategories.includes(subcategory.id)
                          ? 'bg-orange-500 text-gray-900'
                          : 'bg-gray-700 text-gray-600 hover:bg-gray-600'
                      }`}
                    >
                      {subcategory.name}
                    </button>
                  ))}
                  {selectedSubcategories.length > 0 && (
                    <button
                      onClick={() => setSelectedSubcategories([])}
                      className="px-4 py-2 rounded-lg bg-error-light text-error-dark hover:bg-red-500/30"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Brand Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Brands {selectedBrands.length > 0 && (
                    <span className="text-gray-900">({selectedBrands.length} selected)</span>
                  )}
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableBrands.map(brand => (
                    <button
                      key={brand.id}
                      onClick={() => toggleBrand(brand.id)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        selectedBrands.includes(brand.id)
                          ? 'bg-purple-500 text-gray-900'
                          : 'bg-gray-700 text-gray-600 hover:bg-gray-600'
                      }`}
                    >
                      {brand.name}
                    </button>
                  ))}
                  {selectedBrands.length > 0 && (
                    <button
                      onClick={() => setSelectedBrands([])}
                      className="px-4 py-2 rounded-lg bg-error-light text-error-dark hover:bg-red-500/30"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredProducts.length} of {products.length} products
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-600">
              {products.length === 0 
                ? 'No products found. Create one to get started!' 
                : 'No products match your search criteria.'}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="mb-6 pb-4 border-b border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h2 className="text-2xl font-bold text-primary-600">{product.name}</h2>
                      <p className="text-sm text-gray-600 mt-1">SKU: {product.sku}</p>
                      {product.brand && (
                        <p className="text-sm text-gray-600 mt-1">Brand: {product.brand.name}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <span className="px-3 py-1 bg-info-light text-info-dark rounded-full text-sm">
                        {product.category.name}
                      </span>
                      {product.subcategory && (
                        <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm">
                          {product.subcategory.name}
                        </span>
                      )}
                      <span className="px-3 py-1 bg-info-light text-info-dark rounded-full text-sm">
                        On-Hand: {product.inventory?.quantityOnHand ?? 0}
                      </span>
                    </div>
                  </div>
                  
                  {product.description && (
                    <p className="text-gray-600 mt-3">{product.description}</p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-4 text-sm">
                    {product.packageSize && product.unitOfMeasurement && (
                      <div className="text-gray-600">
                        <span className="text-gray-500">Size:</span> {product.packageSize} {product.unitOfMeasurement}
                      </div>
                    )}
                    {product.casePackCount && (
                      <div className="text-gray-600">
                        <span className="text-gray-500">Case Pack:</span> {product.casePackCount} units
                      </div>
                    )}
                    {product.storageType && (
                      <div className="text-gray-600">
                        <span className="text-gray-500">Storage:</span> {product.storageType}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Cost</p>
                    <p className="text-lg font-semibold text-gray-900">
                      ${product.cost.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Retail Price</p>
                    <p className="text-lg font-semibold text-primary-600">
                      ${product.retailPrice.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Markup</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {calculateMarkup(product.cost, product.retailPrice)}%
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Margin</p>
                    <p className="text-lg font-semibold text-warning-dark">
                      {calculateMargin(product.cost, product.retailPrice)}%
                    </p>
                  </div>
                </div>

                {product.purchaseOrderItems.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-600">Purchase History</h3>
                      <button
                        onClick={() => togglePurchaseHistory(product.id)}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300 rounded-lg transition-colors text-sm"
                      >
                        {expandedPurchaseHistory === product.id ? '▼ Hide' : '▶ Show'} ({product.purchaseOrderItems.length})
                      </button>
                    </div>

                    {expandedPurchaseHistory === product.id && (
                      <div className="bg-gray-50 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-white border-b border-gray-200">
                                <th className="text-left p-3 text-gray-600 font-medium">PO Number</th>
                                <th className="text-left p-3 text-gray-600 font-medium">Vendor</th>
                                <th className="text-left p-3 text-gray-600 font-medium">Quantity</th>
                                <th className="text-left p-3 text-gray-600 font-medium">Unit Cost</th>
                                <th className="text-left p-3 text-gray-600 font-medium">Total Cost</th>
                              </tr>
                            </thead>
                            <tbody>
                              {product.purchaseOrderItems.map((item: any, index: number) => (
                                <tr 
                                  key={item.id} 
                                  className={`border-b border-gray-800 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-gray-50/50'}`}
                                >
                                  <td className="p-3 text-gray-600">{item.purchaseOrder.poNumber}</td>
                                  <td className="p-3 text-gray-600">{item.purchaseOrder.vendor.name}</td>
                                  <td className="p-3 text-gray-600">{item.quantity} units</td>
                                  <td className="p-3 text-gray-900 font-medium">${item.unitCost.toFixed(2)}</td>
                                  <td className="p-3 text-primary-600 font-medium">${(item.quantity * item.unitCost).toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <ChangeLogTable changeLogs={product.changeLogs} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}