import PageLayout from '../components/PageLayout'
import Link from 'next/link'

const sections = [
  {
    title: 'Categories',
    description: 'Manage product categories',
    href: '/admin/categories',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    )
  },
  {
    title: 'Subcategories',
    description: 'Manage product subcategories',
    href: '/admin/subcategories',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    )
  },
  {
    title: 'Brands',
    description: 'Manage product brands',
    href: '/admin/brands',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    )
  },
]

export default function AdminMenu() {
  return (
    <PageLayout 
      title="Administration" 
      subtitle="System configuration and data management"
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Administration' }
      ]}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="group bg-white rounded-lg border border-gray-200 p-6 hover:border-primary-300 hover:shadow-md transition-all duration-200"
          >
            <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-gray-600 mb-4 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
              {section.icon}
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-700 transition-colors">
              {section.title}
            </h2>
            <p className="text-sm text-gray-600">
              {section.description}
            </p>
          </Link>
        ))}
      </div>
    </PageLayout>
  )
}
