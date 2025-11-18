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
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emailAddress, setEmailAddress] = useState('')
  const [emailSending, setEmailSending] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/products')
        const data = await response.json()
        const productsData = Array.isArray(data) ? data : []
        setProducts(productsData)
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

    return doc
  }

  const downloadPDF = async () => {
    const doc = await generatePDF()
    doc.save(`category-analysis-${new Date().toISOString().split('T')[0]}.pdf`)
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
          subject: `Category Profitability Analysis - ${new Date().toLocaleDateString()}`,
          html: `
            <h2>Category Profitability Analysis</h2>
            <p>Please find attached your Category Profitability Analysis report.</p>
            <h3>Summary:</h3>
            <ul>
              <li><strong>Total Categories:</strong> ${categoryMetrics.length}</li>
              <li><strong>Report Date:</strong> ${new Date().toLocaleDateString()}</li>
            </ul>
            <p>Generated on ${new Date().toLocaleString()}</p>
          `,
          attachments: [
            {
              filename: `category-analysis-${new Date().toISOString().split('T')[0]}.pdf`,
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
                Category Profitability Analysis
              </h1>
              <p className="text-blue-100">
                Analyze profitability by product categories with subcategory and brand breakdowns
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

      {/* Category Cards */}
      <div className="space-y-6">
        {categoryMetrics.map((catMetric, index) => (
          <div
            key={catMetric.category.id}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 hover:shadow-md transition-all"
          >
            {/* Category Header */}
            <div 
              className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setExpandedCategory(
                expandedCategory === catMetric.category.id ? null : catMetric.category.id
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                  <div>
                    <h3 className="text-2xl font-bold text-blue-600">{catMetric.category.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{catMetric.productCount} products</p>
                  </div>
                </div>
                <div className="flex gap-8">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Avg Margin</p>
                    <p className="text-2xl font-bold text-yellow-600">{catMetric.avgMargin.toFixed(2)}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Avg Markup</p>
                    <p className="text-2xl font-bold text-purple-600">{catMetric.avgMarkup.toFixed(2)}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Avg Profit/Unit</p>
                    <p className="text-2xl font-bold text-green-600">${catMetric.avgProfitPerUnit.toFixed(2)}</p>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    {expandedCategory === catMetric.category.id ? '▼' : '▶'}
                  </button>
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedCategory === catMetric.category.id && (
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Subcategory Breakdown */}
                  <div>
                    <h4 className="text-lg font-semibold text-orange-600 mb-4">
                      Top Subcategories
                    </h4>
                    {catMetric.subcategoryBreakdown.length > 0 ? (
                      <div className="space-y-3">
                        {catMetric.subcategoryBreakdown.slice(0, 5).map(sub => (
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

                  {/* Brand Breakdown */}
                  <div>
                    <h4 className="text-lg font-semibold text-purple-600 mb-4">
                      Top Brands
                    </h4>
                    {catMetric.brandBreakdown.length > 0 ? (
                      <div className="space-y-3">
                        {catMetric.brandBreakdown.slice(0, 5).map(brand => (
                          <div key={brand.brand.id} className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium text-gray-900">{brand.brand.name}</p>
                                <p className="text-sm text-gray-500">{brand.productCount} products</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-yellow-600">{brand.avgMargin.toFixed(2)}% margin</p>
                                <p className="text-sm text-purple-600">{brand.avgMarkup.toFixed(2)}% markup</p>
                                <p className="text-sm font-semibold text-green-600">${brand.avgProfitPerUnit.toFixed(2)}/unit</p>
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
    </PageLayout>
  )
}