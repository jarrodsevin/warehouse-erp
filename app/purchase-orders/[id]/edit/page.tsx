import { prisma } from '@/prisma/prisma.config'
import PurchaseOrderForm from '@/app/components/PurchaseOrderForm'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import PageLayout from '@/app/components/PageLayout'

export default async function EditPurchaseOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const purchaseOrder = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: { items: true }
  })

  if (!purchaseOrder) {
    notFound()
  }

  const vendors = await prisma.vendor.findMany({
    orderBy: { name: 'asc' }
  })

  const products = await prisma.product.findMany({
    orderBy: { name: 'asc' }
  })

  return (
    <PageLayout>
      {/* Blue Header Section */}
      <div className="bg-blue-600 text-white py-12 px-8 -m-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4">
            <Link href="/purchase-orders/update" className="text-blue-100 hover:text-white font-medium">
              ← Back to Update Purchase Orders
            </Link>
          </div>
          <h1 className="text-4xl font-bold mb-2">
            Edit Purchase Order
          </h1>
          <p className="text-blue-100">
            Update purchase order details and items
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-5xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
          <PurchaseOrderForm purchaseOrder={purchaseOrder} vendors={vendors} products={products} />
        </div>
      </div>
    </PageLayout>
  )
}