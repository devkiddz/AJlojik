import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '@/lib/generated/prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is missing.');
}

const adapter = new PrismaPg({
  connectionString
});

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaSchemaVersion?: string;
};

const PRISMA_SCHEMA_VERSION = '20260729110000';

function supportsCurrentSchema(client: PrismaClient | undefined, schemaVersion: string | undefined): client is PrismaClient {
  if (!client || schemaVersion !== PRISMA_SCHEMA_VERSION) return false;

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

const cachedClient = globalForPrisma.prisma;

// Turbopack preserves globalThis during development reloads. After `prisma
// generate`, that can leave an old in-memory client without newly generated
// delegates. Replace it instead of allowing `undefined.findMany` at runtime.
export const prisma = supportsCurrentSchema(cachedClient, globalForPrisma.prismaSchemaVersion)
  ? cachedClient
  : new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaSchemaVersion = PRISMA_SCHEMA_VERSION;
}
