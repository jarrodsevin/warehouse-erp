import Link from 'next/link'
import { prisma } from '@/prisma/prisma.config'

export default async function ViewPurchaseOrdersPage() {
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
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/purchase-orders" className="text-blue-400 hover:text-blue-300">
            ← Back to Purchase Orders Menu
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-4 text-center bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
          View Purchase Orders
        </h1>

        <p className="text-center text-gray-400 mb-12">Detailed purchase order information</p>

        <div className="space-y-6">
          {purchaseOrders.map((po) => (
            <div key={po.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-2xl font-semibold mb-4 text-purple-400">PO #{po.poNumber}</h3>
                  <div className="space-y-2">
                    <p className="text-gray-300"><span className="font-semibold">Vendor:</span> {po.vendor.name}</p>
                    <p className="text-gray-300"><span className="font-semibold">Order Date:</span> {new Date(po.orderDate).toLocaleDateString()}</p>
                    {po.expectedDate && (
                      <p className="text-gray-300"><span className="font-semibold">Expected Date:</span> {new Date(po.expectedDate).toLocaleDateString()}</p>
                    )}
                    <p className="text-gray-300">
                      <span className="font-semibold">Status:</span> 
                      <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
                        po.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        po.status === 'received' ? 'bg-green-500/20 text-green-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {po.status.toUpperCase()}
                      </span>
                    </p>
                    {po.notes && (
                      <p className="text-gray-300"><span className="font-semibold">Notes:</span> {po.notes}</p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-green-400 mb-4">Order Summary</h4>
                  <div className="space-y-2">
                    <p className="text-gray-300">
                      <span className="font-semibold">Total Items:</span> {po.items.length}
                    </p>
                    <p className="text-gray-300">
                      <span clas