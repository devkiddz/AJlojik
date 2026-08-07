import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../../lib/generated/prisma/client';

const connectionString =
  process.env.DIRECT_URL?.trim() ||
  process.env.DATABASE_URL?.trim();

if (
  !connectionString ||
  (
    !connectionString.startsWith('postgres://') &&
    !connectionString.startsWith('postgresql://')
  )
) {
  throw new Error(
    'DIRECT_URL must contain the direct PostgreSQL connection URL before running the seed engine.'
  );
}

const adapter = new PrismaPg({
  connectionString,
  max: 2,
  connectionTimeoutMillis: 15_000,
  idleTimeoutMillis: 10_000
});

export const prisma = new PrismaClient({
  adapter
});
