'use client'

import { createProduct, updateProduct } from '@/app/actions/products'
import { useRouter } from 'next/navigation'

type Category = {
  id: string
  name: string
}

type Subcategory = {
  id: string
  name: string
}

type Brand = {
  id: string
  name: string
}

type Product = {
  id: string
  sku: string
  name: string
  description: string | null
  cost: number
  retailPrice: number
  categoryId: string
  subcategoryId: string | null
  brandId: string | null
  unitOfMeasurement: string | null
  packageSize: number | null
  casePackCount: number | null
  storageType: string | null
}

const UNITS_OF_MEASUREMENT = [
  'oz',
  'lb',
  'g',
  'kg',
  'ml',
  'l',
  'gal',
  'cup',
  'tbsp',
  'tsp',
  'each',
  'pack',
]

const STORAGE_TYPES = [
  'Refrigerated',
  'Frozen',
  'Dry/Shelf-stable',
  'Room Temperature',
]

export default function ProductForm({
  product,
  categories,
  subcategories,
  brands,
}: {
  product?: Product
  categories: Category[]
  subcategories: Subcategory[]
  brands: Brand[]
}) {
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    if (product) {
      await updateProduct(product.id, formData)
    } else {
      await createProduct(formData)
    }
    router.push('/products')
    router.refresh()
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="sku" className="block text-sm font-medium text-gray-300 mb-1.5">
          SKU
        </label>
        <input
          type="text"
          id="sku"
          name="sku"
          defaultValue={product?.sku || ''}
          required
          className="w-full px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1.5">
          Product Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          defaultValue={product?.name || ''}
          required
          className="w-full px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1.5">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={product?.description || ''}
          rows={3}
          className="w-full px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium text-gray-300 mb-1.5">
            Category
          </label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={product?.categoryId || ''}
            required
            className="w-full px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="subcategoryId" className="block text-sm font-medium text-gray-300 mb-1.5">
            Subcategory (Optional)
          </label>
          <select
            id="subcategoryId"
            name="subcategoryId"
            defaultValue={product?.subcategoryId || ''}
            className="w-full px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Subcategory</option>
            {subcategories.map((subcategory) => (
              <option key={subcategory.id} value={subcategory.id}>
                {subcategory.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="brandId" className="block text-sm font-medium text-gray-300 mb-1.5">
          Brand (Optional)
        </label>
        <select
          id="brandId"
          name="brandId"
          defaultValue={product?.brandId || ''}
          className="w-full px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Brand</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="packageSize" className="block text-sm font-medium text-gray-300 mb-1.5">
            Package Size (Optional)
          </label>
          <input
            type="number"
            step="0.01"
            id="packageSize"
            name="packageSize"
            defaultValue={product?.packageSize || ''}
            className="w-full px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="unitOfMeasurement" className="block text-sm font-medium text-gray-300 mb-1.5">
            Unit (Optional)
          </label>
          <select
            id="unitOfMeasurement"
            name="unitOfMeasurement"
            defaultValue={product?.unitOfMeasurement || ''}
            className="w-full px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Unit</option>
            {UNITS_OF_MEASUREMENT.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="casePackCount" className="block text-sm font-medium text-gray-300 mb-1.5">
            Case Pack Count (Optional)
          </label>
          <input
            type="number"
            id="casePackCount"
            name="casePackCount"
            defaultValue={product?.casePackCount || ''}
            className="w-full px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="storageType" className="block text-sm font-medium text-gray-300 mb-1.5">
          Storage Type (Optional)
        </label>
        <select
          id="storageType"
          name="storageType"
          defaultValue={product?.storageType || ''}
          className="w-full px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Storage Type</option>
          {STORAGE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="cost" className="block text-sm font-medium text-gray-300 mb-1.5">
            Cost
          </label>
          <input
            type="number"
            step="0.01"
            id="cost"
            name="cost"
            defaultValue={product?.cost || ''}
            required
            className="w-full px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="retailPrice" className="block text-sm font-medium text-gray-300 mb-1.5">
            Retail Price
          </label>
          <input
            type="number"
            step="0.01"
            id="retailPrice"
            name="retailPrice"
            defaultValue={product?.retailPrice || ''}
            required
            className="w-full px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
      >
        {product ? 'Update Product' : 'Create Product'}
      </button>
    </form>
  )
}