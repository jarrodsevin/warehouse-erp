import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool, neonConfig } from '@neondatabase/serverless'
import ws from 'ws'

// Configure WebSocket for Node.js environment
if (typeof window === 'undefined') {
  neonConfig.webSocketConstructor = ws
}

const databaseUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_hLy07adclIGB@ep-quiet-dust-ah0i6oxm-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require'

const pool = new Pool({ connectionString: databaseUrl })
const adapter = new PrismaNeon(pool)

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ 
    adapter,
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}