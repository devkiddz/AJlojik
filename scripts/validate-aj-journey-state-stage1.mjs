import {
  existsSync,
  readFileSync
} from 'node:fs';

import {
  join
} from 'node:path';

const root =
  process.cwd();

const schemaPath =
  join(
    root,
    'prisma',
    'schema.prisma'
  );

const failures = [];

if (
  !existsSync(
    schemaPath
  )
) {
  failures.push(
    `Missing file: ${schemaPath}`
  );
} else {
  const schema =
    readFileSync(
      schemaPath,
      'utf8'
    );

  const schemaPatterns = [
    {
      label:
        'journeyState Json?',
      pattern:
        /\bjourneyState\s+Json\?/
    },
    {
      label:
        'journeyStateVersion Int',
      pattern:
        /\bjourneyStateVersion\s+Int\b/
    },
    {
      label:
        'journeyStage String',
      pattern:
        /\bjourneyStage\s+String\b/
    },
    {
      label:
        'journeyStateUpdatedAt DateTime?',
      pattern:
        /\bjourneyStateUpdatedAt\s+DateTime\?/
    }
  ];

  for (
    const check of
    schemaPatterns
  ) {
    if (
      !check.pattern.test(
        schema
      )
    ) {
      failures.push(
        `Missing schema field "${check.label}" in ${schemaPath}`
      );
    }
  }
}

const checks = [
  {
    path:
      join(
        root,
        'prisma',
        'migrations',
        '20260803232500_add_ai_journey_state',
        'migration.sql'
      ),
    markers: [
      'ADD COLUMN "journeyState" JSONB',
      'ADD COLUMN "journeyStateVersion"',
      'ADD COLUMN "journeyStage"'
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
      'AIAssistantJourneyStage',
      'AIAssistantJourneyState',
      'journeyStateVersion:',
      'journeyState:'
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
      'AJ_JOURNEY_STATE_ENGINE_STAGE_1',
      'resolveJourneyState',
      'confirmedDecisions',
      'unresolvedQuestions'
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
      'resolveJourneyState',
      'journeyStateSource',
      'journeyStateVersion:',
      'journeyStateUpdatedAt:'
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
      'journeyStateValue',
      'journeyStage:',
      'journeyStateVersion:',
      'journeyState:'
    ]
  },
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
      'State v',
      'activeSession.journeyStage'
    ]
  }
];

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
        `Missing marker "${marker}" in ${check.path}`
      );
    }
  }
}

if (
  failures.length
) {
  console.error(
    '\nAJ Journey State Engine Stage 1 validation failed:\n'
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
AJ Journey State Engine Stage 1 validation passed.

Confirmed:
  Persistent structured Journey state
  Objective and confirmed context
  Constraints and preferences
  Confirmed decisions and rejected directions
  Unresolved questions and assumptions
  Durable Journey-stage and state versions
  Repository state resolution after every response
  Runtime stage and state-version visibility
`);
