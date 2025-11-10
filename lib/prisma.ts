import { PrismaClient } from "@prisma/client";

console.log('=== Prisma Init ===');
console.log('VERCEL:', process.env.VERCEL);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

let prismaClient: PrismaClient;

// Check if running on Vercel
if (process.env.VERCEL) {
  console.log('Using Neon adapter (Vercel environment)');
  // Import adapter modules only on Vercel
  const { PrismaNeon } = require("@prisma/adapter-neon");
  const { Pool, neonConfig } = require("@neondatabase/serverless");
  
  // Set WebSocket for serverless environment
  if (typeof WebSocket === 'undefined') {
    neonConfig.webSocketConstructor = require('ws');
  }
  
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaNeon(pool);
  
  prismaClient = new PrismaClient({ adapter });
} else {
  console.log('Using direct connection (local environment)');
  // Local development - direct connection
  prismaClient = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });
}

export const prisma = globalForPrisma.prisma ?? prismaClient;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;