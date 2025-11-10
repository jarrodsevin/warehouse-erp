'use client'

import Link from 'next/link'
import { useState } from 'react'

type Product = {
  id: string
  name: string
  sku: string
  cost: number
  retailPrice: number
}

function ProductCard({ product }: { product: Product }) {
  const [showFinancials, setShowFinancials] = useState(false)

  const calculateMarkup = (cost: number, retail: number) => {
    return ((retail - cost) / cost * 100).toFixed(2)
  }

  const calculateMargin = (cost: number, retail: number) => {
    return ((retail - cost) / retail * 100).toFixed(2)
  }

  const calculateProfit = (cost: number, retail: number) => {
    return (retail - cost).toFixed(2)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 h-full flex flex-col shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xl font-semibold text-gray-900">{product.name}</h3>
        <button
          onClick={() => setShowFinancials(!showFinancials)}
          className="text-gray-500 hover:text-green-600 transition-colors text-xs"
          title={showFinancials ? 'Hide financials' : 'Show financials'}
        >
          {showFinancials ? '👁️' : '💰'}
        </button>
      </div>
      
      <p className="text-gray-600 text-sm mb-1">SKU: {product.sku}</p>
      <p className="text-gray-600 text-sm mb-1">Cost: ${product.cost.toFixed(2)}</p>
      <p className="text-gray-600 text-sm mb-2">Retail: ${product.retailPrice.toFixed(2)}</p>
      
      {showFinancials && (
        <div className="bg-gray-50 rounded p-2 mb-3 border border-gray-200 text-xs">
          <p className="text-green-600 mb-0.5">
            Markup: {calculateMarkup(product.cost, product.retailPrice)}%
          </p>
          <p className="text-green-600 mb-0.5">
            Margin: {calculateMargin(product.cost, product.retailPrice)}%
          </p>
          <p className="text-green-600 font-semibold">
            Profit: ${calculateProfit(product.cost, product.retailPrice)}
          </p>
        </div>
      )}
      
      <div className="flex-grow"></div>
      
      <Link 
        href={`/products/${product.id}`}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center mt-2"
      >
        Edit
      </Link>
    </div>
  )
}

export default function ProductUpdateClient({ products }: { products: Product[] }) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredProducts = products.filter((product) => {
    const query = searchQuery.toLowerCase()
    return (
      product.name.toLowerCase().includes(query) ||
      product.sku.toLowerCase().includes(query) ||
      product.cost.toString().includes(query) ||
      product.retailPrice.toString().includes(query)
    )
  })

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/products" className="text-gray-900 hover:text-gray-700 font-medium">
            ← Back to Products Menu
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-4 text-center text-gray-900">
          Update Products
        </h1>

        <p className="text-center text-gray-600 mb-8">Select a product to edit</p>

        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, SKU, cost, or price..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-10 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <p className="text-sm text-gray-500 mt-2 text-center">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filteredProducts.length === 0 && searchQuery && (
          <p className="text-center text-gray-500 mt-8">No products match your search.</p>
        )}

        {products.length === 0 && (
          <p className="text-center text-gray-500 mt-8">No products found. Create one first!</p>
        )}
      </div>
    </div>
  )
}