'use server'

import { prisma } from '@/prisma/prisma.config'
import { revalidatePath } from 'next/cache'

export async function createCategory(formData: FormData) {
  const category = await prisma.category.create({
    data: {
      name: formData.get('name') as string,
    },
  })

  revalidatePath('/admin/categories')
  return category
}

export async function updateCategory(id: string, formData: FormData) {
  const category = await prisma.category.update({
    where: { id },
    data: {
      name: formData.get('name') as string,
    },
  })

  revalidatePath('/admin/categories')
  return category
}

export async function getCategories() {
  return prisma.category.findMany({
    orderBy: {
      name: 'asc',
    },
  })
}

export async function getCategory(id: string) {
  return prisma.category.findUnique({
    where: { id },
  })
}