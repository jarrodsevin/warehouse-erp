'use client'

import { createSubcategory, updateSubcategory } from '@/app/actions/subcategories'
import { useRouter } from 'next/navigation'

type Subcategory = {
  id: string
  name: string
}

export default function SubcategoryForm({ subcategory }: { subcategory?: Subcategory }) {
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    if (subcategory) {
      await updateSubcategory(subcategory.id, formData)
    } else {
      await createSubcategory(formData)
    }
    router.push('/admin/subcategories')
    router.refresh()
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1.5">
          Subcategory Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          defaultValue={subcategory?.name || ''}
          required
          className="w-full px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />
      </div>

      <button
        type="submit"
        className="w-full px-4 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-medium rounded-lg transition-colors"
      >
        {subcategory ? 'Update Subcategory' : 'Create Subcategory'}
      </button>
    </form>
  )
}