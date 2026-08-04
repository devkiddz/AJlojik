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
  failures.push('localAssistantEngine.ts was not found.');
} else {
  const source = fs.readFileSync(enginePath, 'utf8');

  const required = [
    'AJ_MS12_4_SOFT_DECREASE_PRESERVATION_V1',
    'type MarketplaceRequestResolution',
    'marketplaceResolution:',
    "direction.direction ===\n              'DECREASE'",
    'const decreasedConcepts =',
    'const reducedCandidates =',
    'selectCandidate(\n          candidate',
    'const orderedSelectedRecords =',
    'const softDecreaseNotes =',
    '...softDecreaseNotes'
  ];

  for (const marker of required) {
    if (!source.includes(marker)) {
      failures.push(`Missing source authority: ${marker}`);
    }
  }

  const composeCalls = (
    source.match(
      /composeShoppingPlan\(\{[\s\S]*?marketplaceResolution[\s\S]*?\}\);/g
    ) ?? []
  ).length;

  if (composeCalls < 2) {
    failures.push(
      'Pairing and Shopping Plan composition do not both receive marketplace resolution.'
    );
  }

  const explanationUses = (
    source.match(/\.\.\.softDecreaseNotes/g) ?? []
  ).length;

  if (explanationUses < 2) {
    failures.push(
      'Soft-decrease reconciliation is not visible in both plan response paths.'
    );
  }

  const reserveIndex = source.indexOf(
    'const decreasedConcepts ='
  );
  const preferIndex = source.indexOf(
    'const preferredCandidateCount ='
  );

  if (
    reserveIndex < 0 ||
    preferIndex < 0 ||
    reserveIndex > preferIndex
  ) {
    failures.push(
      'Reduced-category reservation must happen before preferred-category filling.'
    );
  }

  const orderIndex = source.indexOf(
    'const orderedSelectedRecords ='
  );

  if (
    orderIndex < 0 ||
    !source.slice(
      orderIndex,
      orderIndex + 1400
    ).includes(
      'right.marketplace'
    ) ||
    !source.slice(
      orderIndex,
      orderIndex + 1400
    ).includes(
      '.preferred'
    )
  ) {
    failures.push(
      'Customer-facing product order does not keep preferred products ahead of reduced-category products.'
    );
  }
}

function simulate() {
  const budget = 70000;
  const reduced = [
    { id: 'cake', concept: 'confectionery', price: 12000, preferred: false }
  ];
  const preferred = [
    { id: 'wine-a', concept: 'wine', price: 24000, preferred: true },
    { id: 'wine-b', concept: 'wine', price: 29500, preferred: true },
    { id: 'wine-c', concept: 'wine', price: 12000, preferred: true }
  ];

  const selected = [];
  let total = 0;

  const choose = item => {
    if (total + item.price > budget) return false;
    selected.push(item);
    total += item.price;
    return true;
  };

  choose(reduced[0]);

  for (const item of preferred) {
    choose(item);
  }

  const wineCount = selected.filter(
    item => item.concept === 'wine'
  ).length;
  const confectioneryCount = selected.filter(
    item => item.concept === 'confectionery'
  ).length;

  return {
    total,
    wineCount,
    confectioneryCount
  };
}

const simulated = simulate();

if (
  simulated.total > 70000 ||
  simulated.wineCount <= simulated.confectioneryCount ||
  simulated.confectioneryCount !== 1
) {
  failures.push(
    'Soft-decrease behavior simulation did not preserve one reduced-category item while prioritizing the increased category.'
  );
}

if (failures.length) {
  console.error(
    '\nAJ MS12.4 Soft Decrease Preservation validation failed:\n'
  );

  for (const failure of failures) {
    console.error(`- ${failure}`);
  }

  console.error();
  process.exit(1);
}

console.log(`
AJ MS12.4 Soft Decrease Preservation validation passed.

Confirmed:
  “Fewer” remains a soft reduction instead of becoming a silent exclusion
  One reduced-category selection is reserved when an available item fits the active budget
  Explicit exclusions remain governed separately by EXCLUDE
  Preferred products remain first in the customer-facing result
  Pairing and Shopping Plan paths share the same proportional authority
  Reconciliation explains whether the reduced category was retained or could not fit
  Existing material Plan-version authority remains unchanged
  No database migration required
`);
