'use client'

import Link from 'next/link'
import { useState } from 'react'
import PageLayout from '@/app/components/PageLayout'

type Vendor = {
  id: string
  name: string
  contactPerson: string | null  // Changed from contactName
  email: string | null
  phone: string | null
}

function VendorCard({ vendor }: { vendor: Vendor }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 h-full flex flex-col shadow-sm">
      <h3 className="text-xl font-semibold mb-2 text-gray-900">{vendor.name}</h3>
      <p className="text-gray-600 text-sm mb-1">Contact: {vendor.contactPerson || 'N/A'}</p>
      <p className="text-gray-600 text-sm mb-1">Email: {vendor.email || 'N/A'}</p>
      <p className="text-gray-600 text-sm mb-4 flex-grow">Phone: {vendor.phone || 'N/A'}</p>
      
      <Link 
        href={`/vendors/${vendor.id}`}
        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-center"
      >
        Edit
      </Link>
    </div>
  )
}

export default function VendorUpdateClient({ vendors }: { vendors: Vendor[] }) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredVendors = vendors.filter((vendor) => {
    const query = searchQuery.toLowerCase()
    return (
      vendor.name.toLowerCase().includes(query) ||
      vendor.contactPerson?.toLowerCase().includes(query) ||  // Changed from contactName
      vendor.email?.toLowerCase().includes(query) ||
      vendor.phone?.toLowerCase().includes(query)
    )
  })

  return (
    <PageLayout>
      {/* Blue Header Section */}
      <div className="bg-blue-600 text-white py-12 px-8 -m-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4">
            <Link href="/vendors" className="text-blue-100 hover:text-white font-medium">
              ← Back to Vendors Menu
            </Link>
          </div>
          <h1 className="text-4xl font-bold mb-2">
            Update Vendors
          </h1>
          <p className="text-blue-100">
            Select a vendor to edit
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name, contact, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
        <p className="text-sm text-gray-500 mt-2 text-center">
          Showing {filteredVendors.length} of {vendors.length} vendors
        </p>
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVendors.map((vendor) => (
          <VendorCard key={vendor.id} vendor={vendor} />
        ))}
      </div>

      {/* Empty States */}
      {filteredVendors.length === 0 && searchQuery && (
        <p className="text-center text-gray-500 mt-8">No vendors match your search.</p>
      )}

      {vendors.length === 0 && (
        <p className="text-center text-gray-500 mt-8">No vendors found. Create one first!</p>
      )}
    </PageLayout>
  )
}