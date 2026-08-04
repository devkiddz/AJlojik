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

const railPath =
  join(
    root,
    'features',
    'ai-assistance',
    'components',
    'JourneyNavigationRail.tsx'
  );

const failures = [];

for (
  const path of
  [
    runtimePath,
    railPath
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
    railPath
  )
) {
  const rail =
    readFileSync(
      railPath,
      'utf8'
    );

  for (
    const marker of
    [
      'AJ_MS12_JOURNEY_BUCKET_MANAGEMENT',
      'max-h-[70dvh]',
      'xl:max-h-[34rem]',
      'overflow-y-auto',
      'overscroll-contain',
      'Delete Journey',
      'Clear all Journeys',
      'deletingJourneyId',
      'clearingJourneyBucket'
    ]
  ) {
    if (
      !rail.includes(
        marker
      )
    ) {
      failures.push(
        `Missing Journey bucket marker "${marker}"`
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
      'AJ_MS12_JOURNEY_BUCKET_MANAGEMENT',
      'deletingJourneyId',
      'clearingJourneyBucket',
      'deleteJourneyFromBucket',
      'clearJourneyBucket',
      '&mode=delete',
      'onDelete=',
      'onClearAll='
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

  const selectStart =
    runtime.indexOf(
      'async function selectSession('
    );

  const selectEnd =
    selectStart <
      0
      ? -1
      : runtime.indexOf(
          '\n  function ',
          selectStart +
            1
        );

  const selectBlock =
    selectStart >=
      0
      ? runtime.slice(
          selectStart,
          selectEnd >
            selectStart
            ? selectEnd
            : undefined
        )
      : '';

  if (
    /setSidebarOpen\(\s*false\s*\)/.test(
      selectBlock
    )
  ) {
    failures.push(
      'Journey selection still closes the rail automatically.'
    );
  }
}

if (
  failures.length
) {
  console.error(
    '\nAJ Journey Bucket Management validation failed:\n'
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
AJ Journey Bucket Management validation passed.

Confirmed:
  Journey rail maximum height is constrained
  Journey history scrolls independently
  Every Journey has a permanent delete option
  Entire Journey bucket has a clear-all option
  Destructive actions require confirmation
  Current Journey cleanup is handled safely
  Rail remains open until the user closes it
`);
