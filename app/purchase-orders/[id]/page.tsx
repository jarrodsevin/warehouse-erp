import { prisma } from '@/prisma/prisma.config'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import PageLayout from '@/app/components/PageLayout'

export default async function PurchaseOrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const purchaseOrder = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: {
      vendor: true,
      items: {
        include: {
          product: true
        }
      }
    }
  })

  if (!purchaseOrder) {
    notFound()
  }

  const totalCost = purchaseOrder.items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0)

  return (
    <PageLayout>
      {/* Blue Header Section */}
      <div className="bg-blue-600 text-white py-12 px-4 md:px-8 -m-4 md:-m-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4">
            <Link href="/purchase-orders/view" className="text-blue-100 hover:text-white font-medium">
              ← Back to Purchase Orders
            </Link>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Purchase Order #{purchaseOrder.poNumber}
              </h1>
              <p className="text-blue-100">
                {purchaseOrder.vendor.name}
              </p>
            </div>
            <div>
              <span className={`px-4 py-2 text-sm rounded-full capitalize font-medium inline-block ${
                purchaseOrder.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                purchaseOrder.status === 'received' ? 'bg-green-100 text-green-700' :
                'bg-red-100 text-red-700'
              }`}>
                {purchaseOrder.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Vendor Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
            Vendor Information
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Vendor Name</p>
              <p className="text-sm font-medium text-gray-900">{purchaseOrder.vendor.name}</p>
            </div>
            {purchaseOrder.vendor.email && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Email</p>
                <p className="text-sm text-gray-900">{purchaseOrder.vendor.email}</p>
              </div>
            )}
            {purchaseOrder.vendor.phone && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Phone</p>
                <p className="text-sm text-gray-900">{purchaseOrder.vendor.phone}</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Dates */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
            Order Dates
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Order Date</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date(purchaseOrder.orderDate).toLocaleDateString()}
              </p>
            </div>
            {purchaseOrder.expectedDate && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Expected Date</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(purchaseOrder.expectedDate).toLocaleDateString()}
                </p>
              </div>
            )}
            {purchaseOrder.receivedDate && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Received Date</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(purchaseOrder.receivedDate).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
          Order Summary
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Total Items</p>
            <p className="text-2xl font-bold text-gray-900">{purchaseOrder.items.length}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Total Units</p>
            <p className="text-2xl font-bold text-gray-900">
              {purchaseOrder.items.reduce((sum, item) => sum + item.quantity, 0)}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-gray-500 mb-1">Total Cost</p>
            <p className="text-3xl font-bold text-green-600">${totalCost.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Notes */}
      {purchaseOrder.notes && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Notes</h2>
          <p className="text-gray-700">{purchaseOrder.notes}</p>
        </div>
      )}

      {/* Order Items */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
          Order Items
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Cost
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {purchaseOrder.items.map((item, index) => (
                <tr 
                  key={item.id} 
                  className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  <td className="px-4 py-4 text-sm text-gray-900 font-medium">
                    {item.product.name}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {item.product.sku}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900 text-right">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900 text-right">
                    ${item.unitCost.toFixed(2)}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900 font-semibold text-right">
                    ${(item.quantity * item.unitCost).toFixed(2)}
                  </td>
                </tr>
              ))}
              <tr className="border-t-2 border-gray-300 bg-gray-50">
                <td colSpan={4} className="px-4 py-4 text-sm font-semibold text-gray-900 text-right">
                  Total:
                </td>
                <td className="px-4 py-4 text-lg font-bold text-green-600 text-right">
                  ${totalCost.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex gap-4">
        <Link
          href="/purchase-orders/view"
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          Back to List
        </Link>
        {purchaseOrder.status === 'pending' && (
          <Link
            href={`/purchase-orders/receive`}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Receive This Order
          </Link>
        )}
      </div>
    </PageLayout>
  )
}