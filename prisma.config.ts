import 'dotenv/config';

import { defineConfig } from 'prisma/config';

const connectionCandidates = [
  process.env.AJLOJIK_DB_POSTGRES_URL,
  process.env.AJLOJIK_DB_DATABASE_URL,
  process.env.DIRECT_URL,
  process.env.DATABASE_URL,
  process.env.POSTGRES_URL
].filter((value): value is string => Boolean(value));

const tcpConnectionStrings =
  connectionCandidates.filter(
    value =>
      value.startsWith('postgres://') ||
      value.startsWith('postgresql://')
  );

const migrationConnectionString =
  tcpConnectionStrings.find(value =>
    value.includes('@db.prisma.io')
  ) ?? tcpConnectionStrings[0];

if (!migrationConnectionString) {
  throw new Error(
    'A PostgreSQL migration connection URL is missing.'
  );
}

export default defineConfig({
  schema: 'prisma/schema.prisma',

  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts'
  },

  datasource: {
    url: migrationConnectionString
  }
});