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
  status: string
}

export default function UpdateCustomerPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

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

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
      <div className="bg-blue-600 text-white py-12 px-4 md:px-8 -m-4 md:-m-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4">
            <Link href="/customers" className="text-blue-100 hover:text-white font-medium">
              ← Back to Customers Menu
            </Link>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Update Customer
          </h1>
          <p className="text-blue-100">
            Select a customer to edit
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
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

      {/* Results Summary */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredCustomers.length} of {customers.length} customers
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((customer) => (
          <Link
            key={customer.id}
            href={`/customers/update/${customer.id}`}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {customer.name}
              </h3>
              <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                customer.status === 'active' ? 'bg-green-100 text-green-700' :
                customer.status === 'inactive' ? 'bg-gray-100 text-gray-700' :
                'bg-red-100 text-red-700'
              }`}>
                {customer.status}
              </span>
            </div>
            
            {customer.email && (
              <p className="text-sm text-gray-600 mb-1 truncate">{customer.email}</p>
            )}
            
            {customer.phone && (
              <p className="text-sm text-gray-600 mb-2">{customer.phone}</p>
            )}
            
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded">
                {customer.customerGroup}
              </span>
              <span className="px-2 py-1 text-xs bg-purple-50 text-purple-700 rounded">
                {customer.customerCategory}
              </span>
            </div>

            <div className="mt-3 text-blue-600 text-sm font-medium group-hover:underline">
              Edit Customer →
            </div>
          </Link>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">No customers found matching your search.</p>
        </div>
      )}
    </PageLayout>
  )
}