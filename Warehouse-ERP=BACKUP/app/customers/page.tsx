'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  customerGroup: string;
  customerCategory: string;
  creditLimit: number;
  currentBalance: number;
  status: string;
  _count: {
    salesOrders: number;
    payments: number;
  };
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const customerGroups = ['Amazon', 'Shoprite', 'Costco', 'Other Ethnic'];
  const customerCategories = ['Amazon', 'Canadian Mainstream', 'US Mainstream', 'Club', 'Ethnic', 'Costco'];
  const statuses = ['active', 'inactive', 'suspended'];

  const toggleGroup = (group: string) => {
    setSelectedGroups(prev =>
      prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]
    );
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const toggleStatus = (status: string) => {
    setSelectedStatuses(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = selectedGroups.length === 0 || selectedGroups.includes(customer.customerGroup);
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(customer.customerCategory);
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(customer.status);
    return matchesSearch && matchesGroup && matchesCategory && matchesStatus;
  });

  const activeFilterCount = selectedGroups.length + selectedCategories.length + selectedStatuses.length;

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Customers</h1>
        <Link
          href="/customers/add"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Add Customer
        </Link>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search customers by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white"
        />
      </div>

      {/* Filter Section */}
      <div className="mb-6">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="text-sm text-blue-400 hover:text-blue-300 mb-2"
        >
          {showFilters ? '▼' : '▶'} Filters {activeFilterCount > 0 && `(${activeFilterCount} active)`}
        </button>

        {showFilters && (
          <div className="space-y-4 p-4 bg-gray-800 rounded border border-gray-700">
            {/* Customer Group Filters */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-green-400">Customer Group</span>
                {selectedGroups.length > 0 && (
                  <button
                    onClick={() => setSelectedGroups([])}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    Clear ({selectedGroups.length})
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {customerGroups.map(group => (
                  <button
                    key={group}
                    onClick={() => toggleGroup(group)}
                    className={`px-3 py-1 rounded text-sm ${
                      selectedGroups.includes(group)
                        ? 'bg-green-500/20 text-green-400 border border-green-500'
                        : 'bg-green-500/10 text-green-400/60 border border-green-500/30 hover:border-green-500'
                    }`}
                  >
                    {group}
                  </button>
                ))}
              </div>
            </div>

            {/* Customer Category Filters */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-blue-400">Customer Category</span>
                {selectedCategories.length > 0 && (
                  <button
                    onClick={() => setSelectedCategories([])}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    Clear ({selectedCategories.length})
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {customerCategories.map(category => (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={`px-3 py-1 rounded text-sm ${
                      selectedCategories.includes(category)
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500'
                        : 'bg-blue-500/10 text-blue-400/60 border border-blue-500/30 hover:border-blue-500'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filters */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-yellow-400">Status</span>
                {selectedStatuses.length > 0 && (
                  <button
                    onClick={() => setSelectedStatuses([])}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    Clear ({selectedStatuses.length})
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {statuses.map(status => (
                  <button
                    key={status}
                    onClick={() => toggleStatus(status)}
                    className={`px-3 py-1 rounded text-sm capitalize ${
                      selectedStatuses.includes(status)
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500'
                        : 'bg-yellow-500/10 text-yellow-400/60 border border-yellow-500/30 hover:border-yellow-500'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="mb-4 text-sm text-gray-400">
        Showing {filteredCustomers.length} of {customers.length} customers
      </div>

      {/* Customers Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Group</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Category</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Credit Limit</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Balance</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-400">Status</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer, index) => (
              <tr key={customer.id} className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}>
                <td className="px-4 py-3">
                  <div className="font-medium text-white">{customer.name}</div>
                  <div className="text-sm text-gray-400">{customer.email}</div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-300">{customer.customerGroup}</td>
                <td className="px-4 py-3 text-sm text-gray-300">{customer.customerCategory}</td>
                <td className="px-4 py-3 text-right text-sm text-gray-300">
                  ${customer.creditLimit.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right text-sm">
                  <span className={customer.currentBalance > 0 ? 'text-yellow-400' : 'text-green-400'}>
                    ${customer.currentBalance.toLocaleString()}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 text-xs rounded capitalize ${
                    customer.status === 'active' ? 'bg-green-500/20 text-green-400' :
                    customer.status === 'inactive' ? 'bg-gray-500/20 text-gray-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {customer.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <Link
                    href={`/customers/${customer.id}`}
                    className="text-blue-400 hover:text-blue-300 text-sm mr-3"
                  >
                    View
                  </Link>
                  <Link
                    href={`/customers/edit/${customer.id}`}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}