import Link from 'next/link'
import { prisma } from '@/prisma/prisma.config'

export default async function UpdateCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  })

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/admin/categories" className="text-primary-600 hover:text-primary-700">
            ← Back to Categories Menu
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-4 text-center bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
          Update Categories
        </h1>

        <p className="text-center text-gray-600 mb-12">Select a category to edit</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div key={category.id} className="bg-white border border-gray-200 rounded-lg p-6 h-full flex flex-col">
              <h3 className="text-xl font-semibold mb-4 text-warning-dark flex-grow">{category.name}</h3>
              
              <Link 
                href={`/admin/categories/${category.id}`}
                className="bg-blue-600 text-gray-900 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center"
              >
                Edit
              </Link>
            </div>
          ))}
        </div>

        {categories.length === 0 && (
          <p className="text-center text-gray-600 mt-8">No categories found. Create one first!</p>
        )}
      </div>
    </div>
  )
}