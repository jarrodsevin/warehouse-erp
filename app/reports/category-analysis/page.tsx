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
}

type CategoryMetrics = {
  category: Category
  productCount: number
  avgMargin: number
  avgMarkup: number
  avgProfitPerUnit: number
  subcategoryBreakdown: SubcategoryMetrics[]
  brandBreakdown: BrandMetrics[]
}

type SubcategoryMetrics = {
  subcategory: Subcategory
  productCount: number
  avgProfitPerUnit: number
  avgMargin: number
  avgMarkup: number
}

type BrandMetrics = {
  brand: Brand
  productCount: number
  avgProfitPerUnit: number
  avgMargin: number
  avgMarkup: number
}

export default function CategoryAnalysis() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'margin' | 'markup' | 'profit'>('margin')
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/products')
        const data = await response.json()
        setProducts(data.products)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Group products by category and calculate metrics
  const categoryMetrics: CategoryMetrics[] = Array.from(
    products.reduce((map, product) => {
      const categoryId = product.category.id
      if (!map.has(categoryId)) {
        map.set(categoryId, {
          category: product.category,
          products: [],
        })
      }
      map.get(categoryId)!.products.push(product)
      return map
    }, new Map<string, { category: Category; products: Product[] }>())
  )
    .map(([_, data]) => {
      const products = data.products
      
      // Calculate average metrics across all products
      const avgMargin = products.reduce((sum, p) => {
        const margin = p.retailPrice > 0 ? ((p.retailPrice - p.cost) / p.retailPrice) * 100 : 0
        return sum + margin
      }, 0) / products.length

      const avgMarkup = products.reduce((sum, p) => {
        const markup = p.cost > 0 ? ((p.retailPrice - p.cost) / p.cost) * 100 : 0
        return sum + markup
      }, 0) / products.length

      const avgProfitPerUnit = products.reduce((sum, p) => {
        return sum + (p.retailPrice - p.cost)
      }, 0) / products.length

      // Subcategory breakdown
      const subcategoryMap = new Map<string, Product[]>()
      products.forEach(p => {
        if (p.subcategory) {
          if (!subcategoryMap.has(p.subcategory.id)) {
            subcategoryMap.set(p.subcategory.id, [])
          }
          subcategoryMap.get(p.subcategory.id)!.push(p)
        }
      })

      const subcategoryBreakdown: SubcategoryMetrics[] = Array.from(subcategoryMap.entries())
        .map(([_, subProducts]) => {
          const subAvgMargin = subProducts.reduce((sum, p) => {
            const margin = p.retailPrice > 0 ? ((p.retailPrice - p.cost) / p.retailPrice) * 100 : 0
            return sum + margin
          }, 0) / subProducts.length

          const subAvgMarkup = subProducts.reduce((sum, p) => {
            const markup = p.cost > 0 ? ((p.retailPrice - p.cost) / p.cost) * 100 : 0
            return sum + markup
          }, 0) / subProducts.length

          const subAvgProfit = subProducts.reduce((sum, p) => {
            return sum + (p.retailPrice - p.cost)
          }, 0) / subProducts.length
          
          return {
            subcategory: subProducts[0].subcategory!,
            productCount: subProducts.length,
            avgProfitPerUnit: subAvgProfit,
            avgMargin: subAvgMargin,
            avgMarkup: subAvgMarkup,
          }
        })
        .sort((a, b) => b.avgMargin - a.avgMargin)

      // Brand breakdown
      const brandMap = new Map<string, Product[]>()
      products.forEach(p => {
        if (p.brand) {
          if (!brandMap.has(p.brand.id)) {
            brandMap.set(p.brand.id, [])
          }
          brandMap.get(p.brand.id)!.push(p)
        }
      })

      const brandBreakdown: BrandMetrics[] = Array.from(brandMap.entries())
        .map(([_, brandProducts]) => {
          const brandAvgMargin = brandProducts.reduce((sum, p) => {
            const margin = p.retailPrice > 0 ? ((p.retailPrice - p.cost) / p.retailPrice) * 100 : 0
            return sum + margin
          }, 0) / brandProducts.length

          const brandAvgMarkup = brandProducts.reduce((sum, p) => {
            const markup = p.cost > 0 ? ((p.retailPrice - p.cost) / p.cost) * 100 : 0
            return sum + markup
          }, 0) / brandProducts.length

          const brandAvgProfit = brandProducts.reduce((sum, p) => {
            return sum + (p.retailPrice - p.cost)
          }, 0) / brandProducts.length
          
          return {
            brand: brandProducts[0].brand!,
            productCount: brandProducts.length,
            avgProfitPerUnit: brandAvgProfit,
            avgMargin: brandAvgMargin,
            avgMarkup: brandAvgMarkup,
          }
        })
        .sort((a, b) => b.avgMargin - a.avgMargin)

      return {
        category: data.category,
        productCount: products.length,
        avgMargin,
        avgMarkup,
        avgProfitPerUnit,
        subcategoryBreakdown,
        brandBreakdown,
      }
    })
    .sort((a, b) => {
      if (sortBy === 'margin') return b.avgMargin - a.avgMargin
      if (sortBy === 'markup') return b.avgMarkup - a.avgMarkup
      return b.avgProfitPerUnit - a.avgProfitPerUnit
    })

  const generatePDF = async () => {
    const { jsPDF } = await import('jspdf')
    const autoTable = (await import('jspdf-autotable')).default
    
    const doc = new jsPDF({
      orientation: 'landscape',
    })
    
    doc.setFontSize(18)
    doc.text('Category Profitability Analysis', 14, 20)
    
    doc.setFontSize(10)
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28)
    doc.text(`Total Categories: ${categoryMetrics.length}`, 14, 33)
    
    const tableData = categoryMetrics.map((cat, index) => [
      `#${index + 1}`,
      cat.category.name,
      cat.productCount.toString(),
      `${cat.avgMargin.toFixed(2)}%`,
      `${cat.avgMarkup.toFixed(2)}%`,
      `$${cat.avgProfitPerUnit.toFixed(2)}`,
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

    doc.save(`category-analysis-${new Date().toISOString().split('T')[0]}.pdf`)
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-600 bg-clip-text text-transparent">
            Category Profitability Analysis
          </h1>
          <div className="flex gap-3">
            <button
              onClick={generatePDF}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
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

        {/* Sort Options */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
          <div className="flex gap-4 items-center">
            <label className="text-sm font-medium text-gray-300">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'margin' | 'markup' | 'profit')}
              className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100"
            >
              <option value="margin">Average Margin %</option>
              <option value="markup">Average Markup %</option>
              <option value="profit">Average Profit per Unit</option>
            </select>
          </div>
        </div>

        {/* Category Cards */}
        <div className="space-y-6">
          {categoryMetrics.map((catMetric, index) => (
            <div
              key={catMetric.category.id}
              className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden"
            >
              {/* Category Header */}
              <div 
                className="p-6 cursor-pointer hover:bg-gray-750 transition-colors"
                onClick={() => setExpandedCategory(
                  expandedCategory === catMetric.category.id ? null : catMetric.category.id
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-gray-500">#{index + 1}</span>
                    <div>
                      <h3 className="text-2xl font-bold text-blue-400">{catMetric.category.name}</h3>
                      <p className="text-sm text-gray-400 mt-1">{catMetric.productCount} products</p>
                    </div>
                  </div>
                  <div className="flex gap-8">
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Avg Margin</p>
                      <p className="text-2xl font-bold text-yellow-400">{catMetric.avgMargin.toFixed(2)}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Avg Markup</p>
                      <p className="text-2xl font-bold text-purple-400">{catMetric.avgMarkup.toFixed(2)}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Avg Profit/Unit</p>
                      <p className="text-2xl font-bold text-green-400">${catMetric.avgProfitPerUnit.toFixed(2)}</p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-300">
                      {expandedCategory === catMetric.category.id ? '▼' : '▶'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedCategory === catMetric.category.id && (
                <div className="border-t border-gray-700 p-6 bg-gray-900">
                  <div className="grid grid-cols-2 gap-8">
                    {/* Subcategory Breakdown */}
                    <div>
                      <h4 className="text-lg font-semibold text-orange-400 mb-4">
                        Top Subcategories
                      </h4>
                      {catMetric.subcategoryBreakdown.length > 0 ? (
                        <div className="space-y-3">
                          {catMetric.subcategoryBreakdown.slice(0, 5).map(sub => (
                            <div key={sub.subcategory.id} className="bg-gray-800 rounded-lg p-3">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-medium text-gray-200">{sub.subcategory.name}</p>
                                  <p className="text-sm text-gray-400">{sub.productCount} products</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-yellow-400">{sub.avgMargin.toFixed(2)}% margin</p>
                                  <p className="text-sm text-purple-400">{sub.avgMarkup.toFixed(2)}% markup</p>
                                  <p className="text-sm font-semibold text-green-400">${sub.avgProfitPerUnit.toFixed(2)}/unit</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No subcategories</p>
                      )}
                    </div>

                    {/* Brand Breakdown */}
                    <div>
                      <h4 className="text-lg font-semibold text-purple-400 mb-4">
                        Top Brands
                      </h4>
                      {catMetric.brandBreakdown.length > 0 ? (
                        <div className="space-y-3">
                          {catMetric.brandBreakdown.slice(0, 5).map(brand => (
                            <div key={brand.brand.id} className="bg-gray-800 rounded-lg p-3">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-medium text-gray-200">{brand.brand.name}</p>
                                  <p className="text-sm text-gray-400">{brand.productCount} products</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-yellow-400">{brand.avgMargin.toFixed(2)}% margin</p>
                                  <p className="text-sm text-purple-400">{brand.avgMarkup.toFixed(2)}% markup</p>
                                  <p className="text-sm font-semibold text-green-400">${brand.avgProfitPerUnit.toFixed(2)}/unit</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No brands</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}