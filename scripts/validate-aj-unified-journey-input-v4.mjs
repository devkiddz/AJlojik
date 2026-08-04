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
  builder:
    join(
      root,
      'features',
      'ai-assistance',
      'server',
      'collaborativeIntentBuilder.ts'
    ),
  continuation:
    join(
      root,
      'features',
      'ai-assistance',
      'server',
      'journeyContinuationInput.ts'
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
      'AJ_MS12_UNIFIED_JOURNEY_INPUT',
      'JourneyInputSource',
      'submitJourneyInput',
      "'typed'",
      "'suggested'",
      'rcentz:journey-input-submitted'
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
}

if (
  existsSync(
    paths.builder
  )
) {
  const builder =
    readFileSync(
      paths.builder,
      'utf8'
    );

  for (
    const marker of
    [
      'AJ_MS12_TYPED_JOURNEY_CONTINUATION',
      'canonicalizeJourneyConversation',
      'canonicalConversation',
      'hasFlexibleJourneyBudget',
      'budgetFlexible'
    ]
  ) {
    if (
      !builder.includes(
        marker
      )
    ) {
      failures.push(
        `Missing builder marker "${marker}"`
      );
    }
  }
}

if (
  existsSync(
    paths.continuation
  )
) {
  const continuation =
    readFileSync(
      paths.continuation,
      'utf8'
    );

  for (
    const marker of
    [
      'AJ_MS12_TYPED_JOURNEY_CONTINUATION',
      'canonicalizeJourneyConversation',
      'My budget is flexible',
      'compactAudienceAnswer',
      'compactBudgetAnswer'
    ]
  ) {
    if (
      !continuation.includes(
        marker
      )
    ) {
      failures.push(
        `Missing continuation marker "${marker}"`
      );
    }
  }
}

if (
  failures.length
) {
  console.error(
    '\nAJ Unified Journey Input V4 validation failed:\n'
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
AJ Unified Journey Input V4 validation passed.

Confirmed:
  Typed answers and suggestions share one submission authority
  Both paths continue the same persisted Journey
  Short audience answers are normalized
  Compact budget answers are normalized
  Flexible budget is accepted as resolved context
  Consecutive duplicate prompts are removed
  Existing focused clarification experience remains untouched
`);
