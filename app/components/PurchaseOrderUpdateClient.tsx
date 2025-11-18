'use client'

import Link from 'next/link'
import { useState } from 'react'
import PageLayout from '@/app/components/PageLayout'

type PurchaseOrder = {
  id: string
  poNumber: string
  orderDate: Date
  status: string
  vendor: {
    name: string
  }
  items: {
    quantity: number
    unitCost: number
  }[]
}

function PurchaseOrderCard({ po }: { po: PurchaseOrder }) {
  const total = po.items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0)
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 h-full flex flex-col shadow-sm">
      <h3 className="text-xl font-semibold mb-2 text-gray-900">PO #{po.poNumber}</h3>
      <p className="text-gray-600 text-sm mb-1">Vendor: {po.vendor.name}</p>
      <p className="text-gray-600 text-sm mb-1">
        Date: {new Date(po.orderDate).toLocaleDateString()}
      </p>
      <p className="text-gray-600 text-sm mb-2">
        Status: 
        <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
          po.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
          po.status === 'received' ? 'bg-green-100 text-green-700' :
          'bg-red-100 text-red-700'
        }`}>
          {po.status.toUpperCase()}
        </span>
      </p>
      <p className="text-gray-900 text-sm font-semibold mb-4 flex-grow">
        Total: ${total.toFixed(2)}
      </p>
      <Link
        href={`/purchase-orders/${po.id}/edit`}
        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-center"
      >
        Edit
      </Link>
    </div>
  )
}

export default function PurchaseOrderUpdateClient({ purchaseOrders }: { purchaseOrders: PurchaseOrder[] }) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredPurchaseOrders = purchaseOrders.filter((po) => {
    const query = searchQuery.toLowerCase()
    return (
      po.poNumber.toLowerCase().includes(query) ||
      po.vendor.name.toLowerCase().includes(query) ||
      po.status.toLowerCase().includes(query)
    )
  })

  return (
    <PageLayout>
      {/* Blue Header Section */}
      <div className="bg-blue-600 text-white py-12 px-8 -m-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4">
            <Link href="/purchase-orders" className="text-blue-100 hover:text-white font-medium">
              ← Back to Purchase Orders Menu
            </Link>
          </div>
          <h1 className="text-4xl font-bold mb-2">
            Update Purchase Orders
          </h1>
          <p className="text-blue-100">
            Select a purchase order to edit
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by PO number, vendor, or status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
        <p className="text-sm text-gray-500 mt-2 text-center">
          Showing {filteredPurchaseOrders.length} of {purchaseOrders.length} purchase orders
        </p>
      </div>

      {/* Purchase Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPurchaseOrders.map((po) => (
          <PurchaseOrderCard key={po.id} po={po} />
        ))}
      </div>

      {/* Empty States */}
      {filteredPurchaseOrders.length === 0 && searchQuery && (
        <p className="text-center text-gray-500 mt-8">No purchase orders match your search.</p>
      )}
      {purchaseOrders.length === 0 && (
        <p className="text-center text-gray-500 mt-8">No purchase orders found. Create one first!</p>
      )}
    </PageLayout>
  )
}