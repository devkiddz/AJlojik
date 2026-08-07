import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '@/lib/generated/prisma/client';

const connectionString =
  process.env.DATABASE_URL?.trim();

if (
  !connectionString ||
  (
    !connectionString.startsWith('postgres://') &&
    !connectionString.startsWith('postgresql://')
  )
) {
  throw new Error(
    'DATABASE_URL must contain the pooled PostgreSQL runtime connection URL.'
  );
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaConnectionString?: string;
  prismaSchemaVersion?: string;
};

const PRISMA_SCHEMA_VERSION = '20260803124500-support-knowledge-resolution';

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
    'notification',
    'notificationPreference',
    'notificationMute',
    'adminApprovalRequest',
    'adminAuditEvent',
    'delivery',
    'staffProfile',
    'storefrontHero',
    'storeStudioCampaign',
    'storeStudioAsset',
    'mediaAsset',
    'vendorProfile',
    'storeCollection',
    'supportKnowledgeBucket',
    'supportKnowledgeEntry',
    'supportKnowledgeQuestionExample',
    'supportKnowledgeInteraction'
  ].every(delegate => delegate in client);
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    adapter: new PrismaPg({
      connectionString,

      // Each Vercel function instance owns a local driver pool.
      // Keep it small and let the managed PostgreSQL pooler handle concurrency.
      max: process.env.NODE_ENV === 'production' ? 1 : 5,
      connectionTimeoutMillis: 15_000,
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
