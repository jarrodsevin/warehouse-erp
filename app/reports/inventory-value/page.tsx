'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
}

interface Subcategory {
  id: string;
  name: string;
}

interface Brand {
  id: string;
  name: string;
}

interface Vendor {
  id: string;
  name: string;
}

interface Product {
  id: string;
  sku: string;
  name: string;
  cost: number;
  retailPrice: number;
  category: Category | null;
  subcategory: Subcategory | null;
  brand: Brand | null;
  purchaseOrderItems: Array<{
    purchaseOrder: {
      vendor: Vendor;
    };
  }>;
}

interface InventoryItem {
  id: string;
  quantityOnHand: number;
  product: Product;
}

type GroupByType = 'category' | 'subcategory' | 'brand' | 'vendor';

export default function InventoryValueReport() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupBy, setGroupBy] = useState<GroupByType>('category');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/inventory/value');
      const data = await response.json();
      setInventory(data.inventory);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setLoading(false);
    }
  };

  // Calculate totals
  const calculateTotals = (items: InventoryItem[]) => {
    const costValue = items.reduce(
      (sum, item) => sum + item.quantityOnHand * item.product.cost,
      0
    );
    const retailValue = items.reduce(
      (sum, item) => sum + item.quantityOnHand * item.product.retailPrice,
      0
    );
    const profit = retailValue - costValue;
    return { costValue, retailValue, profit };
  };

  // Get vendor for a product (from most recent PO)
  const getVendor = (product: Product): Vendor | null => {
    if (product.purchaseOrderItems.length > 0) {
      return product.purchaseOrderItems[0].purchaseOrder.vendor;
    }
    return null;
  };

  // Extract unique values for filters
  const allCategories = Array.from(
    new Map(
      inventory
        .filter((item) => item.product.category)
        .map((item) => [item.product.category!.id, item.product.category!])
    ).values()
  );

  const allSubcategories = Array.from(
    new Map(
      inventory
        .filter((item) => item.product.subcategory)
        .map((item) => [item.product.subcategory!.id, item.product.subcategory!])
    ).values()
  );

  const allBrands = Array.from(
    new Map(
      inventory
        .filter((item) => item.product.brand)
        .map((item) => [item.product.brand!.id, item.product.brand!])
    ).values()
  );

  const allVendors = Array.from(
    new Map(
      inventory
        .map((item) => {
          const vendor = getVendor(item.product);
          return vendor ? [vendor.id, vendor] : null;
        })
        .filter((v) => v !== null) as Array<[string, Vendor]>
    ).values()
  );

  // Toggle functions
  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    );
  };

  const toggleSubcategory = (subcategoryId: string) => {
    setSelectedSubcategories((prev) =>
      prev.includes(subcategoryId)
        ? prev.filter((id) => id !== subcategoryId)
        : [...prev, subcategoryId]
    );
  };

  const toggleBrand = (brandId: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brandId) ? prev.filter((id) => id !== brandId) : [...prev, brandId]
    );
  };

  const toggleVendor = (vendorId: string) => {
    setSelectedVendors((prev) =>
      prev.includes(vendorId) ? prev.filter((id) => id !== vendorId) : [...prev, vendorId]
    );
  };

  const clearCategoryFilters = () => setSelectedCategories([]);
  const clearSubcategoryFilters = () => setSelectedSubcategories([]);
  const clearBrandFilters = () => setSelectedBrands([]);
  const clearVendorFilters = () => setSelectedVendors([]);

  // Filter inventory based on all filters
  const filteredInventory = inventory.filter((item) => {
    // Category filter
    if (
      selectedCategories.length > 0 &&
      (!item.product.category || !selectedCategories.includes(item.product.category.id))
    ) {
      return false;
    }

    // Subcategory filter
    if (
      selectedSubcategories.length > 0 &&
      (!item.product.subcategory || !selectedSubcategories.includes(item.product.subcategory.id))
    ) {
      return false;
    }

    // Brand filter
    if (
      selectedBrands.length > 0 &&
      (!item.product.brand || !selectedBrands.includes(item.product.brand.id))
    ) {
      return false;
    }

    // Vendor filter
    if (selectedVendors.length > 0) {
      const vendor = getVendor(item.product);
      if (!vendor || !selectedVendors.includes(vendor.id)) {
        return false;
      }
    }

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const vendor = getVendor(item.product);
      return (
        item.product.name.toLowerCase().includes(search) ||
        item.product.sku.toLowerCase().includes(search) ||
        item.product.category?.name.toLowerCase().includes(search) ||
        item.product.subcategory?.name.toLowerCase().includes(search) ||
        item.product.brand?.name.toLowerCase().includes(search) ||
        vendor?.name.toLowerCase().includes(search)
      );
    }

    return true;
  });

  // Group inventory for display
  const getGroupKey = (item: InventoryItem): string => {
    switch (groupBy) {
      case 'category':
        return item.product.category?.name || 'Uncategorized';
      case 'subcategory':
        return item.product.subcategory?.name || 'No Subcategory';
      case 'brand':
        return item.product.brand?.name || 'No Brand';
      case 'vendor':
        const vendor = getVendor(item.product);
        return vendor?.name || 'No Vendor';
      default:
        return 'Unknown';
    }
  };

  const groupedInventory = filteredInventory.reduce((acc, item) => {
    const groupName = getGroupKey(item);
    if (!acc[groupName]) {
      acc[groupName] = [];
    }
    acc[groupName].push(item);
    return acc;
  }, {} as Record<string, InventoryItem[]>);

  const totals = calculateTotals(filteredInventory);
  const grandTotals = calculateTotals(inventory);

  const generatePDF = async () => {
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;

    const doc = new jsPDF({
      orientation: 'landscape',
    });

    doc.setFontSize(18);
    doc.text('Inventory Value Report', 14, 20);

    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);
    doc.text(`Group By: ${groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}`, 14, 33);

    // Summary section
    doc.setFontSize(12);
    doc.text('Summary', 14, 43);
    doc.setFontSize(10);
    doc.text(`Total Cost Value: $${totals.costValue.toFixed(2)}`, 14, 50);
    doc.text(`Total Retail Value: $${totals.retailValue.toFixed(2)}`, 14, 55);
    doc.text(`Total Potential Profit: $${totals.profit.toFixed(2)}`, 14, 60);

    // Detailed table
    const tableData: any[] = [];
    Object.entries(groupedInventory).forEach(([groupName, items]) => {
      const groupTotals = calculateTotals(items);

      // Group header
      tableData.push([
        {
          content: groupName,
          colSpan: 7,
          styles: { fontStyle: 'bold', fillColor: [59, 130, 246] },
        },
      ]);

      // Group items
      items.forEach((item) => {
        const costValue = item.quantityOnHand * item.product.cost;
        const retailValue = item.quantityOnHand * item.product.retailPrice;
        const profit = retailValue - costValue;

        tableData.push([
          item.product.sku,
          item.product.name,
          item.quantityOnHand.toString(),
          `$${item.product.cost.toFixed(2)}`,
          `$${costValue.toFixed(2)}`,
          `$${retailValue.toFixed(2)}`,
          `$${profit.toFixed(2)}`,
        ]);
      });

      // Group subtotal
      tableData.push([
        { content: `${groupName} Subtotal`, colSpan: 4, styles: { fontStyle: 'bold' } },
        { content: `$${groupTotals.costValue.toFixed(2)}`, styles: { fontStyle: 'bold' } },
        { content: `$${groupTotals.retailValue.toFixed(2)}`, styles: { fontStyle: 'bold' } },
        { content: `$${groupTotals.profit.toFixed(2)}`, styles: { fontStyle: 'bold' } },
      ]);
    });

    autoTable(doc, {
      startY: 68,
      head: [['SKU', 'Product', 'Qty', 'Unit Cost', 'Cost Value', 'Retail Value', 'Profit']],
      body: tableData,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
    });

    doc.save(`inventory-value-${groupBy}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-white text-center">Loading inventory data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Inventory Value Report</h1>
            <p className="text-gray-400">View inventory value by cost and retail price</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={generatePDF}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              📄 Export PDF
            </button>
            <Link
              href="/reports"
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              ← Back to Reports
            </Link>
          </div>
        </div>

        {/* Grand Totals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6">
            <h3 className="text-sm text-green-300 mb-2">Total Cost Value</h3>
            <p className="text-3xl font-bold text-green-400">
              ${grandTotals.costValue.toFixed(2)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {inventory.reduce((sum, item) => sum + item.quantityOnHand, 0)} units
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-6">
            <h3 className="text-sm text-blue-300 mb-2">Total Retail Value</h3>
            <p className="text-3xl font-bold text-blue-400">
              ${grandTotals.retailValue.toFixed(2)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-6">
            <h3 className="text-sm text-purple-300 mb-2">Potential Profit</h3>
            <p className="text-3xl font-bold text-purple-400">
              ${grandTotals.profit.toFixed(2)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {((grandTotals.profit / grandTotals.retailValue) * 100).toFixed(1)}% margin
            </p>
          </div>
        </div>

        {/* Group By Selection */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Group By</h3>
          <div className="flex flex-wrap gap-2">
            {(['category', 'subcategory', 'brand', 'vendor'] as GroupByType[]).map((type) => (
              <button
                key={type}
                onClick={() => setGroupBy(type)}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  groupBy === type
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'bg-gray-800/50 text-gray-400 border-gray-700 hover:border-gray-600'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-6">Filters</h2>

          {/* Search */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Search Products
            </label>
            <input
              type="text"
              placeholder="Search by product name, SKU, category, brand, or vendor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-300">Filter by Category</label>
              {selectedCategories.length > 0 && (
                <button
                  onClick={clearCategoryFilters}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Clear ({selectedCategories.length})
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {allCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => toggleCategory(category.id)}
                  className={`px-4 py-2 rounded-lg border transition-all ${
                    selectedCategories.includes(category.id)
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-gray-800/50 text-gray-400 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Subcategory Filter */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-300">Filter by Subcategory</label>
              {selectedSubcategories.length > 0 && (
                <button
                  onClick={clearSubcategoryFilters}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Clear ({selectedSubcategories.length})
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {allSubcategories.map((subcategory) => (
                <button
                  key={subcategory.id}
                  onClick={() => toggleSubcategory(subcategory.id)}
                  className={`px-4 py-2 rounded-lg border transition-all ${
                    selectedSubcategories.includes(subcategory.id)
                      ? 'bg-orange-600 text-white border-orange-500'
                      : 'bg-gray-800/50 text-gray-400 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  {subcategory.name}
                </button>
              ))}
            </div>
          </div>

          {/* Brand Filter */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-300">Filter by Brand</label>
              {selectedBrands.length > 0 && (
                <button
                  onClick={clearBrandFilters}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Clear ({selectedBrands.length})
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {allBrands.map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => toggleBrand(brand.id)}
                  className={`px-4 py-2 rounded-lg border transition-all ${
                    selectedBrands.includes(brand.id)
                      ? 'bg-purple-600 text-white border-purple-500'
                      : 'bg-gray-800/50 text-gray-400 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  {brand.name}
                </button>
              ))}
            </div>
          </div>

          {/* Vendor Filter */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-300">Filter by Vendor</label>
              {selectedVendors.length > 0 && (
                <button
                  onClick={clearVendorFilters}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Clear ({selectedVendors.length})
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {allVendors.map((vendor) => (
                <button
                  key={vendor.id}
                  onClick={() => toggleVendor(vendor.id)}
                  className={`px-4 py-2 rounded-lg border transition-all ${
                    selectedVendors.includes(vendor.id)
                      ? 'bg-cyan-600 text-white border-cyan-500'
                      : 'bg-gray-800/50 text-gray-400 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  {vendor.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filtered Totals */}
        {(selectedCategories.length > 0 ||
          selectedSubcategories.length > 0 ||
          selectedBrands.length > 0 ||
          selectedVendors.length > 0 ||
          searchTerm) && (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Filtered Results</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-400">Cost Value</p>
                <p className="text-xl font-bold text-green-400">${totals.costValue.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Retail Value</p>
                <p className="text-xl font-bold text-blue-400">${totals.retailValue.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Profit</p>
                <p className="text-xl font-bold text-purple-400">${totals.profit.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="mb-4 text-gray-400">
          Showing {filteredInventory.length} of {inventory.length} items
        </div>

        {/* Grouped Inventory Display */}
        <div className="space-y-6">
          {Object.entries(groupedInventory).length === 0 ? (
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 text-center">
              <p className="text-gray-400">No inventory items found</p>
            </div>
          ) : (
            Object.entries(groupedInventory).map(([groupName, items]) => {
              const groupTotals = calculateTotals(items);
              return (
                <div
                  key={groupName}
                  className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden"
                >
                  {/* Group Header */}
                  <div className="bg-blue-600/20 border-b border-blue-500/30 p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-blue-400">{groupName}</h3>
                      <div className="flex gap-6 text-sm">
                        <div>
                          <span className="text-gray-400">Cost: </span>
                          <span className="text-green-400 font-semibold">
                            ${groupTotals.costValue.toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Retail: </span>
                          <span className="text-blue-400 font-semibold">
                            ${groupTotals.retailValue.toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Profit: </span>
                          <span className="text-purple-400 font-semibold">
                            ${groupTotals.profit.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Group Items Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700 bg-gray-900/50">
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">SKU</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">
                            Product
                          </th>
                          <th className="text-right py-3 px-4 text-gray-400 font-medium">
                            Qty on Hand
                          </th>
                          <th className="text-right py-3 px-4 text-gray-400 font-medium">
                            Unit Cost
                          </th>
                          <th className="text-right py-3 px-4 text-gray-400 font-medium">
                            Cost Value
                          </th>
                          <th className="text-right py-3 px-4 text-gray-400 font-medium">
                            Retail Value
                          </th>
                          <th className="text-right py-3 px-4 text-gray-400 font-medium">
                            Profit
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item, index) => {
                          const costValue = item.quantityOnHand * item.product.cost;
                          const retailValue = item.quantityOnHand * item.product.retailPrice;
                          const profit = retailValue - costValue;

                          return (
                            <tr
                              key={item.id}
                              className={index % 2 === 0 ? 'bg-gray-800/30' : 'bg-gray-800/10'}
                            >
                              <td className="py-3 px-4 text-gray-300">{item.product.sku}</td>
                              <td className="py-3 px-4 text-white">{item.product.name}</td>
                              <td className="py-3 px-4 text-right text-gray-300">
                                {item.quantityOnHand}
                              </td>
                              <td className="py-3 px-4 text-right text-gray-300">
                                ${item.product.cost.toFixed(2)}
                              </td>
                              <td className="py-3 px-4 text-right text-green-400 font-medium">
                                ${costValue.toFixed(2)}
                              </td>
                              <td className="py-3 px-4 text-right text-blue-400 font-medium">
                                ${retailValue.toFixed(2)}
                              </td>
                              <td className="py-3 px-4 text-right text-purple-400 font-medium">
                                ${profit.toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}