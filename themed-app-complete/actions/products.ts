'use server'

import { prisma } from '@/prisma/prisma.config'
import { revalidatePath } from 'next/cache'

function calculateMargin(cost: number, retail: number): number {
  if (retail === 0) return 0
  return ((retail - cost) / retail) * 100
}

export async function createProduct(formData: FormData) {
  const cost = parseFloat(formData.get('cost') as string)
  const retailPrice = parseFloat(formData.get('retailPrice') as string)
  const description = formData.get('description') as string
  const subcategoryId = formData.get('subcategoryId') as string
  const brandId = formData.get('brandId') as string
  const unitOfMeasurement = formData.get('unitOfMeasurement') as string
  const packageSize = formData.get('packageSize') as string
  const casePackCount = formData.get('casePackCount') as string
  const storageType = formData.get('storageType') as string

  const product = await prisma.product.create({
    data: {
      sku: formData.get('sku') as string,
      name: formData.get('name') as string,
      description: description || null,
      cost,
      retailPrice,
      categoryId: formData.get('categoryId') as string,
      subcategoryId: subcategoryId || null,
      brandId: brandId || null,
      unitOfMeasurement: unitOfMeasurement || null,
      packageSize: packageSize ? parseFloat(packageSize) : null,
      casePackCount: casePackCount ? parseInt(casePackCount) : null,
      storageType: storageType || null,
    },
  })

  // Create initial changelog entry
  await prisma.productChangeLog.create({
    data: {
      productId: product.id,
      changeType: 'created',
      newCost: cost,
      newRetail: retailPrice,
      newMargin: calculateMargin(cost, retailPrice),
      newDescription: description || null,
    },
  })

  revalidatePath('/products')
  return product
}

export async function updateProduct(id: string, formData: FormData | any) {
  // Get existing product
  const existingProduct = await prisma.product.findUnique({
    where: { id },
  })

  if (!existingProduct) {
    throw new Error('Product not found')
  }

  // Handle both FormData and regular objects
  const getData = (key: string) => {
    if (formData instanceof FormData) {
      return formData.get(key) as string
    }
    return formData[key]
  }

  const newCost = parseFloat(getData('cost'))
  const newRetail = parseFloat(getData('retailPrice'))
  const newDescription = getData('description')
  const newSku = getData('sku')
  const newName = getData('name')
  const newCategoryId = getData('categoryId')
  const subcategoryId = getData('subcategoryId')
  const brandId = getData('brandId')
  const unitOfMeasurement = getData('unitOfMeasurement')
  const packageSize = getData('packageSize')
  const casePackCount = getData('casePackCount')
  const storageType = getData('storageType')

  const oldMargin = calculateMargin(existingProduct.cost, existingProduct.retailPrice)
  const newMargin = calculateMargin(newCost, newRetail)

  // Determine change type - check if anything actually changed
  let changeType = 'updated'
  const priceChanged = newCost !== existingProduct.cost || newRetail !== existingProduct.retailPrice
  const descriptionChanged = newDescription !== existingProduct.description
  
  if (priceChanged) {
    if (newRetail > existingProduct.retailPrice) {
      changeType = 'price_increase'
    } else if (newRetail < existingProduct.retailPrice) {
      changeType = 'price_decrease'
    } else if (newCost !== existingProduct.cost) {
      // Cost changed but retail stayed same
      changeType = 'cost_change'
    }
  } else if (descriptionChanged) {
    changeType = 'description_update'
  }

  // Update product
  const product = await prisma.product.update({
    where: { id },
    data: {
      sku: newSku,
      name: newName,
      description: newDescription || null,
      cost: newCost,
      retailPrice: newRetail,
      categoryId: newCategoryId,
      subcategoryId: subcategoryId || null,
      brandId: brandId || null,
      unitOfMeasurement: unitOfMeasurement || null,
      packageSize: packageSize ? parseFloat(packageSize) : null,
      casePackCount: casePackCount ? parseInt(casePackCount) : null,
      storageType: storageType || null,
    },
  })

  // Create changelog entry
  await prisma.productChangeLog.create({
    data: {
      productId: id,
      changeType,
      oldCost: existingProduct.cost,
      newCost,
      oldRetail: existingProduct.retailPrice,
      newRetail,
      oldMargin,
      newMargin,
      oldDescription: existingProduct.description,
      newDescription: newDescription || null,
    },
  })

  revalidatePath('/products')
  return product
}

export async function getProducts() {
  return prisma.product.findMany({
    include: {
      category: true,
      subcategory: true,
      brand: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export async function getProduct(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      subcategory: true,
      brand: true,
      changeLogs: {
        orderBy: {
          changedAt: 'desc',
        },
      },
    },
  })
}