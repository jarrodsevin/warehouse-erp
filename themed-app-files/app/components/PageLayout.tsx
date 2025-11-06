import Sidebar from './Sidebar'
import Link from 'next/link'

interface Breadcrumb {
  label: string
  href?: string
}

interface PageLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  breadcrumbs?: Breadcrumb[]
  actions?: React.ReactNode
}

export default function PageLayout({ 
  children, 
  title, 
  subtitle, 
  breadcrumbs,
  actions 
}: PageLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 ml-64">
        {/* Header Section */}
        {(title || subtitle || breadcrumbs) && (
          <div className="bg-white border-b border-gray-200">
            <div className="px-8 py-6">
              {/* Breadcrumbs */}
              {breadcrumbs && breadcrumbs.length > 0 && (
                <nav className="flex mb-3" aria-label="Breadcrumb">
                  <ol className="flex items-center space-x-2 text-sm">
                    {breadcrumbs.map((crumb, index) => (
                      <li key={index} className="flex items-center">
                        {index > 0 && (
                          <svg className="w-4 h-4 text-gray-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        {crumb.href ? (
                          <Link 
                            href={crumb.href}
                            className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                          >
                            {crumb.label}
                          </Link>
                        ) : (
                          <span className="text-gray-900 font-medium">{crumb.label}</span>
                        )}
                      </li>
                    ))}
                  </ol>
                </nav>
              )}

              {/* Title and Actions */}
              <div className="flex items-start justify-between">
                <div>
                  {title && (
                    <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
                      {title}
                    </h1>
                  )}
                  {subtitle && (
                    <p className="text-gray-600 mt-1">
                      {subtitle}
                    </p>
                  )}
                </div>
                {actions && (
                  <div className="flex items-center space-x-3">
                    {actions}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Content Area */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
