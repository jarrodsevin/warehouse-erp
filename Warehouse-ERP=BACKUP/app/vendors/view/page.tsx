import Link from 'next/link'

export default function VendorsMenu() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-blue-400 hover:text-blue-300">
            ← Back to Dashboard
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-4 text-center bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
          Vendors Menu
        </h1>
        
        <p className="text-center text-gray-400 mb-12">Choose an action to manage vendors</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/vendors/create" className="group">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 hover:scale-105 transition-transform cursor-pointer h-full">
              <h2 className="text-2xl font-semibold mb-4 text-green-400 group-hover:text-green-300">
                Create New Vendor
              </h2>
              <p className="text-gray-400">
                Add a new supplier to your system
              </p>
            </div>
          </Link>

          <Link href="/vendors/update" className="group">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 hover:scale-105 transition-transform cursor-pointer h-full">
              <h2 className="text-2xl font-semibold mb-4 text-blue-400 group-hover:text-blue-300">
                Update Vendor
              </h2>
              <p className="text-gray-400">
                Edit existing vendor information
              </p>
            </div>
          </Link>

          <Link href="/vendors/view" className="group">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 hover:scale-105 transition-transform cursor-pointer h-full">
              <h2 className="text-2xl font-semibold mb-4 text-purple-400 group-hover:text-purple-300">
                View Vendors
              </h2>
              <p className="text-gray-400">
                See detailed vendor information
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}