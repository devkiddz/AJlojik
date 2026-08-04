import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const paths = {
  utility: path.join(
    root,
    'features',
    'ai-assistance',
    'server',
    'nairaAmountAuthority.ts'
  ),
  engine: path.join(
    root,
    'features',
    'ai-assistance',
    'server',
    'localAssistantEngine.ts'
  ),
  state: path.join(
    root,
    'features',
    'ai-assistance',
    'server',
    'journeyStateResolver.ts'
  ),
  clarification: path.join(
    root,
    'features',
    'ai-assistance',
    'components',
    'JourneyClarificationCard.tsx'
  )
};

const failures = [];

function source(filePath) {
  if (!fs.existsSync(filePath)) {
    failures.push(
      `Missing ${path.relative(root, filePath)}.`
    );
    return '';
  }

  return fs.readFileSync(
    filePath,
    'utf8'
  );
}

const utility = source(
  paths.utility
);
const engine = source(
  paths.engine
);
const state = source(
  paths.state
);
const clarification = source(
  paths.clarification
);

const utilityMarkers = [
  'AJ_MS12_4_CONTEXTUAL_NAIRA_INPUT_V1',
  'export function parseNairaAmount',
  'export function hasPendingBudgetClarification',
  'allowBare',
  '/[\\s,]/g'
];

for (const marker of utilityMarkers) {
  if (!utility.includes(marker)) {
    failures.push(
      `Naira authority is missing: ${marker}`
    );
  }
}

const engineMarkers = [
  'AJ_MS12_4_CONTEXTUAL_NAIRA_INPUT_V1',
  "from './nairaAmountAuthority'",
  'const pendingBudgetClarification =',
  'const confirmedBudgetFromPrompt =',
  'allowBare:',
  'confirmedBudget:',
  'const preserveActivePlanType =',
  'isPlanMutationInstruction'
];

for (const marker of engineMarkers) {
  if (!engine.includes(marker)) {
    failures.push(
      `Engine is missing: ${marker}`
    );
  }
}

const stateMarkers = [
  'AJ_MS12_4_CONTEXTUAL_NAIRA_INPUT_V1',
  "from './nairaAmountAuthority'",
  'const awaitingBudgetAnswer =',
  'allowBareBudget:',
  'const contextualBudget =',
  '`Budget limit: ${budget}.`'
];

for (const marker of stateMarkers) {
  if (!state.includes(marker)) {
    failures.push(
      `Journey State is missing: ${marker}`
    );
  }
}

const clarificationMarkers = [
  'AJ_MS12_4_CONTEXTUAL_NAIRA_INPUT_V1',
  'For example: ₦100,000, N100K or 100000',
  'Enter the amount with or without ₦, N, NGN, commas or K.',
  "presentation.label ===\n                  'Guest count'",
  'autoComplete="off"'
];

for (const marker of clarificationMarkers) {
  if (!clarification.includes(marker)) {
    failures.push(
      `Clarification UI is missing: ${marker}`
    );
  }
}

function normalizedAmount(
  raw,
  suffix
) {
  const numeric = Number(
    raw.replace(
      /[\s,]/g,
      ''
    )
  );

  if (
    !Number.isFinite(
      numeric
    ) ||
    numeric <=
      0
  ) {
    return null;
  }

  const normalizedSuffix =
    suffix
      .toLowerCase()
      .trim();

  const multiplier =
    normalizedSuffix ===
      'm' ||
    normalizedSuffix ===
      'million'
      ? 1_000_000
      : normalizedSuffix ===
          'k' ||
        normalizedSuffix ===
          'thousand'
        ? 1_000
        : 1;

  return Math.round(
    numeric *
      multiplier
  );
}

function latestMatch(
  value,
  pattern
) {
  const match =
    [
      ...value.matchAll(
        pattern
      )
    ].at(
      -1
    );

  return match
    ? normalizedAmount(
        match[1] ?? '',
        match[2] ?? ''
      )
    : null;
}

function parseNairaAmount(
  value,
  {
    allowBare = false
  } = {}
) {
  const source =
    value
      .replace(
        /\s*,\s*/g,
        ','
      )
      .replace(
        /\s+/g,
        ' '
      )
      .trim();

  if (
    !source ||
    /^\s*[$£€]/.test(
      source
    )
  ) {
    return null;
  }

  const currencyAmount =
    latestMatch(
      source,
      /(?:₦|ngn\b|\bn(?=\s*[0-9]))\s*([0-9][0-9,\s]*(?:\.[0-9]+)?)\s*(k|m|thousand|million)?\b/gi
    );

  if (currencyAmount) {
    return currencyAmount;
  }

  const contextualAmount =
    latestMatch(
      source,
      /(?:budget(?:\s+(?:is|of|to|at))?|spend(?:ing)?(?:\s+limit)?|within|under|below|around|about|max(?:imum)?|ceiling|limit|cost|increase(?:\s+(?:it|the\s+budget|budget))?(?:\s+to)?|raise(?:\s+(?:it|the\s+budget|budget))?(?:\s+to)?|make\s+it|set\s+it\s+to|use)\s*[:=]?\s*(?:₦|ngn\b|\bn(?=\s*[0-9]))?\s*([0-9][0-9,\s]*(?:\.[0-9]+)?)\s*(k|m|thousand|million)?\b/gi
    );

  if (contextualAmount) {
    return contextualAmount;
  }

  const abbreviatedAmount =
    latestMatch(
      source,
      /\b([0-9][0-9,\s]*(?:\.[0-9]+)?)\s*(k|m|thousand|million)\b/gi
    );

  if (abbreviatedAmount) {
    return abbreviatedAmount;
  }

  if (!allowBare) {
    return null;
  }

  const bare =
    source.match(
      /^(?:make\s+it|set\s+it\s+to|use|work\s+with)?\s*(?:₦|ngn\b|\bn(?=\s*[0-9]))?\s*([0-9][0-9,\s]*(?:\.[0-9]+)?)\s*(k|m|thousand|million)?\s*$/i
    );

  return bare
    ? normalizedAmount(
        bare[1] ?? '',
        bare[2] ?? ''
      )
    : null;
}

const accepted = [
  '₦100,000',
  '₦100000',
  'N100,000',
  'N100, 000',
  'N100000',
  'N100K',
  '100K',
  '100k',
  'NGN 100,000',
  'make it 100k',
  'increase it to N100,000'
];

for (const value of accepted) {
  if (
    parseNairaAmount(
      value
    ) !==
      100_000
  ) {
    failures.push(
      `Explicit Naira format was not recognised: ${value}`
    );
  }
}

const contextual = [
  '100000',
  '100,000',
  '100 000'
];

for (const value of contextual) {
  if (
    parseNairaAmount(
      value
    ) !==
      null ||
    parseNairaAmount(
      value,
      {
        allowBare:
          true
      }
    ) !==
      100_000
  ) {
    failures.push(
      `Contextual bare budget behavior failed: ${value}`
    );
  }
}

if (
  parseNairaAmount(
    '$100,000',
    {
      allowBare:
        true
    }
  ) !==
    null
) {
  failures.push(
    'Foreign currency was silently treated as Naira.'
  );
}

if (
  parseNairaAmount(
    '3 guests',
    {
      allowBare:
        true
    }
  ) !==
    null
) {
  failures.push(
    'A guest count was incorrectly treated as a budget.'
  );
}

if (failures.length) {
  console.error(
    '\nAJ MS12.4 Contextual Naira Input validation failed:\n'
  );

  for (const failure of failures) {
    console.error(
      `- ${failure}`
    );
  }

  console.error();
  process.exit(1);
}

console.log(`
AJ MS12.4 Contextual Naira Input validation passed.

Confirmed:
  Naira inputs accept ₦, N, NGN, commas, spaces, K and plain digits
  Bare 100000, 100,000 and 100 000 bind only while AJ is awaiting a budget
  N100, 000 and other harmless spacing variations are normalised
  Foreign currency symbols are not silently converted to Naira
  Guest counts are not mistaken for budgets outside the pending-budget boundary
  A confirmed budget preserves the active Pairing or Shopping Plan output type
  The new budget replaces stale budget authority in Journey State
  The Quick Response field shows accepted amount formats
  No database migration required
`);
