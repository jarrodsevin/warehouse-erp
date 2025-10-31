'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Customer {
  id: string;
  name: string;
  creditLimit: number;
  currentBalance: number;
}

interface Product {
  id: string;
  sku: string;
  name: string;
  cost: number;
  retailPrice: number;
  floorPrice: number;
  inventory: {
    quantityOnHand: number;
  } | null;
}

interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  availableQty: number;
  floorPrice: number;
}

export default function CreateSalesOrderPage() {
  const router = useRouter();
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceErrors, setPriceErrors] = useState<{ [key: string]: string }>({});

  // NEW: Acceptance and signature states
  const [orderAccepted, setOrderAccepted] = useState(false);
  const [printedName, setPrintedName] = useState('');
  const [signatureData, setSignatureData] = useState('');
  const [acceptanceErrors, setAcceptanceErrors] = useState<string[]>([]);

  useEffect(() => {
    fetchCustomers();
    fetchProducts();

    // Check for customerId in URL params
    const params = new URLSearchParams(window.location.search);
    const customerId = params.get('customerId');
    if (customerId) {
      setSelectedCustomerId(customerId);
    }
  }, []);

  // Initialize signature canvas
  useEffect(() => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Configure drawing style
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      const data = await response.json();
      setCustomers(data.filter((c: Customer) => c.currentBalance !== undefined));
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        console.error('Products API returned non-array:', data);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    }
  };

  const handleCustomerChange = (customerId: string) => {
    setSelectedCustomerId(customerId);
    const customer = customers.find(c => c.id === customerId);
    setSelectedCustomer(customer || null);
  };

  const addProductToOrder = (product: Product) => {
    const existingItem = orderItems.find(item => item.productId === product.id);

    if (existingItem) {
      alert('Product already added to order');
      return;
    }

    const newItem: OrderItem = {
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      quantity: 1,
      unitPrice: product.retailPrice,
      lineTotal: product.retailPrice,
      availableQty: product.inventory?.quantityOnHand || 0,
      floorPrice: product.floorPrice
    };

    setOrderItems([...orderItems, newItem]);
    setSearchTerm('');
  };

  const updateItemQuantity = (productId: string, quantity: number) => {
    setOrderItems(orderItems.map(item => {
      if (item.productId === productId) {
        const newQuantity = Math.max(1, Math.min(quantity, item.availableQty));
        return {
          ...item,
          quantity: newQuantity,
          lineTotal: newQuantity * item.unitPrice
        };
      }
      return item;
    }));
  };

  const updateItemPrice = (productId: string, price: number) => {
    const item = orderItems.find(i => i.productId === productId);
    if (!item) return;

    // Check against floor price
    if (price < item.floorPrice) {
      setPriceErrors({
        ...priceErrors,
        [productId]: `Price cannot be below floor price of $${item.floorPrice.toFixed(2)}`
      });
    } else {
      // Clear error if price is valid
      const newErrors = { ...priceErrors };
      delete newErrors[productId];
      setPriceErrors(newErrors);

      // Update the price
      setOrderItems(orderItems.map(i => {
        if (i.productId === productId) {
          return {
            ...i,
            unitPrice: price,
            lineTotal: i.quantity * price
          };
        }
        return i;
      }));
    }
  };

  const removeItem = (productId: string) => {
    setOrderItems(orderItems.filter(item => item.productId !== productId));
    // Clear any price errors for this item
    const newErrors = { ...priceErrors };
    delete newErrors[productId];
    setPriceErrors(newErrors);
  };

  // Signature canvas functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = signatureCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = signatureCanvasRef.current;
    if (canvas) {
      setSignatureData(canvas.toDataURL());
    }
  };

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureData('');
  };

  const validateAcceptance = (): boolean => {
    const errors: string[] = [];

    if (!orderAccepted) {
      errors.push('You must accept the order terms');
    }

    if (!printedName.trim()) {
      errors.push('Please enter your printed name');
    }

    if (!signatureData) {
      errors.push('Please provide your signature');
    }

    setAcceptanceErrors(errors);
    return errors.length === 0;
  };

  const subtotal = orderItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const total = subtotal;

  const filteredProducts = products.filter(p =>
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     p.sku.toLowerCase().includes(searchTerm.toLowerCase())) &&
    !orderItems.find(item => item.productId === p.id)
  ).slice(0, 10);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCustomerId) {
      alert('Please select a customer');
      return;
    }

    if (orderItems.length === 0) {
      alert('Please add at least one product to the order');
      return;
    }

    // Check for price errors
    if (Object.keys(priceErrors).length > 0) {
      alert('Please fix price errors before submitting. All prices must be at or above the floor price.');
      return;
    }

    // Validate all prices are at or above floor price
    const invalidItems = orderItems.filter(item => item.unitPrice < item.floorPrice);
    if (invalidItems.length > 0) {
      alert('Some items have prices below the floor price. Please correct them before submitting.');
      return;
    }

    // NEW: Validate acceptance and signature
    if (!validateAcceptance()) {
      alert('Please complete the order acceptance section before submitting.');
      return;
    }

    // Check credit limit
    if (selectedCustomer) {
      const newBalance = selectedCustomer.currentBalance + total;
      if (newBalance > selectedCustomer.creditLimit) {
        const exceeds = newBalance - selectedCustomer.creditLimit;
        if (!confirm(`Warning: This sale will exceed the customer's credit limit by $${exceeds.toFixed(2)}. Continue?`)) {
          return;
        }
      }
    }

    setLoading(true);

    try {
      const response = await fetch('/api/sales-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          subtotal,
          total,
          notes,
          items: orderItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineTotal: item.lineTotal
          })),
          // NEW: Include acceptance data
          acceptance: {
            accepted: orderAccepted,
            printedName: printedName.trim(),
            signature: signatureData,
            acceptedAt: new Date().toISOString()
          }
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Sales order created successfully!');
        router.push('/sales-orders');
      } else {
        alert(data.error || 'Failed to create sales order');
      }
    } catch (error) {
      console.error('Error creating sales order:', error);
      alert('Error creating sales order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Create Sales Order</h1>
        <Link
          href="/sales-orders"
          className="text-gray-400 hover:text-white"
        >
          ← Back to Sales Orders
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Selection */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Customer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Select Customer <span className="text-red-500">*</span>
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
            {selectedCustomer && (
              <>
                <div>
                  <label className="block text-sm text-gray-400">Credit Limit</label>
                  <p className="text-lg text-white">${selectedCustomer.creditLimit.toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400">Current Balance</label>
                  <p className="text-lg text-yellow-400">${selectedCustomer.currentBalance.toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400">Available Credit</label>
                  <p className="text-lg text-green-400">
                    ${(selectedCustomer.creditLimit - selectedCustomer.currentBalance).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400">Balance After This Sale</label>
                  <p className={`text-lg ${
                    selectedCustomer.currentBalance + total > selectedCustomer.creditLimit
                      ? 'text-red-400'
                      : 'text-white'
                  }`}>
                    ${(selectedCustomer.currentBalance + total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Products */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Products</h2>

          {/* Product Search */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Search Products</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by product name or SKU..."
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded text-white"
            />

            {searchTerm && filteredProducts.length > 0 && (
              <div className="mt-2 bg-gray-900 border border-gray-700 rounded max-h-64 overflow-y-auto">
                {filteredProducts.map(product => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => addProductToOrder(product)}
                    className="w-full px-4 py-3 hover:bg-gray-800 text-left border-b border-gray-700 last:border-b-0"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-white">{product.name}</div>
                        <div className="text-sm text-gray-400">SKU: {product.sku}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Floor: ${product.floorPrice.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${
                          (product.inventory?.quantityOnHand || 0) === 0
                            ? 'text-red-400'
                            : 'text-white'
                        }`}>
                          ${product.retailPrice.toFixed(2)}
                        </div>
                        <div className={`text-sm ${
                          (product.inventory?.quantityOnHand || 0) === 0
                            ? 'text-red-400 font-bold'
                            : 'text-gray-400'
                        }`}>
                          Stock: {product.inventory?.quantityOnHand || 0}
                          {(product.inventory?.quantityOnHand || 0) === 0 && ' ⚠️'}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Order Items Table */}
          {orderItems.length > 0 && (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">Product</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">SKU</th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-400">Price</th>
                    <th className="px-4 py-2 text-center text-sm font-medium text-gray-400">Quantity</th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-400">Total</th>
                    <th className="px-4 py-2 text-center text-sm font-medium text-gray-400">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orderItems.map((item, index) => (
                    <tr key={item.productId} className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}>
                      <td className="px-4 py-3 text-white">{item.productName}</td>
                      <td className="px-4 py-3 text-gray-400 text-sm">{item.sku}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-1">
                            <span className="text-gray-400 text-sm">$</span>
                            <input
                              type="text"
                              inputMode="decimal"
                              key={`price-${item.productId}-${item.unitPrice}`}
                              defaultValue={item.unitPrice.toFixed(2)}
                              onBlur={(e) => {
                                const newPrice = parseFloat(e.target.value) || item.floorPrice;
                                // Enforce minimum floor price
                                const finalPrice = Math.max(newPrice, item.floorPrice);
                                updateItemPrice(item.productId, finalPrice);
                              }}
                              onFocus={(e) => e.target.select()}
                              className={`w-24 py-1 px-3 bg-gray-900 border rounded text-white text-right ${
                                priceErrors[item.productId] 
                                  ? 'border-red-500' 
                                  : 'border-gray-700'
                              }`}
                            />
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Floor: ${item.floorPrice.toFixed(2)}
                          </div>
                          {priceErrors[item.productId] && (
                            <div className="text-xs text-red-400 mt-1">
                              {priceErrors[item.productId]}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItemQuantity(item.productId, parseInt(e.target.value) || 1)}
                          min="1"
                          max={item.availableQty}
                          className="w-20 px-2 py-1 bg-gray-900 border border-gray-700 rounded text-white text-center"
                        />
                        <div className="text-xs text-gray-400 text-center mt-1">
                          Max: {item.availableQty}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-white">
                        ${item.lineTotal.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {orderItems.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No products added yet. Search and select products above.
            </div>
          )}
        </div>

        {/* Order Summary */}
        {orderItems.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-lg">
                <span className="text-gray-400">Subtotal:</span>
                <span className="text-white font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-2xl font-bold border-t border-gray-700 pt-2">
                <span className="text-white">Total:</span>
                <span className="text-white">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* NEW: Order Acceptance Section */}
        {orderItems.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Order Acceptance</h2>

            {/* Terms Acceptance Checkbox */}
            <div className="mb-6">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={orderAccepted}
                  onChange={(e) => setOrderAccepted(e.target.checked)}
                  className="mt-1 w-5 h-5 bg-gray-900 border-gray-700 rounded focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <span className="text-white font-medium">I accept this order</span>
                  <p className="text-sm text-gray-400 mt-1">
                    By checking this box, I acknowledge that I have reviewed the order details above, 
                    including quantities, prices, and the total amount. I agree to accept delivery of 
                    these products and authorize payment according to the agreed terms.
                  </p>
                </div>
              </label>
            </div>

            {/* Printed Name */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Printed Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={printedName}
                onChange={(e) => setPrintedName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded text-white"
              />
              <p className="text-xs text-gray-400 mt-1">
                Please enter your name as it appears on official documents
              </p>
            </div>

            {/* Signature Canvas */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Signature <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-gray-700 rounded bg-gray-900 p-2">
                <canvas
                  ref={signatureCanvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-40 bg-gray-900 rounded cursor-crosshair touch-none"
                  style={{ touchAction: 'none' }}
                />
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-400">
                  Sign above using your mouse or touch screen
                </p>
                <button
                  type="button"
                  onClick={clearSignature}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                >
                  Clear Signature
                </button>
              </div>
            </div>

            {/* Acceptance Errors */}
            {acceptanceErrors.length > 0 && (
              <div className="bg-red-500/20 border border-red-500/50 rounded p-4">
                <div className="font-semibold text-red-400 mb-2">Please complete the following:</div>
                <ul className="list-disc list-inside text-red-400 text-sm space-y-1">
                  {acceptanceErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        <div className="bg-gray-800 rounded-lg p-6">
          <label className="block text-sm font-medium mb-2">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded text-white"
            placeholder="Add any notes about this order..."
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Link
            href="/sales-orders"
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || !selectedCustomerId || orderItems.length === 0 || Object.keys(priceErrors).length > 0}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Sales Order'}
          </button>
        </div>
      </form>
    </div>
  );
}