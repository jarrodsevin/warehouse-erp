'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type DashboardStats = {
  inventoryValue: number
  ytdRevenue: number
  recentOrdersCount: number
  salesToBudget: number
  bestSeller: string
  topBrand: string
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/dashboard')
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header with Gradient - Mobile Responsive */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 border-b border-blue-700">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Left: Branding */}
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-1 tracking-tight">ApexFlow</h1>
              <p className="text-blue-200 text-sm md:text-lg">Enterprise Resource Planning System</p>
              <p className="text-blue-300 text-xs md:text-sm mt-1">Warehouse & Inventory Management</p>
            </div>

            {/* Right: Top Performers */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              {loading ? (
                <div className="text-blue-200 text-sm">Loading...</div>
              ) : (
                <>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 md:px-5 md:py-3 border border-white/20">
                    <div className="text-blue-200 text-xs mb-1">🏆 Best Seller This Month</div>
                    <div className="text-white text-sm md:text-base font-semibold truncate">
                      {stats?.bestSeller}
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 md:px-5 md:py-3 border border-white/20">
                    <div className="text-blue-200 text-xs mb-1">⭐ Top Brand This Month</div>
                    <div className="text-white text-sm md:text-base font-semibold truncate">
                      {stats?.topBrand}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* KPI Cards */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Dashboard Overview</h2>
          
          {loading ? (
            <div className="text-gray-500">Loading metrics...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {/* Inventory Value - Blue accent */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>
                <div className="text-sm text-gray-600 mb-1">Inventory Value</div>
                <div className="text-xl md:text-2xl font-semibold text-blue-700">
                  ${stats?.inventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-gray-500 mt-1">Current on-hand value</div>
              </div>

              {/* YTD Revenue - Orange/Gold accent */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500"></div>
                <div className="text-sm text-gray-600 mb-1">YTD Sales Revenue</div>
                <div className="text-xl md:text-2xl font-semibold text-orange-600">
                  ${stats?.ytdRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-gray-500 mt-1">Year to date</div>
              </div>

              {/* Recent Orders - Teal accent */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-600"></div>
                <div className="text-sm text-gray-600 mb-1">Recent Sales Orders</div>
                <div className="text-xl md:text-2xl font-semibold text-teal-700">
                  {stats?.recentOrdersCount}
                </div>
                <div className="text-xs text-gray-500 mt-1">Last 30 days</div>
              </div>

              {/* Sales to Budget - Amber accent */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>
                <div className="text-sm text-gray-600 mb-1">Sales to Budget</div>
                <div className="text-xl md:text-2xl font-semibold text-gray-400">
                  Coming Soon
                </div>
                <div className="text-xs text-gray-500 mt-1">Budget feature pending</div>
              </div>
            </div>
          )}
        </div>

        {/* Module Navigation */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Modules</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <Link href="/products">
              <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group">
                <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-700 transition-colors mb-2">
                  Products
                </h3>
                <p className="text-sm text-gray-600">
                  Manage inventory and pricing
                </p>
              </div>
            </Link>

            <Link href="/customers/options">
              <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group">
                <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-700 transition-colors mb-2">
                  Customers
                </h3>
                <p className="text-sm text-gray-600">
                  Manage customer accounts
                </p>
              </div>
            </Link>

            <Link href="/vendors">
              <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group">
                <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-700 transition-colors mb-2">
                  Vendors
                </h3>
                <p className="text-sm text-gray-600">
                  Manage vendor contacts
                </p>
              </div>
            </Link>

            <Link href="/purchase-orders">
              <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group">
                <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-700 transition-colors mb-2">
                  Purchase Orders
                </h3>
                <p className="text-sm text-gray-600">
                  Track purchase orders
                </p>
              </div>
            </Link>

            <Link href="/sales-orders">
              <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group">
                <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-700 transition-colors mb-2">
                  Sales Orders
                </h3>
                <p className="text-sm text-gray-600">
                  Manage sales orders
                </p>
              </div>
            </Link>

            <Link href="/sales-visits">
              <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group">
                <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-700 transition-colors mb-2">
                  Sales Visits
                </h3>
                <p className="text-sm text-gray-600">
                  Record customer visits
                </p>
              </div>
            </Link>

            <Link href="/reports">
              <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group">
                <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-700 transition-colors mb-2">
                  Reports
                </h3>
                <p className="text-sm text-gray-600">
                  View analytics and reports
                </p>
              </div>
            </Link>

            <Link href="/admin">
              <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group">
                <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-700 transition-colors mb-2">
                  Admin
                </h3>
                <p className="text-sm text-gray-600">
                  System settings
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}