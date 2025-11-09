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
          <Link href="/vendors" className="text-blue-400 hover:text-blue-300">
            ← Back to Vendors Menu
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-4 text-center bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
          Update Vendors
        </h1>

        <p className="text-center text-gray-400 mb-12">Select a vendor to edit</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendors.map((vendor) => (
            <div key={vendor.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6 h-full flex flex-col">
              <h3 className="text-xl font-semibold mb-2 text-green-400">{vendor.name}</h3>
              <p className="text-gray-400 text-sm mb-1">Contact: {vendor.contactName || 'N/A'}</p>
              <p className="text-gray-400 text-sm mb-1">Email: {vendor.email || 'N/A'}</p>
              <p className="text-gray-400 text-sm mb-4 flex-grow">Phone: {vendor.phone || 'N/A'}</p>
              
              <Link 
                href={`/vendors/${vendor.id}`}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-center"
              >
                Edit
              </Link>
            </div>
          ))}
        </div>

        {vendors.length === 0 && (
          <p className="text-center text-gray-400 mt-8">No vendors found. Create one first!</p>
        )}
      </div>
    </div>
  )
}