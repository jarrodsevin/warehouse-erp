import { prisma } from '@/prisma/prisma.config'
import Link from 'next/link'

export default async function ViewBrands() {
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
            View Brands
          </h1>
          <p className="text-gray-400">All brands in the system</p>
        </div>

        {brands.length === 0 ? (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
            <p className="text-gray-400">No brands found. Create one to get started!</p>
          </div>
        ) : (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="space-y-3">
              {/* @ts-ignore */}
              {brands.map((brand) => (
                <div
                  key={brand.id}
                  className="bg-gray-900 rounded-lg p-4 flex justify-between items-center"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-blue-400">{brand.name}</h3>
                    <p className="text-sm text-gray-400">ID: {brand.id}</p>
                  </div>
                  <div className="text-sm text-gray-400">
                    Created: {new Date(brand.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}