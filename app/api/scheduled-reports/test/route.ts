import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST - Send test report immediately
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { scheduledReportId } = body

    // Fetch the scheduled report with all items
    const report = await prisma.scheduledReportBatch.findUnique({
      where: { id: scheduledReportId },
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
        { error: 'Scheduled report not found' },
        { status: 404 }
      )
    }

    // Parse the items
    const parsedItems = report.items.map(item => ({
      reportType: item.reportType,
      filterConfig: JSON.parse(item.filterConfig),
    }))

    // For now, return success with the report data
    // The actual PDF generation and emailing will happen client-side
    return NextResponse.json({
      success: true,
      report: {
        name: report.name,
        userName: report.userName,
        emailAddress: report.emailAddress,
        items: parsedItems,
      },
    })
  } catch (error) {
    console.error('Error sending test report:', error)
    return NextResponse.json(
      { error: 'Failed to send test report' },
      { status: 500 }
    )
  }
}