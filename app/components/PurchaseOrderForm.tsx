'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPurchaseOrder, updatePurchaseOrder } from '@/app/actions/purchaseOrders'

type PurchaseOrderFormProps = {
  purchaseOrder?: any
  vendors: any[]
  products: any[]
}

export default function PurchaseOrderForm({ purchaseOrder, vendors, products }: PurchaseOrderFormProps) {
  const router = useRouter()
  const [items, setItems] = useState(purchaseOrder?.items || [{ productId: '', quantity: 1, unitCost: 0 }])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const data = {
      poNumber: formData.get('poNumber') as string,
      vendorId: formData.get('vendorId') as string,
      orderDate: new Date(formData.get('orderDate') as string + 'T00:00:00'),
      expectedDate: formData.get('expectedDate') ? new Date(formData.get('expectedDate') as string + 'T00:00:00') : undefined,
      status: formData.get('status') as string,
      notes: formData.get('notes') as string || undefined,
      items: items
        .filter(item => item.productId && item.quantity > 0)
        .map(({ productId, quantity, unitCost }) => ({ productId, quantity, unitCost }))
    }

    if (purchaseOrder) {
      await updatePurchaseOrder(purchaseOrder.id, data)
    } else {
      await createPurchaseOrder(data)
    }
    
    router.push('/purchase-orders')
    router.refresh()
  }

  function addItem() {
    setItems([...items, { productId: '', quantity: 1, unitCost: 0 }])
  }

  function removeItem(index: number) {
    setItems(items.filter((_: any, i: number) => i !== index))
  }

  function updateItem(index: number, field: string, value: any) {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 font-medium mb-1.5">PO Number</label>
          <input
            type="text"
            name="poNumber"
            defaultValue={purchaseOrder?.poNumber}
            required
            className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="Enter PO number"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1.5">Vendor</label>
          <select
            name="vendorId"
            defaultValue={purchaseOrder?.vendorId}
            required
            className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Select Vendor</option>
            {vendors.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 font-medium mb-1.5">Order Date</label>
          <input
            type="date"
            name="orderDate"
            defaultValue={purchaseOrder?.orderDate ? purchaseOrder.orderDate.toString().split('T')[0] : new Date().toISOString().split('T')[0]}
            required
            className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1.5">Expected Date</label>
          <input
            type="date"
            name="expectedDate"
            defaultValue={purchaseOrder?.expectedDate ? purchaseOrder.expectedDate.toString().split('T')[0] : ''}
            className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-1.5">Status</label>
        <select
          name="status"
          defaultValue={purchaseOrder?.status || 'pending'}
          required
          className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          <option value="pending">Pending</option>
          <option value="received">Received</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-1.5">Notes</label>
        <textarea
          name="notes"
          defaultValue={purchaseOrder?.notes}
          className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          rows={3}
          placeholder="Additional notes (optional)"
        />
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-2">Line Items</label>
        <div className="space-y-2">
          {items.map((item: any, index: number) => (
            <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">Product</label>
                  <select
                    value={item.productId}
                    onChange={(e) => updateItem(index, 'productId', e.target.value)}
                    required
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Select Product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.sku})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Qty</label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                    min="1"
                    required
                    className="w-20 bg-white border border-gray-300 text-gray-900 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Unit Cost</label>
                  <input
                    type="number"
                    value={item.unitCost}
                    onChange={(e) => updateItem(index, 'unitCost', parseFloat(e.target.value))}
                    step="0.01"
                    min="0"
                    required
                    className="w-28 bg-white border border-gray-300 text-gray-900 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addItem}
          className="mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
        >
          + Add Item
        </button>
      </div>

      <div className="flex gap-4 pt-2">
        <button type="submit" className="px-6 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors">
          {purchaseOrder ? 'Update' : 'Create'} Purchase Order
        </button>
        <button
          type="button"
          onClick={() => router.push('/purchase-orders')}
          className="px-6 py-2.5 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}