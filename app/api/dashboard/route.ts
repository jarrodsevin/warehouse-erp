import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get inventory value (quantity * unit cost for all products)
    const productsWithInventory = await prisma.product.findMany({
      include: {
        inventory: true
      }
    });

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

    // Get YTD Sales Revenue (fulfilled orders from Jan 1 to today)
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1); // Jan 1 of current year

    const ytdRevenue = await prisma.salesOrder.aggregate({
      where: {
        status: 'fulfilled',
        orderDate: {
          gte: startOfYear,
          lte: now
        }
      },
      _sum: {
        total: true
      }
    });

    // Get recent sales orders count (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentOrdersCount = await prisma.salesOrder.count({
      where: {
        orderDate: {
          gte: thirtyDaysAgo,
          lte: now
        }
      }
    });

    // Get Best Seller This Month (by revenue)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const salesThisMonth = await prisma.salesOrderItem.findMany({
      where: {
        salesOrder: {
          orderDate: {
            gte: startOfMonth,
            lte: now
          },
          status: 'fulfilled'
        }
      },
      include: {
        product: true
      }
    });

    // Calculate revenue per product
    const productRevenue = new Map<string, { product: any; revenue: number }>();
    
    for (const item of salesThisMonth) {
      const revenue = item.quantity * item.unitPrice;
      const existing = productRevenue.get(item.productId);
      
      if (existing) {
        existing.revenue += revenue;
      } else {
        productRevenue.set(item.productId, {
          product: item.product,
          revenue: revenue
        });
      }
    }

    // Find top product
    let bestSeller: string | null = null;
    let maxRevenue = 0;
    
    for (const [_, data] of productRevenue) {
      if (data.revenue > maxRevenue) {
        maxRevenue = data.revenue;
        bestSeller = data.product.name;
      }
    }

    // Get Top Brand This Month (by revenue)
    const brandRevenue = new Map<string, { brandName: string; revenue: number }>();
    
    for (const item of salesThisMonth) {
      if (item.product.brandId) {
        const revenue = item.quantity * item.unitPrice;
        const brandId = item.product.brandId;
        
        // Get brand name
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          include: { brand: true }
        });
        
        if (product?.brand) {
          const existing = brandRevenue.get(brandId);
          
          if (existing) {
            existing.revenue += revenue;
          } else {
            brandRevenue.set(brandId, {
              brandName: product.brand.name,
              revenue: revenue
            });
          }
        }
      }
    }

    // Find top brand
    let topBrand: string | null = null;
    let maxBrandRevenue = 0;
    
    for (const [_, data] of brandRevenue) {
      if (data.revenue > maxBrandRevenue) {
        maxBrandRevenue = data.revenue;
        topBrand = data.brandName;
      }
    }

    // Sales to Budget - placeholder for future feature
    const salesToBudget = 0; // Will be calculated when budget feature is added

    return NextResponse.json({
      inventoryValue,
      ytdRevenue: ytdRevenue._sum.total || 0,
      recentOrdersCount,
      salesToBudget,
      bestSeller: bestSeller || 'No sales this month',
      topBrand: topBrand || 'No sales this month'
    });
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard metrics' },
      { status: 500 }
    );
  }
}