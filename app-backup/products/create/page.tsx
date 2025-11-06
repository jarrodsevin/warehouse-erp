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
    <div className="min-h-screen py-16 px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/products" className="text-blue-400 hover:text-blue-300">
            ← Back to Products
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Create New Product
          </h1>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
          <ProductForm categories={categories} subcategories={subcategories} brands={brands} />
        </div>
      </div>
    </div>
  )
}