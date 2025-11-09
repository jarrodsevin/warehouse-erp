'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

interface SalesOrder {
  id: string;
  soNumber: string;
  orderDate: string;
  total: number;
  status: string;
}

interface Product {
  id: string;
  sku: string;
  name: string;
  totalQuantity: number;
  totalRevenue: number;
  orderCount: number;
  lastOrderDate: string;
}

interface Stats {
  thirtyDays: number;
  sixtyDays: number;
  ninetyDays: number;
  ytd: number;
  lastYear: number;
  allTime: number;
}

type ProductSortKey = 'name' | 'sku' | 'totalQuantity' | 'totalRevenue' | 'orderCount' | 'lastOrderDate';
type SortDirection = 'asc' | 'desc';

export default function SalesVisitPage() {
  const router = useRouter();
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [visitDate, setVisitDate] = useState('');
  const [notes, setNotes] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  // History data
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'30' | '60' | '90' | 'ytd' | 'lastYear' | 'all'>('all');
  
  // Sorting state for products table
  const [productSortKey, setProductSortKey] = useState<ProductSortKey>('totalRevenue');
  const [productSortDirection, setProductSortDirection] = useState<SortDirection>('desc');
  
  useEffect(() => {
    fetchCustomers();
    
    // Set default date/time to now
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    setVisitDate(`${year}-${month}-${day}T${hours}:${minutes}`);
  }, []);
  
  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };
  
  const handleCustomerChange = async (customerId: string) => {
    setSelectedCustomerId(customerId);
    const customer = customers.find(c => c.id === customerId);
    setSelectedCustomer(customer || null);
    
    if (customerId) {
      await fetchCustomerHistory(customerId);
    } else {
      setSalesOrders([]);
      setProducts([]);
      setStats(null);
    }
  };
  
  const fetchCustomerHistory = async (customerId: string) => {
    try {
      const response = await fetch(`/api/sales-visits?customerId=${customerId}`);
      const data = await response.json();
      
      setSalesOrders(data.salesOrders || []);
      setProducts(data.products || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error('Error fetching customer history:', error);
    }
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImages(prev => [...prev, base64String]);
      };
      reader.readAsDataURL(file);
    });
  };
  
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };
const generatePDF = () => {
    if (!selectedCustomer) return;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Title
    doc.setFontSize(20);
    doc.text('Sales Visit Report', pageWidth / 2, 20, { align: 'center' });
    
    // Customer Info
    doc.setFontSize(14);
    doc.text('Customer Information', 14, 35);
    doc.setFontSize(11);
    doc.text(`Name: ${selectedCustomer.name}`, 14, 45);
    doc.text(`Email: ${selectedCustomer.email || 'N/A'}`, 14, 52);
    doc.text(`Phone: ${selectedCustomer.phone || 'N/A'}`, 14, 59);
    
    // Visit Details
    doc.setFontSize(14);
    doc.text('Visit Details', 14, 72);
    doc.setFontSize(11);
    doc.text(`Date & Time: ${new Date(visitDate).toLocaleString()}`, 14, 82);
    
    // Visit Notes
    doc.setFontSize(14);
    doc.text('Visit Notes', 14, 95);
    doc.setFontSize(10);
    
    if (notes && notes.trim()) {
      const splitNotes = doc.splitTextToSize(notes, pageWidth - 28);
      doc.text(splitNotes, 14, 105);
    } else {
      doc.text('No notes recorded', 14, 105);
    }
    
    // Photos section
    const notesHeight = notes ? doc.splitTextToSize(notes, pageWidth - 28).length * 5 : 5;
    const photosY = 105 + notesHeight + 10;
    
    doc.setFontSize(14);
    doc.text('Photos', 14, photosY);
    doc.setFontSize(10);
    
    if (images.length > 0) {
      doc.text(`${images.length} photo(s) attached to this visit`, 14, photosY + 10);
      
      // Add images to PDF
      let currentY = photosY + 20;
      images.forEach((image, index) => {
        // Check if we need a new page
        if (currentY > 250) {
          doc.addPage();
          currentY = 20;
        }
        
        try {
          const imgWidth = 80;
          const imgHeight = 60;
          doc.addImage(image, 'JPEG', 14, currentY, imgWidth, imgHeight);
          doc.setFontSize(9);
          doc.text(`Photo ${index + 1}`, 14, currentY + imgHeight + 5);
          currentY += imgHeight + 15;
        } catch (error) {
          console.error('Error adding image to PDF:', error);
        }
      });
    } else {
      doc.text('No photos attached', 14, photosY + 10);
    }
    
    // Save the PDF
    const dateStr = new Date(visitDate).toISOString().split('T')[0];
    doc.save(`Sales_Visit_${selectedCustomer.name.replace(/\s+/g, '_')}_${dateStr}.pdf`);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCustomerId) {
      alert('Please select a customer');
      return;
    }
    
    if (!visitDate) {
      alert('Please select a date and time');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/sales-visits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          visitDate,
          notes: notes.trim() || null,
          images: images.length > 0 ? images : null
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('Sales visit recorded successfully!');
        // Reset form
        setNotes('');
        setImages([]);
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        setVisitDate(`${year}-${month}-${day}T${hours}:${minutes}`);
      } else {
        alert(data.error || 'Failed to record sales visit');
      }
    } catch (error) {
      console.error('Error recording sales visit:', error);
      alert('Error recording sales visit');
    } finally {
      setLoading(false);
    }
  };
  
  // Filter sales orders based on selected period
  const getFilteredOrders = () => {
    if (!salesOrders.length) return [];
    
    const now = new Date();
    
    switch (selectedPeriod) {
      case '30':
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return salesOrders.filter(o => new Date(o.orderDate) >= thirtyDaysAgo);
      case '60':
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        return salesOrders.filter(o => new Date(o.orderDate) >= sixtyDaysAgo);
      case '90':
        const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        return salesOrders.filter(o => new Date(o.orderDate) >= ninetyDaysAgo);
      case 'ytd':
        const yearStart = new Date(now.getFullYear(), 0, 1);
        return salesOrders.filter(o => new Date(o.orderDate) >= yearStart);
      case 'lastYear':
        const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
        const lastYearEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);
        return salesOrders.filter(o => {
          const orderDate = new Date(o.orderDate);
          return orderDate >= lastYearStart && orderDate <= lastYearEnd;
        });
      case 'all':
      default:
        return salesOrders;
    }
  };
  
  // Handle product sorting
  const handleProductSort = (key: ProductSortKey) => {
    if (productSortKey === key) {
      // Toggle direction if clicking same column
      setProductSortDirection(productSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, default to descending
      setProductSortKey(key);
      setProductSortDirection('desc');
    }
  };
  
  // Sort products
  const getSortedProducts = () => {
    if (!products.length) return [];
    
    const sorted = [...products].sort((a, b) => {
      let aValue: any = a[productSortKey];
      let bValue: any = b[productSortKey];
      
      // Handle date sorting
      if (productSortKey === 'lastOrderDate') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      // Handle string sorting (case insensitive)
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (aValue < bValue) return productSortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return productSortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    return sorted;
  };
  
  const filteredOrders = getFilteredOrders();
  const sortedProducts = getSortedProducts();
  
  // Sort indicator component
  const SortIndicator = ({ columnKey }: { columnKey: ProductSortKey }) => {
    if (productSortKey !== columnKey) {
      return <span className="text-gray-600 ml-1">↕</span>;
    }
    return (
      <span className="text-blue-400 ml-1">
        {productSortDirection === 'asc' ? '↑' : '↓'}
      </span>
    );
  };
  
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Sales Visit</h1>
        <div className="flex gap-4">
          <Link
            href="/sales-visits/view"
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded"
          >
            📋 View All Visits
          </Link>
          <Link
            href="/"
            className="text-gray-400 hover:text-white"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Visit Information */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Visit Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Selection */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Customer <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => handleCustomerChange(e.target.value)}
                required
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded text-white"
              >
                <option value="">-- Select Customer --</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Date/Time */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Visit Date & Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                required
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded text-white"
              />
            </div>
            
            {/* Customer Info Display */}
            {selectedCustomer && (
              <>
                <div>
                  <label className="block text-sm text-gray-400">Email</label>
                  <p className="text-white">{selectedCustomer.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400">Phone</label>
                  <p className="text-white">{selectedCustomer.phone || 'N/A'}</p>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Notes */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Visit Notes</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={6}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded text-white"
            placeholder="Enter notes about this sales visit (customer feedback, discussed products, follow-up items, etc.)..."
          />
        </div>
        
        {/* Photos */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Photos</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Upload Photos (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              capture="environment"
              onChange={handleImageUpload}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
            <p className="text-xs text-gray-400 mt-1">
              You can select multiple photos. Works great on mobile devices!
            </p>
          </div>
          
          {/* Image Preview */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-32 object-cover rounded border border-gray-700"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
     {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Link
            href="/"
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded"
          >
            Cancel
          </Link>
          {selectedCustomerId && (
            <button
              type="button"
              onClick={generatePDF}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
            >
              📄 Generate PDF
            </button>
          )}
          <button
            type="submit"
            disabled={loading || !selectedCustomerId || !visitDate}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {loading ? 'Recording...' : 'Record Visit'}
          </button>
        </div>
      </form>
      
      {/* Customer History Section */}
      {selectedCustomerId && (
        <div className="mt-8 space-y-6">
          {/* Sales Order History */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Sales Order History</h2>
              {stats && (
                <div className="text-sm text-gray-400">
                  Total Orders: <span className="text-white font-medium">{filteredOrders.length}</span>
                </div>
              )}
            </div>
            
            {/* Period Filter Buttons */}
            {stats && (
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setSelectedPeriod('30')}
                  className={`px-3 py-1 rounded text-sm ${
                    selectedPeriod === '30'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  30 Days ({stats.thirtyDays})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPeriod('60')}
                  className={`px-3 py-1 rounded text-sm ${
                    selectedPeriod === '60'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  60 Days ({stats.sixtyDays})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPeriod('90')}
                  className={`px-3 py-1 rounded text-sm ${
                    selectedPeriod === '90'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  90 Days ({stats.ninetyDays})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPeriod('ytd')}
                  className={`px-3 py-1 rounded text-sm ${
                    selectedPeriod === 'ytd'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  YTD ({stats.ytd})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPeriod('lastYear')}
                  className={`px-3 py-1 rounded text-sm ${
                    selectedPeriod === 'lastYear'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Last Year ({stats.lastYear})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPeriod('all')}
                  className={`px-3 py-1 rounded text-sm ${
                    selectedPeriod === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  All Time ({stats.allTime})
                </button>
              </div>
            )}
            
            {/* Sales Orders Table */}
            {filteredOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">Order #</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">Date</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-gray-400">Total</th>
                      <th className="px-4 py-2 text-center text-sm font-medium text-gray-400">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order, index) => (
                      <tr key={order.id} className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}>
                        <td className="px-4 py-3 text-white">{order.soNumber}</td>
                        <td className="px-4 py-3 text-gray-400">
                          {new Date(order.orderDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right text-white font-medium">
                          ${order.total.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded text-xs ${
                            order.status === 'fulfilled'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                No sales orders found for this customer in the selected period.
              </div>
            )}
          </div>
          
          {/* Products Purchased History */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Products Purchased (All Time)</h2>
            
            {sortedProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900">
                    <tr>
                      <th 
                        className="px-4 py-2 text-left text-sm font-medium text-gray-400 cursor-pointer hover:text-white select-none"
                        onClick={() => handleProductSort('name')}
                      >
                        Product <SortIndicator columnKey="name" />
                      </th>
                      <th 
                        className="px-4 py-2 text-left text-sm font-medium text-gray-400 cursor-pointer hover:text-white select-none"
                        onClick={() => handleProductSort('sku')}
                      >
                        SKU <SortIndicator columnKey="sku" />
                      </th>
                      <th 
                        className="px-4 py-2 text-right text-sm font-medium text-gray-400 cursor-pointer hover:text-white select-none"
                        onClick={() => handleProductSort('totalQuantity')}
                      >
                        Total Qty <SortIndicator columnKey="totalQuantity" />
                      </th>
                      <th 
                        className="px-4 py-2 text-right text-sm font-medium text-gray-400 cursor-pointer hover:text-white select-none"
                        onClick={() => handleProductSort('totalRevenue')}
                      >
                        Total Revenue <SortIndicator columnKey="totalRevenue" />
                      </th>
                      <th 
                        className="px-4 py-2 text-center text-sm font-medium text-gray-400 cursor-pointer hover:text-white select-none"
                        onClick={() => handleProductSort('orderCount')}
                      >
                        Times Ordered <SortIndicator columnKey="orderCount" />
                      </th>
                      <th 
                        className="px-4 py-2 text-left text-sm font-medium text-gray-400 cursor-pointer hover:text-white select-none"
                        onClick={() => handleProductSort('lastOrderDate')}
                      >
                        Last Order <SortIndicator columnKey="lastOrderDate" />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedProducts.map((product, index) => (
                      <tr key={product.id} className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}>
                        <td className="px-4 py-3 text-white">{product.name}</td>
                        <td className="px-4 py-3 text-gray-400 text-sm">{product.sku}</td>
                        <td className="px-4 py-3 text-right text-white">{product.totalQuantity}</td>
                        <td className="px-4 py-3 text-right text-green-400 font-medium">
                          ${product.totalRevenue.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-center text-white">{product.orderCount}</td>
                        <td className="px-4 py-3 text-gray-400">
                          {new Date(product.lastOrderDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                No products found for this customer.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}