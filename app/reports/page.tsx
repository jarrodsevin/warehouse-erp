import Link from 'next/link'

export default function ReportsMenu() {
  return (
    <div className="min-h-screen py-16 px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-400 hover:text-blue-300">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="text-center mb-20">
          <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Reports Menu
          </h1>
          
          <p className="text-xl text-gray-400">Choose a report to view analytics</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link href="/reports/product-profitability" className="group">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-10 hover:scale-105 transition-transform cursor-pointer h-full">
              <h2 className="text-2xl font-semibold mb-4 text-green-400 group-hover:text-green-300">
                📊 Product Profitability
              </h2>
              <p className="text-gray-400">
                Compare individual products by profitability with multi-dimensional filtering
              </p>
            </div>
          </Link>

          <Link href="/reports/category-analysis" className="group">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-10 hover:scale-105 transition-transform cursor-pointer h-full">
              <h2 className="text-2xl font-semibold mb-4 text-blue-400 group-hover:text-blue-300">
                📁 Category Analysis
              </h2>
              <p className="text-gray-400">
                Analyze profitability by product categories with subcategory and brand breakdowns
              </p>
            </div>
          </Link>

          <Link href="/reports/subcategory-analysis" className="group">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-10 hover:scale-105 transition-transform cursor-pointer h-full">
              <h2 className="text-2xl font-semibold mb-4 text-orange-400 group-hover:text-orange-300">
                🏷️ Subcategory Analysis
              </h2>
              <p className="text-gray-400">
                Deep dive into subcategory performance across categories and brands
              </p>
            </div>
          </Link>

          <Link href="/reports/brand-analysis" className="group">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-10 hover:scale-105 transition-transform cursor-pointer h-full">
              <h2 className="text-2xl font-semibold mb-4 text-purple-400 group-hover:text-purple-300">
                🏢 Brand Analysis
              </h2>
              <p className="text-gray-400">
                Compare brand performance across categories and subcategories
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}