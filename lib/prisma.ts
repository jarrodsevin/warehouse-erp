import { PrismaClient } from '@prisma/client'

// Use environment variable in production, hardcoded for local dev
const databaseUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_hLy07adclIGB@ep-quiet-dust-ah0i6oxm-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}