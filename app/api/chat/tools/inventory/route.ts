import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { productId, sku, lowStockOnly, limit = 20 } = await request.json();

    // Build query filters
    const where: any = {};
    
    if (productId) {
      where.productId = productId;
    }
    
    if (sku) {
      where.product = {
        sku: { contains: sku, mode: 'insensitive' }
      };
    }
    
    if (lowStockOnly) {
      where.quantityOnHand = {
        lte: prisma.inventory.fields.reorderLevel
      };
    }

    // Fetch inventory
    const inventory = await prisma.inventory.findMany({
      where,
      include: {
        product: {
          select: {
            sku: true,
            name: true,
            category: { select: { name: true } },
            brand: { select: { name: true } },
          }
        },
      },
      take: Math.min(limit, 100),
      orderBy: { quantityOnHand: 'asc' },
    });

    return NextResponse.json({ inventory });
  } catch (error: any) {
    console.error('Inventory tool error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory', details: error.message },
      { status: 500 }
    );
  }
}