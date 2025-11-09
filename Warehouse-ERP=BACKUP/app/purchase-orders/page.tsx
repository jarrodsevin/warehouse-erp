import Link from 'next/link'

export default function PurchaseOrdersMenu() {
  return (
    <div className="min-h-screen py-16 px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-400 hover:text-blue-300">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="text-center mb-20">
          <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Purchase Orders Menu
          </h1>
          
          <p className="text-xl text-gray-400">Choose an action to manage purchase orders</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link href="/purchase-orders/create" className="group">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-10 hover:scale-105 transition-transform cursor-pointer h-full">
              <h2 className="text-2xl font-semibold mb-4 text-green-400 group-hover:text-green-300">
                Create New PO
              </h2>
              <p className="text-gray-400">
                Create a new purchase order
              </p>
            </div>
          </Link>

          <Link href="/purchase-orders/receive" className="group">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-10 hover:scale-105 transition-transform cursor-pointer h-full">
              <h2 className="text-2xl font-semibold mb-4 text-yellow-400 group-hover:text-yellow-300">
                Receive Purchase Orders
              </h2>
              <p className="text-gray-400">
                Mark purchase orders as received and update inventory
              </p>
            </div>
          </Link>

          <Link href="/purchase-orders/update" className="group">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-10 hover:scale-105 transition-transform cursor-pointer h-full">
              <h2 className="text-2xl font-semibold mb-4 text-blue-400 group-hover:text-blue-300">
                Update Purchase Order
              </h2>
              <p className="text-gray-400">
                Edit existing purchase orders
              </p>
            </div>
          </Link>

          <Link href="/purchase-orders/view" className="group">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-10 hover:scale-105 transition-transform cursor-pointer h-full">
              <h2 className="text-2xl font-semibold mb-4 text-purple-400 group-hover:text-purple-300">
                View Purchase Orders
              </h2>
              <p className="text-gray-400">
                See detailed purchase order information
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}