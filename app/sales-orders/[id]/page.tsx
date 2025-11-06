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
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    fetchSalesOrder();
  }, []);

  useEffect(() => {
    if (salesOrder) {
      setEmailSubject(`Sales Order ${salesOrder.soNumber}`);
      if (salesOrder.customer?.email) {
        setEmailAddress(salesOrder.customer.email);
      }
    }
  }, [salesOrder]);

  const fetchSalesOrder = async () => {
    try {
      const response = await fetch(`/api/sales-orders/${params.id}`);
      const data = await response.json();
      console.log('Sales Order Data:', data);
      setSalesOrder(data);
    } catch (error) {
      console.error('Error fetching sales order:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePDFContent = () => {
    if (!salesOrder) return null;
    
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
    
    return doc;
  };

  const exportToPDF = () => {
    const doc = generatePDFContent();
    if (doc && salesOrder) {
      doc.save(`${salesOrder.soNumber}.pdf`);
    }
  };

  const sendEmail = async () => {
    if (!salesOrder || !emailAddress) return;
    
    setSendingEmail(true);
    setEmailStatus('idle');
    
    try {
      const doc = generatePDFContent();
      if (!doc) throw new Error('Could not generate PDF');
      
      // Convert PDF to base64
      const pdfBase64 = doc.output('datauristring').split(',')[1];
      
      // Create HTML email body
      const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Sales Order ${salesOrder.soNumber}</h2>
          <p>Please find attached the sales order details.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Order Summary</h3>
            <p><strong>Order Number:</strong> ${salesOrder.soNumber}</p>
            <p><strong>Date:</strong> ${new Date(salesOrder.orderDate).toLocaleDateString()}</p>
            <p><strong>Customer:</strong> ${salesOrder.customer.name}</p>
            <p><strong>Total:</strong> $${salesOrder.total.toFixed(2)}</p>
            <p><strong>Status:</strong> ${salesOrder.status}</p>
          </div>
          
          ${salesOrder.notes ? `
          <div style="margin-top: 20px;">
            <h3>Notes</h3>
            <p>${salesOrder.notes}</p>
          </div>
          ` : ''}
          
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            This is an automated message from Warehouse ERP System.
          </p>
        </div>
      `;
      
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: emailAddress,
          subject: emailSubject,
          html: htmlBody,
          attachments: [
            {
              filename: `${salesOrder.soNumber}.pdf`,
              content: pdfBase64
            }
          ]
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setEmailStatus('success');
        setTimeout(() => {
          setShowEmailModal(false);
          setEmailStatus('idle');
        }, 2000);
      } else {
        setEmailStatus('error');
        console.error('Email error:', result.error);
      }
    } catch (error) {
      setEmailStatus('error');
      console.error('Error sending email:', error);
    } finally {
      setSendingEmail(false);
    }
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
          <p className="text-gray-600 mt-1">
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
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Export to PDF
          </button>
          <button
            onClick={() => setShowEmailModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Email PDF
          </button>
          <Link
            href="/sales-orders"
            className="bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300 px-4 py-2 rounded"
          >
            Back to Sales Orders
          </Link>
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Email Sales Order PDF</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email Address</label>
                <input
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="customer@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              
              {emailStatus === 'success' && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded">
                  Email sent successfully!
                </div>
              )}
              
              {emailStatus === 'error' && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded">
                  Failed to send email. Please try again.
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                disabled={sendingEmail}
              >
                Cancel
              </button>
              <button
                onClick={sendEmail}
                disabled={!emailAddress || sendingEmail}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingEmail ? 'Sending...' : 'Send Email'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Badge */}
      <div className="mb-6">
        <span className={`px-3 py-1 text-sm rounded capitalize ${
          salesOrder.status === 'fulfilled' ? 'bg-success-light text-success-dark border border-green-500' :
          'bg-error-light text-error-dark border border-red-500'
        }`}>
          {salesOrder.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
            <div className="space-y-2">
              <div>
                {salesOrder.customer ? (
                  <Link
                    href={`/customers/${salesOrder.customer.id}`}
                    className="text-lg font-medium text-primary-600 hover:text-primary-700"
                  >
                    {salesOrder.customer.name}
                  </Link>
                ) : (
                  <span className="text-gray-600">No customer assigned</span>
                )}
              </div>
              {salesOrder.customer?.email && (
                <div className="text-gray-600">{salesOrder.customer.email}</div>
              )}
              {salesOrder.customer?.phone && (
                <div className="text-gray-600">{salesOrder.customer.phone}</div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Order Items</h2>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Product</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">SKU</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">Price</th>
                  <th className="px-4 py-2 text-center text-sm font-medium text-gray-600">Qty</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">Total</th>
                </tr>
              </thead>
              <tbody>
                {salesOrder.items && salesOrder.items.length > 0 ? (
                  salesOrder.items.map((item, index) => (
                    <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3">
                        <Link href={`/products/view?search=${item.product.sku}`} className="text-primary-600 hover:text-primary-700">
                          {item.product.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-sm">{item.product.sku}</td>
                      <td className="px-4 py-3 text-right text-gray-900">
                        ${item.unitPrice.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-900">{item.quantity}</td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">
                        ${item.lineTotal.toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      No items in this order
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Notes */}
          {salesOrder.notes && (
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Notes</h2>
              <p className="text-gray-600 whitespace-pre-wrap">{salesOrder.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar - Order Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${salesOrder.subtotal.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold">${salesOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}