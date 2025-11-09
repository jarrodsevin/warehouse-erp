'use server'

import { prisma } from '@/prisma/prisma.config'
import { revalidatePath } from 'next/cache'

export async function createBrand(formData: FormData) {
  const brand = await prisma.brand.create({
    data: {
      name: formData.get('name') as string,
    },
  })

  revalidatePath('/admin/brands')
  return brand
}

export async function updateBrand(id: string, formData: FormData) {
  const brand = await prisma.brand.update({
    where: { id },
    data: {
      name: formData.get('name') as string,
    },
  })

  revalidatePath('/admin/brands')
  return brand
}

export async function getBrands() {
  return prisma.brand.findMany({
    orderBy: {
      name: 'asc',
    },
  })
}

export async function getBrand(id: string) {
  return prisma.brand.findUnique({
    where: { id },
  })
}