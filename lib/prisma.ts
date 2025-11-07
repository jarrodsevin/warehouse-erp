import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set. Check your .env.local file.');
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaNeon(pool);

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;