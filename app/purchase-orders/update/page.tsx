import { prisma } from '@/prisma/prisma.config'
import PurchaseOrderUpdateClient from '@/app/components/PurchaseOrderUpdateClient'

export default async function UpdatePurchaseOrdersPage() {
  const purchaseOrders = await prisma.purchaseOrder.findMany({
    include: {
      vendor: true,
      items: {
        include: {
          product: true
        }
      }
    },
    orderBy: { orderDate: 'desc' }
  })

  return <PurchaseOrderUpdateClient purchaseOrders={purchaseOrders} />
}