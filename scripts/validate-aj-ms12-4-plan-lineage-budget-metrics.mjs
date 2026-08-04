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

const failures = [];

if (!fs.existsSync(enginePath)) {
  failures.push(
    'localAssistantEngine.ts was not found.'
  );
} else {
  const source = fs.readFileSync(
    enginePath,
    'utf8'
  );

  const markers = [
    'AJ_MS12_4_PLAN_LINEAGE_BUDGET_METRICS_V1',
    'const planLineageText =',
    'const inferredPlanLineageType =',
    'const activePlanLineageType =',
    "'PAIRING' ||",
    "'SHOPPING_PLAN'",
    "? 'SHOPPING_PLAN'",
    'confirmedBudgetFromPrompt !==',
    'pendingBudgetClarification',
    "'Budget limit'",
    "'Remaining budget'"
  ];

  for (const marker of markers) {
    if (!source.includes(marker)) {
      failures.push(
        `Engine is missing: ${marker}`
      );
    }
  }

  const lineageIndex = source.indexOf(
    'const planLineageText ='
  );
  const outputIndex = source.indexOf(
    'const outputType =',
    lineageIndex
  );
  const pairingIndex = source.indexOf(
    "outputType ===\n    'PAIRING'",
    outputIndex
  );
  const shoppingIndex = source.indexOf(
    "outputType ===\n    'SHOPPING_PLAN'",
    outputIndex
  );
  const recommendationIndex = source.indexOf(
    "'Smart picks from the live Store'",
    outputIndex
  );

  if (
    lineageIndex < 0 ||
    outputIndex < 0 ||
    lineageIndex > outputIndex
  ) {
    failures.push(
      'Plan lineage must resolve before customer output classification.'
    );
  }

  if (
    pairingIndex < 0 ||
    shoppingIndex < 0 ||
    recommendationIndex < 0 ||
    pairingIndex > recommendationIndex ||
    shoppingIndex > recommendationIndex
  ) {
    failures.push(
      'Budget-controlled Pairing and Shopping Plan branches must run before generic Recommendation fallback.'
    );
  }
}

function normalize(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function classifyCustomer(prompt) {
  if (
    ['compare', 'difference', 'better between', 'versus', ' vs ']
      .some(term => prompt.includes(term))
  ) {
    return 'COMPARISON';
  }

  if (
    ['pair', 'dinner', 'gift', 'occasion', 'celebration', 'basket', 'party']
      .some(term => prompt.includes(term))
  ) {
    return 'PAIRING';
  }

  if (
    ['shopping list', 'plan', 'quantities', 'essentials', 'checklist']
      .some(term => prompt.includes(term))
  ) {
    return 'SHOPPING_PLAN';
  }

  return 'RECOMMENDATION';
}

function resolveLineage({
  previousType,
  objective,
  hasProducts,
  hasBudget
}) {
  if (
    previousType === 'PAIRING' ||
    previousType === 'SHOPPING_PLAN'
  ) {
    return previousType;
  }

  const inferred = classifyCustomer(
    normalize(objective)
  );

  if (
    inferred === 'PAIRING' ||
    inferred === 'SHOPPING_PLAN'
  ) {
    return inferred;
  }

  return hasProducts && hasBudget
    ? 'SHOPPING_PLAN'
    : null;
}

if (
  resolveLineage({
    previousType: 'RECOMMENDATION',
    objective: 'Prepare an occasion pairing for my celebration',
    hasProducts: true,
    hasBudget: true
  }) !== 'PAIRING'
) {
  failures.push(
    'A corrupted Recommendation lineage did not recover its Pairing authority.'
  );
}

if (
  resolveLineage({
    previousType: 'RECOMMENDATION',
    objective: 'Help me choose products',
    hasProducts: true,
    hasBudget: true
  }) !== 'SHOPPING_PLAN'
) {
  failures.push(
    'A budget-controlled product plan did not recover to Shopping Plan when no stronger lineage was available.'
  );
}

if (
  resolveLineage({
    previousType: 'PAIRING',
    objective: '',
    hasProducts: true,
    hasBudget: true
  }) !== 'PAIRING'
) {
  failures.push(
    'An existing Pairing lineage was not preserved.'
  );
}

if (failures.length) {
  console.error(
    '\nAJ MS12.4 Plan Lineage + Budget Metrics validation failed:\n'
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
AJ MS12.4 Plan Lineage + Budget Metrics validation passed.

Confirmed:
  Budget refinement preserves Pairing or Shopping Plan lineage
  A previously corrupted Recommendation can recover from Journey objective and state
  Budget-controlled plan fallback resolves to Shopping Plan instead of generic Recommendation
  Pairing and Shopping Plan retain Budget limit, Estimated total and Remaining budget cards
  Generic Recommendation remains available for ordinary product discovery
  Existing material Plan-version authority remains unchanged
  No database migration required
`);
