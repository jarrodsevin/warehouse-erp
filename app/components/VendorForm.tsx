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
    
    const data = {
      name: formData.get('name') as string,
      contactName: formData.get('contactName') as string || undefined,
      email: formData.get('email') as string || undefined,
      phone: formData.get('phone') as string || undefined,
      terms: formData.get('terms') as string || undefined,
      notes: formData.get('notes') as string || undefined,
    }

    if (vendor) {
      await updateVendor(vendor.id, data)
    } else {
      await createVendor(data)
    }
    
    router.push('/vendors')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-white font-medium mb-1.5">Vendor Name</label>
        <input
          type="text"
          name="name"
          defaultValue={vendor?.name}
          required
          className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          placeholder="Enter vendor name"
        />
      </div>

      <div>
        <label className="block text-white font-medium mb-1.5">Contact Name</label>
        <input
          type="text"
          name="contactName"
          defaultValue={vendor?.contactName}
          className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          placeholder="Enter contact name (optional)"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-white font-medium mb-1.5">Email</label>
          <input
            type="email"
            name="email"
            defaultValue={vendor?.email}
            className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="email@example.com"
          />
        </div>

        <div>
          <label className="block text-white font-medium mb-1.5">Phone</label>
          <input
            type="tel"
            name="phone"
            defaultValue={vendor?.phone}
            className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="(555) 555-5555"
          />
        </div>
      </div>

      <div>
        <label className="block text-white font-medium mb-1.5">Payment Terms</label>
        <input
          type="text"
          name="terms"
          defaultValue={vendor?.terms}
          className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          placeholder="e.g., Net 30 (optional)"
        />
      </div>

      <div>
        <label className="block text-white font-medium mb-1.5">Notes</label>
        <textarea
          name="notes"
          defaultValue={vendor?.notes}
          className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          rows={3}
          placeholder="Additional notes (optional)"
        />
      </div>

      <div className="flex gap-4 pt-2">
        <button type="submit" className="px-6 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors">
          {vendor ? 'Update' : 'Create'} Vendor
        </button>
        <button
          type="button"
          onClick={() => router.push('/vendors')}
          className="px-6 py-2.5 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}