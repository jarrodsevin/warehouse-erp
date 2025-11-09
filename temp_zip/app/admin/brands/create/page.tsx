import Link from 'next/link'
import BrandForm from '@/app/components/BrandForm'

export default function CreateBrand() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/admin/brands" className="text-primary-600 hover:text-primary-700">
            ← Back to Brands
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">
            Create New Brand
          </h1>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <BrandForm />
        </div>
      </div>
    </div>
  )
}