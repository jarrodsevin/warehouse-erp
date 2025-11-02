import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch sales visit data for a customer
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    }

    // Get all sales visits for this customer
    const salesVisits = await prisma.salesVisit.findMany({
      where: { customerId },
      orderBy: { visitDate: 'desc' },
      include: {
        customer: true
      }
    });

    // Get sales orders with date filtering options
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
    const lastYearEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);

    const salesOrders = await prisma.salesOrder.findMany({
      where: { customerId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { orderDate: 'desc' }
    });

    // Get unique products purchased by this customer
    const productMap = new Map();
    
    salesOrders.forEach(order => {
      order.items.forEach(item => {
        const productId = item.product.id;
        if (!productMap.has(productId)) {
          productMap.set(productId, {
            id: item.product.id,
            sku: item.product.sku,
            name: item.product.name,
            totalQuantity: 0,
            totalRevenue: 0,
            orderCount: 0,
            lastOrderDate: order.orderDate
          });
        }
        const productData = productMap.get(productId);
        productData.totalQuantity += item.quantity;
        productData.totalRevenue += item.lineTotal;
        productData.orderCount += 1;
        
        // Update last order date if this order is more recent
        if (new Date(order.orderDate) > new Date(productData.lastOrderDate)) {
          productData.lastOrderDate = order.orderDate;
        }
      });
    });

    const products = Array.from(productMap.values());

    return NextResponse.json({
      salesVisits,
      salesOrders,
      products,
      stats: {
        thirtyDays: salesOrders.filter(o => new Date(o.orderDate) >= thirtyDaysAgo).length,
        sixtyDays: salesOrders.filter(o => new Date(o.orderDate) >= sixtyDaysAgo).length,
        ninetyDays: salesOrders.filter(o => new Date(o.orderDate) >= ninetyDaysAgo).length,
        ytd: salesOrders.filter(o => new Date(o.orderDate) >= yearStart).length,
        lastYear: salesOrders.filter(o => 
          new Date(o.orderDate) >= lastYearStart && 
          new Date(o.orderDate) <= lastYearEnd
        ).length,
        allTime: salesOrders.length
      }
    });
  } catch (error) {
    console.error('Error fetching sales visit data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

// POST - Create a new sales visit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, visitDate, notes, images } = body;

    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    }

    const salesVisit = await prisma.salesVisit.create({
      data: {
        customerId,
        visitDate: visitDate ? new Date(visitDate) : new Date(),
        notes: notes || null,
        images: images ? JSON.stringify(images) : null
      },
      include: {
        customer: true
      }
    });

    return NextResponse.json(salesVisit, { status: 201 });
  } catch (error) {
    console.error('Error creating sales visit:', error);
    return NextResponse.json({ error: 'Failed to create sales visit' }, { status: 500 });
  }
}