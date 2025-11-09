'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AddCustomerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    customerGroup: 'Amazon',
    customerCategory: 'Amazon',
    creditLimit: '',
    paymentTerms: '',
    status: 'active',
    notes: ''
  });

  const customerGroups = ['Amazon', 'Shoprite', 'Costco', 'Other Ethnic'];
  const customerCategories = ['Amazon', 'Canadian Mainstream', 'US Mainstream', 'Club', 'Ethnic', 'Costco'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/customers');
      } else {
        alert('Failed to create customer');
      }
    } catch (error) {
      console.error('Error creating customer:', error);
      alert('Error creating customer');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Add New Customer</h1>
        <Link
          href="/customers"
          className="text-gray-600 hover:text-gray-900"
        >
          ← Back to Customers
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 space-y-6">
        {/* Basic Information */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded text-gray-900"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded text-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Categorization */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Categorization</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Customer Group <span className="text-red-500">*</span>
              </label>
              <select
                name="customerGroup"
                value={formData.customerGroup}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded text-gray-900"
              >
                {customerGroups.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Customer Category <span className="text-red-500">*</span>
              </label>
              <select
                name="customerCategory"
                value={formData.customerCategory}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded text-gray-900"
              >
                {customerCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Financial Information */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Financial Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Credit Limit <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="creditLimit"
                value={formData.creditLimit}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Payment Terms</label>
              <input
                type="text"
                name="paymentTerms"
                value={formData.paymentTerms}
                onChange={handleChange}
                placeholder="e.g., Net 30, Net 60"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded text-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium mb-2">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded text-gray-900"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Link
            href="/customers"
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300 text-gray-900 rounded"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-gray-900 rounded disabled:bg-gray-600"
          >
            {loading ? 'Creating...' : 'Create Customer'}
          </button>
        </div>
      </form>
    </div>
  );
}