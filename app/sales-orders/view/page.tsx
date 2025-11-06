'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PageLayout from '@/app/components/PageLayout'

export default function ViewSalesOrdersPage() {
  const [salesOrders, setSalesOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/sales-orders')
      .then(res => res.json())
      .then(data => {
        setSalesOrders(data)
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <PageLayout
      title="Sales Orders"
      subtitle="View all customer orders"
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Sales Orders', href: '/sales-orders' },
        { label: 'View All' }
      ]}
    >
      <div className="bg-white rounded-lg border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {salesOrders.map((order: any) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link href={`/sales-orders/${order.id}`} className="text-primary-600 hover:text-primary-700 font-medium">
                    {order.soNumber}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {new Date(order.orderDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{order.customer?.name}</td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right">${order.total?.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded capitalize ${
                    order.status === 'fulfilled' ? 'bg-success-light text-success-dark' : 'bg-warning-light text-warning-dark'
                  }`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageLayout>
  )
}