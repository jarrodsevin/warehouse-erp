'use client';

import { useEffect, useState } from 'react';
import PageLayout from '@/app/components/PageLayout';
import Link from 'next/link';

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
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'received':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const statuses = ['pending', 'received', 'cancelled'];

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading purchase orders...</div>
        </div>
      </PageLayout>
    );
  }

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
            Receive Purchase Orders
          </h1>
          <p className="text-blue-100">
            View and receive purchase orders to update inventory
          </p>
        </div>
      </div>

      {/* Status Filter Tiles */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Filter by Status</h3>
          {selectedStatuses.length > 0 && (
            <button
              onClick={clearStatusFilters}
              className="text-sm text-blue-600 hover:text-blue-700 transition-colors font-medium"
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
              className={`px-4 py-2 rounded-lg border transition-all capitalize ${
                selectedStatuses.includes(status)
                  ? getStatusColor(status)
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredPOs.length} of {purchaseOrders.length} purchase orders
      </div>

      {/* Purchase Orders List */}
      <div className="space-y-4">
        {filteredPOs.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-500">No purchase orders found</p>
          </div>
        ) : (
          filteredPOs.map((po) => (
            <div
              key={po.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all"
            >
              {/* PO Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      PO #{po.poNumber}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-lg text-sm border capitalize ${getStatusColor(
                        po.status
                      )}`}
                    >
                      {po.status}
                    </span>
                  </div>
                  <div className="text-gray-600 space-y-1 text-sm">
                    <p>
                      <span className="font-medium text-gray-700">Vendor:</span>{' '}
                      {po.vendor.name}
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">Order Date:</span>{' '}
                      {new Date(po.orderDate).toLocaleDateString()}
                    </p>
                    {po.expectedDate && (
                      <p>
                        <span className="font-medium text-gray-700">Expected:</span>{' '}
                        {new Date(po.expectedDate).toLocaleDateString()}
                      </p>
                    )}
                    {po.receivedDate && (
                      <p>
                        <span className="font-medium text-gray-700">Received:</span>{' '}
                        {new Date(po.receivedDate).toLocaleDateString()}
                      </p>
                    )}
                    <p>
                      <span className="font-medium text-gray-700">Total:</span>{' '}
                      <span className="text-green-600 font-semibold">
                        ${calculatePOTotal(po.items).toFixed(2)}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">Items:</span>{' '}
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
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                  >
                    {expandedPO === po.id ? 'Hide Details' : 'Show Details'}
                  </button>
                  {po.status === 'pending' && (
                    <button
                      onClick={() => handleReceivePO(po.id)}
                      disabled={receiving === po.id}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <th className="text-left py-3 px-4 text-gray-700 font-medium text-sm">
                            SKU
                          </th>
                          <th className="text-left py-3 px-4 text-gray-700 font-medium text-sm">
                            Product Name
                          </th>
                          <th className="text-left py-3 px-4 text-gray-700 font-medium text-sm">
                            Category
                          </th>
                          <th className="text-right py-3 px-4 text-gray-700 font-medium text-sm">
                            Quantity
                          </th>
                          <th className="text-right py-3 px-4 text-gray-700 font-medium text-sm">
                            Unit Cost
                          </th>
                          <th className="text-right py-3 px-4 text-gray-700 font-medium text-sm">
                            Total Cost
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {po.items.map((item, index) => (
                          <tr
                            key={item.id}
                            className={
                              index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                            }
                          >
                            <td className="py-3 px-4 text-gray-600 text-sm">
                              {item.product.sku}
                            </td>
                            <td className="py-3 px-4 text-gray-900 text-sm font-medium">
                              {item.product.name}
                            </td>
                            <td className="py-3 px-4 text-gray-600 text-sm">
                              {item.product.category?.name || 'N/A'}
                            </td>
                            <td className="py-3 px-4 text-right text-gray-900 text-sm">
                              {item.quantity}
                            </td>
                            <td className="py-3 px-4 text-right text-gray-900 text-sm">
                              ${item.unitCost.toFixed(2)}
                            </td>
                            <td className="py-3 px-4 text-right text-gray-900 font-semibold text-sm">
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
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Notes:</span> {po.notes}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </PageLayout>
  );
}