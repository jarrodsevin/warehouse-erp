import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    
    const salesOrder = await prisma.salesOrder.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      }
    })

    if (!salesOrder) {
      return NextResponse.json(
        { error: 'Sales order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(salesOrder)
  } catch (error) {
    console.error('Error fetching sales order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sales order', details: String(error) },
      { status: 500 }
    )
  }
}