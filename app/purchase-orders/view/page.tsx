'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PageLayout from '@/app/components/PageLayout'

interface PurchaseOrderItem {
  id: string
  quantity: number
  unitCost: number
  product: {
    name: string
    sku: string
  }
}

interface PurchaseOrder {
  id: string
  poNumber: string
  orderDate: string
  expectedDate: string | null
  receivedDate: string | null
  status: string
  notes: string | null
  vendor: {
    id: string
    name: string
  }
  items: PurchaseOrderItem[]
}

export default function ViewPurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchPurchaseOrders()
  }, [])

  const fetchPurchaseOrders = async () => {
    try {
      const response = await fetch('/api/purchase-orders')
      const data = await response.json()
      setPurchaseOrders(data.purchaseOrders || [])
    } catch (error) {
      console.error('Error fetching purchase orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const statuses = ['pending', 'received', 'cancelled']

  const toggleStatus = (status: string) => {
    setSelectedStatus(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    )
  }

  const filteredPurchaseOrders = purchaseOrders.filter(po => {
    const matchesSearch = po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         po.vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         po.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus.length === 0 || selectedStatus.includes(po.status)
    return matchesSearch && matchesStatus
  })

  const activeFilterCount = selectedStatus.length

  const calculateTotal = (items: PurchaseOrderItem[]) => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0)
  }

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading purchase orders...</div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      {/* Blue Header Section */}
      <div className="bg-blue-600 text-white py-12 px-4 md:px-8 -m-4 md:-m-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4">
            <Link href="/purchase-orders" className="text-blue-100 hover:text-white font-medium">
              ← Back to Purchase Orders Menu
            </Link>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            View Purchase Orders
          </h1>
          <p className="text-blue-100">
            Browse and manage your purchase orders
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by PO number, vendor, or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-10 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Filter Section */}
      <div className="mb-6">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium mb-2 flex items-center gap-2"
        >
          <span>{showFilters ? '▼' : '▶'}</span>
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">
              {activeFilterCount}
            </span>
          )}
        </button>

        {showFilters && (
          <div className="space-y-4 p-4 bg-white rounded-lg border border-gray-200">
            {/* Status Filters */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Status</span>
                {selectedStatus.length > 0 && (
                  <button
                    onClick={() => setSelectedStatus([])}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Clear ({selectedStatus.length})
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {statuses.map(status => (
                  <button
                    key={status}
                    onClick={() => toggleStatus(status)}
                    className={`px-3 py-1.5 rounded text-sm capitalize transition-colors ${
                      selectedStatus.includes(status)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredPurchaseOrders.length} of {purchaseOrders.length} purchase orders
      </div>

      {/* Purchase Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredPurchaseOrders.map((po) => (
          <div
            key={po.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:shadow-md transition-all"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900 text-xl mb-1">
                  PO #{po.poNumber}
                </h3>
                <p className="text-sm text-gray-600">{po.vendor.name}</p>
              </div>
              <span className={`px-3 py-1 text-xs rounded-full capitalize font-medium ${
                po.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                po.status === 'received' ? 'bg-green-100 text-green-700' :
                'bg-red-100 text-red-700'
              }`}>
                {po.status}
              </span>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-200">
              <div>
                <p className="text-xs text-gray-500 mb-1">Order Date</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(po.orderDate).toLocaleDateString()}
                </p>
              </div>
              {po.expectedDate && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Expected Date</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(po.expectedDate).toLocaleDateString()}
                  </p>
                </div>
              )}
              {po.receivedDate && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Received Date</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(po.receivedDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Items</p>
                <p className="text-lg font-semibold text-gray-900">
                  {po.items.length}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Cost</p>
                <p className="text-lg font-semibold text-green-600">
                  ${calculateTotal(po.items).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Notes */}
            {po.notes && (
              <div className="mb-4 p-3 bg-gray-50 rounded text-sm text-gray-700">
                <p className="text-xs text-gray-500 mb-1">Notes</p>
                {po.notes}
              </div>
            )}

            {/* Action Button */}
            <div className="flex gap-2 pt-4 border-t border-gray-200">
              <Link
                href={`/purchase-orders/${po.id}`}
                className="w-full text-center px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filteredPurchaseOrders.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">No purchase orders found matching your filters.</p>
        </div>
      )}
    </PageLayout>
  )
}