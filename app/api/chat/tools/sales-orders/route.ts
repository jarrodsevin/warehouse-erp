import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { soNumber, customerId, status, startDate, endDate, limit = 20 } = await request.json();

    // Build query filters
    const where: any = {};
    
    if (soNumber) {
      where.soNumber = { contains: soNumber, mode: 'insensitive' };
    }
    
    if (customerId) {
      where.customerId = customerId;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (startDate || endDate) {
      where.orderDate = {};
      if (startDate) where.orderDate.gte = new Date(startDate);
      if (endDate) where.orderDate.lte = new Date(endDate);
    }

    // Fetch sales orders
    const salesOrders = await prisma.salesOrder.findMany({
      where,
      include: {
        customer: {
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

    return NextResponse.json({ salesOrders });
  } catch (error: any) {
    console.error('Sales Orders tool error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sales orders', details: error.message },
      { status: 500 }
    );
  }
}