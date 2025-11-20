import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { searchTerm, categoryId, brandId, limit = 10 } = await request.json();

    // Build query filters
    const where: any = {};
    
    if (searchTerm) {
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { sku: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }
    
    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    if (brandId) {
      where.brandId = brandId;
    }

    // Fetch products
    const products = await prisma.product.findMany({
      where,
      include: {
        category: { select: { name: true } },
        subcategory: { select: { name: true } },
        brand: { select: { name: true } },
        inventory: {
          select: {
            quantityOnHand: true,
            reorderLevel: true,
          }
        },
      },
      take: Math.min(limit, 50), // Max 50 results
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ products });
  } catch (error: any) {
    console.error('Products tool error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products', details: error.message },
      { status: 500 }
    );
  }
}