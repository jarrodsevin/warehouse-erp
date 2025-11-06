import Link from 'next/link'
import { prisma } from '@/prisma/prisma.config'

export default async function UpdateVendorsPage() {
  const vendors = await prisma.vendor.findMany({
    orderBy: { name: 'asc' }
  })

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link href="/vendors" className="text-primary-600 hover:text-primary-700">
            ← Back to Vendors Menu
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-4 text-center text-gray-900">
          Update Vendors
        </h1>

        <p className="text-center text-gray-600 mb-12">Select a vendor to edit</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendors.map((vendor) => (
            <div key={vendor.id} className="bg-white border border-gray-200 rounded-lg p-6 h-full flex flex-col">
              <h3 className="text-xl font-semibold mb-2 text-gray-900">{vendor.name}</h3>
              <p className="text-gray-600 text-sm mb-1">Contact: {vendor.contactName || 'N/A'}</p>
              <p className="text-gray-600 text-sm mb-1">Email: {vendor.email || 'N/A'}</p>
              <p className="text-gray-600 text-sm mb-4 flex-grow">Phone: {vendor.phone || 'N/A'}</p>
              
              <Link 
                href={`/vendors/${vendor.id}`}
                className="bg-green-600 text-gray-900 px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-center"
              >
                Edit
              </Link>
            </div>
          ))}
        </div>

        {vendors.length === 0 && (
          <p className="text-center text-gray-600 mt-8">No vendors found. Create one first!</p>
        )}
      </div>
    </div>
  )
}