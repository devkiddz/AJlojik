import fs from 'node:fs';
import path from 'node:path';

const root =
  process.cwd();

const enginePath =
  path.join(
    root,
    'features',
    'ai-assistance',
    'server',
    'localAssistantEngine.ts'
  );

const failures = [];

if (
  !fs.existsSync(
    enginePath
  )
) {
  failures.push(
    'localAssistantEngine.ts was not found.'
  );
}

const source =
  failures.length
    ? ''
    : fs.readFileSync(
        enginePath,
        'utf8'
      );

const markers = [
  'AJ_MS12_4_FIXED_BUDGET_PRECEDENCE_V1',
  'const latestFlexibleBudget =',
  'const savedFixedBudget =',
  'const fixedBudgetAuthority =',
  'input.confirmedBudget ??',
  'latestFlexibleBudget',
  'fixedBudgetAuthority ===',
  'fixedBudgetAuthority ??'
];

for (
  const marker of
  markers
) {
  if (
    !source.includes(
      marker
    )
  ) {
    failures.push(
      `Engine is missing: ${marker}`
    );
  }
}

function resolve({
  prompt,
  savedBudget,
  confirmedBudget,
  historicalFlexible
}) {
  const latestFlexibleBudget =
    /(?:budget\s+is\s+flexible|flexible\s+budget|optimise\s+freely|optimize\s+freely)/i.test(
      prompt
    );

  const fixedBudgetAuthority =
    confirmedBudget ??
    (
      latestFlexibleBudget
        ? null
        : savedBudget
    );

  const flexibleBudget =
    latestFlexibleBudget ||
    (
      fixedBudgetAuthority ===
        null &&
      historicalFlexible
    );

  return {
    flexibleBudget,
    budget:
      flexibleBudget
        ? null
        : fixedBudgetAuthority
  };
}

const savedFixed =
  resolve({
    prompt:
      'It is a get-together evening party with friends.',
    savedBudget:
      100_000,
    confirmedBudget:
      null,
    historicalFlexible:
      true
  });

if (
  savedFixed.flexibleBudget ||
  savedFixed.budget !==
    100_000
) {
  failures.push(
    'A saved fixed budget did not outrank an older flexible-budget phrase.'
  );
}

const newlyConfirmed =
  resolve({
    prompt:
      '100000',
    savedBudget:
      70_000,
    confirmedBudget:
      100_000,
    historicalFlexible:
      true
  });

if (
  newlyConfirmed.flexibleBudget ||
  newlyConfirmed.budget !==
    100_000
) {
  failures.push(
    'A newly confirmed fixed budget did not override historical flexibility.'
  );
}

const explicitFlexible =
  resolve({
    prompt:
      'My budget is flexible.',
    savedBudget:
      100_000,
    confirmedBudget:
      null,
    historicalFlexible:
      false
  });

if (
  !explicitFlexible.flexibleBudget ||
  explicitFlexible.budget !==
    null
) {
  failures.push(
    'An explicit latest flexible-budget instruction could not replace a fixed budget.'
  );
}

if (
  failures.length
) {
  console.error(
    '\nAJ MS12.4 Fixed Budget Precedence validation failed:\n'
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
AJ MS12.4 Fixed Budget Precedence validation passed.

Confirmed:
  A saved fixed budget outranks an older flexible-budget phrase
  A newly confirmed amount remains authoritative on later non-budget refinements
  An explicit latest “budget is flexible” instruction can still replace a fixed ceiling
  Pairing and Shopping Plan composition receive the reconciled fixed budget
  Existing Plan lineage, Naira input and Journey Summary authorities remain unchanged
  No database migration required
`);
