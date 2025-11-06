import PurchaseOrderForm from '@/app/components/PurchaseOrderForm'
import Link from 'next/link'
import { prisma } from '@/prisma/prisma.config'

export default async function CreatePurchaseOrderPage() {
  const vendors = await prisma.vendor.findMany({
    orderBy: { name: 'asc' }
  })

  const products = await prisma.product.findMany({
    orderBy: { name: 'asc' }
  })

  return (
    <div className="min-h-screen py-16 px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <Link href="/purchase-orders" className="text-blue-400 hover:text-blue-300">
            ← Back to Purchase Orders Menu
          </Link>
        </div>
        
        <h1 className="text-4xl font-bold mb-12 text-center bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
          Create New Purchase Order
        </h1>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
          <PurchaseOrderForm vendors={vendors} products={products} />
        </div>
      </div>
    </div>
  )
}