// app/api/cron/send-scheduled-reports/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  generateProductProfitabilityPDF,
  generateCategoryAnalysisPDF,
  generateSubcategoryAnalysisPDF,
  generateBrandAnalysisPDF,
  generateVendorAnalysisPDF,
  generateInventoryStatusPDF,
} from '@/lib/pdf-generators'

// This function will be called by Vercel Cron every hour
export async function GET(request: Request) {
  try {
    // Verify the request is coming from Vercel Cron (security)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    console.log(`[CRON] Running at ${now.toISOString()}`)

    // Fetch all active scheduled reports
    const activeReports = await prisma.scheduledReportBatch.findMany({
      where: {
        status: 'active',
      },
      include: {
        items: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    })

    console.log(`[CRON] Found ${activeReports.length} active reports`)

    const sentReports: string[] = []
    const skippedReports: string[] = []

    for (const report of activeReports) {
      // Convert current UTC time to the report's timezone
      const reportTime = new Date(now.toLocaleString('en-US', { timeZone: report.timezone }))
      const currentHour = reportTime.getHours()
      const currentMinute = reportTime.getMinutes()
      const currentDay = reportTime.toLocaleDateString('en-US', { weekday: 'long', timeZone: report.timezone })
      const currentDate = reportTime.getDate()

      // Parse scheduled time (format: "HH:MM")
      const [scheduledHour, scheduledMinute] = report.scheduledTime.split(':').map(Number)

      // Check if this is the right hour
      if (currentHour !== scheduledHour) {
        continue
      }

      // Check frequency-specific conditions
      let shouldSend = false

      if (report.frequency === 'daily') {
        shouldSend = true
      } else if (report.frequency === 'weekly' && report.scheduledDays) {
        const scheduledDays = JSON.parse(report.scheduledDays) as string[]
        shouldSend = scheduledDays.includes(currentDay)
      } else if (report.frequency === 'monthly' && report.scheduledDays) {
        const scheduledDates = JSON.parse(report.scheduledDays) as number[]
        shouldSend = scheduledDates.includes(currentDate)
      }

      if (!shouldSend) {
        console.log(`[CRON] Skipping ${report.name} - not scheduled for now`)
        skippedReports.push(report.name)
        continue
      }

      // Check if we already sent today (prevent duplicate sends)
      if (report.lastSentAt) {
        const lastSent = new Date(report.lastSentAt)
        const lastSentDateString = lastSent.toLocaleDateString('en-US', { timeZone: report.timezone })
        const todayDateString = reportTime.toLocaleDateString('en-US', { timeZone: report.timezone })
        
        if (lastSentDateString === todayDateString) {
          console.log(`[CRON] Skipping ${report.name} - already sent today`)
          skippedReports.push(report.name)
          continue
        }
      }

      // Send the report!
      console.log(`[CRON] Sending report: ${report.name} (timezone: ${report.timezone})`)

      try {
        await sendScheduledReport(report)
        sentReports.push(report.name)

        // Update lastSentAt
        await prisma.scheduledReportBatch.update({
          where: { id: report.id },
          data: {
            lastSentAt: now,
            nextScheduledAt: calculateNextScheduledTime(report, now),
          },
        })

        console.log(`[CRON] Successfully sent: ${report.name}`)
      } catch (error) {
        console.error(`[CRON] Error sending ${report.name}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      totalActive: activeReports.length,
      sent: sentReports,
      skipped: skippedReports,
      sentCount: sentReports.length,
    })

  } catch (error) {
    console.error('[CRON] Error in scheduled reports:', error)
    return NextResponse.json(
      {
        error: 'Failed to process scheduled reports',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Helper function to send a report (similar to test send)
async function sendScheduledReport(reportBatch: any) {
  // Fetch all products
  const products = await prisma.product.findMany({
    include: {
      category: true,
      subcategory: true,
      brand: true,
      inventory: true,
    },
  })

  // Single report
  if (reportBatch.items.length === 1) {
    const item = reportBatch.items[0]
    const filterConfig = JSON.parse(item.filterConfig)
    
    let reportDoc: any

    switch (item.reportType) {
      case 'product-profitability':
        reportDoc = await generateProductProfitabilityPDF(products, filterConfig)
        break
      case 'category-analysis':
        reportDoc = await generateCategoryAnalysisPDF(products, filterConfig)
        break
      case 'subcategory-analysis':
        reportDoc = await generateSubcategoryAnalysisPDF(products, filterConfig)
        break
      case 'brand-analysis':
        reportDoc = await generateBrandAnalysisPDF(products, filterConfig)
        break
      case 'vendor-analysis':
        reportDoc = await generateVendorAnalysisPDF(products, filterConfig)
        break
      case 'inventory-status':
        reportDoc = await generateInventoryStatusPDF(products, filterConfig)
        break
      default:
        throw new Error(`Unknown report type: ${item.reportType}`)
    }

    const pdfBase64 = reportDoc.output('datauristring').split(',')[1]

    const typeLabel = item.reportType
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

    const emailSubject = `${reportBatch.name} - ${new Date().toLocaleDateString()}`
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">ApexFlow Scheduled Report</h2>
        
        <p>Dear ${reportBatch.userName},</p>
        
        <p>Your scheduled report "<strong>${reportBatch.name}</strong>" has been generated and is attached to this email.</p>
        
        <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">Report:</h3>
          <p style="margin: 0; font-size: 14px; color: #1f2937;">${typeLabel}</p>
        </div>
        
        <p style="color: #6b7280; font-size: 14px;">
          Generated on ${new Date().toLocaleString()}
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
        
        <p style="color: #9ca3af; font-size: 12px;">
          This is an automated scheduled report from your ApexFlow Warehouse ERP System.
        </p>
      </div>
    `

    const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: reportBatch.emailAddress,
        subject: emailSubject,
        html: emailHtml,
        attachments: [
          {
            filename: `${reportBatch.name.replace(/[^a-z0-9]/gi, '_')}-${new Date().toISOString().split('T')[0]}.pdf`,
            content: pdfBase64,
          },
        ],
      }),
    })

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json()
      throw new Error(`Email sending failed: ${errorData.error || 'Unknown error'}`)
    }

    return
  }

  // Multiple reports - merge PDFs
  const PDFDocument = (await import('pdf-lib')).PDFDocument
  const mergedPdf = await PDFDocument.create()

  for (const item of reportBatch.items) {
    const filterConfig = JSON.parse(item.filterConfig)
    
    let reportDoc: any

    switch (item.reportType) {
      case 'product-profitability':
        reportDoc = await generateProductProfitabilityPDF(products, filterConfig)
        break
      case 'category-analysis':
        reportDoc = await generateCategoryAnalysisPDF(products, filterConfig)
        break
      case 'subcategory-analysis':
        reportDoc = await generateSubcategoryAnalysisPDF(products, filterConfig)
        break
      case 'brand-analysis':
        reportDoc = await generateBrandAnalysisPDF(products, filterConfig)
        break
      case 'vendor-analysis':
        reportDoc = await generateVendorAnalysisPDF(products, filterConfig)
        break
      case 'inventory-status':
        reportDoc = await generateInventoryStatusPDF(products, filterConfig)
        break
      default:
        console.error(`Unknown report type: ${item.reportType}`)
        continue
    }

    const pdfBytes = reportDoc.output('arraybuffer')
    const pdf = await PDFDocument.load(pdfBytes)
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
    
    copiedPages.forEach((page) => {
      mergedPdf.addPage(page)
    })
  }

  const mergedPdfBytes = await mergedPdf.save()
  const pdfBase64 = Buffer.from(mergedPdfBytes).toString('base64')

  const reportSummary = reportBatch.items
    .map((item: any, index: number) => {
      const typeLabel = item.reportType
        .split('-')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      return `${index + 1}. ${typeLabel}`
    })
    .join('\n')

  const emailSubject = `${reportBatch.name} - ${new Date().toLocaleDateString()}`
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">ApexFlow Scheduled Report</h2>
      
      <p>Dear ${reportBatch.userName},</p>
      
      <p>Your scheduled report batch "<strong>${reportBatch.name}</strong>" has been generated and is attached to this email.</p>
      
      <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #374151;">Reports Included:</h3>
        <pre style="margin: 0; font-size: 14px; color: #1f2937;">${reportSummary}</pre>
      </div>
      
      <p style="color: #6b7280; font-size: 14px;">
        Generated on ${new Date().toLocaleString()}
      </p>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
      
      <p style="color: #9ca3af; font-size: 12px;">
        This is an automated scheduled report from your ApexFlow Warehouse ERP System.
      </p>
    </div>
  `

  const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: reportBatch.emailAddress,
      subject: emailSubject,
      html: emailHtml,
      attachments: [
        {
          filename: `${reportBatch.name.replace(/[^a-z0-9]/gi, '_')}-${new Date().toISOString().split('T')[0]}.pdf`,
          content: pdfBase64,
        },
      ],
    }),
  })

  if (!emailResponse.ok) {
    const errorData = await emailResponse.json()
    throw new Error(`Email sending failed: ${errorData.error || 'Unknown error'}`)
  }
}

// Helper function to calculate next scheduled time
function calculateNextScheduledTime(report: any, now: Date): Date {
  const [hour, minute] = report.scheduledTime.split(':').map(Number)
  
  // Create a date in the report's timezone
  const reportTimeString = now.toLocaleString('en-US', { timeZone: report.timezone })
  const next = new Date(reportTimeString)
  next.setHours(hour, minute, 0, 0)

  if (report.frequency === 'daily') {
    // If we already sent today, schedule for tomorrow
    if (next <= now) {
      next.setDate(next.getDate() + 1)
    }
  } else if (report.frequency === 'weekly') {
    const scheduledDays = JSON.parse(report.scheduledDays) as string[]
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    
    // Find next scheduled day
    let daysToAdd = 1
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(next)
      checkDate.setDate(checkDate.getDate() + daysToAdd)
      const dayName = checkDate.toLocaleDateString('en-US', { weekday: 'long', timeZone: report.timezone })
      
      if (scheduledDays.includes(dayName)) {
        next.setDate(next.getDate() + daysToAdd)
        break
      }
      daysToAdd++
    }
  } else if (report.frequency === 'monthly' && report.scheduledDays) {
    const scheduledDates = JSON.parse(report.scheduledDays) as number[]
    
    // Find next scheduled date
    const currentDate = next.getDate()
    let foundDate = scheduledDates.find(d => d > currentDate)
    
    if (foundDate) {
      next.setDate(foundDate)
    } else {
      // Next month
      next.setMonth(next.getMonth() + 1)
      next.setDate(scheduledDates[0])
    }
  }

  return next
}