import Link from 'next/link'

export default function AdminMenu() {
  return (
    <div className="min-h-screen py-16 px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-400 hover:text-blue-300">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="text-center mb-20">
          <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Admin Menu
          </h1>
          
          <p className="text-xl text-gray-400">Manage system settings and data</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link href="/admin/categories" className="group">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-10 hover:scale-105 transition-transform cursor-pointer h-full">
              <h2 className="text-2xl font-semibold mb-4 text-yellow-400 group-hover:text-yellow-300">
                Categories
              </h2>
              <p className="text-gray-400">
                Manage product categories
              </p>
            </div>
          </Link>

          <Link href="/admin/subcategories" className="group">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-10 hover:scale-105 transition-transform cursor-pointer h-full">
              <h2 className="text-2xl font-semibold mb-4 text-orange-400 group-hover:text-orange-300">
                Subcategories
              </h2>
              <p className="text-gray-400">
                Manage product subcategories
              </p>
            </div>
          </Link>

          <Link href="/admin/brands" className="group">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-10 hover:scale-105 transition-transform cursor-pointer h-full">
              <h2 className="text-2xl font-semibold mb-4 text-blue-400 group-hover:text-blue-300">
                Brands
              </h2>
              <p className="text-gray-400">
                Manage product brands
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}