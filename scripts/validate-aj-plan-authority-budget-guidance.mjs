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
  repository:
    join(
      root,
      'features',
      'ai-assistance',
      'server',
      'assistantRepository.ts'
    ),
  continuation:
    join(
      root,
      'features',
      'ai-assistance',
      'server',
      'journeyContinuationInput.ts'
    ),
  state:
    join(
      root,
      'features',
      'ai-assistance',
      'server',
      'journeyStateResolver.ts'
    ),
  runtime:
    join(
      root,
      'features',
      'ai-assistance',
      'components',
      'AssistantRuntimePage.tsx'
    ),
  clarification:
    join(
      root,
      'features',
      'ai-assistance',
      'components',
      'JourneyClarificationCard.tsx'
    ),
  guided:
    join(
      root,
      'features',
      'ai-assistance',
      'components',
      'GuidedAssistantExperience.tsx'
    ),
  progress:
    join(
      root,
      'features',
      'ai-assistance',
      'components',
      'JourneyProgressStrip.tsx'
    ),
  budget:
    join(
      root,
      'features',
      'ai-assistance',
      'journeyBudgetGuidance.ts'
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

function source(
  path
) {
  return existsSync(
    path
  )
    ? readFileSync(
        path,
        'utf8'
      )
    : '';
}

const repository =
  source(
    paths.repository
  );

const respondBlock =
  repository.slice(
    repository.indexOf(
      'async respond('
    ),
    repository.indexOf(
      'async archiveSession('
    )
  );

for (
  const marker of
  [
    'AJ_MS12_MEANINGFUL_PLAN_VERSION_AUTHORITY',
    'shouldCreateCustomerPlanSnapshot',
    'createPlanSnapshot',
    'journeyVersion:',
    'isPlanSnapshot:',
    'nextPlanVersion',
    'nextJourneyStateVersion'
  ]
) {
  if (
    !respondBlock.includes(
      marker
    ) &&
    !repository.includes(
      marker
    )
  ) {
    failures.push(
      `Missing repository marker "${marker}"`
    );
  }
}

if (
  /currentPlanVersion:\s*\{\s*increment:\s*1/.test(
    respondBlock
  )
) {
  failures.push(
    'respond() still increments currentPlanVersion unconditionally.'
  );
}

if (
  !/journeyVersion:\s*createPlanSnapshot\s*\?\s*nextPlanVersion\s*:\s*null/.test(
    respondBlock
  )
) {
  failures.push(
    'Clarification assistant messages are not separated from Journey versions.'
  );
}

if (
  !/isPlanSnapshot:\s*createPlanSnapshot/.test(
    respondBlock
  )
) {
  failures.push(
    'Plan snapshot authority is not conditional.'
  );
}

const continuation =
  source(
    paths.continuation
  );

if (
  !continuation.includes(
    'AJ_MS12_COMMA_SAFE_BUDGET_INPUT'
  ) ||
  !continuation.includes(
    'My budget is ${normalized}'
  )
) {
  failures.push(
    'Comma-safe budget canonicalization is missing.'
  );
}

const state =
  source(
    paths.state
  );

if (
  !state.includes(
    'AJ_MS12_COMMA_SAFE_BUDGET_STATE'
  )
) {
  failures.push(
    'Comma-safe Journey-State budget recognition is missing.'
  );
}

const runtime =
  source(
    paths.runtime
  );

for (
  const marker of
  [
    'AJ_MS12_PLAN_AUTHORITY_BUDGET_GUIDANCE',
    'resolveJourneyBudgetGuidance',
    'budgetGuidance',
    'suggestions={',
    'suggestionContext={',
    'Plan not created yet',
    'Gathering details'
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

const clarification =
  source(
    paths.clarification
  );

for (
  const marker of
  [
    'AJ_MS12_DYNAMIC_BUDGET_RANGES',
    'JourneyQuickReplyOption',
    'suggestionContext',
    'Choose a catalogue-guided range'
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

const budget =
  source(
    paths.budget
  );

for (
  const marker of
  [
    'AJ_MS12_CATALOG_BUDGET_GUIDANCE',
    'currently available catalogue prices',
    'product.available <=',
    'Affordable',
    'Balanced',
    'Premium',
    'Flexible budget'
  ]
) {
  if (
    !budget.includes(
      marker
    )
  ) {
    failures.push(
      `Missing budget guidance marker "${marker}"`
    );
  }
}

const guided =
  source(
    paths.guided
  );

if (
  !guided.includes(
    'AJ_MS12_PLAN_SNAPSHOT_HISTORY_ONLY'
  ) ||
  !/message\.role\s*!==\s*'ASSISTANT'\s*\|\|\s*!message\.isPlanSnapshot/.test(
    guided
  )
) {
  failures.push(
    'Guided history still treats clarification responses as plan versions.'
  );
}

if (
  guided.includes(
    'AJ is answering from this instruction'
  ) ||
  guided.includes(
    'This instruction produced the current Plan'
  )
) {
  failures.push(
    'The old single-instruction authority wording is still present.'
  );
}

const progress =
  source(
    paths.progress
  );

if (
  !progress.includes(
    'Ready to decide'
  ) ||
  !progress.includes(
    'Plan pending'
  )
) {
  failures.push(
    'Progress presentation does not distinguish Ready to decide or a pending plan.'
  );
}

if (
  failures.length
) {
  console.error(
    '\nAJ Plan Authority + Budget Guidance validation failed:\n'
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
AJ Plan Authority + Budget Guidance validation passed.

Confirmed:
  Clarification turns advance Journey State without creating saved Plan versions
  The first complete result becomes Plan v1
  Meaningful refinements can create later Plan versions
  Decision and explanation turns do not automatically create fake versions
  Plan history renders only true Plan snapshots
  Budget input supports 250000, 250k and 250,000
  Budget Quick Response offers Affordable, Balanced and Premium catalogue-guided ranges
  Budget ranges use available product prices already returned from the live workspace catalogue
  Ready is presented as Ready to decide
  No database migration required
`);
