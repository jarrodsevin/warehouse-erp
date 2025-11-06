'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createVendor, updateVendor } from '@/app/actions/vendors'

type VendorFormProps = {
  vendor?: any
}

export default function VendorForm({ vendor }: VendorFormProps) {
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    if (vendor) {
      await updateVendor(vendor.id, formData)
    } else {
      await createVendor(formData)
    }
    
    router.push('/vendors')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Vendor Name
        </label>
        <input
          type="text"
          name="name"
          defaultValue={vendor?.name}
          required
          className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Enter vendor name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Contact Name
        </label>
        <input
          type="text"
          name="contactName"
          defaultValue={vendor?.contactName}
          className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Enter contact name (optional)"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Email
          </label>
          <input
            type="email"
            name="email"
            defaultValue={vendor?.email}
            className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="email@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            defaultValue={vendor?.phone}
            className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="(555) 555-5555"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Payment Terms
        </label>
        <input
          type="text"
          name="terms"
          defaultValue={vendor?.terms}
          className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="e.g., Net 30 (optional)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Notes
        </label>
        <textarea
          name="notes"
          defaultValue={vendor?.notes}
          className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          rows={3}
          placeholder="Additional notes (optional)"
        />
      </div>

      <div className="flex gap-4 pt-2">
        <button
          type="submit"
          className="px-6 py-2.5 bg-primary-600 text-sm font-medium text-gray-700 rounded-lg hover:bg-primary-700 transition-colors"
        >
          {vendor ? 'Update' : 'Create'} Vendor
        </button>
        <button
          type="button"
          onClick={() => router.push('/vendors')}
          className="px-6 py-2.5 bg-gray-100 text-gray-900 font-medium rounded-lg hover:bg-gray-200 border border-gray-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
