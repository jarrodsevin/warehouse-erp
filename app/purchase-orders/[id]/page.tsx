import { prisma } from '@/prisma/prisma.config'
import PurchaseOrderForm from '@/app/components/PurchaseOrderForm'
import Link from 'next/link'
import { notFound } from 'next/navigation'

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
    <div className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link href="/purchase-orders/update" className="text-primary-600 hover:text-primary-700">
            ← Back to Update Purchase Orders
          </Link>
        </div>
        
        <h1 className="text-4xl font-bold mb-12 text-center text-gray-900">
          Edit Purchase Order
        </h1>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
          <PurchaseOrderForm purchaseOrder={purchaseOrder} vendors={vendors} products={products} />
        </div>
      </div>
    </div>
  )
}