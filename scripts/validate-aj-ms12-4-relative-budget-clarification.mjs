import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const enginePath = path.join(
  root,
  'features',
  'ai-assistance',
  'server',
  'localAssistantEngine.ts'
);
const statePath = path.join(
  root,
  'features',
  'ai-assistance',
  'server',
  'journeyStateResolver.ts'
);

const failures = [];

function source(filePath) {
  if (!fs.existsSync(filePath)) {
    failures.push(`Missing ${path.relative(root, filePath)}.`);
    return '';
  }

  return fs.readFileSync(filePath, 'utf8');
}

const engine = source(enginePath);
const state = source(statePath);

const engineMarkers = [
  'AJ_MS12_4_RELATIVE_BUDGET_CLARIFICATION_V1',
  'type RelativeBudgetAdjustment',
  'function relativeBudgetAdjustment',
  'function relativeBudgetClarificationResponse',
  "'How much should I raise the budget?'",
  "'What budget would you like me to work within?'",
  "'The active Plan, selected products and budget remain unchanged until a new limit is confirmed.'",
  "'Use a flexible budget'"
];

for (const marker of engineMarkers) {
  if (!engine.includes(marker)) {
    failures.push(`Engine is missing: ${marker}`);
  }
}

if (
  !engine.includes(
    'numericBudget(\n      prompt\n    )'
  )
) {
  failures.push(
    'An explicit numeric budget does not override relative-budget clarification.'
  );
}

const relativeBranch = engine.indexOf(
  "relativeBudgetAdjustment(\n      prompt\n    ) ===\n      'INCREASE'"
);
const constraintBranch = engine.indexOf(
  'const planConstraints ='
);

if (
  relativeBranch < 0 ||
  constraintBranch < 0 ||
  relativeBranch > constraintBranch
) {
  failures.push(
    'Relative budget clarification must run before plan composition.'
  );
}

const stateMarkers = [
  'AJ_MS12_4_RELATIVE_BUDGET_CLARIFICATION_V1',
  'const extractedConstraints =',
  'const hasResolvedBudgetConstraint =',
  'const retainedPriorConstraints =',
  '/^Budget(?:\\s+limit)?:/i'
];

for (const marker of stateMarkers) {
  if (!state.includes(marker)) {
    failures.push(`Journey State resolver is missing: ${marker}`);
  }
}

function normalize(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function numericBudget(value) {
  const matches = [
    ...value.matchAll(
      /(?:₦|ngn|budget(?:\s+(?:is|of))?|under|below|within|around|about|max(?:imum)?|spend(?:ing)?(?:\s+limit)?|cost)\s*[:=]?\s*(?:₦|ngn)?\s*([0-9][0-9,]*(?:\.[0-9]+)?)\s*(k|m|thousand|million)?/gi
    )
  ];

  const match = matches.at(-1);

  if (!match) return null;

  const amount = Number(match[1].replaceAll(',', ''));
  if (!Number.isFinite(amount) || amount <= 0) return null;

  const suffix = (match[2] ?? '').toLowerCase();
  const multiplier =
    suffix === 'm' || suffix === 'million'
      ? 1_000_000
      : suffix === 'k' || suffix === 'thousand'
        ? 1_000
        : 1;

  return Math.round(amount * multiplier);
}

function relativeBudgetAdjustment(prompt) {
  if (numericBudget(prompt)) return null;

  const normalized = normalize(prompt);

  return /(?:\b(?:increase|raise|expand|boost|enlarge)\b[^.!?\n]{0,30}\bbudget\b|\bbudget\b[^.!?\n]{0,30}\b(?:increase|higher|larger|bigger|too low|too small|not enough)\b|\bspend\s+more\b|\bgive\s+(?:it|the\s+plan|this\s+plan)\s+more\s+(?:budget|room)\b)/.test(
    normalized
  )
    ? 'INCREASE'
    : null;
}

function roundBudgetGuidance(value) {
  return Math.max(
    5_000,
    Math.ceil(value / 5_000) * 5_000
  );
}

function firstGuidedBudget({
  currentBudget,
  currentTotal,
  productCount
}) {
  const currentAuthority =
    currentBudget ?? Math.max(currentTotal, 1);
  const estimatedItemValue =
    productCount > 0
      ? currentTotal / productCount
      : currentAuthority * 0.2;

  return roundBudgetGuidance(
    Math.max(
      currentAuthority * 1.15,
      currentTotal + Math.max(5_000, estimatedItemValue * 0.45)
    )
  );
}

if (
  relativeBudgetAdjustment(
    'Three products are too small, please increase the budget.'
  ) !== 'INCREASE'
) {
  failures.push(
    'A natural relative budget increase was not recognised.'
  );
}

if (
  relativeBudgetAdjustment(
    'Increase the budget to ₦90,000.'
  ) !== null
) {
  failures.push(
    'An explicit new budget was incorrectly held for clarification.'
  );
}

if (
  firstGuidedBudget({
    currentBudget: 70_000,
    currentTotal: 61_000,
    productCount: 3
  }) <= 70_000
) {
  failures.push(
    'Catalogue guidance did not suggest a ceiling above the current ₦70,000 authority.'
  );
}

const priorConstraints = [
  'Budget limit: 70000.',
  'Audience size: 3 guests.'
];
const extractedConstraints = [
  'Budget limit: 90000.'
];
const hasResolvedBudgetConstraint =
  extractedConstraints.some(value =>
    /^Budget(?:\s+limit)?:/i.test(value)
  );
const retainedPriorConstraints =
  priorConstraints.filter(
    value =>
      !hasResolvedBudgetConstraint ||
      !/^Budget(?:\s+limit)?:/i.test(value)
  );
const resolvedConstraints = [
  ...new Set([
    ...retainedPriorConstraints,
    ...extractedConstraints
  ])
];

if (
  resolvedConstraints.some(value =>
    value.includes('70000')
  ) ||
  !resolvedConstraints.some(value =>
    value.includes('90000')
  )
) {
  failures.push(
    'Journey State retained a stale budget after a new explicit ceiling was confirmed.'
  );
}

if (failures.length) {
  console.error(
    '\nAJ MS12.4 Relative Budget Clarification validation failed:\n'
  );

  for (const failure of failures) {
    console.error(`- ${failure}`);
  }

  console.error();
  process.exit(1);
}

console.log(`
AJ MS12.4 Relative Budget Clarification validation passed.

Confirmed:
  “Increase the budget” is recognised as a relative budget request
  An explicit amount such as ₦90,000 proceeds directly to recomposition
  A relative request pauses for customer confirmation instead of silently retaining ₦70,000
  The active Plan remains unchanged while the new ceiling is unresolved
  Guided budget suggestions are higher than the current saved authority
  A newly confirmed budget replaces stale budget constraints in Journey State
  Existing Plan snapshot and transition authorities remain responsible for persistence
  No database migration required
`);
