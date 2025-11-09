import { PrismaClient } from "@prisma/client";

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Vercel uses serverless, local uses Node.js
const isVercel = process.env.VERCEL === '1';

let prismaClient: PrismaClient;

if (isVercel) {
  // For Vercel: Use Neon serverless adapter
  const { PrismaNeon } = require("@prisma/adapter-neon");
  const { Pool, neonConfig } = require("@neondatabase/serverless");
  const ws = require("ws");
  
  neonConfig.webSocketConstructor = ws;
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaNeon(pool);
  
  prismaClient = new PrismaClient({ adapter });
} else {
  // For local: Use direct connection
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