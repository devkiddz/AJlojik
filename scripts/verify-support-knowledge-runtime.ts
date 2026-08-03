import {
  prisma
} from '../prisma/seeds/seed-utils';

import {
  AJ_LOGIK_SUPPORT_KNOWLEDGE_SEED
} from '../features/support/server/supportKnowledgeSeedCatalog';

type ColumnRow = {
  column_name: string;
};

type MigrationRow = {
  migration_name: string;
  finished_at: Date | null;
  rolled_back_at: Date | null;
};

async function main(): Promise<void> {
  const requiredColumns =
    new Set([
      'supportKnowledgeBucketId',
      'category',
      'primaryQuestion',
      'answerTemplate',
      'clarificationAnswer',
      'escalationAnswer',
      'synonyms',
      'requiredContext',
      'conditions',
      'status',
      'confidenceThreshold',
      'version',
      'archivedAt'
    ]);

  const legacyColumns =
    new Set([
      'bucketId',
      'answer',
      'followUp',
      'sampleQuestions',
      'active',
      'verified'
    ]);

  const columns =
    await prisma.$queryRawUnsafe<ColumnRow[]>(
      `
        SELECT "column_name"
        FROM "information_schema"."columns"
        WHERE
          "table_schema" = 'public'
          AND "table_name" = 'support_knowledge_entry'
        ORDER BY "ordinal_position"
      `
    );

  const columnNames =
    new Set(
      columns.map(
        row =>
          row.column_name
      )
    );

  for (const column of requiredColumns) {
    if (!columnNames.has(column)) {
      throw new Error(
        `Runtime Support Knowledge column is missing: ${column}`
      );
    }
  }

  for (const column of legacyColumns) {
    if (columnNames.has(column)) {
      throw new Error(
        `Legacy Support Knowledge column still exists: ${column}`
      );
    }
  }

  const migrations =
    await prisma.$queryRawUnsafe<MigrationRow[]>(
      `
        SELECT
          "migration_name",
          "finished_at",
          "rolled_back_at"
        FROM "_prisma_migrations"
        WHERE "migration_name" IN (
          '20260803090000_add_support_knowledge_foundation',
          '20260803124500_upgrade_support_knowledge_resolution'
        )
        ORDER BY "migration_name"
      `
    );

  const applied =
    new Set(
      migrations
        .filter(
          migration =>
            migration.finished_at &&
            !migration.rolled_back_at
        )
        .map(
          migration =>
            migration.migration_name
        )
    );

  for (const migrationName of [
    '20260803090000_add_support_knowledge_foundation',
    '20260803124500_upgrade_support_knowledge_resolution'
  ]) {
    if (!applied.has(migrationName)) {
      throw new Error(
        `Support Knowledge migration is not applied: ${migrationName}`
      );
    }
  }

  const activeWorkspaces =
    await prisma.workspace.count({
      where: {
        active: true
      }
    });

  const expectedPerWorkspace =
    AJ_LOGIK_SUPPORT_KNOWLEDGE_SEED.filter(
      item =>
        (
          item.status ??
          'ACTIVE'
        ) ===
        'ACTIVE'
    ).length;

  const [
    activeEntries,
    questionExamples,
    activeBuckets
  ] =
    await Promise.all([
      prisma.supportKnowledgeEntry.count({
        where: {
          status: 'ACTIVE'
        }
      }),
      prisma.supportKnowledgeQuestionExample.count({
        where: {
          active: true
        }
      }),
      prisma.supportKnowledgeBucket.count({
        where: {
          slug: 'auto-support',
          active: true
        }
      })
    ]);

  const expectedActiveEntries =
    activeWorkspaces *
    expectedPerWorkspace;

  if (
    activeEntries <
    expectedActiveEntries
  ) {
    throw new Error(
      `Expected at least ${expectedActiveEntries} active Support Knowledge entries, found ${activeEntries}.`
    );
  }

  if (
    activeBuckets <
    activeWorkspaces
  ) {
    throw new Error(
      `Expected an active auto-support bucket for each active workspace. Found ${activeBuckets} for ${activeWorkspaces} workspaces.`
    );
  }

  if (
    questionExamples <
    activeEntries
  ) {
    throw new Error(
      `Expected relational question examples for active knowledge. Found ${questionExamples} examples for ${activeEntries} entries.`
    );
  }

  const sample =
    await prisma.supportKnowledgeEntry.findFirst({
      where: {
        status: 'ACTIVE'
      },
      include: {
        supportKnowledgeBucket: true,
        questionExamples: {
          where: {
            active: true
          }
        }
      }
    });

  if (
    !sample ||
    !sample.supportKnowledgeBucket ||
    !sample.questionExamples.length
  ) {
    throw new Error(
      'The runtime could not load a complete active Support Knowledge entry.'
    );
  }

  console.log(
    'AJ Logik Support Knowledge runtime is healthy.'
  );

  console.log(
    `Validated ${activeEntries} active entries, ${questionExamples} examples and ${activeBuckets} auto-support buckets across ${activeWorkspaces} active workspaces.`
  );
}

main()
  .catch(cause => {
    console.error(cause);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
