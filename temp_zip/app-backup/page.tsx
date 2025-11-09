import Link from "next/link";
import PageLayout from "./components/PageLayout";

type Module = {
  name: string;
  description: string;
  href: string;
  category: string;
  icon: React.ReactNode;
};

const modules: Module[] = [
  {
    name: "Products",
    description: "Inventory and pricing management",
    href: "/products",
    category: "Core Operations",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    name: "Customers",
    description: "Customer relationship management",
    href: "/customers/options",
    category: "Sales",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m0-6a3 3 0 116 0 3 3 0 01-6 0z" />
      </svg>
    ),
  },
  {
    name: "Vendors",
    description: "Supplier information and terms",
    href: "/vendors",
    category: "Procurement",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 7h18M3 12h18M3 17h18" />
      </svg>
    ),
  },
  {
    name: "Purchase Orders",
    description: "Create, track, and receive POs",
    href: "/purchase-orders",
    category: "Procurement",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 17v-6h6v6m-7 4h8a2 2 0 002-2V7l-5-5H8a2 2 0 00-2 2v15a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    name: "Sales Orders",
    description: "Take orders and manage fulfillment",
    href: "/sales-orders",
    category: "Sales",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 3h18M3 7h18M5 11h14M7 15h10M9 19h6" />
      </svg>
    ),
  },
  {
    name: "Sales Visits",
    description: "Plan and log sales calls",
    href: "/sales-visits",
    category: "Sales",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 11c1.657 0 3-1.567 3-3.5S13.657 4 12 4 9 5.567 9 7.5 10.343 11 12 11zM19 21a7 7 0 10-14 0" />
      </svg>
    ),
  },
  {
    name: "Reports",
    description: "Profitability, inventory value, and more",
    href: "/reports",
    category: "Analytics",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M11 19V6m4 13V10m-8 9V14" />
      </svg>
    ),
  },
  {
    name: "Admin",
    description: "Categories, brands, and settings",
    href: "/admin",
    category: "System",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 8c-1.657 0-3 1.567-3 3.5S10.343 15 12 15s3-1.567 3-3.5S13.657 8 12 8zM4 12h16" />
      </svg>
    ),
  },
];

export default function DashboardPage() {
  return (
    <PageLayout
      title="Dashboard"
      subtitle="Quick access to core modules and recent activity"
      breadcrumbs={[]}
    >
      {/* Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {modules.map((m) => (
          <Link
            key={m.name}
            href={m.href}
            className="group block rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-base p-5 focus:outline-none focus:ring-2 focus:ring-primary-300"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary-50 text-primary-600">
                  {m.icon}
                </div>
                <div>
                  <div className="text-base font-semibold text-gray-900">{m.name}</div>
                  <div className="text-sm text-gray-600">{m.description}</div>
                </div>
              </div>
              <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
                {m.category}
              </span>
            </div>
            <div className="mt-4 text-sm font-medium text-primary-600 group-hover:translate-x-0.5 transition-transform">
              Open →
            </div>
          </Link>
        ))}
      </div>
    </PageLayout>
  );
}
