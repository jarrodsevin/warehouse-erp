import Link from 'next/link'

export default function SubcategoriesMenu() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/admin" className="text-primary-600 hover:text-primary-700">
            ← Back to Admin
          </Link>
        </div>

        <div className="text-center mb-20">
          <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Subcategories Menu
          </h1>
          
          <p className="text-xl text-gray-600">Choose an action to manage subcategories</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link href="/admin/subcategories/create" className="group">
            <div className="bg-white border border-gray-200 rounded-lg p-10 hover:border-primary-300 hover:shadow-md transition-all duration-200 cursor-pointer h-full">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 group-hover:text-success">
                Create New Subcategory
              </h2>
              <p className="text-gray-600">
                Add a new subcategory
              </p>
            </div>
          </Link>

          <Link href="/admin/subcategories/update" className="group">
            <div className="bg-white border border-gray-200 rounded-lg p-10 hover:border-primary-300 hover:shadow-md transition-all duration-200 cursor-pointer h-full">
              <h2 className="text-2xl font-semibold mb-4 text-warning-dark group-hover:text-yellow-300">
                Update Subcategory
              </h2>
              <p className="text-gray-600">
                Edit existing subcategories
              </p>
            </div>
          </Link>

          <Link href="/admin/subcategories/view" className="group">
            <div className="bg-white border border-gray-200 rounded-lg p-10 hover:border-primary-300 hover:shadow-md transition-all duration-200 cursor-pointer h-full">
              <h2 className="text-2xl font-semibold mb-4 text-orange-400 group-hover:text-orange-300">
                View Subcategories
              </h2>
              <p className="text-gray-600">
                See all subcategories
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}