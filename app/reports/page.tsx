'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Sidebar from '../components/Sidebar'

export default function ReportsMenu() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed on all screen sizes */}
      <div className={`
        fixed inset-y-0 left-0 z-50 md:z-10
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>
      
      <main className="flex-1 md:ml-64 w-full min-w-0">
        {/* Mobile Menu Button */}
        <div className="md:hidden fixed top-4 left-4 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="bg-white p-2 rounded-lg shadow-lg border border-gray-200"
            aria-label="Open menu"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Blue Gradient Header - Mobile Responsive */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 border-b border-blue-700">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-8 pt-16 md:pt-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Left: Title */}
              <div>
                <h1 className="text-2xl md:text-4xl font-bold text-white mb-1 tracking-tight">Reports</h1>
                <p className="text-blue-200 text-sm md:text-lg">Analytics & Insights</p>
                <p className="text-blue-300 text-xs md:text-sm mt-1">Choose a report to view analytics and profitability data</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <Link href="/reports/product-profitability">
                <div className="bg-white border-2 border-gray-200 rounded-lg p-6 md:p-8 hover:border-green-500 hover:shadow-lg transition-all cursor-pointer group h-full relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
                  <h2 className="text-lg md:text-xl font-semibold mb-3 text-gray-900 group-hover:text-green-700 transition-colors">
                     Product Profitability
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Compare individual products by profitability with multi-dimensional filtering
                  </p>
                </div>
              </Link>

              <Link href="/reports/category-analysis">
                <div className="bg-white border-2 border-gray-200 rounded-lg p-6 md:p-8 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer group h-full relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
                  <h2 className="text-lg md:text-xl font-semibold mb-3 text-gray-900 group-hover:text-blue-700 transition-colors">
                     Category Analysis
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Analyze profitability by product categories with subcategory and brand breakdowns
                  </p>
                </div>
              </Link>

              <Link href="/reports/subcategory-analysis">
                <div className="bg-white border-2 border-gray-200 rounded-lg p-6 md:p-8 hover:border-orange-500 hover:shadow-lg transition-all cursor-pointer group h-full relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-orange-500"></div>
                  <h2 className="text-lg md:text-xl font-semibold mb-3 text-gray-900 group-hover:text-orange-700 transition-colors">
                     Subcategory Analysis
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Deep dive into subcategory performance across categories and brands
                  </p>
                </div>
              </Link>

              <Link href="/reports/brand-analysis">
                <div className="bg-white border-2 border-gray-200 rounded-lg p-6 md:p-8 hover:border-purple-500 hover:shadow-lg transition-all cursor-pointer group h-full relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-purple-500"></div>
                  <h2 className="text-lg md:text-xl font-semibold mb-3 text-gray-900 group-hover:text-purple-700 transition-colors">
                     Brand Analysis
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Compare brand performance across categories and subcategories
                  </p>
                </div>
              </Link>

              <Link href="/reports/customer-sales">
                <div className="bg-white border-2 border-gray-200 rounded-lg p-6 md:p-8 hover:border-indigo-500 hover:shadow-lg transition-all cursor-pointer group h-full relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500"></div>
                  <h2 className="text-lg md:text-xl font-semibold mb-3 text-gray-900 group-hover:text-indigo-700 transition-colors">
                     Customer Sales Performance
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Analyze customer profitability and sales performance with time-based filtering
                  </p>
                </div>
              </Link>

              <Link href="/reports/discount-analysis">
                <div className="bg-white border-2 border-gray-200 rounded-lg p-6 md:p-8 hover:border-red-500 hover:shadow-lg transition-all cursor-pointer group h-full relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
                  <h2 className="text-lg md:text-xl font-semibold mb-3 text-gray-900 group-hover:text-red-700 transition-colors">
                     Discount & Pricing Analysis
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Compare potential profit at retail vs actual profit with discounts applied
                  </p>
                </div>
              </Link>

              <Link href="/reports/scheduled">
                <div className="bg-white border-2 border-gray-200 rounded-lg p-6 md:p-8 hover:border-cyan-500 hover:shadow-lg transition-all cursor-pointer group h-full relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500"></div>
                  <h2 className="text-lg md:text-xl font-semibold mb-3 text-gray-900 group-hover:text-cyan-700 transition-colors">
                    📧 Scheduled Reports
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Manage automated report batches sent via email on a daily schedule
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}