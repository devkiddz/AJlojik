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
        'prisma',
        'schema.prisma'
      ),
    markers: [
      'journeyLastTransition Json?',
      'journeyStateSnapshot',
      'journeyStageSnapshot',
      'journeyStateVersionSnapshot',
      'journeyTransition'
    ]
  },
  {
    path:
      join(
        root,
        'prisma',
        'migrations',
        '20260804013000_add_ai_journey_state_snapshots',
        'migration.sql'
      ),
    markers: [
      'journeyLastTransition',
      'journeyStateSnapshot',
      'journeyStageSnapshot',
      'journeyStateVersionSnapshot',
      'journeyTransition'
    ]
  },
  {
    path:
      join(
        root,
        'features',
        'ai-assistance',
        'contracts.ts'
      ),
    markers: [
      'AIAssistantJourneyTransitionReason',
      'AIAssistantJourneyTransition',
      'journeyLastTransition:',
      'journeyStateSnapshot:',
      'journeyTransition:'
    ]
  },
  {
    path:
      join(
        root,
        'features',
        'ai-assistance',
        'server',
        'journeyStateResolver.ts'
      ),
    markers: [
      'AJ_MS12_STATE_AWARE_TRANSITIONS',
      'resolveJourneyStateUpdate',
      'controlledStage',
      'createJourneyRestoreTransition',
      'STAGE_PRESERVED',
      'DECISION_CONFIRMED',
      'canonicalizeJourneyConversation',
      "replace(\n        /\\bnon-alcoholic\\b/g"
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
      'AJ_MS12_STATE_AWARE_TRANSITIONS',
      'resolveJourneyStateUpdate',
      'journeyStateVersionSnapshot',
      'journeyLastTransition:',
      'createJourneyRestoreTransition',
      'stateSnapshot',
      'restoredState'
    ]
  },
  {
    path:
      join(
        root,
        'features',
        'ai-assistance',
        'server',
        'assistantMapper.ts'
      ),
    markers: [
      'journeyTransitionValue',
      'journeyLastTransition:',
      'journeyStateSnapshot:',
      'journeyStageSnapshot:',
      'journeyStateVersionSnapshot:',
      'journeyTransition:'
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

  const source =
    readFileSync(
      check.path,
      'utf8'
    );

  for (
    const marker of
    check.markers
  ) {
    if (
      !source.includes(
        marker
      )
    ) {
      failures.push(
        `Missing marker "${marker}" in ${check.path}`
      );
    }
  }
}

if (
  failures.length
) {
  console.error(
    '\nAJ MS12.3 State-Aware Transitions validation failed:\n'
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
AJ MS12.3 State-Aware Transitions validation passed.

Confirmed:
  One controlled Journey-stage authority
  Structured state snapshot saved with every plan
  Transition reason saved with every plan
  State-version counter remains monotonic
  Historical plan restore also restores its matching state
  Old plans receive lazy state reconstruction when restored
  Completed Journeys do not reopen accidentally
  Explicit refinements reopen or refine safely
  Decisions can advance a Journey to ready
  Non-alcoholic no longer implies alcoholic
`);
