import { prisma } from '@/prisma/prisma.config'
import VendorForm from '@/app/components/VendorForm'
import PageLayout from '@/app/components/PageLayout'
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
    <PageLayout>
      {/* Blue Header Section */}
      <div className="bg-blue-600 text-white py-12 px-8 -m-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4">
            <Link href="/vendors/update" className="text-blue-100 hover:text-white font-medium">
              ← Back to Update Vendors
            </Link>
          </div>
          <h1 className="text-4xl font-bold mb-2">
            Edit Vendor
          </h1>
          <p className="text-blue-100">
            Update vendor information and details
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-3xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
          <VendorForm vendor={vendor} />
        </div>
      </div>
    </PageLayout>
  )
}