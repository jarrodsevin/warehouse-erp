import { prisma } from '@/prisma/prisma.config'
import VendorUpdateClient from '@/app/components/VendorUpdateClient'

export default async function UpdateVendorsPage() {
  const vendors = await prisma.vendor.findMany({
    orderBy: { name: 'asc' }
  })

  return <VendorUpdateClient vendors={vendors} />
}