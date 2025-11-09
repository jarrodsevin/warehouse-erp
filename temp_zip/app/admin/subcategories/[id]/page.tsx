import { prisma } from '@/prisma/prisma.config'
import Link from 'next/link'
import SubcategoryForm from '@/app/components/SubcategoryForm'
import { notFound } from 'next/navigation'

export default async function EditSubcategory({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const subcategory = await prisma.subcategory.findUnique({
    where: { id },
  })

  if (!subcategory) {
    notFound()
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/admin/subcategories/update" className="text-primary-600 hover:text-primary-700">
            ← Back to Subcategories List
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Edit Subcategory
          </h1>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-[0_0_15px_rgba(234,179,8,0.3)]">
          <SubcategoryForm subcategory={subcategory} />
        </div>
      </div>
    </div>
  )
}