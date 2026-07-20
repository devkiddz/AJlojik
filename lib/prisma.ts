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
};

function supportsCurrentSchema(client: PrismaClient | undefined): client is PrismaClient {
  if (!client) return false;

  return ['adminTodo', 'adminApprovalRequest', 'adminAuditEvent', 'delivery', 'staffProfile', 'storefrontHero']
    .every(delegate => delegate in client);
}

const cachedClient = globalForPrisma.prisma;

// Turbopack preserves globalThis during development reloads. After `prisma
// generate`, that can leave an old in-memory client without newly generated
// delegates. Replace it instead of allowing `undefined.findMany` at runtime.
export const prisma = supportsCurrentSchema(cachedClient)
  ? cachedClient
  : new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
