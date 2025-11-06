'use client'

import { useRouter } from 'next/navigation'
import { createCategory, updateCategory } from '@/app/actions/categories'

type CategoryFormProps = {
  category?: any
}

export default function CategoryForm({ category }: CategoryFormProps) {
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    if (category) {
      await updateCategory(category.id, formData)
    } else {
      await createCategory(formData)
    }
    
    router.push('/admin/categories')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Category Name</label>
        <input
          type="text"
          name="name"
          defaultValue={category?.name}
          required
          className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Enter category name"
        />
      </div>

      <div className="flex gap-4 pt-2">
        <button type="submit" className="px-6 py-2.5 bg-blue-600 text-sm font-medium text-gray-700 rounded-lg hover:bg-blue-700 transition-colors">
          {category ? 'Update' : 'Create'} Category
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/categories')}
          className="px-6 py-2.5 bg-gray-700 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
