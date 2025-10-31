import { prisma } from '@/prisma/prisma.config'
import Link from 'next/link'

export default async function UpdateBrands() {
  const brands = await prisma.brand.findMany({
    orderBy: {
      name: 'asc',
    },
  })

  return (
    <div className="min-h-screen py-16 px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/admin/brands" className="text-blue-400 hover:text-blue-300">
            ← Back to Brands
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
            Update Brands
          </h1>
          <p className="text-gray-400">Click on a brand to edit it</p>
        </div>

        {brands.length === 0 ? (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
            <p className="text-gray-400">No brands found. Create one to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/admin/brands/${brand.id}`}
                className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:scale-105 hover:shadow-lg transition-all cursor-pointer"
              >
                <h3 className="text-xl font-semibold text-blue-400">{brand.name}</h3>
                <p className="text-sm text-gray-400 mt-2">Click to edit</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}