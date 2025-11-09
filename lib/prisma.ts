import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool } from '@neondatabase/serverless';

declare global {
  var prisma: PrismaClient | undefined;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaNeon(pool);

export const prisma = global.prisma || new PrismaClient({ 
  adapter: adapter as any
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}