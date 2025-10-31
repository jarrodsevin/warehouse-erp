'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface SalesOrder {
  id: string;
  soNumber: string;
  orderDate: string;
  status: string;
  subtotal: number;
  total: number;
  notes: string | null;
  customer: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  };
  items: {
    id: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    product: {
      id: string;
      sku: string;
      name: string;
    };
  }[];
}

export default function SalesOrderDetailsPage() {
  const params = useParams();
  const [salesOrder, setSalesOrder] = useState<SalesOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSalesOrder();
  }, []);

  const fetchSalesOrder = async () => {
    try {
      const response = await fetch(`/api/sales-orders/${params.id}`);
      const data = await response.json();
      setSalesOrder(data);
    } catch (error) {
      console.error('Error fetching sales order:', error);
    } finally {
      setLoading(false);
    }
  };
  const exportToPDF = () => {
    if (!salesOrder) return;

    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('Sales Order', 14, 20);
    
    doc.setFontSize(12);
    doc.text(salesOrder.soNumber, 14, 28);
    
    doc.setFontSize(10);
    doc.text(`Date: ${new Date(salesOrder.orderDate).toLocaleDateString()}`, 14, 35);
    doc.text(`Status: ${salesOrder.status.toUpperCase()}`, 14, 41);
    
    // Customer Information
    doc.setFontSize(14);
    doc.text('Customer Information', 14, 52);
    doc.setFontSize(10);
    doc.text(salesOrder.customer.name, 14, 59);
    if (salesOrder.customer.email) doc.text(salesOrder.customer.email, 14, 65);
    if (salesOrder.customer.phone) doc.text(salesOrder.customer.phone, 14, 71);
    
    // Items Table
    const tableData = salesOrder.items.map(item => [
      item.product.name,
      item.product.sku,
      `$${item.unitPrice.toFixed(2)}`,
      item.quantity.toString(),
      `$${item.lineTotal.toFixed(2)}`
    ]);
    
    autoTable(doc, {
      startY: 80,
      head: [['Product', 'SKU', 'Price', 'Qty', 'Total']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 10 }
    });
    
    // @ts-ignore - autoTable adds finalY to doc
    const finalY = doc.lastAutoTable.finalY + 10;
    
    // Totals
    doc.setFontSize(12);
    doc.text(`Subtotal: $${salesOrder.subtotal.toFixed(2)}`, 140, finalY);
    doc.setFontSize(14);
    doc.text(`Total: $${salesOrder.total.toFixed(2)}`, 140, finalY + 8);
    
    // Notes
    if (salesOrder.notes) {
      doc.setFontSize(12);
      doc.text('Notes:', 14, finalY + 20);
      doc.setFontSize(10);
      const splitNotes = doc.splitTextToSize(salesOrder.notes, 180);
      doc.text(splitNotes, 14, finalY + 27);
    }
    
    // Save
    doc.save(`${salesOrder.soNumber}.pdf`);
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!salesOrder) {
    return <div className="p-8">Sales order not found</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{salesOrder.soNumber}</h1>
          <p className="text-gray-400 mt-1">
            {new Date(salesOrder.orderDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={exportToPDF}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Export to PDF
          </button>
          <Link
            href="/sales-orders"
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            Back to Sales Orders
          </Link>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-6">
        <span className={`px-3 py-1 text-sm rounded capitalize ${
          salesOrder.status === 'fulfilled' ? 'bg-green-500/20 text-green-400 border border-green-500' :
          'bg-red-500/20 text-red-400 border border-red-500'
        }`}>
          {salesOrder.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
            <div className="space-y-2">
              <div>
                <Link
                  href={`/customers/${salesOrder.customer.id}`}
                  className="text-lg font-medium text-blue-400 hover:text-blue-300"
                >
                  {salesOrder.customer.name}
                </Link>
              </div>
              {salesOrder.customer.email && (
                <div className="text-gray-300">{salesOrder.customer.email}</div>
              )}
              {salesOrder.customer.phone && (
                <div className="text-gray-300">{salesOrder.customer.phone}</div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Order Items</h2>
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">Product</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">SKU</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-400">Price</th>
                  <th className="px-4 py-2 text-center text-sm font-medium text-gray-400">Qty</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-400">Total</th>
                </tr>
              </thead>
              <tbody>
                {salesOrder.items.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}>
                    <td className="px-4 py-3">
                      <Link
                        href={`/products/view?search=${item.product.sku}`}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        {item.product.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{item.product.sku}</td>
                    <td className="px-4 py-3 text-right text-white">
                      ${item.unitPrice.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center text-white">{item.quantity}</td>
                    <td className="px-4 py-3 text-right font-medium text-white">
                      ${item.lineTotal.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Notes */}
          {salesOrder.notes && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Notes</h2>
              <p className="text-gray-300 whitespace-pre-wrap">{salesOrder.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-white font-medium">
                  ${salesOrder.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-gray-700 pt-3">
                <span className="text-white">Total</span>
                <span className="text-white">
                  ${salesOrder.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Order Details</h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-400">Order Number</span>
                <p className="text-white font-medium">{salesOrder.soNumber}</p>
              </div>
              <div>
                <span className="text-gray-400">Order Date</span>
                <p className="text-white">
                  {new Date(salesOrder.orderDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="text-gray-400">Status</span>
                <p className="text-white capitalize">{salesOrder.status}</p>
              </div>
              <div>
                <span className="text-gray-400">Total Items</span>
                <p className="text-white">{salesOrder.items.length}</p>
              </div>
              <div>
                <span className="text-gray-400">Total Units</span>
                <p className="text-white">
                  {salesOrder.items.reduce((sum, item) => sum + item.quantity, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}