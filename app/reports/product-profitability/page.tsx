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
  const [showFilters, setShowFilters] = useState(true)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emailAddress, setEmailAddress] = useState('')
  const [emailSending, setEmailSending] = useState(false)

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
        
        const productsData = Array.isArray(data) ? data : []
        setProducts(productsData)
        
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

    return doc
  }

  const downloadPDF = async () => {
    const doc = await generatePDF()
    doc.save(`profitability-report-${new Date().toISOString().split('T')[0]}.pdf`)
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
          subject: `Product Profitability Report - ${new Date().toLocaleDateString()}`,
          html: `
            <h2>Product Profitability Report</h2>
            <p>Please find attached your Product Profitability Report.</p>
            <h3>Summary:</h3>
            <ul>
              <li><strong>Total Products:</strong> ${totalProducts}</li>
              <li><strong>Average Profit/Unit:</strong> $${avgProfit.toFixed(2)}</li>
              <li><strong>Average Margin:</strong> ${avgMargin.toFixed(2)}%</li>
            </ul>
            <p>Generated on ${new Date().toLocaleString()}</p>
          `,
          attachments: [
            {
              filename: `profitability-report-${new Date().toISOString().split('T')[0]}.pdf`,
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

  const activeFilterCount = selectedCategories.length + selectedSubcategories.length + selectedBrands.length

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
                Product Profitability Report
              </h1>
              <p className="text-blue-100">
                Compare individual products by profitability with multi-dimensional filtering
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={downloadPDF}
                className="px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium flex items-center gap-2"
              >
                📄 Export PDF
              </button>
              <button
                onClick={() => setShowEmailModal(true)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
              >
                📧 Email PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-500 mb-2">Total Products</p>
          <p className="text-3xl font-bold text-blue-600">{totalProducts}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-500 mb-2">Avg Profit/Unit</p>
          <p className="text-3xl font-bold text-green-600">${avgProfit.toFixed(2)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-500 mb-2">Avg Margin</p>
          <p className="text-3xl font-bold text-yellow-600">{avgMargin.toFixed(2)}%</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-500 mb-2">Range</p>
          <p className="text-lg font-bold text-purple-600">
            ${leastProfitable?.profit.toFixed(2) || '0'} - ${mostProfitable?.profit.toFixed(2) || '0'}
          </p>
        </div>
      </div>

      {/* Filters Toggle Button */}
      <div className="mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
        >
          <span>{showFilters ? '▼' : '▶'}</span>
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">
              {activeFilterCount} active
            </span>
          )}
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          {/* Category Filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categories {selectedCategories.length > 0 && (
                <span className="text-blue-600">({selectedCategories.length} selected)</span>
              )}
            </label>
            <div className="flex flex-wrap gap-2">
              {availableCategories.map(category => (
                <button
                  key={category.id}
                  onClick={() => toggleCategory(category.id)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedCategories.includes(category.id)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
              {selectedCategories.length > 0 && (
                <button
                  onClick={() => setSelectedCategories([])}
                  className="px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Subcategory Filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subcategories {selectedSubcategories.length > 0 && (
                <span className="text-orange-600">({selectedSubcategories.length} selected)</span>
              )}
            </label>
            <div className="flex flex-wrap gap-2">
              {availableSubcategories.map(subcategory => (
                <button
                  key={subcategory.id}
                  onClick={() => toggleSubcategory(subcategory.id)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedSubcategories.includes(subcategory.id)
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {subcategory.name}
                </button>
              ))}
              {selectedSubcategories.length > 0 && (
                <button
                  onClick={() => setSelectedSubcategories([])}
                  className="px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Brand Filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brands {selectedBrands.length > 0 && (
                <span className="text-purple-600">({selectedBrands.length} selected)</span>
              )}
            </label>
            <div className="flex flex-wrap gap-2">
              {availableBrands.map(brand => (
                <button
                  key={brand.id}
                  onClick={() => toggleBrand(brand.id)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedBrands.includes(brand.id)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {brand.name}
                </button>
              ))}
              {selectedBrands.length > 0 && (
                <button
                  onClick={() => setSelectedBrands([])}
                  className="px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex flex-wrap gap-4 items-center">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'profit' | 'margin' | 'markup')}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="profit">Profit per Unit</option>
              <option value="margin">Margin %</option>
              <option value="markup">Markup %</option>
            </select>
            <button
              onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              {sortOrder === 'desc' ? '↓ Highest First' : '↑ Lowest First'}
            </button>
          </div>
        </div>
      )}

      {/* Results Table */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-500">No products match your filter criteria.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 text-gray-700 font-medium text-sm">Rank</th>
                  <th className="text-left p-4 text-gray-700 font-medium text-sm">SKU</th>
                  <th className="text-left p-4 text-gray-700 font-medium text-sm">Product Name</th>
                  <th className="text-left p-4 text-gray-700 font-medium text-sm">Brand</th>
                  <th className="text-left p-4 text-gray-700 font-medium text-sm">Category</th>
                  <th className="text-left p-4 text-gray-700 font-medium text-sm">Subcategory</th>
                  <th className="text-right p-4 text-gray-700 font-medium text-sm">Cost</th>
                  <th className="text-right p-4 text-gray-700 font-medium text-sm">Retail</th>
                  <th className="text-right p-4 text-gray-700 font-medium text-sm">Profit</th>
                  <th className="text-right p-4 text-gray-700 font-medium text-sm">Margin %</th>
                  <th className="text-right p-4 text-gray-700 font-medium text-sm">Markup %</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product, index) => (
                  <tr 
                    key={product.id} 
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    }`}
                  >
                    <td className="p-4 text-gray-600 text-sm">#{index + 1}</td>
                    <td className="p-4 text-gray-600 font-mono text-sm">{product.sku}</td>
                    <td className="p-4 text-gray-900 font-medium text-sm">{product.name}</td>
                    <td className="p-4 text-gray-600 text-sm">{product.brand?.name || '-'}</td>
                    <td className="p-4 text-gray-600 text-sm">{product.category.name}</td>
                    <td className="p-4 text-gray-600 text-sm">{product.subcategory?.name || '-'}</td>
                    <td className="p-4 text-right text-green-600 text-sm">${product.cost.toFixed(2)}</td>
                    <td className="p-4 text-right text-blue-600 text-sm">${product.retailPrice.toFixed(2)}</td>
                    <td className="p-4 text-right text-sm">
                      <span className={`font-semibold ${
                        product.profit > avgProfit ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        ${product.profit.toFixed(2)}
                      </span>
                    </td>
                    <td className="p-4 text-right text-yellow-600 text-sm">{product.margin.toFixed(2)}%</td>
                    <td className="p-4 text-right text-purple-600 text-sm">{product.markup.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </PageLayout>
  )
}