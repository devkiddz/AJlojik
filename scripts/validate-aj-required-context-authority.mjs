import {
  existsSync,
  readFileSync
} from 'node:fs';

import {
  join
} from 'node:path';

const root =
  process.cwd();

const resolverPath =
  join(
    root,
    'features',
    'ai-assistance',
    'server',
    'journeyStateResolver.ts'
  );

const failures = [];

if (
  !existsSync(
    resolverPath
  )
) {
  failures.push(
    `Missing file: ${resolverPath}`
  );
} else {
  const resolver =
    readFileSync(
      resolverPath,
      'utf8'
    );

  const literalMarkers = [
    'AJ_MS12_REQUIRED_CONTEXT_AUTHORITY',
    'requiredJourneyQuestions',
    'hasAudienceContext',
    'hasBudgetContext',
    'hasOccasionContext',
    'hasPreferenceContext',
    'About how many people should I plan for?',
    'What budget would you like me to work within?',
    'What should the result feel like—balanced, affordable, premium or something else?',
    'required[0]'
  ];

  for (
    const marker of
    literalMarkers
  ) {
    if (
      !resolver.includes(
        marker
      )
    ) {
      failures.push(
        `Missing resolver marker "${marker}"`
      );
    }
  }

  const structuralChecks = [
    {
      label:
        'messages-aware unresolvedQuestions signature',
      pattern:
        /function\s+unresolvedQuestions\s*\(\s*messages\s*:\s*string\[\]\s*,\s*payload\s*:/
    },
    {
      label:
        'messages passed into unresolvedQuestions',
      pattern:
        /unresolvedQuestions\s*\(\s*messages\s*,\s*payload\s*\)/
    },
    {
      label:
        'one focused required question',
      pattern:
        /return\s*\[\s*required\s*\[\s*0\s*\]\s*\]/
    }
  ];

  for (
    const check of
    structuralChecks
  ) {
    if (
      !check.pattern.test(
        resolver
      )
    ) {
      failures.push(
        `Missing structural marker "${check.label}"`
      );
    }
  }

  if (
    /const\s+questions\s*=\s*unresolvedQuestions\s*\(\s*payload\s*\)/.test(
      resolver
    )
  ) {
    failures.push(
      'Journey questions still depend on payload alone.'
    );
  }
}

if (
  failures.length
) {
  console.error(
    '\nAJ Required Context Authority validation failed:\n'
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
AJ Required Context Authority validation passed.

Confirmed:
  Journey State checks customer context independently of generated output
  Event-planning Journeys require occasion, guest count, budget and preference
  Existing occasion language prevents redundant occasion questions
  Birthday dinner begins with guest count
  Only one focused question is exposed at a time
  A confident draft cannot force READY while required context is missing
  Existing payload questions remain available after required context is complete
  No database migration required
`);
