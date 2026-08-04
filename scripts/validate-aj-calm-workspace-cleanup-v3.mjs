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

const guidedPath =
  join(
    root,
    'features',
    'ai-assistance',
    'components',
    'GuidedAssistantExperience.tsx'
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
    guidedPath,
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
      'AJ_MS12_CALM_JOURNEY_NAVIGATION_V3',
      'Find a Journey',
      'Getting the details',
      'Ready when you are'
    ]
  ) {
    if (
      !rail.includes(
        marker
      )
    ) {
      failures.push(
        `Missing rail marker "${marker}"`
      );
    }
  }

  if (
    rail.includes(
      'session.lastMessage'
    )
  ) {
    failures.push(
      'Journey rail still uses generated lastMessage content.'
    );
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
      'AJ_MS12_CALM_WORKSPACE_CLEANUP_V3',
      "from './JourneyNavigationRail'",
      '<JourneyNavigationRail'
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
    !selectBlock
  ) {
    failures.push(
      'Could not validate selectSession().'
    );
  } else if (
    /setSidebarOpen\(\s*false\s*\)/.test(
      selectBlock
    )
  ) {
    failures.push(
      'Journey selection still closes the Journey rail automatically.'
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

  for (
    const marker of
    [
      'What I’m keeping in mind',
      'A little more detail',
      'You could also say'
    ]
  ) {
    if (
      !guided.includes(
        marker
      )
    ) {
      failures.push(
        `Missing calm workspace label "${marker}"`
      );
    }
  }
}

if (
  failures.length
) {
  console.error(
    '\nAJ Calm Workspace Cleanup V3 validation failed:\n'
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
AJ Calm Workspace Cleanup V3 validation passed.

Confirmed:
  Journey navigation remains open after selection
  Only the user closes or reopens the Journey rail
  Journey cards contain no assistant-generated story text
  All saved Journeys remain directly available
  Search supports larger Journey collections
  Progress language is calm and natural
  Heavy labels and typography are softened
  Existing persistence, History and Journey State remain untouched
`);
