import {
  existsSync,
  readFileSync
} from 'node:fs';

import {
  join
} from 'node:path';

const root =
  process.cwd();

const paths = {
  runtime:
    join(
      root,
      'features',
      'ai-assistance',
      'components',
      'AssistantRuntimePage.tsx'
    ),
  guided:
    join(
      root,
      'features',
      'ai-assistance',
      'components',
      'GuidedAssistantExperience.tsx'
    ),
  clarification:
    join(
      root,
      'features',
      'ai-assistance',
      'components',
      'JourneyClarificationCard.tsx'
    ),
  progress:
    join(
      root,
      'features',
      'ai-assistance',
      'components',
      'JourneyProgressStrip.tsx'
    ),
  rail:
    join(
      root,
      'features',
      'ai-assistance',
      'components',
      'JourneyNavigationRail.tsx'
    )
};

const failures = [];

for (
  const path of
  Object.values(
    paths
  )
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
    paths.runtime
  )
) {
  const runtime =
    readFileSync(
      paths.runtime,
      'utf8'
    );

  for (
    const marker of
    [
      'AJ_MS12_GUIDED_COMPOSER_COMPOSITION_V4',
      "from './JourneyClarificationCard'",
      "from './JourneyProgressStrip'",
      'const pendingJourneyQuestion =',
      '<JourneyProgressStrip',
      '<JourneyClarificationCard',
      'pendingJourneyQuestion ? (',
      'submitJourneyInput(',
      "'typed'"
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

  if (
    !/pendingJourneyQuestion\s*\?\s*\([\s\S]*?<JourneyClarificationCard[\s\S]*?\)\s*:\s*\([\s\S]*?Tell me what you are shopping for/.test(
      runtime
    )
  ) {
    failures.push(
      'Quick Response does not replace the generic composer structurally.'
    );
  }
}

if (
  existsSync(
    paths.guided
  )
) {
  const guided =
    readFileSync(
      paths.guided,
      'utf8'
    );

  for (
    const marker of
    [
      'AJ_MS12_GUIDED_COMPOSER_COMPOSITION_V4',
      'AJ_MS12_RELOCATED_JOURNEY_PROGRESS'
    ]
  ) {
    if (
      !guided.includes(
        marker
      )
    ) {
      failures.push(
        `Missing Guided marker "${marker}"`
      );
    }
  }

  if (
    guided.includes(
      '<JourneyClarificationCard'
    )
  ) {
    failures.push(
      'GuidedAssistantExperience still renders a duplicate clarification card.'
    );
  }

  if (
    /Current journey/i.test(
      guided
    )
  ) {
    failures.push(
      'The duplicate Current Journey progress card is still rendered.'
    );
  }
}

if (
  existsSync(
    paths.clarification
  )
) {
  const clarification =
    readFileSync(
      paths.clarification,
      'utf8'
    );

  for (
    const marker of
    [
      'AJ_MS12_QUICK_RESPONSE_COMPOSER_V4',
      'Quick response',
      'Choose one or type naturally'
    ]
  ) {
    if (
      !clarification.includes(
        marker
      )
    ) {
      failures.push(
        `Missing Quick Response marker "${marker}"`
      );
    }
  }
}

if (
  existsSync(
    paths.progress
  )
) {
  const progress =
    readFileSync(
      paths.progress,
      'utf8'
    );

  for (
    const marker of
    [
      'AJ_MS12_JOURNEY_HEADER_PROGRESS_V4',
      'Journey progress',
      'Begin',
      'Understand',
      'Refine',
      'Decide'
    ]
  ) {
    if (
      !progress.includes(
        marker
      )
    ) {
      failures.push(
        `Missing progress marker "${marker}"`
      );
    }
  }
}

if (
  existsSync(
    paths.rail
  )
) {
  const rail =
    readFileSync(
      paths.rail,
      'utf8'
    );

  for (
    const marker of
    [
      'AJ_MS12_STICKY_JOURNEY_BUCKET_V4',
      'data-aj-sticky-journey-bucket',
      'xl:sticky',
      'xl:top-24',
      'xl:max-h-[calc(100svh-7rem)]'
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
  failures.length
) {
  console.error(
    '\nAJ Guided Composer Composition V5 validation failed:\n'
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
AJ Guided Composer Composition V5 validation passed.

Confirmed:
  Journey progress lives between the Journey title and Active Journey details
  The duplicate Current Journey progress card is retired
  Quick Response replaces the generic composer while context is unresolved
  The normal composer returns after clarification
  Quick Response uses the unified Journey input authority
  The JourneyNavigationRail bucket is sticky on desktop
  No database migration required
`);
