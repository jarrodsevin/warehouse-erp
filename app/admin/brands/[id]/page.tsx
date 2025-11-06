import { prisma } from '@/prisma/prisma.config'
import Link from 'next/link'
import BrandForm from '@/app/components/BrandForm'
import { notFound } from 'next/navigation'

export default async function EditBrand({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const brand = await prisma.brand.findUnique({
    where: { id },
  })

  if (!brand) {
    notFound()
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/admin/brands/update" className="text-primary-600 hover:text-primary-700">
            ← Back to Brands List
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
            Edit Brand
          </h1>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
          <BrandForm brand={brand} />
        </div>
      </div>
    </div>
  )
}