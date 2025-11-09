import Link from 'next/link'
import SubcategoryForm from '@/app/components/SubcategoryForm'

export default function CreateSubcategory() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/admin/subcategories" className="text-primary-600 hover:text-primary-700">
            ← Back to Subcategories
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Create New Subcategory
          </h1>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <SubcategoryForm />
        </div>
      </div>
    </div>
  )
}