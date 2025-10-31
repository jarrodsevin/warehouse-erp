'use client'

import { createBrand, updateBrand } from '@/app/actions/brands'
import { useRouter } from 'next/navigation'

type Brand = {
  id: string
  name: string
}

export default function BrandForm({ brand }: { brand?: Brand }) {
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    if (brand) {
      await updateBrand(brand.id, formData)
    } else {
      await createBrand(formData)
    }
    router.push('/admin/brands')
    router.refresh()
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1.5">
          Brand Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          defaultValue={brand?.name || ''}
          required
          className="w-full px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        className="w-full px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
      >
        {brand ? 'Update Brand' : 'Create Brand'}
      </button>
    </form>
  )
}