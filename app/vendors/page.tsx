import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen py-16 px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Warehouse ERP System
          </h1>
          
          <p className="text-xl text-gray-400">Manage your warehouse operations efficiently</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link href="/products" className="group">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-10 hover:scale-105 transition-transform cursor-pointer h-full">
              <h2 className="text-2xl font-semibold mb-4 text-blue-400 group-hover:text-blue-300">
                Products
              </h2>
              <p className="text-gray-400">
                Manage your product catalog, pricing, and inventory items
              </p>
            </div>
          </Link>

          <Link href="/vendors" className="group">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-10 hover:scale-105 transition-transform cursor-pointer h-full">
              <h2 className="text-2xl font-semibold mb-4 text-green-400 group-hover:text-green-300">
                Vendors
              </h2>
              <p className="text-gray-400">
                Manage supplier information and vendor relationships
              </p>
            </div>
          </Link>

          <Link href="/purchase-orders" className="group">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-10 hover:scale-105 transition-transform cursor-pointer h-full">
              <h2 className="text-2xl font-semibold mb-4 text-purple-400 group-hover:text-purple-300">
                Purchase Orders
              </h2>
              <p className="text-gray-400">
                Create and track purchase orders from vendors
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}