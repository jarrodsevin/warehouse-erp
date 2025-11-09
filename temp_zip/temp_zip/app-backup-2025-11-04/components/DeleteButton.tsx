'use client'

import { useRouter } from 'next/navigation'

type DeleteButtonProps = {
  id: string
  deleteAction: (id: string) => Promise<void>
  itemName: string
}

export default function DeleteButton({ id, deleteAction, itemName }: DeleteButtonProps) {
  const router = useRouter()

  async function handleDelete() {
    if (confirm(`Are you sure you want to delete "${itemName}"?`)) {
      await deleteAction(id)
      router.refresh()
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors font-medium"
    >
      Delete
    </button>
  )
}