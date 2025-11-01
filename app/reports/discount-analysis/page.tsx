'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Customer = {
  id: string
  name: string
}

type Product = {
  id: string
  name: string
  sku: string
  cost: number
  retailPrice: number
}

type SalesOrderItem = {
  id: string
  quantity: number
  unitPrice: number
  lineTotal: number
  product: Product
}

type SalesOrder = {
  id: string
  soNumber: string
  orderDate: string
  customer: Customer
  items: SalesOrderItem[]
}

type ProductDiscountMetrics = {
  product: Product
  unitsSold: number
  avgSellingPrice: number
  avgDiscount: number
  potentialProfit: number
  actualProfit: number
  profitLost: number
}

type CustomerDiscountMetrics = {
  customer: Customer
  orderCount: number
  totalUnits: number
  avgDiscount: number
  potentialProfit: number
  actualProfit: number
  profitLost: number
  discountRate: number
}

type DateFilter = '30' | '60' | '90' | 'ytd' | 'thisYear' | 'lastYear'
type ViewMode = 'products' | 'customers'

export default function DiscountAnalysisReport() {
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [dateFilter, setDateFilter] = useState<DateFilter>('30')
  const [viewMode, setViewMode] = useState<ViewMode>('products')
  const [productSortBy, setProductSortBy] = useState<'profitLost' | 'discount' | 'units' | 'potentialProfit'>('profitLost')
  const [customerSortBy, setCustomerSortBy] = useState<'profitLost' | 'discount' | 'orders' | 'discountRate'>('profitLost')
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/sales-orders')
        const data = await response.json()
        const ordersData = Array.isArray(data) ? data : []
        setSalesOrders(ordersData)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Filter orders by date
  const getFilteredOrders = () => {
    const now = new Date()
    let startDate: Date

    switch (dateFilter) {
      case '30':
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 30)
        break
      case '60':
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 60)
        break
      case '90':
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 90)
        break
      case 'ytd':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      case 'thisYear':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      case 'lastYear':
        startDate = new Date(now.getFullYear() - 1, 0, 1)
        const endDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59)
        return salesOrders.filter(order => {
          const orderDate = new Date(order.orderDate)
          return orderDate >= startDate && orderDate <= endDate
        })
      default:
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 30)
    }

    return salesOrders.filter(order => new Date(order.orderDate) >= startDate)
  }

  const filteredOrders = getFilteredOrders()

  // Calculate product discount metrics
  const productMetrics: ProductDiscountMetrics[] = Array.from(
    filteredOrders.reduce((map, order) => {
      order.items.forEach(item => {
        const productId = item.product.id
        if (!map.has(productId)) {
          map.set(productId, {
            product: item.product,
            items: [],
          })
        }
        map.get(productId)!.items.push(item)
      })
      return map
    }, new Map<string, { product: Product; items: SalesOrderItem[] }>())
  )
    .map(([_, data]) => {
      const items = data.items
      const product = data.product
      
      const unitsSold = items.reduce((sum, item) => sum + item.quantity, 0)
      const totalRevenue = items.reduce((sum, item) => sum + item.lineTotal, 0)
      const avgSellingPrice = totalRevenue / unitsSold
      const avgDiscount = product.retailPrice > 0 
        ? ((product.retailPrice - avgSellingPrice) / product.retailPrice) * 100
        : 0
      const potentialProfit = (product.retailPrice - product.cost) * unitsSold
      const actualProfit = items.reduce((sum, item) => {
        return sum + ((item.unitPrice - product.cost) * item.quantity)
      }, 0)
      const profitLost = potentialProfit - actualProfit

      return {
        product,
        unitsSold,
        avgSellingPrice,
        avgDiscount,
        potentialProfit,
        actualProfit,
        profitLost,
      }
    })
    .sort((a, b) => {
      let aValue: number, bValue: number
      
      switch (productSortBy) {
        case 'profitLost':
          aValue = a.profitLost
          bValue = b.profitLost
          break
        case 'discount':
          aValue = a.avgDiscount
          bValue = b.avgDiscount
          break
        case 'units':
          aValue = a.unitsSold
          bValue = b.unitsSold
          break
        case 'potentialProfit':
          aValue = a.potentialProfit
          bValue = b.potentialProfit
          break
        default:
          aValue = a.profitLost
          bValue = b.profitLost
      }

      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue
    })

  // Calculate customer discount metrics
  const customerMetrics: CustomerDiscountMetrics[] = Array.from(
    filteredOrders.reduce((map, order) => {
      const customerId = order.customer.id
      if (!map.has(customerId)) {
        map.set(customerId, {
          customer: order.customer,
          orders: [],
        })
      }
      map.get(customerId)!.orders.push(order)
      return map
    }, new Map<string, { customer: Customer; orders: SalesOrder[] }>())
  )
    .map(([_, data]) => {
      const orders = data.orders
      const customer = data.customer
      
      let totalUnits = 0
      let totalPotentialProfit = 0
      let totalActualProfit = 0
      let totalRetailValue = 0
      let totalActualValue = 0
      
      orders.forEach(order => {
        order.items.forEach(item => {
          const units = item.quantity
          const retailPrice = item.product.retailPrice
          const cost = item.product.cost
          const actualPrice = item.unitPrice
          
          totalUnits += units
          totalPotentialProfit += (retailPrice - cost) * units
          totalActualProfit += (actualPrice - cost) * units
          totalRetailValue += retailPrice * units
          totalActualValue += actualPrice * units
        })
      })
      
      const profitLost = totalPotentialProfit - totalActualProfit
      const avgDiscount = totalRetailValue > 0 
        ? ((totalRetailValue - totalActualValue) / totalRetailValue) * 100
        : 0
      
      // Discount rate: percentage of items purchased at a discount
      const discountedItems = orders.reduce((sum, order) => {
        return sum + order.items.filter(item => item.unitPrice < item.product.retailPrice).length
      }, 0)
      const totalItems = orders.reduce((sum, order) => sum + order.items.length, 0)
      const discountRate = totalItems > 0 ? (discountedItems / totalItems) * 100 : 0

      return {
        customer,
        orderCount: orders.length,
        totalUnits,
        avgDiscount,
        potentialProfit: totalPotentialProfit,
        actualProfit: totalActualProfit,
        profitLost,
        discountRate,
      }
    })
    .sort((a, b) => {
      let aValue: number, bValue: number
      
      switch (customerSortBy) {
        case 'profitLost':
          aValue = a.profitLost
          bValue = b.profitLost
          break
        case 'discount':
          aValue = a.avgDiscount
          bValue = b.avgDiscount
          break
        case 'orders':
          aValue = a.orderCount
          bValue = b.orderCount
          break
        case 'discountRate':
          aValue = a.discountRate
          bValue = b.discountRate
          break
        default:
          aValue = a.profitLost
          bValue = b.profitLost
      }

      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue
    })

  // Summary stats
  const totalPotentialProfit = productMetrics.reduce((sum, p) => sum + p.potentialProfit, 0)
  const totalActualProfit = productMetrics.reduce((sum, p) => sum + p.actualProfit, 0)
  const totalProfitLost = productMetrics.reduce((sum, p) => sum + p.profitLost, 0)
  const avgDiscount = productMetrics.length > 0
    ? productMetrics.reduce((sum, p) => sum + p.avgDiscount, 0) / productMetrics.length
    : 0
  const captureRate = totalPotentialProfit > 0
    ? (totalActualProfit / totalPotentialProfit) * 100
    : 0

  const generatePDF = async () => {
    const { jsPDF } = await import('jspdf')
    const autoTable = (await import('jspdf-autotable')).default
    
    const doc = new jsPDF({
      orientation: 'landscape',
    })
    
    doc.setFontSize(18)
    doc.text(`Discount Analysis - ${viewMode === 'products' ? 'Products' : 'Customers'}`, 14, 20)
    
    doc.setFontSize(10)
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28)
    doc.text(`Period: ${getFilterLabel()}`, 14, 33)
    doc.text(`Potential Profit: $${totalPotentialProfit.toFixed(2)}`, 14, 38)
    doc.text(`Actual Profit: $${totalActualProfit.toFixed(2)}`, 14, 43)
    doc.text(`Profit Lost: $${totalProfitLost.toFixed(2)}`, 14, 48)
    
    if (viewMode === 'products') {
      const tableData = productMetrics.map((product, index) => [
        `#${index + 1}`,
        product.product.sku,
        product.product.name,
        product.unitsSold.toString(),
        `$${product.product.retailPrice.toFixed(2)}`,
        `$${product.avgSellingPrice.toFixed(2)}`,
        `${product.avgDiscount.toFixed(1)}%`,
        `$${product.potentialProfit.toFixed(2)}`,
        `$${product.actualProfit.toFixed(2)}`,
        `$${product.profitLost.toFixed(2)}`,
      ])

      autoTable(doc, {
        startY: 55,
        head: [['Rank', 'SKU', 'Product', 'Units', 'Retail', 'Avg Price', 'Discount %', 'Potential', 'Actual', 'Lost']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [239, 68, 68], textColor: [255, 255, 255], fontStyle: 'bold' },
        columnStyles: { 2: { cellWidth: 40 } },
      })
    } else {
      const tableData = customerMetrics.map((customer, index) => [
        `#${index + 1}`,
        customer.customer.name,
        customer.orderCount.toString(),
        customer.totalUnits.toString(),
        `${customer.avgDiscount.toFixed(1)}%`,
        `${customer.discountRate.toFixed(1)}%`,
        `$${customer.potentialProfit.toFixed(2)}`,
        `$${customer.actualProfit.toFixed(2)}`,
        `$${customer.profitLost.toFixed(2)}`,
      ])

      autoTable(doc, {
        startY: 55,
        head: [['Rank', 'Customer', 'Orders', 'Units', 'Avg Discount', 'Discount Rate', 'Potential', 'Actual', 'Lost']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 2 },
        headStyles: { fillColor: [239, 68, 68], textColor: [255, 255, 255], fontStyle: 'bold' },
      })
    }

    doc.save(`discount-analysis-${viewMode}-${dateFilter}-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const getFilterLabel = () => {
    switch (dateFilter) {
      case '30': return 'Last 30 Days'
      case '60': return 'Last 60 Days'
      case '90': return 'Last 90 Days'
      case 'ytd': return 'Year to Date'
      case 'thisYear': return 'This Year'
      case 'lastYear': return 'Last Year'
      default: return 'Last 30 Days'
    }
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-600 bg-clip-text text-transparent">
            Discount & Pricing Analysis
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <p className="text-sm text-gray-400 mb-2">Potential Profit</p>
            <p className="text-3xl font-bold text-blue-400">${totalPotentialProfit.toFixed(0)}</p>
            <p className="text-xs text-gray-500 mt-1">At full retail</p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <p className="text-sm text-gray-400 mb-2">Actual Profit</p>
            <p className="text-3xl font-bold text-green-400">${totalActualProfit.toFixed(0)}</p>
            <p className="text-xs text-gray-500 mt-1">With discounts</p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <p className="text-sm text-gray-400 mb-2">Profit Lost</p>
            <p className="text-3xl font-bold text-red-400">${totalProfitLost.toFixed(0)}</p>
            <p className="text-xs text-gray-500 mt-1">Due to discounts</p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <p className="text-sm text-gray-400 mb-2">Avg Discount</p>
            <p className="text-3xl font-bold text-orange-400">{avgDiscount.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 mt-1">Across all products</p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <p className="text-sm text-gray-400 mb-2">Capture Rate</p>
            <p className="text-3xl font-bold text-purple-400">{captureRate.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 mt-1">Of potential profit</p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
          <div className="flex gap-4 items-center">
            <label className="text-sm font-medium text-gray-300">View:</label>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('products')}
                className={`px-6 py-2 rounded-lg transition-colors font-medium ${
                  viewMode === 'products'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                📦 Products
              </button>
              <button
                onClick={() => setViewMode('customers')}
                className={`px-6 py-2 rounded-lg transition-colors font-medium ${
                  viewMode === 'customers'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                👥 Customers
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
          <div className="flex gap-6 items-center flex-wrap">
            {/* Date Filter */}
            <div className="flex gap-4 items-center">
              <label className="text-sm font-medium text-gray-300">Period:</label>
              <div className="flex gap-2">
                {[
                  { value: '30', label: 'Last 30 Days' },
                  { value: '60', label: 'Last 60 Days' },
                  { value: '90', label: 'Last 90 Days' },
                  { value: 'ytd', label: 'YTD' },
                  { value: 'thisYear', label: 'This Year' },
                  { value: 'lastYear', label: 'Last Year' },
                ].map(filter => (
                  <button
                    key={filter.value}
                    onClick={() => setDateFilter(filter.value as DateFilter)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      dateFilter === filter.value
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div className="flex gap-4 items-center ml-auto">
              <label className="text-sm font-medium text-gray-300">Sort by:</label>
              {viewMode === 'products' ? (
                <select
                  value={productSortBy}
                  onChange={(e) => setProductSortBy(e.target.value as 'profitLost' | 'discount' | 'units' | 'potentialProfit')}
                  className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100"
                >
                  <option value="profitLost">Profit Lost</option>
                  <option value="discount">Discount %</option>
                  <option value="units">Units Sold</option>
                  <option value="potentialProfit">Potential Profit</option>
                </select>
              ) : (
                <select
                  value={customerSortBy}
                  onChange={(e) => setCustomerSortBy(e.target.value as 'profitLost' | 'discount' | 'orders' | 'discountRate')}
                  className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100"
                >
                  <option value="profitLost">Profit Lost</option>
                  <option value="discount">Avg Discount %</option>
                  <option value="orders">Order Count</option>
                  <option value="discountRate">Discount Rate %</option>
                </select>
              )}
              <button
                onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                {sortOrder === 'desc' ? '↓ Highest First' : '↑ Lowest First'}
              </button>
            </div>
          </div>
        </div>

        {/* Results Table - Products View */}
        {viewMode === 'products' && (
          <>
            {productMetrics.length === 0 ? (
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
                <p className="text-gray-400">No sales data for the selected period.</p>
              </div>
            ) : (
              <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-900 border-b border-gray-700">
                      <tr>
                        <th className="text-left p-4 text-gray-400 font-medium">Rank</th>
                        <th className="text-left p-4 text-gray-400 font-medium">SKU</th>
                        <th className="text-left p-4 text-gray-400 font-medium">Product</th>
                        <th className="text-center p-4 text-gray-400 font-medium">Units Sold</th>
                        <th className="text-right p-4 text-gray-400 font-medium">Retail Price</th>
                        <th className="text-right p-4 text-gray-400 font-medium">Avg Selling Price</th>
                        <th className="text-right p-4 text-gray-400 font-medium">Avg Discount %</th>
                        <th className="text-right p-4 text-gray-400 font-medium">Potential Profit</th>
                        <th className="text-right p-4 text-gray-400 font-medium">Actual Profit</th>
                        <th className="text-right p-4 text-gray-400 font-medium">Profit Lost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productMetrics.map((product, index) => (
                        <tr 
                          key={product.product.id} 
                          className="border-b border-gray-800 hover:bg-gray-900/50 transition-colors"
                        >
                          <td className="p-4 text-gray-300">#{index + 1}</td>
                          <td className="p-4 text-gray-300 font-mono text-sm">{product.product.sku}</td>
                          <td className="p-4 text-gray-100 font-medium">{product.product.name}</td>
                          <td className="p-4 text-center text-cyan-400">{product.unitsSold}</td>
                          <td className="p-4 text-right text-gray-400">${product.product.retailPrice.toFixed(2)}</td>
                          <td className="p-4 text-right text-blue-400">${product.avgSellingPrice.toFixed(2)}</td>
                          <td className="p-4 text-right">
                            <span className={`font-semibold ${
                              product.avgDiscount > 10 ? 'text-red-400' : 
                              product.avgDiscount > 5 ? 'text-orange-400' : 
                              'text-yellow-400'
                            }`}>
                              {product.avgDiscount.toFixed(1)}%
                            </span>
                          </td>
                          <td className="p-4 text-right text-blue-400">${product.potentialProfit.toFixed(2)}</td>
                          <td className="p-4 text-right text-green-400">${product.actualProfit.toFixed(2)}</td>
                          <td className="p-4 text-right">
                            <span className="font-semibold text-red-400">
                              ${product.profitLost.toFixed(2)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Results Table - Customers View */}
        {viewMode === 'customers' && (
          <>
            {customerMetrics.length === 0 ? (
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
                <p className="text-gray-400">No sales data for the selected period.</p>
              </div>
            ) : (
              <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-900 border-b border-gray-700">
                      <tr>
                        <th className="text-left p-4 text-gray-400 font-medium">Rank</th>
                        <th className="text-left p-4 text-gray-400 font-medium">Customer</th>
                        <th className="text-center p-4 text-gray-400 font-medium">Orders</th>
                        <th className="text-center p-4 text-gray-400 font-medium">Total Units</th>
                        <th className="text-right p-4 text-gray-400 font-medium">Avg Discount %</th>
                        <th className="text-right p-4 text-gray-400 font-medium">Discount Rate %</th>
                        <th className="text-right p-4 text-gray-400 font-medium">Potential Profit</th>
                        <th className="text-right p-4 text-gray-400 font-medium">Actual Profit</th>
                        <th className="text-right p-4 text-gray-400 font-medium">Profit Lost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customerMetrics.map((customer, index) => (
                        <tr 
                          key={customer.customer.id} 
                          className="border-b border-gray-800 hover:bg-gray-900/50 transition-colors"
                        >
                          <td className="p-4 text-gray-300">#{index + 1}</td>
                          <td className="p-4 text-gray-100 font-medium">{customer.customer.name}</td>
                          <td className="p-4 text-center text-cyan-400">{customer.orderCount}</td>
                          <td className="p-4 text-center text-purple-400">{customer.totalUnits}</td>
                          <td className="p-4 text-right">
                            <span className={`font-semibold ${
                              customer.avgDiscount > 10 ? 'text-red-400' : 
                              customer.avgDiscount > 5 ? 'text-orange-400' : 
                              'text-yellow-400'
                            }`}>
                              {customer.avgDiscount.toFixed(1)}%
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <span className={`font-semibold ${
                              customer.discountRate > 75 ? 'text-red-400' : 
                              customer.discountRate > 50 ? 'text-orange-400' : 
                              'text-yellow-400'
                            }`}>
                              {customer.discountRate.toFixed(1)}%
                            </span>
                          </td>
                          <td className="p-4 text-right text-blue-400">${customer.potentialProfit.toFixed(2)}</td>
                          <td className="p-4 text-right text-green-400">${customer.actualProfit.toFixed(2)}</td>
                          <td className="p-4 text-right">
                            <span className="font-semibold text-red-400">
                              ${customer.profitLost.toFixed(2)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}