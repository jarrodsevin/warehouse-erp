import VendorForm from '@/app/components/VendorForm'
import PageLayout from '@/app/components/PageLayout'
import Link from 'next/link'

export default function CreateVendorPage() {
  return (
    <PageLayout>
      {/* Blue Header Section */}
      <div className="bg-blue-600 text-white py-12 px-8 -m-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4">
            <Link href="/vendors" className="text-blue-100 hover:text-white font-medium">
              ← Back to Vendors Menu
            </Link>
          </div>
          <h1 className="text-4xl font-bold mb-2">
            Create New Vendor
          </h1>
          <p className="text-blue-100">
            Add a new supplier to your vendor database
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-3xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
          <VendorForm />
        </div>
      </div>
    </PageLayout>
  )
}