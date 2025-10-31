import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const inventory = await prisma.inventory.findMany({
      include: {
        product: {
          include: {
            category: true,
            subcategory: true,
            brand: true,
            purchaseOrderItems: {
              include: {
                purchaseOrder: {
                  include: {
                    vendor: true,
                  },
                },
              },
              orderBy: {
                purchaseOrder: {
                  orderDate: 'desc',
                },
              },
              take: 1, // Get most recent purchase order
            },
          },
        },
      },
      where: {
        quantityOnHand: {
          gt: 0, // Only products with inventory
        },
      },
    });

    return NextResponse.json({ inventory });
  } catch (error) {
    console.error('Error fetching inventory value:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory value' },
      { status: 500 }
    );
  }
}