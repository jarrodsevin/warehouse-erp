import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { searchTerm, customerGroup, customerCategory, status, limit = 20 } = await request.json();

    // Build query filters
    const where: any = {};
    
    if (searchTerm) {
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
        { phone: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }
    
    if (customerGroup) {
      where.customerGroup = customerGroup;
    }
    
    if (customerCategory) {
      where.customerCategory = customerCategory;
    }
    
    if (status) {
      where.status = status;
    }

    // Fetch customers
    const customers = await prisma.customer.findMany({
      where,
      include: {
        salesOrders: {
          select: {
            id: true,
            soNumber: true,
            orderDate: true,
            total: true,
            status: true,
          },
          orderBy: {
            orderDate: 'desc'
          },
          take: 5, // Last 5 SOs per customer
        }
      },
      take: Math.min(limit, 50),
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ customers });
  } catch (error: any) {
    console.error('Customers tool error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers', details: error.message },
      { status: 500 }
    );
  }
}