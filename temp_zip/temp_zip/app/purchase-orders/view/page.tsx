import PageLayout from '@/app/components/PageLayout'
import { prisma } from '@/prisma/prisma.config'

export const dynamic = 'force-dynamic';

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
    <PageLayout
      title="Purchase Orders"
      subtitle="Detailed purchase order information"
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Purchase Orders', href: '/purchase-orders' },
        { label: 'View Orders' }
      ]}
    >
      <div className="space-y-6">
        {purchaseOrders.map((po) => (
          <div key={po.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">PO #{po.poNumber}</h3>
                <div className="space-y-2">
                  <p className="text-gray-600"><span className="font-semibold text-gray-900">Vendor:</span> {po.vendor.name}</p>
                  <p className="text-gray-600"><span className="font-semibold text-gray-900">Order Date:</span> {new Date(po.orderDate).toLocaleDateString()}</p>
                  {po.expectedDate && (
                    <p className="text-gray-600"><span className="font-semibold text-gray-900">Expected Date:</span> {new Date(po.expectedDate).toLocaleDateString()}</p>
                  )}
                  <p className="text-gray-600">
                    <span className="font-semibold text-gray-900">Status:</span> 
                    <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
                      po.status === 'pending' ? 'bg-warning-light text-warning-dark' :
                      po.status === 'received' ? 'bg-success-light text-success-dark' :
                      'bg-error-light text-error-dark'
                    }`}>
                      {po.status.toUpperCase()}
                    </span>
                  </p>
                  {po.notes && (
                    <p className="text-gray-600"><span className="font-semibold text-gray-900">Notes:</span> {po.notes}</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Order Summary</h4>
                <div className="space-y-2">
                  <p className="text-gray-600">
                    <span className="font-semibold text-gray-900">Total Items:</span> {po.items.length}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold text-gray-900">Total Cost:</span> <span className="text-gray-900 font-medium">${po.items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0).toFixed(2)}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Cost</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {po.items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{item.product.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.product.sku}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">${item.unitCost.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">${(item.quantity * item.unitCost).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </PageLayout>
  )
}
