'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import PageLayout from '@/app/components/PageLayout'
import { TIMEZONES } from '@/lib/timezones'

type Category = { id: string; name: string }
type Subcategory = { id: string; name: string }
type Brand = { id: string; name: string }

type ReportType = 
  | 'product-profitability'
  | 'category-analysis'
  | 'subcategory-analysis'
  | 'brand-analysis'
  | 'customer-sales'
  | 'discount-pricing'

type ReportItem = {
  id: string
  reportType: ReportType
  filterConfig: any
}

type FormData = {
  name: string
  userName: string
  emailAddress: string
  status: 'draft' | 'active'
  frequency: 'daily' | 'weekly' | 'monthly'
  scheduledDays: string[]
  scheduledTime: string
  timezone: string
  items: ReportItem[]
}

const REPORT_TYPES = [
  { value: 'product-profitability', label: 'Product Profitability Report' },
  { value: 'category-analysis', label: 'Category Analysis Report' },
  { value: 'subcategory-analysis', label: 'Subcategory Analysis Report' },
  { value: 'brand-analysis', label: 'Brand Analysis Report' },
  { value: 'customer-sales', label: 'Customer Sales Performance Report' },
  { value: 'discount-pricing', label: 'Discount & Pricing Analysis Report' },
]

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const CUSTOMER_SALES_PERIODS = [
  { value: '30', label: 'Last 30 Days' },
  { value: '60', label: 'Last 60 Days' },
  { value: '90', label: 'Last 90 Days' },
  { value: 'ytd', label: 'Year to Date' },
  { value: 'this-year', label: 'This Year' },
  { value: 'last-year', label: 'Last Year' },
]

const SORT_OPTIONS = [
  { value: 'profit', label: 'Profit per Unit' },
  { value: 'margin', label: 'Margin %' },
  { value: 'markup', label: 'Markup %' },
]

export default function ScheduledReportForm() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const isEdit = id !== 'new'

  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    userName: '',
    emailAddress: '',
    status: 'draft',
    frequency: 'weekly',
    scheduledDays: [],
    scheduledTime: '09:00',
    timezone: 'America/Chicago',
    items: [],
  })

  useEffect(() => {
    fetchFilterOptions()
    if (isEdit) {
      fetchReport()
    }
  }, [])

  const fetchFilterOptions = async () => {
    try {
      const response = await fetch('/api/products')
      const data = await response.json()
      const products = Array.isArray(data) ? data : []

      const uniqueCategories = Array.from(
        new Map(products.map((p: any) => [p.category.id, p.category])).values()
      ) as Category[]
      
      const uniqueSubcategories = Array.from(
        new Map(
          products
            .filter((p: any) => p.subcategory)
            .map((p: any) => [p.subcategory.id, p.subcategory])
        ).values()
      ) as Subcategory[]
      
      const uniqueBrands = Array.from(
        new Map(
          products
            .filter((p: any) => p.brand)
            .map((p: any) => [p.brand.id, p.brand])
        ).values()
      ) as Brand[]

      setCategories(uniqueCategories)
      setSubcategories(uniqueSubcategories)
      setBrands(uniqueBrands)
    } catch (error) {
      console.error('Error fetching filter options:', error)
    }
  }

  const fetchReport = async () => {
    try {
      const response = await fetch(`/api/scheduled-reports/${id}`)
      const data = await response.json()
      
      // Check if we got an error
      if (data.error) {
        console.error('API Error:', data.error)
        throw new Error(data.error)
      }
      
      setFormData({
        name: data.name,
        userName: data.userName,
        emailAddress: data.emailAddress,
        status: data.status,
        frequency: data.frequency,
        scheduledDays: data.scheduledDays || [],
        scheduledTime: data.scheduledTime,
        timezone: data.timezone || 'America/Chicago',
        items: (data.items || []).map((item: any) => ({
          id: item.id,
          reportType: item.reportType,
          filterConfig: item.filterConfig || {},
        })),
      })
    } catch (error) {
      console.error('Error fetching report:', error)
      alert('Failed to load report. Check console for details.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.userName || !formData.emailAddress) {
      alert('Please fill in all required fields')
      return
    }

    if (formData.items.length === 0) {
      alert('Please add at least one report to the batch')
      return
    }

    if (formData.frequency === 'weekly' && formData.scheduledDays.length === 0) {
      alert('Please select at least one day for weekly schedule')
      return
    }

    setSaving(true)

    try {
      const url = isEdit
        ? `/api/scheduled-reports/${id}`
        : '/api/scheduled-reports'
      
      const method = isEdit ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push('/reports/scheduled')
      } else {
        alert('Failed to save scheduled report')
      }
    } catch (error) {
      console.error('Error saving report:', error)
      alert('Failed to save scheduled report')
    } finally {
      setSaving(false)
    }
  }

  const handleSendTest = async () => {
    if (!confirm(`Send test report to ${formData.emailAddress}?`)) {
      return
    }

    setSaving(true)

    try {
      // First save the current state
      const saveResponse = await fetch(`/api/scheduled-reports/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!saveResponse.ok) {
        alert('Failed to save changes before sending test')
        return
      }

      // Trigger the test send
      const testResponse = await fetch('/api/scheduled-reports/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledReportId: id }),
      })

      const data = await testResponse.json()

      if (testResponse.ok) {
        alert(`✅ Test report sent successfully to ${formData.emailAddress}!\n\nThe email includes ${data.reportCount} report(s).`)
      } else {
        alert(`❌ Failed to send test report:\n${data.error}\n\n${data.details || ''}`)
      }
    } catch (error) {
      console.error('Error sending test:', error)
      alert('Failed to send test report')
    } finally {
      setSaving(false)
    }
  }

  const addReportItem = () => {
    const newItem: ReportItem = {
      id: `temp-${Date.now()}`,
      reportType: 'product-profitability',
      filterConfig: {
        categories: [],
        subcategories: [],
        brands: [],
        sortBy: 'profit',
      },
    }
    setFormData({
      ...formData,
      items: [...formData.items, newItem],
    })
  }

  const removeReportItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    })
  }

  const updateReportItem = (index: number, updates: Partial<ReportItem>) => {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], ...updates }
    setFormData({ ...formData, items: newItems })
  }

  const updateFilterConfig = (index: number, key: string, value: any) => {
    const newItems = [...formData.items]
    newItems[index].filterConfig = {
      ...newItems[index].filterConfig,
      [key]: value,
    }
    setFormData({ ...formData, items: newItems })
  }

  const toggleFilter = (index: number, filterType: string, id: string) => {
    const item = formData.items[index]
    const currentFilters = item.filterConfig[filterType] || []
    const newFilters = currentFilters.includes(id)
      ? currentFilters.filter((f: string) => f !== id)
      : [...currentFilters, id]
    
    updateFilterConfig(index, filterType, newFilters)
  }

  const moveReportItem = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === formData.items.length - 1)
    ) {
      return
    }

    const newItems = [...formData.items]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    ;[newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]]
    setFormData({ ...formData, items: newItems })
  }

  const toggleDay = (day: string) => {
    setFormData({
      ...formData,
      scheduledDays: formData.scheduledDays.includes(day)
        ? formData.scheduledDays.filter(d => d !== day)
        : [...formData.scheduledDays, day],
    })
  }

  const renderFilterConfig = (item: ReportItem, index: number) => {
    switch (item.reportType) {
      case 'product-profitability':
        return (
          <div className="space-y-4">
            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categories {item.filterConfig.categories?.length > 0 && (
                  <span className="text-blue-600">({item.filterConfig.categories.length} selected)</span>
                )}
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleFilter(index, 'categories', cat.id)}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      item.filterConfig.categories?.includes(cat.id)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Subcategories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subcategories {item.filterConfig.subcategories?.length > 0 && (
                  <span className="text-orange-600">({item.filterConfig.subcategories.length} selected)</span>
                )}
              </label>
              <div className="flex flex-wrap gap-2">
                {subcategories.map(sub => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => toggleFilter(index, 'subcategories', sub.id)}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      item.filterConfig.subcategories?.includes(sub.id)
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {sub.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Brands */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brands {item.filterConfig.brands?.length > 0 && (
                  <span className="text-purple-600">({item.filterConfig.brands.length} selected)</span>
                )}
              </label>
              <div className="flex flex-wrap gap-2">
                {brands.map(brand => (
                  <button
                    key={brand.id}
                    type="button"
                    onClick={() => toggleFilter(index, 'brands', brand.id)}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      item.filterConfig.brands?.includes(brand.id)
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {brand.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={item.filterConfig.sortBy || 'profit'}
                onChange={(e) => updateFilterConfig(index, 'sortBy', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        )

      case 'customer-sales':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Period
            </label>
            <select
              value={item.filterConfig.period || '30'}
              onChange={(e) => updateFilterConfig(index, 'period', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CUSTOMER_SALES_PERIODS.map(period => (
                <option key={period.value} value={period.value}>{period.label}</option>
              ))}
            </select>
          </div>
        )

      case 'discount-pricing':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              View Mode
            </label>
            <select
              value={item.filterConfig.viewMode || 'products'}
              onChange={(e) => updateFilterConfig(index, 'viewMode', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="products">Products View</option>
              <option value="customers">Customers View</option>
            </select>
          </div>
        )

      default:
        return (
          <div className="text-sm text-gray-600">
            No additional filters needed for this report type
          </div>
        )
    }
  }

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      {/* Blue Header */}
      <div className="bg-blue-600 text-white py-12 px-8 -m-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4">
            <Link href="/reports/scheduled" className="text-blue-100 hover:text-white font-medium">
              ← Back to Scheduled Reports
            </Link>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {isEdit ? 'Edit Scheduled Report' : 'Create Scheduled Report'}
          </h1>
          <p className="text-blue-100">
            Configure automated report batches to be emailed on a schedule
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Schedule Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Weekly Executive Summary"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'active' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Draft (not sending)</option>
                <option value="active">Active (will send on schedule)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipient Name *
              </label>
              <input
                type="text"
                value={formData.userName}
                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                placeholder="John Smith"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.emailAddress}
                onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
                placeholder="john@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Schedule Configuration */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Schedule Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frequency *
              </label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  frequency: e.target.value as 'daily' | 'weekly' | 'monthly',
                  scheduledDays: e.target.value === 'daily' || e.target.value === 'monthly' ? [] : formData.scheduledDays
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly (1st of month)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time *
              </label>
              <input
                type="time"
                value={formData.scheduledTime}
                onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timezone *
              </label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {TIMEZONES.map(tz => (
                  <option key={tz.value} value={tz.value}>{tz.label}</option>
                ))}
              </select>
            </div>
          </div>

          {formData.frequency === 'weekly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Days of Week *
              </label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      formData.scheduledDays.includes(day)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Report Items */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Reports in Batch</h2>
            <button
              type="button"
              onClick={addReportItem}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
            >
              + Add Report
            </button>
          </div>

          {formData.items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No reports added yet. Click "+ Add Report" to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold text-gray-700">#{index + 1}</span>
                      <select
                        value={item.reportType}
                        onChange={(e) => updateReportItem(index, { 
                          reportType: e.target.value as ReportType,
                          filterConfig: e.target.value === 'product-profitability' 
                            ? { categories: [], subcategories: [], brands: [], sortBy: 'profit' }
                            : e.target.value === 'customer-sales'
                            ? { period: '30' }
                            : e.target.value === 'discount-pricing'
                            ? { viewMode: 'products' }
                            : {}
                        })}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {REPORT_TYPES.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => moveReportItem(index, 'up')}
                        disabled={index === 0}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveReportItem(index, 'down')}
                        disabled={index === formData.items.length - 1}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => removeReportItem(index)}
                        className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="pl-10 bg-gray-50 rounded p-4">
                    {renderFilterConfig(item, index)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : (isEdit ? 'Update Schedule' : 'Create Schedule')}
          </button>
          
          {isEdit && (
            <button
              type="button"
              onClick={handleSendTest}
              disabled={saving}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              📧 Send Test Now
            </button>
          )}
          
          <Link
            href="/reports/scheduled"
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors font-medium"
          >
            Cancel
          </Link>
        </div>
      </form>
    </PageLayout>
  )
}