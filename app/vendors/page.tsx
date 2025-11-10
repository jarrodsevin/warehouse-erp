import PageLayout from '@/app/components/PageLayout'
import Link from 'next/link'

export default function VendorsPage() {
  return (
    <PageLayout>
      {/* Blue Header Section */}
      <div className="bg-blue-600 text-white py-12 px-8 -m-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">
            Vendors
          </h1>
          <h2 className="text-xl mb-2">
            Vendor Management
          </h2>
          <p className="text-blue-100">
            Choose an action to manage your suppliers
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/vendors/create" className="group">
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
            <div className="h-2 bg-green-500"></div>
            <div className="p-8">
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                Create New Vendor
              </h3>
              <p className="text-gray-600">
                Add a new supplier to your vendor database with contact information and details
              </p>
            </div>
          </div>
        </Link>

        <Link href="/vendors/update" className="group">
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
            <div className="h-2 bg-blue-500"></div>
            <div className="p-8">
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                Update Vendor
              </h3>
              <p className="text-gray-600">
                Edit existing vendor information and details
              </p>
            </div>
          </div>
        </Link>

        <Link href="/vendors/view" className="group">
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
            <div className="h-2 bg-purple-500"></div>
            <div className="p-8">
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                View Vendors
              </h3>
              <p className="text-gray-600">
                Browse and search all vendors in your system
              </p>
            </div>
          </div>
        </Link>
      </div>
    </PageLayout>
  )
}