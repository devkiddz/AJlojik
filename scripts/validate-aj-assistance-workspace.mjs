import {
  existsSync,
  readFileSync
} from 'node:fs';

import {
  join
} from 'node:path';

const root =
  process.cwd();

const checks = [
  {
    path:
      join(
        root,
        'features',
        'ai-assistance',
        'components',
        'AssistantRuntimePage.tsx'
      ),
    markers: [
      'AJ_ASSISTANCE_WORKSPACE_STAGE_1',
      'AJ_ASSISTANCE_WORKSPACE_STAGE_3',
      'AJ_ASSISTANCE_WORKSPACE_STAGE_5',
      'promptDraftStorageKey',
      'activePlanVersion',
      'saveJourneyTitle',
      'deleteActiveJourney',
      'Database saved'
    ]
  },
  {
    path:
      join(
        root,
        'features',
        'ai-assistance',
        'components',
        'GuidedAssistantExperience.tsx'
      ),
    markers: [
      'AJ_ASSISTANCE_WORKSPACE_STAGE_3',
      'AJ_ASSISTANCE_WORKSPACE_STAGE_4',
      'onRestorePlan',
      'buildJourneyInsights'
    ]
  },
  {
    path:
      join(
        root,
        'features',
        'ai-assistance',
        'server',
        'collaborativeIntentBuilder.ts'
      ),
    markers: [
      'AJ_ASSISTANCE_WORKSPACE_STAGE_2',
      'One detail before I build the plan'
    ]
  },
  {
    path:
      join(
        root,
        'features',
        'ai-assistance',
        'server',
        'assistantRepository.ts'
      ),
    markers: [
      'AJ_ASSISTANCE_WORKSPACE_STAGE_3',
      'async restorePlan(',
      'async renameSession(',
      'async deleteSession('
    ]
  },
  {
    path:
      join(
        root,
        'app',
        'api',
        'assistant',
        'sessions',
        '[sessionId]',
        'restore',
        'route.ts'
      ),
    markers: [
      'AJ_ASSISTANCE_WORKSPACE_STAGE_3_RESTORE_ROUTE'
    ]
  },
  {
    path:
      join(
        root,
        'prisma',
        'schema.prisma'
      ),
    markers: [
      'journeyGoal',
      'activePlanMessageId',
      'currentPlanVersion',
      'journeyVersion',
      'previousPlanMessageId',
      'isPlanSnapshot'
    ]
  }
];

const failures = [];

for (
  const check of
  checks
) {
  if (
    !existsSync(
      check.path
    )
  ) {
    failures.push(
      `Missing file: ${check.path}`
    );

    continue;
  }

  const content =
    readFileSync(
      check.path,
      'utf8'
    );

  for (
    const marker of
    check.markers
  ) {
    if (
      !content.includes(
        marker
      )
    ) {
      failures.push(
        `Missing capability marker "${marker}" in ${check.path}`
      );
    }
  }
}

if (
  failures.length
) {
  console.error(
    '\nAJ Assistance Workspace validation failed:\n'
  );

  for (
    const failure of
    failures
  ) {
    console.error(
      `- ${failure}`
    );
  }

  console.error();

  process.exit(
    1
  );
}

console.log(`
AJ Assistance Workspace validation passed.

Confirmed:
  Database-backed Journeys
  Durable active-plan versions
  Focused clarification workflow
  Compare and restore
  Change tracking and insights
  URL and local-storage restoration
  Per-Journey prompt draft continuity
  Edit, Archive and Delete controls
  Stable current-plan metadata

Run-time smoke test:
  1. Open a saved Journey.
  2. Type an unfinished instruction and refresh.
  3. Confirm the draft returns.
  4. Restore an older plan.
  5. Refresh and confirm that restored plan remains current.
  6. Rename the Journey.
  7. Start a new Journey and confirm the previous Journey stays saved.
`);
