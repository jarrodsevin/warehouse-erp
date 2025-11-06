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

type BrandMetrics = {
  brand: Brand
  productCount: number
  avgMargin: number
  avgMarkup: number
  avgProfitPerUnit: number
  categoryBreakdown: CategoryMetrics[]
  subcategoryBreakdown: SubcategoryMetrics[]
}

type CategoryMetrics = {
  category: Category
  productCount: number
  avgProfitPerUnit: number
  avgMargin: number
  avgMarkup: number
}

type SubcategoryMetrics = {
  subcategory: Subcategory
  productCount: number
  avgProfitPerUnit: number
  avgMargin: number
  avgMarkup: number
}

export default function BrandAnalysis() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'margin' | 'markup' | 'profit'>('margin')
  const [expandedBrand, setExpandedBrand] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/products')
        const data = await response.json()
        setProducts(data.products.filter((p: Product) => p.brand !== null))
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Group products by brand and calculate metrics
  const brandMetrics: BrandMetrics[] = Array.from(
    products.reduce((map, product) => {
      if (!product.brand) return map
      const brandId = product.brand.id
      if (!map.has(brandId)) {
        map.set(brandId, {
          brand: product.brand,
          products: [],
        })
      }
      map.get(brandId)!.products.push(product)
      return map
    }, new Map<string, { brand: Brand; products: Product[] }>())
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

      // Category breakdown
      const categoryMap = new Map<string, Product[]>()
      products.forEach(p => {
        if (!categoryMap.has(p.category.id)) {
          categoryMap.set(p.category.id, [])
        }
        categoryMap.get(p.category.id)!.push(p)
      })

      const categoryBreakdown: CategoryMetrics[] = Array.from(categoryMap.entries())
        .map(([_, catProducts]) => {
          const catAvgMargin = catProducts.reduce((sum, p) => {
            const margin = p.retailPrice > 0 ? ((p.retailPrice - p.cost) / p.retailPrice) * 100 : 0
            return sum + margin
          }, 0) / catProducts.length

          const catAvgMarkup = catProducts.reduce((sum, p) => {
            const markup = p.cost > 0 ? ((p.retailPrice - p.cost) / p.cost) * 100 : 0
            return sum + markup
          }, 0) / catProducts.length

          const catAvgProfit = catProducts.reduce((sum, p) => {
            return sum + (p.retailPrice - p.cost)
          }, 0) / catProducts.length

          return {
            category: catProducts[0].category,
            productCount: catProducts.length,
            avgProfitPerUnit: catAvgProfit,
            avgMargin: catAvgMargin,
            avgMarkup: catAvgMarkup,
          }
        })
        .sort((a, b) => b.avgMargin - a.avgMargin)

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

      return {
        brand: data.brand,
        productCount: products.length,
        avgMargin,
        avgMarkup,
        avgProfitPerUnit,
        categoryBreakdown,
        subcategoryBreakdown,
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
    doc.text('Brand Profitability Analysis', 14, 20)
    
    doc.setFontSize(10)
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28)
    doc.text(`Total Brands: ${brandMetrics.length}`, 14, 33)
    
    const tableData = brandMetrics.map((brand, index) => [
      `#${index + 1}`,
      brand.brand.name,
      brand.productCount.toString(),
      `${brand.avgMargin.toFixed(2)}%`,
      `${brand.avgMarkup.toFixed(2)}%`,
      `$${brand.avgProfitPerUnit.toFixed(2)}`,
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

    doc.save(`brand-analysis-${new Date().toISOString().split('T')[0]}.pdf`)
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            Brand Profitability Analysis
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

        {/* Brand Cards */}
        <div className="space-y-6">
          {brandMetrics.map((brandMetric, index) => (
            <div
              key={brandMetric.brand.id}
              className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden"
            >
              {/* Brand Header */}
              <div 
                className="p-6 cursor-pointer hover:bg-gray-750 transition-colors"
                onClick={() => setExpandedBrand(
                  expandedBrand === brandMetric.brand.id ? null : brandMetric.brand.id
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-gray-500">#{index + 1}</span>
                    <div>
                      <h3 className="text-2xl font-bold text-purple-400">{brandMetric.brand.name}</h3>
                      <p className="text-sm text-gray-400 mt-1">{brandMetric.productCount} products</p>
                    </div>
                  </div>
                  <div className="flex gap-8">
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Avg Margin</p>
                      <p className="text-2xl font-bold text-yellow-400">{brandMetric.avgMargin.toFixed(2)}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Avg Markup</p>
                      <p className="text-2xl font-bold text-purple-400">{brandMetric.avgMarkup.toFixed(2)}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Avg Profit/Unit</p>
                      <p className="text-2xl font-bold text-green-400">${brandMetric.avgProfitPerUnit.toFixed(2)}</p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-300">
                      {expandedBrand === brandMetric.brand.id ? '▼' : '▶'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedBrand === brandMetric.brand.id && (
                <div className="border-t border-gray-700 p-6 bg-gray-900">
                  <div className="grid grid-cols-2 gap-8 mb-8">
                    {/* Category Breakdown */}
                    <div>
                      <h4 className="text-lg font-semibold text-blue-400 mb-4">
                        Top Categories
                      </h4>
                      {brandMetric.categoryBreakdown.length > 0 ? (
                        <div className="space-y-3">
                          {brandMetric.categoryBreakdown.slice(0, 5).map(cat => (
                            <div key={cat.category.id} className="bg-gray-800 rounded-lg p-3">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-medium text-gray-200">{cat.category.name}</p>
                                  <p className="text-sm text-gray-400">{cat.productCount} products</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-yellow-400">{cat.avgMargin.toFixed(2)}% margin</p>
                                  <p className="text-sm text-purple-400">{cat.avgMarkup.toFixed(2)}% markup</p>
                                  <p className="text-sm font-semibold text-green-400">${cat.avgProfitPerUnit.toFixed(2)}/unit</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No categories</p>
                      )}
                    </div>

                    {/* Subcategory Breakdown */}
                    <div>
                      <h4 className="text-lg font-semibold text-orange-400 mb-4">
                        Top Subcategories
                      </h4>
                      {brandMetric.subcategoryBreakdown.length > 0 ? (
                        <div className="space-y-3">
                          {brandMetric.subcategoryBreakdown.slice(0, 5).map(sub => (
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
                  </div>

                  {/* Products List */}
                  <div>
                    <h4 className="text-lg font-semibold text-green-400 mb-4">
                      Products
                    </h4>
                    <div className="space-y-3">
                      {products
                        .filter(p => p.brand?.id === brandMetric.brand.id)
                        .map(product => {
                          const margin = product.retailPrice > 0 
                            ? ((product.retailPrice - product.cost) / product.retailPrice) * 100 
                            : 0
                          const markup = product.cost > 0 
                            ? ((product.retailPrice - product.cost) / product.cost) * 100 
                            : 0
                          const profitPerUnit = product.retailPrice - product.cost

                          return (
                            <div key={product.id} className="bg-gray-800 rounded-lg p-3">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-medium text-gray-200">{product.name}</p>
                                  <p className="text-sm text-gray-400">{product.sku}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-yellow-400">{margin.toFixed(2)}% margin</p>
                                  <p className="text-sm text-purple-400">{markup.toFixed(2)}% markup</p>
                                  <p className="text-sm font-semibold text-green-400">${profitPerUnit.toFixed(2)}/unit</p>
                                </div>
                              </div>
                            </div>
                          )
                        })}
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