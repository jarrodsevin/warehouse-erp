import { prisma } from '@/prisma/prisma.config'
import Link from 'next/link'

export default async function ViewSubcategories() {
  const subcategories = await prisma.subcategory.findMany({
    orderBy: {
      name: 'asc',
    },
  })

  return (
    <div className="min-h-screen py-16 px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/admin/subcategories" className="text-blue-400 hover:text-blue-300">
            ← Back to Subcategories
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            All Subcategories
          </h1>
          <p className="text-gray-400">Total: {subcategories.length}</p>
        </div>

        {subcategories.length === 0 ? (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
            <p className="text-gray-400">No subcategories found. Create one to get started!</p>
          </div>
        ) : (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="space-y-3">
              {subcategories.map((subcategory) => (
                <div
                  key={subcategory.id}
                  className="bg-gray-900 rounded-lg p-4 flex justify-between items-center"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-400">{subcategory.name}</h3>
                    <p className="text-sm text-gray-400">
                      Created: {new Date(subcategory.createdAt).toLocaleDateString()}
                    </p>
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