import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { searchTerm, status, limit = 20 } = await request.json();

    // Build query filters
    const where: any = {};
    
    if (searchTerm) {
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
        { contactPerson: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }
    
    if (status) {
      where.status = status;
    }

    // Fetch vendors
    const vendors = await prisma.vendor.findMany({
      where,
      include: {
        purchaseOrders: {
          select: {
            id: true,
            poNumber: true,
            orderDate: true,
            status: true,
          },
          orderBy: {
            orderDate: 'desc'
          },
          take: 5, // Last 5 POs per vendor
        }
      },
      take: Math.min(limit, 50),
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ vendors });
  } catch (error: any) {
    console.error('Vendors tool error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vendors', details: error.message },
      { status: 500 }
    );
  }
}