import {
  createHash
} from 'node:crypto';

import {
  existsSync,
  readFileSync
} from 'node:fs';

const ORIGINAL_MIGRATION =
  'prisma/migrations/20260803090000_add_support_knowledge_foundation/migration.sql';

const UPGRADE_MIGRATION =
  'prisma/migrations/20260803124500_upgrade_support_knowledge_resolution/migration.sql';

const ORIGINAL_MIGRATION_SHA256 =
  '773c06c43af0d34486e6a76bcf6db2e3ead30077f659b276c715f70796ace2a5';

const requiredFiles = [
  'prisma/schema.prisma',
  ORIGINAL_MIGRATION,
  UPGRADE_MIGRATION,
  'features/support/supportKnowledgeTypes.ts',
  'features/support/server/supportKnowledgeRepository.ts',
  'features/support/server/supportKnowledgeSeedCatalog.ts',
  'features/support/server/supportKnowledgeText.ts',
  'prisma/seeds/support-knowledge.seed.ts',
  'scripts/verify-support-knowledge-runtime.ts'
];

for (const path of requiredFiles) {
  if (!existsSync(path)) {
    throw new Error(
      `Missing Support Knowledge foundation file: ${path}`
    );
  }
}

const originalMigrationBytes =
  readFileSync(ORIGINAL_MIGRATION);

const originalMigrationHash =
  createHash('sha256')
    .update(originalMigrationBytes)
    .digest('hex');

if (
  originalMigrationHash !==
  ORIGINAL_MIGRATION_SHA256
) {
  throw new Error(
    'The immutable original Support Knowledge migration has been modified.'
  );
}

const schema =
  readFileSync(
    'prisma/schema.prisma',
    'utf8'
  );

for (const contract of [
  'model SupportKnowledgeBucket',
  'enum SupportKnowledgeStatus',
  'enum SupportKnowledgeInteractionOutcome',
  'model SupportKnowledgeEntry',
  'model SupportKnowledgeQuestionExample',
  'model SupportKnowledgeInteraction',
  'supportKnowledgeBucketId String?',
  'onDelete: SetNull',
  '@@index([supportKnowledgeBucketId, priority])',
  '@@map("support_knowledge_entry")',
  '@@map("support_knowledge_interaction")'
]) {
  if (!schema.includes(contract)) {
    throw new Error(
      `Prisma Support Knowledge contract is missing: ${contract}`
    );
  }
}

const upgradeMigration =
  readFileSync(
    UPGRADE_MIGRATION,
    'utf8'
  );

for (const contract of [
  'RENAME COLUMN "bucketId" TO "supportKnowledgeBucketId"',
  'RENAME COLUMN "answer" TO "answerTemplate"',
  '"support_knowledge_question_example"',
  '"support_knowledge_interaction"',
  'DROP COLUMN "sampleQuestions"',
  'ON DELETE SET NULL'
]) {
  if (!upgradeMigration.includes(contract)) {
    throw new Error(
      `Support Knowledge upgrade migration is missing: ${contract}`
    );
  }
}

const seed =
  readFileSync(
    'prisma/seeds/support-knowledge.seed.ts',
    'utf8'
  );

for (const contract of [
  'supportKnowledgeBucket.upsert',
  "AUTO_SUPPORT_BUCKET_SLUG = 'auto-support'",
  'supportKnowledgeBucketId: bucket.id'
]) {
  if (!seed.includes(contract)) {
    throw new Error(
      `Support Knowledge seed is missing: ${contract}`
    );
  }
}

const packageJson =
  JSON.parse(
    readFileSync(
      'package.json',
      'utf8'
    )
  );

if (
  packageJson.scripts?.[
    'verify:support-knowledge-foundation'
  ] !==
  'node scripts/verify-support-knowledge-foundation.mjs'
) {
  throw new Error(
    'package.json is missing verify:support-knowledge-foundation.'
  );
}

if (
  packageJson.scripts?.[
    'verify:support-knowledge-runtime'
  ] !==
  'tsx scripts/verify-support-knowledge-runtime.ts'
) {
  throw new Error(
    'package.json is missing verify:support-knowledge-runtime.'
  );
}

console.log(
  'AJ Logik Support Knowledge migration history and schema contract are complete.'
);

console.log(
  'Validated the immutable original migration, forward upgrade migration, bucket-preserving seed and runtime verifier.'
);
