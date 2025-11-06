import Link from 'next/link'
import { prisma } from '@/prisma/prisma.config'

export default async function UpdatePurchaseOrdersPage() {
  const purchaseOrders = await prisma.purchaseOrder.findMany({
    include: {
      vendor: true,
      items: {
        include: {
          product: true
        }
      }
    },
    orderBy: { orderDate: 'desc' }
  })

  return (
    <div className="min-h-screen py-16 px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/purchase-orders" className="text-blue-400 hover:text-blue-300">
            ← Back to Purchase Orders Menu
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-4 text-center bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
          Update Purchase Orders
        </h1>

        <p className="text-center text-gray-400 mb-12">Select a purchase order to edit</p>

        <div className="space-y-4">
          {purchaseOrders.map((po) => (
            <div key={po.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2 text-purple-400">PO #{po.poNumber}</h3>
                  <p className="text-gray-400 text-sm mb-1">Vendor: {po.vendor.name}</p>
                  <p className="text-gray-400 text-sm mb-1">Order Date: {new Date(po.orderDate).toLocaleDateString()}</p>
                  <p className="text-gray-400 text-sm mb-1">
                    Status: 
                    <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
                      po.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      po.status === 'received' ? 'bg-green-500/20 text-green-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {po.status.toUpperCase()}
                    </span>
                  </p>
                  <p className="text-gray-400 text-sm">
                    Total: ${po.items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0).toFixed(2)}
                  </p>
                </div>
                
                <Link 
                  href={`/purchase-orders/${po.id}`}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>

        {purchaseOrders.length === 0 && (
          <p className="text-center text-gray-400 mt-8">No purchase orders found. Create one first!</p>
        )}
      </div>
    </div>
  )
}