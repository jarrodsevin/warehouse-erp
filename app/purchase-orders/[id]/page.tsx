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
    <div className="min-h-screen py-16 px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link href="/purchase-orders/update" className="text-blue-400 hover:text-blue-300">
            ← Back to Update Purchase Orders
          </Link>
        </div>
        
        <h1 className="text-4xl font-bold mb-12 text-center bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
          Edit Purchase Order
        </h1>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
          <PurchaseOrderForm purchaseOrder={purchaseOrder} vendors={vendors} products={products} />
        </div>
      </div>
    </div>
  )
}