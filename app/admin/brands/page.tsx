import Link from 'next/link'

export default function BrandsMenu() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/admin" className="text-primary-600 hover:text-primary-700">
            ← Back to Admin
          </Link>
        </div>

        <div className="text-center mb-20">
          <h1 className="text-4xl font-bold mb-6 text-gray-900">
            Brands Menu
          </h1>
          
          <p className="text-xl text-gray-600">Choose an action to manage brands</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link href="/admin/brands/create" className="group">
            <div className="bg-white border border-gray-200 rounded-lg p-10 hover:border-primary-300 hover:shadow-md transition-all duration-200 cursor-pointer h-full">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 group-hover:text-success">
                Create New Brand
              </h2>
              <p className="text-gray-600">
                Add a new brand
              </p>
            </div>
          </Link>

          <Link href="/admin/brands/update" className="group">
            <div className="bg-white border border-gray-200 rounded-lg p-10 hover:border-primary-300 hover:shadow-md transition-all duration-200 cursor-pointer h-full">
              <h2 className="text-2xl font-semibold mb-4 text-primary-600 group-hover:text-primary-600">
                Update Brand
              </h2>
              <p className="text-gray-600">
                Edit existing brands
              </p>
            </div>
          </Link>

          <Link href="/admin/brands/view" className="group">
            <div className="bg-white border border-gray-200 rounded-lg p-10 hover:border-primary-300 hover:shadow-md transition-all duration-200 cursor-pointer h-full">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 group-hover:text-cyan-300">
                View Brands
              </h2>
              <p className="text-gray-600">
                See all brands
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}