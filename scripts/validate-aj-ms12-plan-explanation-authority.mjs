import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const repositoryPath = join(root, 'features', 'ai-assistance', 'server', 'assistantRepository.ts');
const enginePath = join(root, 'features', 'ai-assistance', 'server', 'localAssistantEngine.ts');

function fail(message) {
  console.error(`\n[AJ Plan Explanation Authority] Validation failed: ${message}\n`);
  process.exit(1);
}

for (const path of [repositoryPath, enginePath]) {
  if (!existsSync(path)) fail(`Missing ${path}`);
}

const repository = readFileSync(repositoryPath, 'utf8');
const engine = readFileSync(enginePath, 'utf8');

const checks = [
  [repository.includes('AJ_MS12_PLAN_EXPLANATION_AUTHORITY_V1'), 'repository marker'],
  [repository.includes('isCustomerPlanExplanationPrompt'), 'repository explanation classifier'],
  [repository.includes('prompt:\n          message'), 'snapshot prompt authority'],
  [engine.includes('AJ_MS12_PLAN_EXPLANATION_AUTHORITY_V1'), 'engine marker'],
  [engine.includes('isActivePlanExplanationPrompt'), 'engine explanation classifier'],
  [engine.includes('activePlanExplanationResponse'), 'active plan explanation response'],
  [engine.includes('This explanation reads the active plan without changing its products, budget, constraints or saved Plan version.'), 'non-mutating explanation contract'],
  [engine.includes("headline:\n      'Why this plan fits your Journey'"), 'visible explanation headline'],
  [engine.includes('products:\n      plan.products'), 'active product preservation'],
  [engine.includes('metrics:\n      plan.metrics'), 'active metric preservation']
];

for (const [passed, label] of checks) {
  if (!passed) fail(label);
}

console.log('[AJ Plan Explanation Authority] Validation passed.');
