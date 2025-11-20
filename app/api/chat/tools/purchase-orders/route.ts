import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { poNumber, vendorId, status, startDate, endDate, limit = 20 } = await request.json();

    // Build query filters
    const where: any = {};
    
    if (poNumber) {
      where.poNumber = { contains: poNumber, mode: 'insensitive' };
    }
    
    if (vendorId) {
      where.vendorId = vendorId;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (startDate || endDate) {
      where.orderDate = {};
      if (startDate) where.orderDate.gte = new Date(startDate);
      if (endDate) where.orderDate.lte = new Date(endDate);
    }

    // Fetch purchase orders
    const purchaseOrders = await prisma.purchaseOrder.findMany({
      where,
      include: {
        vendor: {
          select: {
            name: true,
            email: true,
            phone: true,
          }
        },
        items: {
          include: {
            product: {
              select: {
                sku: true,
                name: true,
              }
            }
          }
        }
      },
      take: Math.min(limit, 50),
      orderBy: { orderDate: 'desc' },
    });

    return NextResponse.json({ purchaseOrders });
  } catch (error: any) {
    console.error('Purchase Orders tool error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchase orders', details: error.message },
      { status: 500 }
    );
  }
}