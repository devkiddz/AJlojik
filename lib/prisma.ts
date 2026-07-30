import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '@/lib/generated/prisma/client';

const connectionCandidates = [
  process.env.AJLOJIK_DB_DATABASE_URL,
  process.env.AJLOJIK_DB_POSTGRES_URL,
  process.env.DATABASE_URL,
  process.env.POSTGRES_URL
].filter((value): value is string => Boolean(value));

const configuredConnectionString =
  connectionCandidates.find(
    value =>
      value.startsWith('postgres://') ||
      value.startsWith('postgresql://')
  );

if (!configuredConnectionString) {
  throw new Error(
    'A PostgreSQL TCP connection URL is missing.'
  );
}

/**
 * Prisma Postgres provides separate direct and pooled TCP hosts.
 *
 * Runtime traffic on Vercel must use the pooled host. The Vercel integration
 * may provide the direct TCP hostname, so convert it to the pooled runtime
 * hostname when necessary.
 *
 * Migration commands should continue using the unmodified URL through
 * prisma.config.ts.
 */
function resolveRuntimeConnectionString(
  connectionString: string
): string {
  if (
    process.env.NODE_ENV === 'production' &&
    connectionString.includes('@db.prisma.io') &&
    !connectionString.includes('@pooled.db.prisma.io')
  ) {
    return connectionString.replace(
      '@db.prisma.io',
      '@pooled.db.prisma.io'
    );
  }

  return connectionString;
}

const connectionString = resolveRuntimeConnectionString(
  configuredConnectionString
);

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaConnectionString?: string;
  prismaSchemaVersion?: string;
};

const PRISMA_SCHEMA_VERSION = '20260729110000';

function supportsCurrentSchema(
  client: PrismaClient | undefined,
  schemaVersion: string | undefined
): client is PrismaClient {
  if (
    !client ||
    schemaVersion !== PRISMA_SCHEMA_VERSION
  ) {
    return false;
  }

  return [
    'adminTodo',
    'adminApprovalRequest',
    'adminAuditEvent',
    'delivery',
    'staffProfile',
    'storefrontHero',
    'storeStudioCampaign',
    'storeStudioAsset',
    'mediaAsset',
    'vendorProfile',
    'storeCollection'
  ].every(delegate => delegate in client);
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    adapter: new PrismaPg({
      connectionString,

      // Every Vercel function instance owns its own local driver pool.
      // Keep it small and allow Prisma Postgres to handle external pooling.
      max: process.env.NODE_ENV === 'production' ? 1 : 5,
      connectionTimeoutMillis: 10_000,
      idleTimeoutMillis: 10_000
    })
  });
}

const cachedClient = globalForPrisma.prisma;

const canReuseCachedClient =
  globalForPrisma.prismaConnectionString ===
    connectionString &&
  supportsCurrentSchema(
    cachedClient,
    globalForPrisma.prismaSchemaVersion
  );

export const prisma = canReuseCachedClient
  ? cachedClient
  : createPrismaClient();

globalForPrisma.prisma = prisma;
globalForPrisma.prismaConnectionString =
  connectionString;
globalForPrisma.prismaSchemaVersion =
  PRISMA_SCHEMA_VERSION;