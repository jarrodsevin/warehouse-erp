import { prisma } from '@/prisma/prisma.config'
import VendorForm from '@/app/components/VendorForm'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function EditVendorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const vendor = await prisma.vendor.findUnique({
    where: { id }
  })

  if (!vendor) {
    notFound()
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link href="/vendors/update" className="text-primary-600 hover:text-primary-700">
            ← Back to Update Vendors
          </Link>
        </div>
        
        <h1 className="text-4xl font-bold mb-12 text-center text-gray-900">
          Edit Vendor
        </h1>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <VendorForm vendor={vendor} />
        </div>
      </div>
    </div>
  )
}