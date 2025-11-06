import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get total products count
    const totalProducts = await prisma.product.count();

    // Get active sales orders (not fulfilled)
    const activeOrders = await prisma.salesOrder.count({
      where: {
        status: {
          not: 'fulfilled'
        }
      }
    });

    // Get current month's revenue (fulfilled orders)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const monthlyRevenue = await prisma.salesOrder.aggregate({
      where: {
        status: 'fulfilled',
        orderDate: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      },
      _sum: {
        total: true
      }
    });

    // Get inventory value (quantity * unit cost for all products)
    const productsWithInventory = await prisma.product.findMany({
      include: {
        inventory: true
      }
    });

    // Get the most recent purchase order item for each product to get unit cost
    let inventoryValue = 0;
    for (const product of productsWithInventory) {
      if (product.inventory && product.inventory.quantityOnHand > 0) {
        // Find most recent purchase order item for this product
        const recentPurchase = await prisma.purchaseOrderItem.findFirst({
          where: {
            productId: product.id
          },
          orderBy: {
            purchaseOrder: {
              receivedDate: 'desc'
            }
          },
          select: {
            unitCost: true
          }
        });

        if (recentPurchase) {
          inventoryValue += product.inventory.quantityOnHand * recentPurchase.unitCost;
        }
      }
    }

    return NextResponse.json({
      totalProducts,
      activeOrders,
      monthlyRevenue: monthlyRevenue._sum.total || 0,
      inventoryValue
    });
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard metrics' },
      { status: 500 }
    );
  }
}