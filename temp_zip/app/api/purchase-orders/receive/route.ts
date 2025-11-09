import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { poId } = await request.json();

    if (!poId) {
      return NextResponse.json(
        { error: 'Purchase Order ID is required' },
        { status: 400 }
      );
    }

    // Get the PO with its items
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id: poId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!purchaseOrder) {
      return NextResponse.json(
        { error: 'Purchase Order not found' },
        { status: 404 }
      );
    }

    if (purchaseOrder.status === 'received') {
      return NextResponse.json(
        { error: 'Purchase Order already received' },
        { status: 400 }
      );
    }

    // Update PO status and receivedDate
    await prisma.purchaseOrder.update({
      where: { id: poId },
      data: {
        status: 'received',
        receivedDate: new Date(),
      },
    });

    // Update inventory for each item
    for (const item of purchaseOrder.items) {
      const existingInventory = await prisma.inventory.findUnique({
        where: { productId: item.productId },
      });

      if (existingInventory) {
        // Update existing inventory
        await prisma.inventory.update({
          where: { productId: item.productId },
          data: {
            quantityOnHand: existingInventory.quantityOnHand + item.quantity,
            lastRestocked: new Date(),
          },
        });
      } else {
        // Create new inventory record with reorder levels based on category
        const product = item.product;
        let reorderLevel = 50;
        let reorderQuantity = 100;

        // Set reorder levels based on category (matching seed script logic)
        if (product.categoryId) {
          const category = await prisma.category.findUnique({
            where: { id: product.categoryId },
          });

          if (category) {
            const categoryName = category.name.toLowerCase();
            if (categoryName.includes('beverage') || categoryName.includes('snack')) {
              reorderLevel = 100;
              reorderQuantity = 200;
            } else if (categoryName.includes('dairy') || categoryName.includes('produce')) {
              reorderLevel = 50;
              reorderQuantity = 100;
            } else if (categoryName.includes('meat')) {
              reorderLevel = 25;
              reorderQuantity = 50;
            } else if (categoryName.includes('frozen')) {
              reorderLevel = 75;
              reorderQuantity = 150;
            }
          }
        }

        await prisma.inventory.create({
          data: {
            productId: item.productId,
            quantityOnHand: item.quantity,
            reorderLevel,
            reorderQuantity,
            lastRestocked: new Date(),
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Purchase Order received and inventory updated',
    });
  } catch (error) {
    console.error('Error receiving purchase order:', error);
    return NextResponse.json(
      { error: 'Failed to receive purchase order' },
      { status: 500 }
    );
  }
}