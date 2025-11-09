'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  customerGroup: string;
  customerCategory: string;
  creditLimit: number;
  currentBalance: number;
  paymentTerms: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  _count: {
    salesOrders: number;
    payments: number;
  };
}

export default function CustomerDetailsPage() {
  const params = useParams();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomer();
  }, []);

  const fetchCustomer = async () => {
    try {
      const response = await fetch(`/api/customers/${params.id}`);
      const data = await response.json();
      setCustomer(data);
    } catch (error) {
      console.error('Error fetching customer:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!customer) {
    return <div className="p-8">Customer not found</div>;
  }

  const creditUsagePercent = (customer.currentBalance / customer.creditLimit) * 100;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{customer.name}</h1>
        <div className="flex gap-4">
          <Link
            href={`/customers/edit/${customer.id}`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Edit Customer
          </Link>
          <Link
            href="/customers"
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            Back to List
          </Link>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-6">
        <span className={`px-3 py-1 text-sm rounded capitalize ${
          customer.status === 'active' ? 'bg-green-500/20 text-green-400 border border-green-500' :
          customer.status === 'inactive' ? 'bg-gray-500/20 text-gray-400 border border-gray-500' :
          'bg-red-500/20 text-red-400 border border-red-500'
        }`}>
          {customer.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information Card */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400">Email</label>
                <p className="text-white">{customer.email || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Phone</label>
                <p className="text-white">{customer.phone || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <label className="text-sm text-gray-400">Address</label>
                <p className="text-white">{customer.address || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Categorization */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Categorization</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400">Customer Group</label>
                <p className="text-white font-medium">{customer.customerGroup}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Customer Category</label>
                <p className="text-white font-medium">{customer.customerCategory}</p>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Financial Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400">Credit Limit</label>
                <p className="text-2xl font-bold text-white">
                  ${customer.creditLimit.toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Current Balance</label>
                <p className={`text-2xl font-bold ${
                  customer.currentBalance > 0 ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  ${customer.currentBalance.toLocaleString()}
                </p>
              </div>
              <div className="col-span-2">
                <label className="text-sm text-gray-400 mb-2 block">Credit Usage</label>
                <div className="w-full bg-gray-700 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full ${
                      creditUsagePercent > 90 ? 'bg-red-500' :
                      creditUsagePercent > 70 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(creditUsagePercent, 100)}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  {creditUsagePercent.toFixed(1)}% of credit limit used
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Payment Terms</label>
                <p className="text-white">{customer.paymentTerms || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {customer.notes && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Notes</h2>
              <p className="text-gray-300 whitespace-pre-wrap">{customer.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Activity Summary */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Activity Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Sales Orders</span>
                <span className="text-2xl font-bold text-white">{customer._count.salesOrders}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Payments</span>
                <span className="text-2xl font-bold text-white">{customer._count.payments}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link
                href={`/sales-orders/create?customerId=${customer.id}`}
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-left"
              >
                Create Sales Order
              </Link>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-left">
                Record Payment
              </button>
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Account Info</h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-400">Customer Since</span>
                <p className="text-white">
                  {new Date(customer.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}