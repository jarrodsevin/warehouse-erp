import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const salesOrders = await prisma.salesOrder.findMany({
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        orderDate: 'desc'
      }
    });

    return NextResponse.json(salesOrders);
  } catch (error) {
    console.error('Error fetching sales orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sales orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate inventory availability
    for (const item of body.items) {
      const inventory = await prisma.inventory.findUnique({
        where: { productId: item.productId }
      });
      
      if (!inventory || inventory.quantityOnHand < item.quantity) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId }
        });
        return NextResponse.json(
          { error: `Insufficient inventory for ${product?.name}. Available: ${inventory?.quantityOnHand || 0}` },
          { status: 400 }
        );
      }
    }

    // Get next SO number
    const lastSO = await prisma.salesOrder.findFirst({
      orderBy: { soNumber: 'desc' }
    });
    const lastNumber = lastSO ? parseInt(lastSO.soNumber.split('-')[1]) : 0;
    const soNumber = `SO-${String(lastNumber + 1).padStart(4, '0')}`;

    // Create sales order with items
    const salesOrder = await prisma.salesOrder.create({
      data: {
        soNumber,
        customerId: body.customerId,
        orderDate: new Date(),
        status: 'fulfilled',
        subtotal: body.subtotal,
        total: body.total,
        notes: body.notes,
        items: {
          create: body.items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineTotal: item.lineTotal
          }))
        }
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // Deduct inventory and update customer balance
    for (const item of body.items) {
      await prisma.inventory.update({
        where: { productId: item.productId },
        data: {
          quantityOnHand: {
            decrement: item.quantity
          }
        }
      });
    }

    await prisma.customer.update({
      where: { id: body.customerId },
      data: {
        currentBalance: {
          increment: body.total
        }
      }
    });

    return NextResponse.json(salesOrder);
  } catch (error) {
    console.error('Error creating sales order:', error);
    return NextResponse.json(
      { error: 'Failed to create sales order' },
      { status: 500 }
    );
  }
}