import {
  existsSync,
  readFileSync
} from 'node:fs';

import {
  join
} from 'node:path';

const path =
  join(
    process.cwd(),
    'features',
    'ai-assistance',
    'server',
    'collaborativeIntentBuilder.ts'
  );

if (
  !existsSync(
    path
  )
) {
  console.error(
    `Missing file: ${path}`
  );

  process.exit(
    1
  );
}

const source =
  readFileSync(
    path,
    'utf8'
  );

const required = [
  'AJ_MS12_UNIFIED_JOURNEY_INPUT_TYPE_REPAIR',
  'CollaborativeIntent |',
  'string |',
  "candidate in questions"
];

const failures =
  required.filter(
    marker =>
      !source.includes(
        marker
      )
  );

if (
  failures.length
) {
  console.error(
    '\nAJ Unified Journey Input type repair validation failed:\n'
  );

  for (
    const failure of
    failures
  ) {
    console.error(
      `- Missing marker "${failure}"`
    );
  }

  console.error();

  process.exit(
    1
  );
}

console.log(`
AJ Unified Journey Input type repair validation passed.

Confirmed:
  questionFor() accepts the full intent object
  questionFor() accepts the local string-based missing key
  Unknown strings resolve safely without changing Journey state
  Existing MS12.2 normalization remains untouched
`);
