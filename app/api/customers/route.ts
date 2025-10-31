import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        _count: {
          select: {
            salesOrders: true,
            payments: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const customer = await prisma.customer.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        address: body.address,
        customerGroup: body.customerGroup,
        customerCategory: body.customerCategory,
        creditLimit: parseFloat(body.creditLimit) || 0,
        currentBalance: 0,
        paymentTerms: body.paymentTerms,
        status: body.status || 'active',
        notes: body.notes
      }
    });

    return NextResponse.json(customer);
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}