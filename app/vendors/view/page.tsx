import { prisma } from '@/lib/prisma'
import PageLayout from '@/app/components/PageLayout'
import Link from 'next/link'

export const dynamic = 'force-dynamic';

export default async function ViewVendorsPage() {
  const vendors = await prisma.vendor.findMany({
    orderBy: { name: 'asc' }
  })

  return (
    <PageLayout
      title="Vendors"
      subtitle="Browse and manage your supplier directory"
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Vendors', href: '/vendors' },
        { label: 'View All' }
      ]}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendors.map((vendor) => (
          <Link
            key={vendor.id}
            href={`/vendors/${vendor.id}`}
            className="group bg-white border border-gray-200 rounded-lg p-6 hover:border-primary-300 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">
                {vendor.name}
              </h3>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            
            <div className="space-y-2 text-sm">
              {vendor.contactName && (
                <p className="text-gray-600">
                  <span className="font-medium text-gray-900">Contact:</span> {vendor.contactName}
                </p>
              )}
              {vendor.email && (
                <p className="text-gray-600">
                  <span className="font-medium text-gray-900">Email:</span> {vendor.email}
                </p>
              )}
              {vendor.phone && (
                <p className="text-gray-600">
                  <span className="font-medium text-gray-900">Phone:</span> {vendor.phone}
                </p>
              )}
              {vendor.terms && (
  <p className="text-gray-600">
    <span className="font-medium text-gray-900">Terms:</span> {vendor.terms}
  </p>
)}
            </div>
          </Link>
        ))}
      </div>

      {vendors.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No vendors found</p>
          <Link
            href="/vendors/create"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Create Your First Vendor
          </Link>
        </div>
      )}
    </PageLayout>
  )
}