import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const vendors = await prisma.vendor.findMany({
      orderBy: {
        name: 'asc'
      }
    })
    return NextResponse.json(vendors)
  } catch (error) {
    console.error('Error fetching vendors:', error)
    return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const vendor = await prisma.vendor.create({
      data: {
        name: body.name,
        email: body.email || null,
        phone: body.phone || null,
        contactPerson: body.contactPerson || null,
        status: body.status || 'active',
        notes: body.notes || null,
      }
    })
    
    return NextResponse.json(vendor)
  } catch (error) {
    console.error('Error creating vendor:', error)
    return NextResponse.json({ error: 'Failed to create vendor' }, { status: 500 })
  }
}