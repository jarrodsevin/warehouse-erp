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
  cost: number
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
  total: number
  customer: Customer
  items: SalesOrderItem[]
}

type CustomerMetrics = {
  customer: Customer
  orderCount: number
  totalRevenue: number
  totalProfit: number
  profitMargin: number
  avgOrderValue: number
}

type DateFilter = '30' | '60' | '90' | 'ytd' | 'thisYear' | 'lastYear'

export default function CustomerSalesReport() {
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [dateFilter, setDateFilter] = useState<DateFilter>('30')
  const [sortBy, setSortBy] = useState<'profit' | 'revenue' | 'orders' | 'margin'>('profit')
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

  // Calculate customer metrics
  const customerMetrics: CustomerMetrics[] = Array.from(
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
      const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
      
      // Calculate total profit (revenue - cost)
      const totalProfit = orders.reduce((sum, order) => {
        const orderProfit = order.items.reduce((itemSum, item) => {
          const profit = (item.unitPrice - item.product.cost) * item.quantity
          return itemSum + profit
        }, 0)
        return sum + orderProfit
      }, 0)

      const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0
      const avgOrderValue = totalRevenue / orders.length

      return {
        customer: data.customer,
        orderCount: orders.length,
        totalRevenue,
        totalProfit,
        profitMargin,
        avgOrderValue,
      }
    })
    .sort((a, b) => {
      let aValue: number, bValue: number
      
      switch (sortBy) {
        case 'profit':
          aValue = a.totalProfit
          bValue = b.totalProfit
          break
        case 'revenue':
          aValue = a.totalRevenue
          bValue = b.totalRevenue
          break
        case 'orders':
          aValue = a.orderCount
          bValue = b.orderCount
          break
        case 'margin':
          aValue = a.profitMargin
          bValue = b.profitMargin
          break
        default:
          aValue = a.totalProfit
          bValue = b.totalProfit
      }

      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue
    })

  // Summary stats
  const totalCustomers = customerMetrics.length
  const totalRevenue = customerMetrics.reduce((sum, c) => sum + c.totalRevenue, 0)
  const totalProfit = customerMetrics.reduce((sum, c) => sum + c.totalProfit, 0)
  const avgProfitMargin = totalCustomers > 0 
    ? customerMetrics.reduce((sum, c) => sum + c.profitMargin, 0) / totalCustomers 
    : 0
  const totalOrders = customerMetrics.reduce((sum, c) => sum + c.orderCount, 0)

  const generatePDF = async () => {
    const { jsPDF } = await import('jspdf')
    const autoTable = (await import('jspdf-autotable')).default
    
    const doc = new jsPDF({
      orientation: 'landscape',
    })
    
    doc.setFontSize(18)
    doc.text('Customer Sales Performance Report', 14, 20)
    
    doc.setFontSize(10)
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28)
    doc.text(`Period: ${getFilterLabel()}`, 14, 33)
    doc.text(`Total Customers: ${totalCustomers}`, 14, 38)
    doc.text(`Total Revenue: $${totalRevenue.toFixed(2)}`, 14, 43)
    doc.text(`Total Profit: $${totalProfit.toFixed(2)}`, 14, 48)
    
    const tableData = customerMetrics.map((customer, index) => [
      `#${index + 1}`,
      customer.customer.name,
      customer.orderCount.toString(),
      `$${customer.totalRevenue.toFixed(2)}`,
      `$${customer.totalProfit.toFixed(2)}`,
      `${customer.profitMargin.toFixed(2)}%`,
      `$${customer.avgOrderValue.toFixed(2)}`,
    ])

    autoTable(doc, {
      startY: 55,
      head: [[
        'Rank',
        'Customer',
        'Orders',
        'Revenue',
        'Profit',
        'Margin %',
        'Avg Order Value',
      ]],
      body: tableData,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [99, 102, 241],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
    })

    doc.save(`customer-sales-${dateFilter}-${new Date().toISOString().split('T')[0]}.pdf`)
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-600 bg-clip-text text-transparent">
            Customer Sales Performance
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
            <p className="text-sm text-gray-400 mb-2">Customers</p>
            <p className="text-3xl font-bold text-blue-400">{totalCustomers}</p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <p className="text-sm text-gray-400 mb-2">Total Orders</p>
            <p className="text-3xl font-bold text-cyan-400">{totalOrders}</p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <p className="text-sm text-gray-400 mb-2">Total Revenue</p>
            <p className="text-3xl font-bold text-blue-400">${totalRevenue.toFixed(0)}</p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <p className="text-sm text-gray-400 mb-2">Total Profit</p>
            <p className="text-3xl font-bold text-green-400">${totalProfit.toFixed(0)}</p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <p className="text-sm text-gray-400 mb-2">Avg Margin</p>
            <p className="text-3xl font-bold text-yellow-400">{avgProfitMargin.toFixed(1)}%</p>
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
                        ? 'bg-indigo-500 text-white'
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
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'profit' | 'revenue' | 'orders' | 'margin')}
                className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100"
              >
                <option value="profit">Total Profit</option>
                <option value="revenue">Total Revenue</option>
                <option value="orders">Order Count</option>
                <option value="margin">Profit Margin %</option>
              </select>
              <button
                onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                {sortOrder === 'desc' ? '↓ Highest First' : '↑ Lowest First'}
              </button>
            </div>
          </div>
        </div>

        {/* Results Table */}
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
                    <th className="text-right p-4 text-gray-400 font-medium">Revenue</th>
                    <th className="text-right p-4 text-gray-400 font-medium">Profit</th>
                    <th className="text-right p-4 text-gray-400 font-medium">Margin %</th>
                    <th className="text-right p-4 text-gray-400 font-medium">Avg Order Value</th>
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
                      <td className="p-4 text-right text-blue-400">${customer.totalRevenue.toFixed(2)}</td>
                      <td className="p-4 text-right">
                        <span className={`font-semibold ${
                          customer.totalProfit > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          ${customer.totalProfit.toFixed(2)}
                        </span>
                      </td>
                      <td className="p-4 text-right text-yellow-400">{customer.profitMargin.toFixed(2)}%</td>
                      <td className="p-4 text-right text-purple-400">${customer.avgOrderValue.toFixed(2)}</td>
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