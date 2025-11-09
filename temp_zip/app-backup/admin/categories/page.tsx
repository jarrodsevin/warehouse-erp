import Link from 'next/link'

export default function CategoriesMenu() {
  return (
    <div className="min-h-screen py-16 px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/admin" className="text-blue-400 hover:text-blue-300">
            ← Back to Admin Menu
          </Link>
        </div>

        <div className="text-center mb-20">
          <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Manage Categories
          </h1>
          
          <p className="text-xl text-gray-400">Organize your product categories</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link href="/admin/categories/create" className="group">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-10 hover:scale-105 transition-transform cursor-pointer h-full">
              <h2 className="text-2xl font-semibold mb-4 text-green-400 group-hover:text-green-300">
                Create Category
              </h2>
              <p className="text-gray-400">
                Add a new product category
              </p>
            </div>
          </Link>

          <Link href="/admin/categories/update" className="group">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-10 hover:scale-105 transition-transform cursor-pointer h-full">
              <h2 className="text-2xl font-semibold mb-4 text-blue-400 group-hover:text-blue-300">
                Update Category
              </h2>
              <p className="text-gray-400">
                Edit existing categories
              </p>
            </div>
          </Link>

          <Link href="/admin/categories/view" className="group">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-10 hover:scale-105 transition-transform cursor-pointer h-full">
              <h2 className="text-2xl font-semibold mb-4 text-purple-400 group-hover:text-purple-300">
                View Categories
              </h2>
              <p className="text-gray-400">
                See all product categories
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}