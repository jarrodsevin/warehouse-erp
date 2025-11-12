'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import PageLayout from '@/app/components/PageLayout'

interface Vendor {
  id: string
  name: string
  email: string | null
  phone: string | null
  contactPerson: string | null
  status: string
  notes: string | null
  createdAt: string
  updatedAt: string
}

export default function VendorDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVendor()
  }, [resolvedParams.id])

  const fetchVendor = async () => {
    try {
      const response = await fetch(`/api/vendors/${resolvedParams.id}`)
      if (response.ok) {
        const data = await response.json()
        setVendor(data)
      }
    } catch (error) {
      console.error('Error fetching vendor:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading vendor...</div>
        </div>
      </PageLayout>
    )
  }

  if (!vendor) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">Vendor not found</div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      {/* Blue Header Section */}
      <div className="bg-blue-600 text-white py-12 px-4 md:px-8 -m-4 md:-m-8 mb-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4">
            <Link href="/vendors/view" className="text-blue-100 hover:text-white font-medium">
              ← Back to Vendors List
            </Link>
          </div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl md:text-4xl font-bold">
              {vendor.name}
            </h1>
            <span className={`px-3 py-1 text-sm rounded-full capitalize ${
              vendor.status === 'active' 
                ? 'bg-green-400 text-green-900' 
                : 'bg-gray-400 text-gray-900'
            }`}>
              {vendor.status}
            </span>
          </div>
          <p className="text-blue-100">
            Vendor Details
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Contact Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vendor.contactPerson && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Contact Person</label>
                <p className="text-gray-900 font-medium">{vendor.contactPerson}</p>
              </div>
            )}

            {vendor.email && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                <a 
                  href={`mailto:${vendor.email}`}
                  className="text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {vendor.email}
                </a>
              </div>
            )}

            {vendor.phone && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                <a 
                  href={`tel:${vendor.phone}`}
                  className="text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {vendor.phone}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        {vendor.notes && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Notes</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{vendor.notes}</p>
          </div>
        )}

        {/* Metadata */}
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 md:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Record Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-gray-500 mb-1">Created</label>
              <p className="text-gray-900">
                {new Date(vendor.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div>
              <label className="block text-gray-500 mb-1">Last Updated</label>
              <p className="text-gray-900">
                {new Date(vendor.updatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center mt-6">
          <Link
            href="/vendors/view"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Back to Vendors List
          </Link>
        </div>
      </div>
    </PageLayout>
  )
}