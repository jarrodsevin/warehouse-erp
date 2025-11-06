import Link from 'next/link';

export default function CustomersOptionsPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent">
          Customer Management
        </h1>
        <p className="text-xl text-gray-400">Choose an action</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl">
        <Link href="/customers" className="group">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-12 hover:scale-105 transition-transform cursor-pointer shadow-lg hover:shadow-blue-500/50">
            <h2 className="text-3xl font-semibold mb-4 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent group-hover:from-blue-300 group-hover:to-blue-500">
              View Customers
            </h2>
            <p className="text-gray-400">
              Browse and search all customers
            </p>
          </div>
        </Link>

        <Link href="/customers/add" className="group">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-12 hover:scale-105 transition-transform cursor-pointer shadow-lg hover:shadow-green-500/50">
            <h2 className="text-3xl font-semibold mb-4 bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent group-hover:from-green-300 group-hover:to-green-500">
              Add Customer
            </h2>
            <p className="text-gray-400">
              Create a new customer account
            </p>
          </div>
        </Link>

        <Link href="/customers" className="group">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-12 hover:scale-105 transition-transform cursor-pointer shadow-lg hover:shadow-purple-500/50">
            <h2 className="text-3xl font-semibold mb-4 bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:to-purple-500">
              Edit Customer
            </h2>
            <p className="text-gray-400">
              Select a customer to update from the list
            </p>
          </div>
        </Link>
      </div>

      <div className="mt-12">
        <Link href="/" className="text-gray-400 hover:text-white">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}