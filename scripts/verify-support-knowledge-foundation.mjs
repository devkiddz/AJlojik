import { existsSync, readFileSync } from 'node:fs';

const requiredFiles = [
  'prisma/schema.prisma',
  'prisma/migrations/20260803090000_add_support_knowledge_foundation/migration.sql',
  'features/support/supportKnowledgeTypes.ts',
  'features/support/server/supportKnowledgeRepository.ts',
  'features/support/server/supportKnowledgeSeedCatalog.ts',
  'prisma/seeds/support-knowledge.seed.ts'
];

for (const path of requiredFiles) {
  if (!existsSync(path)) {
    throw new Error(`Missing Support Knowledge foundation file: ${path}`);
  }
}

const schema = readFileSync('prisma/schema.prisma', 'utf8');
const schemaContracts = [
  'enum SupportKnowledgeStatus',
  'enum SupportKnowledgeInteractionOutcome',
  'model SupportKnowledgeEntry',
  'model SupportKnowledgeQuestionExample',
  'model SupportKnowledgeInteraction',
  '@@unique([workspaceId, slug])',
  '@@map("support_knowledge_entry")',
  '@@map("support_knowledge_interaction")'
];

for (const contract of schemaContracts) {
  if (!schema.includes(contract)) {
    throw new Error(`Prisma Support Knowledge contract is missing: ${contract}`);
  }
}

const migration = readFileSync(
  'prisma/migrations/20260803090000_add_support_knowledge_foundation/migration.sql',
  'utf8'
);

for (const table of [
  'support_knowledge_entry',
  'support_knowledge_question_example',
  'support_knowledge_interaction'
]) {
  if (!migration.includes(`"${table}"`)) {
    throw new Error(`Support Knowledge migration is missing table: ${table}`);
  }
}

const seed = readFileSync(
  'features/support/server/supportKnowledgeSeedCatalog.ts',
  'utf8'
);

for (const slug of [
  'what-is-aj-logik',
  'what-is-aj-liqz',
  'track-order',
  'payment-help',
  'alcohol-delivery-eligibility',
  'human-support'
]) {
  if (!seed.includes(slug)) {
    throw new Error(`Support Knowledge seed is missing: ${slug}`);
  }
}

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));

if (
  packageJson.scripts?.['verify:support-knowledge-foundation'] !==
  'node scripts/verify-support-knowledge-foundation.mjs'
) {
  throw new Error(
    'package.json is missing verify:support-knowledge-foundation.'
  );
}

console.log('AJ Logik Support Knowledge foundation is complete.');
console.log(
  'Validated 3 database models, the workspace-scoped migration, the seed catalogue and the verifier command.'
);
