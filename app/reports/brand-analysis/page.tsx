'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import PageLayout from '@/app/components/PageLayout'

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
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emailAddress, setEmailAddress] = useState('')
  const [emailSending, setEmailSending] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/products')
        const data = await response.json()
        const productsData = Array.isArray(data) ? data : (data.products || [])
        setProducts(productsData.filter((p: Product) => p.brand !== null))
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

    return doc
  }

  const downloadPDF = async () => {
    const doc = await generatePDF()
    doc.save(`brand-analysis-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const handleEmailPDF = async () => {
    if (!emailAddress || !emailAddress.includes('@')) {
      alert('Please enter a valid email address')
      return
    }

    setEmailSending(true)

    try {
      const doc = await generatePDF()
      const pdfBase64 = doc.output('datauristring').split(',')[1]

      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: emailAddress,
          subject: `Brand Profitability Analysis - ${new Date().toLocaleDateString()}`,
          html: `
            <h2>Brand Profitability Analysis</h2>
            <p>Please find attached your Brand Profitability Analysis report.</p>
            <h3>Summary:</h3>
            <ul>
              <li><strong>Total Brands:</strong> ${brandMetrics.length}</li>
              <li><strong>Report Date:</strong> ${new Date().toLocaleDateString()}</li>
            </ul>
            <p>Generated on ${new Date().toLocaleString()}</p>
          `,
          attachments: [
            {
              filename: `brand-analysis-${new Date().toISOString().split('T')[0]}.pdf`,
              content: pdfBase64,
            },
          ],
        }),
      })

      if (response.ok) {
        alert('Report emailed successfully!')
        setShowEmailModal(false)
        setEmailAddress('')
      } else {
        const error = await response.json()
        alert(`Failed to send email: ${error.error}`)
      }
    } catch (error) {
      console.error('Error sending email:', error)
      alert('Failed to send email. Please try again.')
    } finally {
      setEmailSending(false)
    }
  }

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading report...</div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Email Report</h3>
            <p className="text-gray-600 text-sm mb-4">
              Enter the email address where you'd like to send this report.
            </p>
            <input
              type="email"
              placeholder="email@example.com"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-3">
              <button
                onClick={handleEmailPDF}
                disabled={emailSending}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {emailSending ? 'Sending...' : 'Send Email'}
              </button>
              <button
                onClick={() => {
                  setShowEmailModal(false)
                  setEmailAddress('')
                }}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Blue Header Section */}
      <div className="bg-blue-600 text-white py-12 px-8 -m-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4">
            <Link href="/reports" className="text-blue-100 hover:text-white font-medium">
              ← Back to Reports
            </Link>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Brand Profitability Analysis
              </h1>
              <p className="text-blue-100">
                Compare brand performance across categories and subcategories
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={downloadPDF}
                className="px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
              >
                📄 Export PDF
              </button>
              <button
                onClick={() => setShowEmailModal(true)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
              >
                📧 Email PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sort Options */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <div className="flex gap-4 items-center">
          <label className="text-sm font-medium text-gray-700">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'margin' | 'markup' | 'profit')}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 hover:shadow-md transition-all"
          >
            {/* Brand Header */}
            <div 
              className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setExpandedBrand(
                expandedBrand === brandMetric.brand.id ? null : brandMetric.brand.id
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                  <div>
                    <h3 className="text-2xl font-bold text-purple-600">{brandMetric.brand.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{brandMetric.productCount} products</p>
                  </div>
                </div>
                <div className="flex gap-8">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Avg Margin</p>
                    <p className="text-2xl font-bold text-yellow-600">{brandMetric.avgMargin.toFixed(2)}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Avg Markup</p>
                    <p className="text-2xl font-bold text-purple-600">{brandMetric.avgMarkup.toFixed(2)}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Avg Profit/Unit</p>
                    <p className="text-2xl font-bold text-green-600">${brandMetric.avgProfitPerUnit.toFixed(2)}</p>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    {expandedBrand === brandMetric.brand.id ? '▼' : '▶'}
                  </button>
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedBrand === brandMetric.brand.id && (
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  {/* Category Breakdown */}
                  <div>
                    <h4 className="text-lg font-semibold text-blue-600 mb-4">
                      Top Categories
                    </h4>
                    {brandMetric.categoryBreakdown.length > 0 ? (
                      <div className="space-y-3">
                        {brandMetric.categoryBreakdown.slice(0, 5).map(cat => (
                          <div key={cat.category.id} className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium text-gray-900">{cat.category.name}</p>
                                <p className="text-sm text-gray-500">{cat.productCount} products</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-yellow-600">{cat.avgMargin.toFixed(2)}% margin</p>
                                <p className="text-sm text-purple-600">{cat.avgMarkup.toFixed(2)}% markup</p>
                                <p className="text-sm font-semibold text-green-600">${cat.avgProfitPerUnit.toFixed(2)}/unit</p>
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
                    <h4 className="text-lg font-semibold text-orange-600 mb-4">
                      Top Subcategories
                    </h4>
                    {brandMetric.subcategoryBreakdown.length > 0 ? (
                      <div className="space-y-3">
                        {brandMetric.subcategoryBreakdown.slice(0, 5).map(sub => (
                          <div key={sub.subcategory.id} className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium text-gray-900">{sub.subcategory.name}</p>
                                <p className="text-sm text-gray-500">{sub.productCount} products</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-yellow-600">{sub.avgMargin.toFixed(2)}% margin</p>
                                <p className="text-sm text-purple-600">{sub.avgMarkup.toFixed(2)}% markup</p>
                                <p className="text-sm font-semibold text-green-600">${sub.avgProfitPerUnit.toFixed(2)}/unit</p>
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
                  <h4 className="text-lg font-semibold text-green-600 mb-4">
                    Products
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                          <div key={product.id} className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium text-gray-900">{product.name}</p>
                                <p className="text-sm text-gray-500">{product.sku}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-yellow-600">{margin.toFixed(2)}% margin</p>
                                <p className="text-sm text-purple-600">{markup.toFixed(2)}% markup</p>
                                <p className="text-sm font-semibold text-green-600">${profitPerUnit.toFixed(2)}/unit</p>
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
    </PageLayout>
  )
}