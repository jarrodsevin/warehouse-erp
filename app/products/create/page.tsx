import Link from 'next/link'
import ProductForm from '@/app/components/ProductForm'
import { prisma } from '@/prisma/prisma.config'

export default async function CreateProduct() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  })

  const subcategories = await prisma.subcategory.findMany({
    orderBy: { name: 'asc' }
  })

  const brands = await prisma.brand.findMany({
    orderBy: { name: 'asc' }
  })

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/products" className="text-gray-900 hover:text-gray-700 font-medium">
            ← Back to Products
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Create New Product
          </h1>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <ProductForm categories={categories} subcategories={subcategories} brands={brands} />
        </div>
      </div>
    </div>
  )
}