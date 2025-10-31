"use server";
import { PrismaClient, Prisma } from "@prisma/client";
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient();

export async function createPurchaseOrder(data: {
  poNumber: string
  vendorId: string
  orderDate: Date
  expectedDate?: Date
  status: string
  notes?: string
  items: Array<{
    productId: string
    quantity: number
    unitCost: number
  }>
}) {
  await prisma.purchaseOrder.create({
    data: {
      poNumber: data.poNumber,
      vendorId: data.vendorId,
      orderDate: data.orderDate,
      expectedDate: data.expectedDate,
      status: data.status,
      notes: data.notes,
      items: {
        create: data.items
      }
    }
  })
  
  revalidatePath('/purchase-orders')
}

export async function getPurchaseOrders() {
  return await prisma.purchaseOrder.findMany({
    include: {
      vendor: true,
      items: {
        include: {
          product: true
        }
      }
    },
    orderBy: {
      orderDate: 'desc'
    }
  })
}

export async function getPurchaseOrder(id: string) {
  return await prisma.purchaseOrder.findUnique({
    where: { id },
    include: {
      vendor: true,
      items: {
        include: {
          product: true
        }
      }
    }
  })
}

export async function updatePurchaseOrder(id: string, data: {
  poNumber: string
  vendorId: string
  orderDate: Date
  expectedDate?: Date
  status: string
  notes?: string
  items: Array<{
    productId: string
    quantity: number
    unitCost: number
  }>
}) {
  // @ts-ignore - Prisma transaction type inference
  await prisma.$transaction(async (tx) => {
    await tx.purchaseOrderItem.deleteMany({
      where: { purchaseOrderId: id }
    })
    
    await tx.purchaseOrder.update({
      where: { id },
      data: {
        poNumber: data.poNumber,
        vendorId: data.vendorId,
        orderDate: data.orderDate,
        expectedDate: data.expectedDate,
        status: data.status,
        notes: data.notes,
      }
    })
    
    await tx.purchaseOrderItem.createMany({
      data: data.items.map(item => ({
        ...item,
        purchaseOrderId: id
      }))
    })
  })
  
  revalidatePath('/purchase-orders')
  revalidatePath(`/purchase-orders/${id}`)
}

export async function deletePurchaseOrder(id: string) {
  await prisma.purchaseOrder.delete({
    where: { id }
  })
  
  revalidatePath('/purchase-orders')
}