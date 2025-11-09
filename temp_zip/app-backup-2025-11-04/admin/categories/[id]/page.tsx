import { prisma } from '@/prisma/prisma.config'
import CategoryForm from '@/app/components/CategoryForm'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const category = await prisma.category.findUnique({
    where: { id }
  })

  if (!category) {
    notFound()
  }

  return (
    <div className="min-h-screen py-16 px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link href="/admin/categories/update" className="text-blue-400 hover:text-blue-300">
            ← Back to Update Categories
          </Link>
        </div>
        
        <h1 className="text-4xl font-bold mb-12 text-center bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
          Edit Category
        </h1>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-[0_0_15px_rgba(234,179,8,0.3)]">
          <CategoryForm category={category} />
        </div>
      </div>
    </div>
  )
}