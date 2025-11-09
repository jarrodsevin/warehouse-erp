import Link from 'next/link'

export default function ProductsMenu() {
  return (
    <div className="min-h-screen py-16 px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-400 hover:text-blue-300">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="text-center mb-20">
          <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Products Menu
          </h1>
          
          <p className="text-xl text-gray-400">Choose an action to manage products</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link href="/products/create" className="group">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-10 hover:scale-105 transition-transform cursor-pointer h-full">
              <h2 className="text-2xl font-semibold mb-4 text-green-400 group-hover:text-green-300">
                Create New Product
              </h2>
              <p className="text-gray-400">
                Add a new product to your catalog
              </p>
            </div>
          </Link>

          <Link href="/products/update" className="group">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-10 hover:scale-105 transition-transform cursor-pointer h-full">
              <h2 className="text-2xl font-semibold mb-4 text-blue-400 group-hover:text-blue-300">
                Update Product
              </h2>
              <p className="text-gray-400">
                Edit existing product information
              </p>
            </div>
          </Link>

          <Link href="/products/view" className="group">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-10 hover:scale-105 transition-transform cursor-pointer h-full">
              <h2 className="text-2xl font-semibold mb-4 text-purple-400 group-hover:text-purple-300">
                View Products
              </h2>
              <p className="text-gray-400">
                See detailed product information
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}