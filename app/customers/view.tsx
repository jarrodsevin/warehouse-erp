'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PageLayout from '@/app/components/PageLayout'

interface Customer {
  id: string
  name: string
  email: string | null
  phone: string | null
  customerGroup: string
  customerCategory: string
  creditLimit: number
  currentBalance: number
  status: string
  _count: {
    salesOrders: number
    payments: number
  }
}

export default function ViewCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers')
      const data = await response.json()
      setCustomers(data)
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const customerGroups = ['Amazon', 'Shoprite', 'Costco', 'Other Ethnic']
  const customerCategories = ['Amazon', 'Canadian Mainstream', 'US Mainstream', 'Club', 'Ethnic', 'Costco']
  const statuses = ['active', 'inactive', 'suspended']

  const toggleGroup = (group: string) => {
    setSelectedGroups(prev =>
      prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]
    )
  }

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    )
  }

  const toggleStatus = (status: string) => {
    setSelectedStatuses(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    )
  }

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesGroup = selectedGroups.length === 0 || selectedGroups.includes(customer.customerGroup)
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(customer.customerCategory)
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(customer.status)
    return matchesSearch && matchesGroup && matchesCategory && matchesStatus
  })

  const activeFilterCount = selectedGroups.length + selectedCategories.length + selectedStatuses.length

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading customers...</div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      {/* Blue Header Section */}
      <div className="bg-blue-600 text-white py-12 px-8 -m-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4">
            <Link href="/customers" className="text-blue-100 hover:text-white font-medium">
              ← Back to Customers Menu
            </Link>
          </div>
          <h1 className="text-4xl font-bold mb-2">
            View Customers
          </h1>
          <p className="text-blue-100">
            Browse and manage your customer database
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-10 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Filter Section */}
      <div className="mb-6">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium mb-2 flex items-center gap-2"
        >
          <span>{showFilters ? '▼' : '▶'}</span>
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">
              {activeFilterCount}
            </span>
          )}
        </button>

        {showFilters && (
          <div className="space-y-4 p-4 bg-white rounded-lg border border-gray-200">
            {/* Customer Group Filters */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Customer Group</span>
                {selectedGroups.length > 0 && (
                  <button
                    onClick={() => setSelectedGroups([])}
                    className="text-xs text-gray-500 hover:text-gray-700"
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
                    className={`px-3 py-1.5 rounded text-sm transition-colors ${
                      selectedGroups.includes(group)
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                <span className="text-sm font-medium text-gray-700">Customer Category</span>
                {selectedCategories.length > 0 && (
                  <button
                    onClick={() => setSelectedCategories([])}
                    className="text-xs text-gray-500 hover:text-gray-700"
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
                    className={`px-3 py-1.5 rounded text-sm transition-colors ${
                      selectedCategories.includes(category)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                <span className="text-sm font-medium text-gray-700">Status</span>
                {selectedStatuses.length > 0 && (
                  <button
                    onClick={() => setSelectedStatuses([])}
                    className="text-xs text-gray-500 hover:text-gray-700"
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
                    className={`px-3 py-1.5 rounded text-sm capitalize transition-colors ${
                      selectedStatuses.includes(status)
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredCustomers.length} of {customers.length} customers
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Group</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Category</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Credit Limit</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Balance</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Status</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredCustomers.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{customer.name}</div>
                  <div className="text-sm text-gray-500">{customer.email}</div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{customer.customerGroup}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{customer.customerCategory}</td>
                <td className="px-4 py-3 text-right text-sm text-gray-700">
                  ${customer.creditLimit.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right text-sm">
                  <span className={customer.currentBalance > 0 ? 'text-amber-600 font-medium' : 'text-green-600'}>
                    ${customer.currentBalance.toLocaleString()}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 text-xs rounded-full capitalize font-medium ${
                    customer.status === 'active' ? 'bg-green-100 text-green-700' :
                    customer.status === 'inactive' ? 'bg-gray-100 text-gray-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {customer.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <Link
                    href={`/customers/${customer.id}`}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium mr-3"
                  >
                    View
                  </Link>
                  <Link
                    href={`/customers/edit/${customer.id}`}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">No customers found matching your filters.</p>
        </div>
      )}
    </PageLayout>
  )
}