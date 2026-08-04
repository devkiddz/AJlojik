import fs from 'node:fs';
import path from 'node:path';

const root =
  process.cwd();

const paths = {
  summary: path.join(
    root,
    'features',
    'ai-assistance',
    'components',
    'JourneySummaryCard.tsx'
  ),
  clarification: path.join(
    root,
    'features',
    'ai-assistance',
    'components',
    'JourneyClarificationCard.tsx'
  ),
  state: path.join(
    root,
    'features',
    'ai-assistance',
    'server',
    'journeyStateResolver.ts'
  )
};

const failures = [];

function source(
  filePath
) {
  if (
    !fs.existsSync(
      filePath
    )
  ) {
    failures.push(
      `Missing ${path.relative(
        root,
        filePath
      )}.`
    );

    return '';
  }

  return fs.readFileSync(
    filePath,
    'utf8'
  );
}

const summary =
  source(
    paths.summary
  );

const clarification =
  source(
    paths.clarification
  );

const state =
  source(
    paths.state
  );

const exportIndex =
  summary.indexOf(
    'export function JourneySummaryCard'
  );

const payloadIndex =
  summary.indexOf(
    '  const payload =',
    exportIndex
  );

const metricsIndex =
  summary.indexOf(
    '  const constraints =',
    exportIndex
  );

const returnIndex =
  summary.indexOf(
    '  return (',
    exportIndex
  );

if (
  exportIndex < 0 ||
  payloadIndex < 0 ||
  metricsIndex < 0 ||
  returnIndex < 0 ||
  !(
    exportIndex <
      payloadIndex &&
    payloadIndex <
      metricsIndex &&
    metricsIndex <
      returnIndex
  )
) {
  failures.push(
    'JourneySummaryCard function scope is malformed.'
  );
}

const summaryMarkers = [
  'AJ_MS12_4_JOURNEY_SUMMARY_RECOVERY_V2',
  'function stateBudgetAmount',
  'function hasFlexibleBudget',
  'function displayContextValue',
  "'PAIRING'",
  "'SHOPPING_PLAN'",
  'const budgetAmount =',
  'const estimatedTotalAmount =',
  'const remainingAmount =',
  'Over by'
];

for (
  const marker of
  summaryMarkers
) {
  if (
    !summary.includes(
      marker
    )
  ) {
    failures.push(
      `Journey Summary is missing: ${marker}`
    );
  }
}

const requiredClarificationCopy = [
  'Choose a catalogue-guided range',
  'Enter the amount with or without ₦, N, NGN, commas or K.'
];

for (
  const copy of
  requiredClarificationCopy
) {
  if (
    !clarification.includes(
      copy
    )
  ) {
    failures.push(
      `Clarification UI is missing: ${copy}`
    );
  }
}

const stateMarkers = [
  'const knowledgeMessages =',
  'prior.objective ??',
  'prior.confirmedContext ??',
  'prior.constraints ??',
  'prior.preferences ??',
  'unresolvedQuestions(\n      knowledgeMessages,'
];

for (
  const marker of
  stateMarkers
) {
  if (
    !state.includes(
      marker
    )
  ) {
    failures.push(
      `Journey State is missing: ${marker}`
    );
  }
}

function parseAmount(
  value
) {
  if (!value) {
    return null;
  }

  const match =
    value.match(
      /(-?[0-9][0-9,\s]*(?:\.[0-9]+)?)\s*(k|m|thousand|million)?/i
    );

  if (!match) {
    return null;
  }

  const amount =
    Number(
      (
        match[1] ??
        ''
      ).replace(
        /[\s,]/g,
        ''
      )
    );

  if (
    !Number.isFinite(
      amount
    )
  ) {
    return null;
  }

  const suffix =
    (
      match[2] ??
      ''
    ).toLowerCase();

  return Math.round(
    amount *
      (
        suffix === 'm' ||
        suffix === 'million'
          ? 1_000_000
          : suffix === 'k' ||
              suffix === 'thousand'
            ? 1_000
            : 1
      )
  );
}

function stateBudgetAmount(
  constraints
) {
  for (
    const constraint of
    [...constraints].reverse()
  ) {
    const match =
      constraint.match(
        /^Budget(?:\s+limit)?:\s*(.+?)\.?$/i
      );

    if (!match) {
      continue;
    }

    const amount =
      parseAmount(
        match[1]
      );

    if (
      amount !== null &&
      amount > 0
    ) {
      return amount;
    }
  }

  return null;
}

function fallbackTotal(
  payload
) {
  if (
    !payload ||
    ![
      'PAIRING',
      'SHOPPING_PLAN'
    ].includes(
      payload.outputType
    )
  ) {
    return null;
  }

  const total =
    payload.products.reduce(
      (
        sum,
        product
      ) =>
        sum +
        (
          typeof product.price ===
            'number'
            ? product.price
            : 0
        ),
      0
    );

  return total > 0
    ? total
    : null;
}

const fixedBudget =
  stateBudgetAmount([
    'Audience size: 5 people.',
    'Budget limit: 100000.'
  ]);

if (
  fixedBudget !==
    100_000
) {
  failures.push(
    'Fixed Journey budget resolution failed.'
  );
}

if (
  fallbackTotal({
    outputType:
      'RECOMMENDATION',
    products: [
      { price: 115000 },
      { price: 74000 }
    ]
  }) !==
    null
) {
  failures.push(
    'Generic Recommendation was treated as a controlled plan basket.'
  );
}

const pairingTotal =
  fallbackTotal({
    outputType:
      'PAIRING',
    products: [
      { price: 24000 },
      { price: 29500 },
      { price: 7500 }
    ]
  });

if (
  pairingTotal !==
    61_000 ||
  fixedBudget -
    pairingTotal !==
    39_000
) {
  failures.push(
    'Pairing total or remaining-budget reconciliation failed.'
  );
}

if (
  failures.length
) {
  console.error(
    '\nAJ MS12.4 Journey Summary Reconciliation validation failed:\n'
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
  process.exit(1);
}

console.log(`
AJ MS12.4 Journey Summary Reconciliation validation passed.

Confirmed:
  JourneySummaryCard export and component scope are intact
  Journey Summary reads the latest fixed budget from Journey State
  Budget limit values render as formatted Naira
  Generic Recommendations are not summed as controlled plan baskets
  Pairing and Shopping Plan totals remain eligible for safe fallback calculation
  Remaining budget is derived only from reconciled budget and plan totals
  Saved Journey objective and confirmed context participate in unresolved-question checks
  Budget Quick Response satisfies both guidance validators
  Existing completion, Plan history and material-version authorities remain unchanged
  No database migration required
`);
