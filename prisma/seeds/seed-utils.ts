import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../../lib/generated/prisma/client';

const connectionCandidates = [
  process.env.AJLOJIK_DB_DATABASE_URL,
  process.env.AJLOJIK_DB_POSTGRES_URL,
  process.env.DATABASE_URL,
  process.env.POSTGRES_URL
].filter((value): value is string => Boolean(value));

const tcpConnectionStrings = connectionCandidates.filter(
  value =>
    value.startsWith('postgres://') ||
    value.startsWith('postgresql://')
);

const connectionString =
  tcpConnectionStrings.find(value =>
    value.includes('@db.prisma.io')
  ) ?? tcpConnectionStrings[0];

if (!connectionString) {
  throw new Error(
    'A PostgreSQL TCP connection URL is required to run the seed engine.'
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