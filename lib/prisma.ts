import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configure for serverless WebSocket
neonConfig.webSocketConstructor = ws;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set. Check your .env.local file.');
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  (() => {
    const pool = new Pool({ connectionString: databaseUrl });
    const adapter = new PrismaNeon(pool);
    return new PrismaClient({ adapter });
  })();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;