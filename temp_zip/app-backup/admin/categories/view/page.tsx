import Link from 'next/link'
import { prisma } from '@/prisma/prisma.config'

export default async function ViewCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true }
      }
    },
    orderBy: { name: 'asc' }
  })

  return (
    <div className="min-h-screen py-16 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/admin/categories" className="text-blue-400 hover:text-blue-300">
            ← Back to Categories Menu
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-4 text-center bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
          View Categories
        </h1>

        <p className="text-center text-gray-400 mb-12">All product categories</p>

        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-semibold text-yellow-400">{category.name}</h3>
                  <p className="text-gray-400 text-sm mt-2">
                    {category._count.products} product{category._count.products !== 1 ? 's' : ''} in this category
                  </p>
                </div>
                <div className="text-gray-400 text-sm">
                  Created: {new Date(category.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {categories.length === 0 && (
          <p className="text-center text-gray-400 mt-8">No categories found.</p>
        )}
      </div>
    </div>
  )
}