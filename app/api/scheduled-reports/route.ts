import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Fetch all scheduled reports
export async function GET() {
  try {
    const reports = await prisma.scheduledReportBatch.findMany({
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Add item count to each report
    const reportsWithCount = reports.map(report => ({
      ...report,
      itemCount: report.items.length,
      items: undefined, // Remove items array from response, just send count
    }))

    return NextResponse.json(reportsWithCount)
  } catch (error) {
    console.error('Error fetching scheduled reports:', error)
    return NextResponse.json(
      { error: 'Failed to fetch scheduled reports' },
      { status: 500 }
    )
  }
}

// POST - Create new scheduled report
export async function POST(request: Request) {
  try {
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

    const report = await prisma.scheduledReportBatch.create({
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
    console.error('Error creating scheduled report:', error)
    return NextResponse.json(
      { error: 'Failed to create scheduled report' },
      { status: 500 }
    )
  }
}