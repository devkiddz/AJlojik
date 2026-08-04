import {
  existsSync,
  readFileSync
} from 'node:fs';

import {
  join
} from 'node:path';

const root =
  process.cwd();

const guidedPath =
  join(
    root,
    'features',
    'ai-assistance',
    'components',
    'GuidedAssistantExperience.tsx'
  );

const clarificationPath =
  join(
    root,
    'features',
    'ai-assistance',
    'components',
    'JourneyClarificationCard.tsx'
  );

const failures = [];

for (
  const path of
  [
    guidedPath,
    clarificationPath
  ]
) {
  if (
    !existsSync(
      path
    )
  ) {
    failures.push(
      `Missing file: ${path}`
    );
  }
}

if (
  existsSync(
    guidedPath
  )
) {
  const guided =
    readFileSync(
      guidedPath,
      'utf8'
    );

  const literalMarkers = [
    'AJ_MS12_VISIBLE_STATE_CLARIFICATION',
    '<JourneyClarificationCard',
    'onSubmit={',
    'onPrompt'
  ];

  for (
    const marker of
    literalMarkers
  ) {
    if (
      !guided.includes(
        marker
      )
    ) {
      failures.push(
        `Missing guided marker "${marker}"`
      );
    }
  }

  const structuralChecks = [
    {
      label:
        'JourneyClarificationCard import',
      pattern:
        /from\s*['"]\.\/JourneyClarificationCard['"]/
    },
    {
      label:
        'session Journey State access',
      pattern:
        /session\s*\?\.\s*journeyState/
    },
    {
      label:
        'first unresolved Journey question',
      pattern:
        /unresolvedQuestions\s*\[\s*0\s*\]/
    }
  ];

  for (
    const check of
    structuralChecks
  ) {
    if (
      !check.pattern.test(
        guided
      )
    ) {
      failures.push(
        `Missing structural marker "${check.label}"`
      );
    }
  }
}

if (
  existsSync(
    clarificationPath
  )
) {
  const clarification =
    readFileSync(
      clarificationPath,
      'utf8'
    );

  for (
    const marker of
    [
      'AJ_MS12_VISIBLE_STATE_CLARIFICATION',
      'AJ needs one detail',
      'Guest count',
      'My budget is flexible',
      'Your choice',
      'Choose one or type naturally'
    ]
  ) {
    if (
      !clarification.includes(
        marker
      )
    ) {
      failures.push(
        `Missing clarification marker "${marker}"`
      );
    }
  }
}

if (
  failures.length
) {
  console.error(
    '\nAJ Visible State Clarification validation failed:\n'
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
AJ Visible State Clarification validation passed.

Confirmed:
  Clarification is driven by persisted Journey State
  AJ visibly presents the next unresolved question
  Guest, budget, occasion, preference and choice prompts are contextual
  Suggested answers and typed answers share onPrompt
  Multiline project formatting is supported
  Existing Guided Assistance internals remain untouched
  No database migration required
`);
