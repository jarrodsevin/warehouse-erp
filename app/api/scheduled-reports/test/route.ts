// app/api/scheduled-reports/test/route.ts
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

export async function POST(request: Request) {
  try {
    const { scheduledReportId } = await request.json()

    if (!scheduledReportId) {
      return NextResponse.json(
        { error: 'scheduledReportId is required' },
        { status: 400 }
      )
    }

    // 1. Fetch the scheduled report batch with all items
    const reportBatch = await prisma.scheduledReportBatch.findUnique({
      where: { id: scheduledReportId },
      include: {
        items: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    })

    if (!reportBatch) {
      return NextResponse.json(
        { error: 'Scheduled report not found' },
        { status: 404 }
      )
    }

    if (!reportBatch.items || reportBatch.items.length === 0) {
      return NextResponse.json(
        { error: 'No reports configured in this batch' },
        { status: 400 }
      )
    }

    // 2. Fetch all products with related data (we'll filter per report)
    const products = await prisma.product.findMany({
      include: {
        category: true,
        subcategory: true,
        brand: true,
        inventory: true,
      },
    })

    // 3. If only one report, generate and send it directly
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
          return NextResponse.json(
            { error: `Unknown report type: ${item.reportType}` },
            { status: 400 }
          )
      }

      const pdfBase64 = reportDoc.output('datauristring').split(',')[1]

      // Send email
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
            This is an automated message from your ApexFlow Warehouse ERP System.
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

      return NextResponse.json({
        success: true,
        message: 'Test report sent successfully',
        emailAddress: reportBatch.emailAddress,
        reportCount: 1,
      })
    }

    // 4. For multiple reports, we need to use pdf-lib to properly merge PDFs
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

      // Convert jsPDF to pdf-lib format
      const pdfBytes = reportDoc.output('arraybuffer')
      const pdf = await PDFDocument.load(pdfBytes)
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
      
      copiedPages.forEach((page) => {
        mergedPdf.addPage(page)
      })
    }

    // 5. Convert merged PDF to base64
    const mergedPdfBytes = await mergedPdf.save()
    const pdfBase64 = Buffer.from(mergedPdfBytes).toString('base64')

    // 6. Prepare email content
    const reportSummary = reportBatch.items
      .map((item, index) => {
        const typeLabel = item.reportType
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
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
          This is an automated message from your ApexFlow Warehouse ERP System.
        </p>
      </div>
    `

    // 7. Send email with PDF attachment
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

    // 8. Return success response
    return NextResponse.json({
      success: true,
      message: 'Test report sent successfully',
      emailAddress: reportBatch.emailAddress,
      reportCount: reportBatch.items.length,
    })

  } catch (error) {
    console.error('Error sending test report:', error)
    return NextResponse.json(
      {
        error: 'Failed to send test report',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}