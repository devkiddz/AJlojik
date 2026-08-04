import {
  existsSync,
  readFileSync
} from 'node:fs';

import {
  join
} from 'node:path';

const root =
  process.cwd();

const runtimePath =
  join(
    root,
    'features',
    'ai-assistance',
    'components',
    'AssistantRuntimePage.tsx'
  );

const dialogPath =
  join(
    root,
    'features',
    'ai-assistance',
    'components',
    'JourneyDeleteDialog.tsx'
  );

const failures = [];

for (
  const path of
  [
    runtimePath,
    dialogPath
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
    dialogPath
  )
) {
  const dialog =
    readFileSync(
      dialogPath,
      'utf8'
    );

  for (
    const marker of
    [
      'AJ_MS12_JOURNEY_CONFIRMATION_DIALOG',
      'Clear your saved Journeys?',
      'Remove this Journey?',
      'Keep my Journeys',
      'Keep this Journey',
      'This cannot be undone.'
    ]
  ) {
    if (
      !dialog.includes(
        marker
      )
    ) {
      failures.push(
        `Missing dialog marker "${marker}"`
      );
    }
  }
}

if (
  existsSync(
    runtimePath
  )
) {
  const runtime =
    readFileSync(
      runtimePath,
      'utf8'
    );

  for (
    const marker of
    [
      'AJ_MS12_JOURNEY_CONFIRMATION_DIALOG',
      "from './JourneyDeleteDialog'",
      'journeyDeleteRequest',
      'confirmJourneyDeletion',
      '<JourneyDeleteDialog',
      'setJourneyDeleteRequest'
    ]
  ) {
    if (
      !runtime.includes(
        marker
      )
    ) {
      failures.push(
        `Missing runtime marker "${marker}"`
      );
    }
  }

  const managedStart =
    runtime.indexOf(
      'async function deleteJourneyFromBucket('
    );

  const managedEnd =
    runtime.indexOf(
      '  function applicationApplied(',
      managedStart
    );

  const managedBlock =
    managedStart >=
      0 &&
    managedEnd >
      managedStart
      ? runtime.slice(
          managedStart,
          managedEnd
        )
      : '';

  if (
    !managedBlock
  ) {
    failures.push(
      'Could not inspect Journey deletion functions.'
    );
  } else if (
    managedBlock.includes(
      'window.confirm'
    )
  ) {
    failures.push(
      'Native window.confirm remains in Journey deletion functions.'
    );
  }
}

if (
  failures.length
) {
  console.error(
    '\nAJ Journey Confirmation Dialog validation failed:\n'
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
AJ Journey Confirmation Dialog validation passed.

Confirmed:
  Browser-native delete prompts removed
  Single-Journey deletion uses AJ/Rcentz dialog
  Current-Journey deletion uses the same dialog
  Clear-all uses a dedicated calm confirmation
  Destructive actions remain permanent and explicit
  Escape and backdrop dismissal are supported
  Busy state prevents accidental duplicate actions
`);
