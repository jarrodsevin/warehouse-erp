import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        subcategory: true,
        brand: true,
        inventory: true,
        purchaseOrderItems: {
          include: {
            purchaseOrder: {
              include: {
                vendor: true
              }
            }
          },
          orderBy: {
            purchaseOrder: {
              orderDate: 'desc'
            }
          }
        },
        changeLogs: {
          orderBy: {
            changedAt: 'desc'
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}