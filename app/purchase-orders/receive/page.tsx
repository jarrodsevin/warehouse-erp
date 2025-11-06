'use client';

import { useEffect, useState } from 'react';

interface Product {
  id: string;
  sku: string;
  name: string;
  cost: number;
  retailPrice: number;
  category: { id: string; name: string } | null;
  subcategory: { id: string; name: string } | null;
  brand: { id: string; name: string } | null;
}

interface PurchaseOrderItem {
  id: string;
  quantity: number;
  unitCost: number;
  product: Product;
}

interface Vendor {
  id: string;
  name: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  orderDate: string;
  expectedDate: string | null;
  receivedDate: string | null;
  status: string;
  notes: string | null;
  vendor: Vendor;
  items: PurchaseOrderItem[];
}

export default function ReceivePurchaseOrders() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [filteredPOs, setFilteredPOs] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [expandedPO, setExpandedPO] = useState<string | null>(null);
  const [receiving, setReceiving] = useState<string | null>(null);

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  useEffect(() => {
    filterPurchaseOrders();
  }, [purchaseOrders, selectedStatuses]);

  const fetchPurchaseOrders = async () => {
    try {
      const response = await fetch('/api/purchase-orders');
      const data = await response.json();
      setPurchaseOrders(data.purchaseOrders);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
      setLoading(false);
    }
  };

  const filterPurchaseOrders = () => {
    let filtered = [...purchaseOrders];

    if (selectedStatuses.length > 0) {
      filtered = filtered.filter((po) => selectedStatuses.includes(po.status));
    }

    setFilteredPOs(filtered);
  };

  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const clearStatusFilters = () => {
    setSelectedStatuses([]);
  };

  const handleReceivePO = async (poId: string) => {
    if (!confirm('Mark this Purchase Order as received? This will update inventory.')) {
      return;
    }

    setReceiving(poId);

    try {
      const response = await fetch('/api/purchase-orders/receive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ poId }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Purchase Order received successfully! Inventory has been updated.');
        fetchPurchaseOrders();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error receiving purchase order:', error);
      alert('Failed to receive purchase order');
    } finally {
      setReceiving(null);
    }
  };

  const calculatePOTotal = (items: PurchaseOrderItem[]) => {
    return items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-warning-light text-warning-dark border-yellow-500/30';
      case 'received':
        return 'bg-success-light text-success-dark border-green-500/30';
      case 'cancelled':
        return 'bg-error-light text-error-dark border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-600 border-gray-500/30';
    }
  };

  const statuses = ['pending', 'received', 'cancelled'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-gray-900 text-center">Loading purchase orders...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Receive Purchase Orders
          </h1>
          <p className="text-gray-600">
            View and receive purchase orders to update inventory
          </p>
        </div>

        {/* Status Filter Tiles */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Filter by Status</h3>
            {selectedStatuses.length > 0 && (
              <button
                onClick={clearStatusFilters}
                className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
              >
                Clear ({selectedStatuses.length})
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => toggleStatus(status)}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  selectedStatuses.includes(status)
                    ? getStatusColor(status)
                    : 'bg-white/50 text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-gray-600">
          Showing {filteredPOs.length} of {purchaseOrders.length} purchase orders
        </div>

        {/* Purchase Orders List */}
        <div className="space-y-4">
          {filteredPOs.length === 0 ? (
            <div className="bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl p-8 text-center">
              <p className="text-gray-600">No purchase orders found</p>
            </div>
          ) : (
            filteredPOs.map((po) => (
              <div
                key={po.id}
                className="bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-all"
              >
                {/* PO Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {po.poNumber}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-lg text-sm border ${getStatusColor(
                          po.status
                        )}`}
                      >
                        {po.status.charAt(0).toUpperCase() + po.status.slice(1)}
                      </span>
                    </div>
                    <div className="text-gray-600 space-y-1">
                      <p>
                        <span className="font-medium">Vendor:</span>{' '}
                        {po.vendor.name}
                      </p>
                      <p>
                        <span className="font-medium">Order Date:</span>{' '}
                        {new Date(po.orderDate).toLocaleDateString()}
                      </p>
                      {po.expectedDate && (
                        <p>
                          <span className="font-medium">Expected:</span>{' '}
                          {new Date(po.expectedDate).toLocaleDateString()}
                        </p>
                      )}
                      {po.receivedDate && (
                        <p>
                          <span className="font-medium">Received:</span>{' '}
                          {new Date(po.receivedDate).toLocaleDateString()}
                        </p>
                      )}
                      <p>
                        <span className="font-medium">Total:</span> $
                        {calculatePOTotal(po.items).toFixed(2)}
                      </p>
                      <p>
                        <span className="font-medium">Items:</span>{' '}
                        {po.items.length} products
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setExpandedPO(expandedPO === po.id ? null : po.id)
                      }
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-gray-900 rounded-lg transition-colors"
                    >
                      {expandedPO === po.id ? 'Hide Details' : 'Show Details'}
                    </button>
                    {po.status === 'pending' && (
                      <button
                        onClick={() => handleReceivePO(po.id)}
                        disabled={receiving === po.id}
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {receiving === po.id ? 'Processing...' : 'Mark as Received'}
                      </button>
                    )}
                  </div>
                </div>

                {/* PO Items Table (Expandable) */}
                {expandedPO === po.id && (
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      Order Items
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-gray-600 font-medium">
                              SKU
                            </th>
                            <th className="text-left py-3 px-4 text-gray-600 font-medium">
                              Product Name
                            </th>
                            <th className="text-left py-3 px-4 text-gray-600 font-medium">
                              Category
                            </th>
                            <th className="text-right py-3 px-4 text-gray-600 font-medium">
                              Quantity
                            </th>
                            <th className="text-right py-3 px-4 text-gray-600 font-medium">
                              Unit Cost
                            </th>
                            <th className="text-right py-3 px-4 text-gray-600 font-medium">
                              Total Cost
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {po.items.map((item, index) => (
                            <tr
                              key={item.id}
                              className={
                                index % 2 === 0 ? 'bg-white/30' : 'bg-white/10'
                              }
                            >
                              <td className="py-3 px-4 text-gray-600">
                                {item.product.sku}
                              </td>
                              <td className="py-3 px-4 text-gray-900">
                                {item.product.name}
                              </td>
                              <td className="py-3 px-4 text-gray-600">
                                {item.product.category?.name || 'N/A'}
                              </td>
                              <td className="py-3 px-4 text-right text-gray-600">
                                {item.quantity}
                              </td>
                              <td className="py-3 px-4 text-right text-gray-600">
                                ${item.unitCost.toFixed(2)}
                              </td>
                              <td className="py-3 px-4 text-right text-gray-900 font-medium">
                                ${(item.quantity * item.unitCost).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {po.notes && (
                  <div className="mt-4 p-3 bg-gray-50/50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Notes:</span> {po.notes}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}