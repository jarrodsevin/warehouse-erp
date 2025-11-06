'use server'

import { prisma } from '@/prisma/prisma.config'
import { revalidatePath } from 'next/cache'

export async function createSubcategory(formData: FormData) {
  const subcategory = await prisma.subcategory.create({
    data: {
      name: formData.get('name') as string,
    },
  })

  revalidatePath('/admin/subcategories')
  return subcategory
}

export async function updateSubcategory(id: string, formData: FormData) {
  const subcategory = await prisma.subcategory.update({
    where: { id },
    data: {
      name: formData.get('name') as string,
    },
  })

  revalidatePath('/admin/subcategories')
  return subcategory
}

export async function getSubcategories() {
  return prisma.subcategory.findMany({
    orderBy: {
      name: 'asc',
    },
  })
}

export async function getSubcategory(id: string) {
  return prisma.subcategory.findUnique({
    where: { id },
  })
}