'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface SalesOrder {
  id: string;
  soNumber: string;
  orderDate: string;
  status: string;
  total: number;
  customer: {
    id: string;
    name: string;
  };
  items: {
    id: string;
    quantity: number;
    unitPrice: number;
    product: {
      name: string;
    };
  }[];
}

export default function SalesOrdersPage() {
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSalesOrders();
  }, []);

  const fetchSalesOrders = async () => {
    try {
      const response = await fetch('/api/sales-orders');
      const data = await response.json();
      setSalesOrders(data);
    } catch (error) {
      console.error('Error fetching sales orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = salesOrders.filter(order => 
    order.soNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Sales Orders</h1>
        <Link
          href="/sales-orders/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Create Sales Order
        </Link>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by SO number or customer name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white"
        />
      </div>

      {/* Results Summary */}
      <div className="mb-4 text-sm text-gray-400">
        Showing {filteredOrders.length} of {salesOrders.length} sales orders
      </div>

      {/* Sales Orders Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">SO Number</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Customer</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Date</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Total</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-400">Items</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-400">Status</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order, index) => (
              <tr key={order.id} className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}>
                <td className="px-4 py-3 font-medium text-blue-400">{order.soNumber}</td>
                <td className="px-4 py-3 text-gray-300">{order.customer.name}</td>
                <td className="px-4 py-3 text-sm text-gray-400">
                  {new Date(order.orderDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right font-medium text-white">
                  ${order.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-400">
                  {order.items.length}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 text-xs rounded capitalize ${
                    order.status === 'fulfilled' ? 'bg-green-500/20 text-green-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <Link
                    href={`/sales-orders/${order.id}`}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  No sales orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}