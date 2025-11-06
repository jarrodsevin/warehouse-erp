import VendorForm from '@/app/components/VendorForm'
import Link from 'next/link'

export default function CreateVendorPage() {
  return (
    <div className="min-h-screen py-16 px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link href="/vendors" className="text-blue-400 hover:text-blue-300">
            ← Back to Vendors Menu
          </Link>
        </div>
        
        <h1 className="text-4xl font-bold mb-12 text-center bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
          Create New Vendor
        </h1>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
          <VendorForm />
        </div>
      </div>
    </div>
  )
}