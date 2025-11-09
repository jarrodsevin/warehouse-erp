// app/customers/page.tsx
import Link from "next/link";

/* Inline icons so we don't depend on any external icon libs */
function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M16 14c2.761 0 5 2.239 5 5v1H3v-1c0-2.761 2.239-5 5-5h8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PencilIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="m14.5 6.5 3 3M4 20l4.5-1.5L19 8.5a2.121 2.121 0 0 0-3-3L5.5 15.5 4 20Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function CustomersPage() {
  return (
    <main className="space-y-6">
      {/*
        NOTE: Do not render any big hero/centered headline here.
        PageLayout provides the header so this page should just
        render the 3 action cards exactly like /products.
      */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* View Customers */}
        <Link
          href="/customers/options"
          className="block rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition"
        >
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center">
              <UsersIcon className="h-6 w-6 text-gray-700" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                View Customers
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Browse and search customer database
              </p>
            </div>
          </div>
        </Link>

        {/* Add Customer */}
        <Link
          href="/customers/add"
          className="block rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition"
        >
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center">
              <PlusIcon className="h-6 w-6 text-gray-700" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Add Customer
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Create a new customer account
              </p>
            </div>
          </div>
        </Link>

        {/* Edit Customer */}
        <Link
          href="/customers/options"
          className="block rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition"
        >
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center">
              <PencilIcon className="h-6 w-6 text-gray-700" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Edit Customer
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Update existing customer details
              </p>
            </div>
          </div>
        </Link>
      </section>
    </main>
  );
}
