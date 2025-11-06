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
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emailAddress, setEmailAddress] = useState('')
  const [emailSubject, setEmailSubject] = useState('Customer Sales Performance Report')
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailStatus, setEmailStatus] = useState<'idle' | 'success' | 'error'>('idle')

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

  const generatePDFDocument = async () => {
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

    return doc
  }

  const exportToPDF = async () => {
    const doc = await generatePDFDocument()
    doc.save(`customer-sales-${dateFilter}-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const sendEmail = async () => {
    if (!emailAddress) return

    setSendingEmail(true)
    setEmailStatus('idle')

    try {
      const doc = await generatePDFDocument()
      
      // Convert PDF to base64
      const pdfBase64 = doc.output('datauristring').split(',')[1]

      // Create HTML email body
      const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Customer Sales Performance Report</h2>
          <p>Please find attached the customer sales performance report.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Report Summary</h3>
            <p><strong>Period:</strong> ${getFilterLabel()}</p>
            <p><strong>Total Customers:</strong> ${totalCustomers}</p>
            <p><strong>Total Orders:</strong> ${totalOrders}</p>
            <p><strong>Total Revenue:</strong> $${totalRevenue.toFixed(2)}</p>
            <p><strong>Total Profit:</strong> $${totalProfit.toFixed(2)}</p>
            <p><strong>Average Margin:</strong> ${avgProfitMargin.toFixed(2)}%</p>
          </div>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            This is an automated message from Warehouse ERP System.
          </p>
        </div>
      `

      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: emailAddress,
          subject: emailSubject,
          html: htmlBody,
          attachments: [
            {
              filename: `customer-sales-${dateFilter}-${new Date().toISOString().split('T')[0]}.pdf`,
              content: pdfBase64
            }
          ]
        })
      })

      const result = await response.json()

      if (response.ok) {
        setEmailStatus('success')
        setTimeout(() => {
          setShowEmailModal(false)
          setEmailStatus('idle')
        }, 2000)
      } else {
        setEmailStatus('error')
        console.error('Email error:', result.error)
      }
    } catch (error) {
      setEmailStatus('error')
      console.error('Error sending email:', error)
    } finally {
      setSendingEmail(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading report...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Customer Sales Performance
          </h1>
          <div className="flex gap-3">
            <button
              onClick={exportToPDF}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              Export PDF
            </button>
            <button
              onClick={() => setShowEmailModal(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              📧 Email PDF
            </button>
            <Link
              href="/reports"
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300 rounded-lg transition-colors"
            >
              ← Back to Reports
            </Link>
          </div>
        </div>

        {/* Email Modal */}
        {showEmailModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Email Customer Sales Report</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email Address</label>
                  <input
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="recipient@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Subject</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                
                {emailStatus === 'success' && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded">
                    Email sent successfully!
                  </div>
                )}
                
                {emailStatus === 'error' && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded">
                    Failed to send email. Please try again.
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                  disabled={sendingEmail}
                >
                  Cancel
                </button>
                <button
                  onClick={sendEmail}
                  disabled={!emailAddress || sendingEmail}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingEmail ? 'Sending...' : 'Send Email'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <p className="text-sm text-gray-600 mb-2">Customers</p>
            <p className="text-3xl font-bold text-primary-600">{totalCustomers}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <p className="text-sm text-gray-600 mb-2">Total Orders</p>
            <p className="text-3xl font-bold text-gray-900">{totalOrders}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <p className="text-sm text-gray-600 mb-2">Total Revenue</p>
            <p className="text-3xl font-bold text-primary-600">${totalRevenue.toFixed(0)}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <p className="text-sm text-gray-600 mb-2">Total Profit</p>
            <p className="text-3xl font-bold text-gray-900">${totalProfit.toFixed(0)}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <p className="text-sm text-gray-600 mb-2">Avg Margin</p>
            <p className="text-3xl font-bold text-warning-dark">{avgProfitMargin.toFixed(1)}%</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <div className="flex gap-6 items-center flex-wrap">
            {/* Date Filter */}
            <div className="flex gap-4 items-center">
              <label className="text-sm font-medium text-gray-600">Period:</label>
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
                    className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                      dateFilter === filter.value
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div className="flex gap-4 items-center ml-auto">
              <label className="text-sm font-medium text-gray-600">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'profit' | 'revenue' | 'orders' | 'margin')}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900"
              >
                <option value="profit">Total Profit</option>
                <option value="revenue">Total Revenue</option>
                <option value="orders">Order Count</option>
                <option value="margin">Profit Margin %</option>
              </select>
              <button
                onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300 rounded-lg transition-colors"
              >
                {sortOrder === 'desc' ? '↓ Highest First' : '↑ Lowest First'}
              </button>
            </div>
          </div>
        </div>

        {/* Results Table */}
        {customerMetrics.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-600">No sales data for the selected period.</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left p-4 text-gray-600 font-medium">Rank</th>
                    <th className="text-left p-4 text-gray-600 font-medium">Customer</th>
                    <th className="text-center p-4 text-gray-600 font-medium">Orders</th>
                    <th className="text-right p-4 text-gray-600 font-medium">Revenue</th>
                    <th className="text-right p-4 text-gray-600 font-medium">Profit</th>
                    <th className="text-right p-4 text-gray-600 font-medium">Margin %</th>
                    <th className="text-right p-4 text-gray-600 font-medium">Avg Order Value</th>
                  </tr>
                </thead>
                <tbody>
                  {customerMetrics.map((customer, index) => (
                    <tr
                      key={customer.customer.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4 text-gray-600">#{index + 1}</td>
                      <td className="p-4 text-gray-900 font-medium">{customer.customer.name}</td>
                      <td className="p-4 text-center text-gray-900">{customer.orderCount}</td>
                      <td className="p-4 text-right text-primary-600">${customer.totalRevenue.toFixed(2)}</td>
                      <td className="p-4 text-right">
                        <span className={`font-semibold ${
                          customer.totalProfit > 0 ? 'text-gray-900' : 'text-red-400'
                        }`}>
                          ${customer.totalProfit.toFixed(2)}
                        </span>
                      </td>
                      <td className="p-4 text-right text-warning-dark">{customer.profitMargin.toFixed(2)}%</td>
                      <td className="p-4 text-right text-gray-900">${customer.avgOrderValue.toFixed(2)}</td>
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