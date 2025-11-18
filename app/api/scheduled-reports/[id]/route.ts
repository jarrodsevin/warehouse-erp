import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Fetch single scheduled report
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const report = await prisma.scheduledReportBatch.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: {
            orderIndex: 'asc',
          },
        },
      },
    })

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      )
    }

    // Parse JSON fields
    const reportWithParsedData = {
      ...report,
      scheduledDays: report.scheduledDays ? JSON.parse(report.scheduledDays) : null,
      items: report.items.map(item => ({
        ...item,
        filterConfig: JSON.parse(item.filterConfig),
      })),
    }

    return NextResponse.json(reportWithParsedData)
  } catch (error) {
    console.error('Error fetching scheduled report:', error)
    return NextResponse.json(
      { error: 'Failed to fetch scheduled report' },
      { status: 500 }
    )
  }
}

// DELETE - Delete scheduled report
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    await prisma.scheduledReportBatch.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting scheduled report:', error)
    return NextResponse.json(
      { error: 'Failed to delete scheduled report' },
      { status: 500 }
    )
  }
}

// PUT - Update scheduled report
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      name,
      userName,
      emailAddress,
      status,
      frequency,
      scheduledDays,
      scheduledTime,
      items,
    } = body

    // Delete existing items
    await prisma.scheduledReportItem.deleteMany({
      where: { batchId: id },
    })

    // Update report with new items
    const report = await prisma.scheduledReportBatch.update({
      where: { id },
      data: {
        name,
        userName,
        emailAddress,
        status,
        frequency,
        scheduledDays: scheduledDays ? JSON.stringify(scheduledDays) : null,
        scheduledTime,
        items: {
          create: items.map((item: any, index: number) => ({
            reportType: item.reportType,
            orderIndex: index,
            filterConfig: JSON.stringify(item.filterConfig),
          })),
        },
      },
      include: {
        items: true,
      },
    })

    return NextResponse.json(report)
  } catch (error) {
    console.error('Error updating scheduled report:', error)
    return NextResponse.json(
      { error: 'Failed to update scheduled report' },
      { status: 500 }
    )
  }
}