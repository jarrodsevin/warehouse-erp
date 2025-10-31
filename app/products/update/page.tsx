import Link from 'next/link'
import { prisma } from '@/prisma/prisma.config'
import ProductUpdateClient from '@/app/components/ProductUpdateClient'

export default async function UpdateProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { name: 'asc' }
  })

  return <ProductUpdateClient products={products} />
}