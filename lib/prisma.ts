import { PrismaClient } from '@prisma/client'

// Use Neon adapter in production (Vercel), standard client in development
const isVercel = process.env.VERCEL === '1'

let prisma: PrismaClient

if (isVercel) {
  // Vercel production: Use Neon adapter (no binary engine)
  const { PrismaNeon } = require('@prisma/adapter-neon')
  const { Pool } = require('@neondatabase/serverless')
  
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaNeon(pool)
  
  prisma = new PrismaClient({ adapter })
} else {
  // Local development: Standard Prisma
  const databaseUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_hLy07adclIGB@ep-quiet-dust-ah0i6oxm-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require'
  
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  })
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prismaClient = globalForPrisma.prisma ?? prisma

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prismaClient
}

export { prismaClient as prisma }