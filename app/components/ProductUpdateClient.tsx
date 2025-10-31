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
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 h-full flex flex-col">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xl font-semibold text-blue-400">{product.name}</h3>
        <button
          onClick={() => setShowFinancials(!showFinancials)}
          className="text-gray-400 hover:text-green-400 transition-colors text-xs"
          title={showFinancials ? 'Hide financials' : 'Show financials'}
        >
          {showFinancials ? '👁️' : '💰'}
        </button>
      </div>
      
      <p className="text-gray-400 text-sm mb-1">SKU: {product.sku}</p>
      <p className="text-gray-400 text-sm mb-1">Cost: ${product.cost.toFixed(2)}</p>
      <p className="text-gray-400 text-sm mb-2">Retail: ${product.retailPrice.toFixed(2)}</p>
      
      {showFinancials && (
        <div className="bg-gray-900/50 rounded p-2 mb-3 border border-gray-600 text-xs">
          <p className="text-green-400 mb-0.5">
            Markup: {calculateMarkup(product.cost, product.retailPrice)}%
          </p>
          <p className="text-green-400 mb-0.5">
            Margin: {calculateMargin(product.cost, product.retailPrice)}%
          </p>
          <p className="text-green-400 font-semibold">
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
  return (
    <div className="min-h-screen py-16 px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/products" className="text-blue-400 hover:text-blue-300">
            ← Back to Products Menu
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-4 text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Update Products
        </h1>

        <p className="text-center text-gray-400 mb-12">Select a product to edit</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {products.length === 0 && (
          <p className="text-center text-gray-400 mt-8">No products found. Create one first!</p>
        )}
      </div>
    </div>
  )
}