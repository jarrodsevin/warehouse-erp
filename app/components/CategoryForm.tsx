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
        <label className="block text-white font-medium mb-1.5">Category Name</label>
        <input
          type="text"
          name="name"
          defaultValue={category?.name}
          required
          className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          placeholder="Enter category name"
        />
      </div>

      <div className="flex gap-4 pt-2">
        <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
          {category ? 'Update' : 'Create'} Category
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/categories')}
          className="px-6 py-2.5 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}