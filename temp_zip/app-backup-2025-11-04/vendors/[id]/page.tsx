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
    <div className="min-h-screen py-16 px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link href="/vendors/update" className="text-blue-400 hover:text-blue-300">
            ← Back to Update Vendors
          </Link>
        </div>
        
        <h1 className="text-4xl font-bold mb-12 text-center bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
          Edit Vendor
        </h1>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
          <VendorForm vendor={vendor} />
        </div>
      </div>
    </div>
  )
}