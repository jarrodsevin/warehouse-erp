import Link from 'next/link'
import SubcategoryForm from '@/app/components/SubcategoryForm'

export default function CreateSubcategory() {
  return (
    <div className="min-h-screen py-16 px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/admin/subcategories" className="text-blue-400 hover:text-blue-300">
            ← Back to Subcategories
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Create New Subcategory
          </h1>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-[0_0_15px_rgba(234,179,8,0.3)]">
          <SubcategoryForm />
        </div>
      </div>
    </div>
  )
}