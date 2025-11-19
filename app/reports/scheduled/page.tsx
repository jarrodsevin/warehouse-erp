'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import PageLayout from '@/app/components/PageLayout'

type ScheduledReport = {
  id: string
  name: string
  userName: string
  emailAddress: string
  status: string
  frequency: string
  scheduledDays: string | null
  scheduledTime: string
  lastSentAt: string | null
  nextScheduledAt: string | null
  itemCount: number
  createdAt: string
  updatedAt: string
}

export default function ScheduledReportsPage() {
  const [reports, setReports] = useState<ScheduledReport[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'draft'>('all')
  const [sendingTestId, setSendingTestId] = useState<string | null>(null)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/scheduled-reports')
      const data = await response.json()
      setReports(data)
    } catch (error) {
      console.error('Error fetching scheduled reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scheduled report?')) return

    try {
      const response = await fetch(`/api/scheduled-reports/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setReports(reports.filter(r => r.id !== id))
      } else {
        alert('Failed to delete report')
      }
    } catch (error) {
      console.error('Error deleting report:', error)
      alert('Failed to delete report')
    }
  }

  const handleSendTestNow = async (reportId: string, reportName: string, emailAddress: string) => {
    if (!confirm(`Send test email to ${emailAddress}?`)) return

    setSendingTestId(reportId)

    try {
      const response = await fetch('/api/scheduled-reports/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scheduledReportId: reportId,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        alert(`✅ Test report sent successfully to ${emailAddress}!\n\nThe email includes ${data.reportCount} report(s).`)
      } else {
        alert(`❌ Failed to send test report:\n${data.error}\n\n${data.details || ''}`)
      }
    } catch (error) {
      console.error('Error sending test report:', error)
      alert('❌ Failed to send test report. Please try again.')
    } finally {
      setSendingTestId(null)
    }
  }

  const filteredReports = reports.filter(report => {
    if (filter === 'all') return true
    return report.status === filter
  })

  const activeCount = reports.filter(r => r.status === 'active').length
  const draftCount = reports.filter(r => r.status === 'draft').length

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading scheduled reports...</div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      {/* Blue Header Section */}
      <div className="bg-blue-600 text-white py-12 px-8 -m-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4">
            <Link href="/reports" className="text-blue-100 hover:text-white font-medium">
              ← Back to Reports
            </Link>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Scheduled Reports
              </h1>
              <p className="text-blue-100">
                Manage automated report batches sent via email on a schedule
              </p>
            </div>
            <Link
              href="/reports/scheduled/new"
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
            >
              + Create New Schedule
            </Link>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({reports.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'active'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Active ({activeCount})
        </button>
        <button
          onClick={() => setFilter('draft')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'draft'
              ? 'bg-gray-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Draft ({draftCount})
        </button>
      </div>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-500 mb-4">
            {filter === 'all'
              ? 'No scheduled reports yet. Create your first one!'
              : `No ${filter} reports found.`}
          </p>
          <Link
            href="/reports/scheduled/new"
            className="inline-block px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
          >
            + Create New Schedule
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:border-blue-400 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {report.name}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        report.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {report.status === 'active' ? 'Active' : 'Draft'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Recipient</p>
                      <p className="text-sm font-medium text-gray-900">{report.userName}</p>
                      <p className="text-xs text-gray-600">{report.emailAddress}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Frequency</p>
                      <p className="text-sm font-medium text-gray-900 capitalize">{report.frequency}</p>
                      <p className="text-xs text-gray-600">at {report.scheduledTime}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Reports Included</p>
                      <p className="text-sm font-medium text-gray-900">{report.itemCount} report{report.itemCount !== 1 ? 's' : ''}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Last Sent</p>
                      <p className="text-sm font-medium text-gray-900">
                        {report.lastSentAt
                          ? new Date(report.lastSentAt).toLocaleDateString()
                          : 'Never'}
                      </p>
                    </div>
                  </div>

                  {report.scheduledDays && (
                    <div className="flex gap-2 mb-3">
                      <span className="text-xs text-gray-500">Days:</span>
                      {JSON.parse(report.scheduledDays).map((day: string) => (
                        <span
                          key={day}
                          className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                        >
                          {day}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => handleSendTestNow(report.id, report.name, report.emailAddress)}
                    disabled={sendingTestId === report.id}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center"
                  >
                    {sendingTestId === report.id ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Sending...
                      </>
                    ) : (
                      <>
                        📧 Send Test Now
                      </>
                    )}
                  </button>
                  <Link
                    href={`/reports/scheduled/${report.id}`}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium text-center"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(report.id)}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageLayout>
  )
}