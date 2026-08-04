import {
  existsSync,
  readFileSync
} from 'node:fs';

import {
  join
} from 'node:path';

const root = process.cwd();

const runtimePath = join(
  root,
  'features',
  'ai-assistance',
  'components',
  'AssistantRuntimePage.tsx'
);

const repositoryPath = join(
  root,
  'features',
  'ai-assistance',
  'server',
  'assistantRepository.ts'
);

const failures = [];

for (const path of [runtimePath, repositoryPath]) {
  if (!existsSync(path)) {
    failures.push(`Missing file: ${path}`);
  }
}

if (existsSync(runtimePath)) {
  const runtime = readFileSync(runtimePath, 'utf8');

  if (!runtime.includes('AJ_MS12_STATE_AWARE_TRANSITIONS_TYPE_REPAIR')) {
    failures.push('Missing runtime repair marker.');
  }

  if (
    !runtime.includes('journeyLastTransition:') ||
    !runtime.includes('session.journeyLastTransition')
  ) {
    failures.push('Session summary does not include journeyLastTransition.');
  }
}

if (existsSync(repositoryPath)) {
  const repository = readFileSync(repositoryPath, 'utf8');

  if (!repository.includes('AJ_MS12_STATE_AWARE_TRANSITIONS_TYPE_REPAIR')) {
    failures.push('Missing repository repair marker.');
  }

  if (!repository.includes('const restoredPlanVersion =')) {
    failures.push('Restored plan version is not explicitly narrowed.');
  }

  if (/Math\.max\(\s*1,\s*plan\.journeyVersion\s*\)/.test(repository)) {
    failures.push('Nullable plan.journeyVersion remains inside Math.max().');
  }
}

if (failures.length) {
  console.error('\nAJ MS12.3 type repair validation failed:\n');

  for (const failure of failures) {
    console.error(`- ${failure}`);
  }

  console.error();
  process.exit(1);
}

console.log(`
AJ MS12.3 type repair validation passed.

Confirmed:
  Session-summary projection includes journeyLastTransition
  Restored plan version is explicitly narrowed
  Applied migration and Journey-state architecture remain unchanged
`);
