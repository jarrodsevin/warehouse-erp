import PageLayout from '../components/PageLayout'
import Link from 'next/link'

const actions = [
  {
    title: 'View All Visits',
    description: 'Browse complete visit history',
    href: '/sales-visits/view',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  },
]

export default function SalesVisitsMenu() {
  return (
    <PageLayout 
      title="Sales Visits" 
      subtitle="Track field operations and customer interactions"
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Sales Visits' }
      ]}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group bg-white rounded-lg border border-gray-200 p-6 hover:border-primary-300 hover:shadow-md transition-all duration-200"
          >
            <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-gray-600 mb-4 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
              {action.icon}
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-700 transition-colors">
              {action.title}
            </h2>
            <p className="text-sm text-gray-600">
              {action.description}
            </p>
          </Link>
        ))}
      </div>
    </PageLayout>
  )
}
