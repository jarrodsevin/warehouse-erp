'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

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
  cost: number
  retailPrice: number
  category: Category
  subcategory: Subcategory | null
  brand: Brand | null
  packageSize: number | null
  unitOfMeasurement: string | null
}

type ProductWithMetrics = Product & {
  profit: number
  margin: number
  markup: number
}

export default function ProfitabilityReport() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'profit' | 'margin' | 'markup'>('profit')
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/products')
        const data = await response.json()
        
        // Handle the API response - it returns an array directly
        const productsData = Array.isArray(data) ? data : []
        setProducts(productsData)
        
        // Extract unique categories, subcategories, and brands
        const uniqueCategories = Array.from(
          new Map(productsData.map((p: Product) => [p.category.id, p.category])).values()
        ) as Category[]
        
        const uniqueSubcategories = Array.from(
          new Map(
            productsData
              .filter((p: Product) => p.subcategory)
              .map((p: Product) => [p.subcategory!.id, p.subcategory])
          ).values()
        ) as Subcategory[]
        
        const uniqueBrands = Array.from(
          new Map(
            productsData
              .filter((p: Product) => p.brand)
              .map((p: Product) => [p.brand!.id, p.brand])
          ).values()
        ) as Brand[]

        setCategories(uniqueCategories)
        setSubcategories(uniqueSubcategories)
        setBrands(uniqueBrands)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

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

  // Calculate metrics and filter products
  const filteredProducts: ProductWithMetrics[] = products
    .filter(product => {
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
    .map(product => ({
      ...product,
      profit: product.retailPrice - product.cost,
      margin: product.retailPrice > 0 ? ((product.retailPrice - product.cost) / product.retailPrice) * 100 : 0,
      markup: product.cost > 0 ? ((product.retailPrice - product.cost) / product.cost) * 100 : 0,
    }))
    .sort((a, b) => {
      const aValue = a[sortBy]
      const bValue = b[sortBy]
      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue
    })

  // Filter subcategories and brands based on selected categories
  const availableSubcategories = selectedCategories.length > 0 || selectedBrands.length > 0
    ? subcategories.filter(sub => 
        products.some(p => {
          const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(p.category.id)
          const matchesBrand = selectedBrands.length === 0 || (p.brand && selectedBrands.includes(p.brand.id))
          return matchesCategory && matchesBrand && p.subcategory?.id === sub.id
        })
      )
    : subcategories

  const availableBrands = selectedCategories.length > 0 || selectedSubcategories.length > 0
    ? brands.filter(brand => 
        products.some(p => {
          const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(p.category.id)
          const matchesSubcategory = selectedSubcategories.length === 0 || (p.subcategory && selectedSubcategories.includes(p.subcategory.id))
          return matchesCategory && matchesSubcategory && p.brand?.id === brand.id
        })
      )
    : brands

  const availableCategories = selectedBrands.length > 0 || selectedSubcategories.length > 0
    ? categories.filter(category => 
        products.some(p => {
          const matchesBrand = selectedBrands.length === 0 || (p.brand && selectedBrands.includes(p.brand.id))
          const matchesSubcategory = selectedSubcategories.length === 0 || (p.subcategory && selectedSubcategories.includes(p.subcategory.id))
          return matchesBrand && matchesSubcategory && p.category.id === category.id
        })
      )
    : categories

  // Calculate summary statistics
  const totalProducts = filteredProducts.length
  const avgProfit = totalProducts > 0 
    ? filteredProducts.reduce((sum, p) => sum + p.profit, 0) / totalProducts 
    : 0
  const avgMargin = totalProducts > 0 
    ? filteredProducts.reduce((sum, p) => sum + p.margin, 0) / totalProducts 
    : 0
  const mostProfitable = filteredProducts[0]
  const leastProfitable = filteredProducts[filteredProducts.length - 1]

  const generatePDF = async () => {
    const { jsPDF } = await import('jspdf')
    const autoTable = (await import('jspdf-autotable')).default
    
    const doc = new jsPDF({
      orientation: 'landscape',
    })
    
    doc.setFontSize(18)
    doc.text('Product Profitability Report', 14, 20)
    
    doc.setFontSize(10)
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28)
    doc.text(`Total Products: ${totalProducts}`, 14, 33)
    doc.text(`Average Profit: $${avgProfit.toFixed(2)}`, 14, 38)
    doc.text(`Average Margin: ${avgMargin.toFixed(2)}%`, 14, 43)
    
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

    doc.save(`profitability-report-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  if (loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-xl text-gray-400">Loading report...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-cyan-600 bg-clip-text text-transparent">
            Product Profitability Report
          </h1>
          <div className="flex gap-3">
            <button
              onClick={generatePDF}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              📄 Export PDF
            </button>
            <Link
              href="/reports"
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              ← Back to Reports
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <p className="text-sm text-gray-400 mb-2">Total Products</p>
            <p className="text-3xl font-bold text-blue-400">{totalProducts}</p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <p className="text-sm text-gray-400 mb-2">Avg Profit/Unit</p>
            <p className="text-3xl font-bold text-green-400">${avgProfit.toFixed(2)}</p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <p className="text-sm text-gray-400 mb-2">Avg Margin</p>
            <p className="text-3xl font-bold text-yellow-400">{avgMargin.toFixed(2)}%</p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <p className="text-sm text-gray-400 mb-2">Range</p>
            <p className="text-lg font-bold text-purple-400">
              ${leastProfitable?.profit.toFixed(2) || '0'} - ${mostProfitable?.profit.toFixed(2) || '0'}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-300 mb-4">Filters</h2>
          
          {/* Category Filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Categories {selectedCategories.length > 0 && (
                <span className="text-blue-400">({selectedCategories.length} selected)</span>
              )}
            </label>
            <div className="flex flex-wrap gap-2">
              {availableCategories.map(category => (
                <button
                  key={category.id}
                  onClick={() => toggleCategory(category.id)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedCategories.includes(category.id)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {category.name}
                </button>
              ))}
              {selectedCategories.length > 0 && (
                <button
                  onClick={() => setSelectedCategories([])}
                  className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Subcategory Filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
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
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {subcategory.name}
                </button>
              ))}
              {selectedSubcategories.length > 0 && (
                <button
                  onClick={() => setSelectedSubcategories([])}
                  className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Brand Filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Brands {selectedBrands.length > 0 && (
                <span className="text-purple-400">({selectedBrands.length} selected)</span>
              )}
            </label>
            <div className="flex flex-wrap gap-2">
              {availableBrands.map(brand => (
                <button
                  key={brand.id}
                  onClick={() => toggleBrand(brand.id)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedBrands.includes(brand.id)
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {brand.name}
                </button>
              ))}
              {selectedBrands.length > 0 && (
                <button
                  onClick={() => setSelectedBrands([])}
                  className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex gap-4 items-center">
            <label className="text-sm font-medium text-gray-300">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'profit' | 'margin' | 'markup')}
              className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100"
            >
              <option value="profit">Profit per Unit</option>
              <option value="margin">Margin %</option>
              <option value="markup">Markup %</option>
            </select>
            <button
              onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              {sortOrder === 'desc' ? '↓ Highest First' : '↑ Lowest First'}
            </button>
          </div>
        </div>

        {/* Results Table */}
        {filteredProducts.length === 0 ? (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
            <p className="text-gray-400">No products match your filter criteria.</p>
          </div>
        ) : (
          <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900 border-b border-gray-700">
                  <tr>
                    <th className="text-left p-4 text-gray-400 font-medium">Rank</th>
                    <th className="text-left p-4 text-gray-400 font-medium">SKU</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Product Name</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Brand</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Category</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Subcategory</th>
                    <th className="text-right p-4 text-gray-400 font-medium">Cost</th>
                    <th className="text-right p-4 text-gray-400 font-medium">Retail</th>
                    <th className="text-right p-4 text-gray-400 font-medium">Profit</th>
                    <th className="text-right p-4 text-gray-400 font-medium">Margin %</th>
                    <th className="text-right p-4 text-gray-400 font-medium">Markup %</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product, index) => (
                    <tr 
                      key={product.id} 
                      className="border-b border-gray-800 hover:bg-gray-900/50 transition-colors"
                    >
                      <td className="p-4 text-gray-300">#{index + 1}</td>
                      <td className="p-4 text-gray-300 font-mono text-sm">{product.sku}</td>
                      <td className="p-4 text-gray-100 font-medium">{product.name}</td>
                      <td className="p-4 text-gray-400">{product.brand?.name || '-'}</td>
                      <td className="p-4 text-gray-400">{product.category.name}</td>
                      <td className="p-4 text-gray-400">{product.subcategory?.name || '-'}</td>
                      <td className="p-4 text-right text-green-400">${product.cost.toFixed(2)}</td>
                      <td className="p-4 text-right text-blue-400">${product.retailPrice.toFixed(2)}</td>
                      <td className="p-4 text-right">
                        <span className={`font-semibold ${
                          product.profit > avgProfit ? 'text-green-400' : 'text-yellow-400'
                        }`}>
                          ${product.profit.toFixed(2)}
                        </span>
                      </td>
                      <td className="p-4 text-right text-yellow-400">{product.margin.toFixed(2)}%</td>
                      <td className="p-4 text-right text-purple-400">{product.markup.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}