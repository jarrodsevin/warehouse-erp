'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Sidebar from '../components/Sidebar'

export default function ProductsMenu() {
  const [productCount, setProductCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProductCount() {
      try {
        const response = await fetch('/api/products')
        const data = await response.json()
        if (Array.isArray(data)) {
          setProductCount(data.length)
        }
      } catch (error) {
        console.error('Error fetching product count:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProductCount()
  }, [])

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 ml-64">
        {/* Blue Gradient Header - Same as Dashboard */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 border-b border-blue-700">
          <div className="px-8 py-8">
            <div className="flex items-center justify-between">
              {/* Left: Title */}
              <div>
                <h1 className="text-4xl font-bold text-white mb-1 tracking-tight">Products</h1>
                <p className="text-blue-200 text-lg">Product Management</p>
                <p className="text-blue-300 text-sm mt-1">Choose an action to manage your catalog</p>
              </div>

              {/* Right: Total Products Stat */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-5 py-3 border border-white/20 min-w-[180px]">
                <div className="text-blue-200 text-xs mb-1">Total Products</div>
                <div className="text-white text-2xl font-semibold">
                  {loading ? '...' : productCount}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/products/create">
                <div className="bg-white border-2 border-gray-200 rounded-lg p-8 hover:border-green-500 hover:shadow-lg transition-all cursor-pointer group h-full relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
                  <h2 className="text-xl font-semibold mb-3 text-gray-900 group-hover:text-green-700 transition-colors">
                    Create New Product
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Add a new product to your catalog with pricing, categories, and details
                  </p>
                </div>
              </Link>

              <Link href="/products/update">
                <div className="bg-white border-2 border-gray-200 rounded-lg p-8 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer group h-full relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
                  <h2 className="text-xl font-semibold mb-3 text-gray-900 group-hover:text-blue-700 transition-colors">
                    Update Product
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Edit existing product information, pricing, and inventory details
                  </p>
                </div>
              </Link>

              <Link href="/products/view">
                <div className="bg-white border-2 border-gray-200 rounded-lg p-8 hover:border-purple-500 hover:shadow-lg transition-all cursor-pointer group h-full relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-purple-500"></div>
                  <h2 className="text-xl font-semibold mb-3 text-gray-900 group-hover:text-purple-700 transition-colors">
                    View Products
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Browse and search your complete product catalog with detailed information
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