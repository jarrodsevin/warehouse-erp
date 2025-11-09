import { PrismaClient } from '@prisma/client'

// Detect if we're in Vercel production
const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production'

let prisma: PrismaClient

if (isProduction) {
  // Production: Use Neon serverless adapter (no binary engine needed)
  const { PrismaNeon } = require('@prisma/adapter-neon')
  const { Pool, neonConfig } = require('@neondatabase/serverless')
  
  const databaseUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_hLy07adclIGB@ep-quiet-dust-ah0i6oxm-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require'
  
  const pool = new Pool({ connectionString: databaseUrl })
  const adapter = new PrismaNeon(pool)
  
  prisma = new PrismaClient({ adapter })
  
  console.log('✅ Prisma initialized with Neon adapter (production)')
} else {
  // Development: Use standard Prisma with binary engine
  const databaseUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_hLy07adclIGB@ep-quiet-dust-ah0i6oxm-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require'
  
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  })
  
  console.log('✅ Prisma initialized with standard client (development)')
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prismaClient = globalForPrisma.prisma ?? prisma

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prismaClient
}

export { prismaClient as prisma }