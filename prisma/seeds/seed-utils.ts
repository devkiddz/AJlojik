import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../lib/generated/prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required to run the seed engine.');
}

const adapter = new PrismaPg({
  connectionString
});

export const prisma = new PrismaClient({
  adapter
});