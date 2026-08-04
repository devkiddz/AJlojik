import {
  existsSync,
  readFileSync
} from 'node:fs';

import {
  join
} from 'node:path';

const root =
  process.cwd();

const marker =
  'AJ_MS12_PRODUCT_LIBRARY_PRESENTATION_V1';

const paths = {
  contracts:
    join(root, 'features', 'ai-assistance', 'contracts.ts'),
  engine:
    join(root, 'features', 'ai-assistance', 'server', 'localAssistantEngine.ts'),
  responseCard:
    join(root, 'features', 'ai-assistance', 'components', 'AssistantResponseCard.tsx'),
  productCard:
    join(root, 'features', 'ai-assistance', 'components', 'AssistantProductLibraryCard.tsx'),
  faqs:
    join(root, 'features', 'ai-assistance', 'components', 'AssistantPlanFaqs.tsx')
};

function fail(message) {
  console.error(`\n[AJ Product Library Validator] ${message}\n`);
  process.exit(1);
}

for (const [label, path] of Object.entries(paths)) {
  if (!existsSync(path)) {
    fail(`Missing ${label}: ${path}`);
  }
}

const contracts = readFileSync(paths.contracts, 'utf8');
const engine = readFileSync(paths.engine, 'utf8');
const responseCard = readFileSync(paths.responseCard, 'utf8');
const productCard = readFileSync(paths.productCard, 'utf8');
const faqs = readFileSync(paths.faqs, 'utf8');

const assertions = [
  [contracts.includes(marker), 'Product Library contract marker is missing.'],
  [contracts.includes('AIAssistantProductLibraryEntry'), 'Product Library entry contract is missing.'],
  [contracts.includes("'WIKIPEDIA'"), 'Wikipedia source authority is missing.'],
  [contracts.includes("'MANUFACTURER'"), 'Manufacturer source authority is missing.'],
  [engine.includes(marker), 'Engine Product Library mapper marker is missing.'],
  [engine.includes('product.shortDescription'), 'Catalogue overview mapping is missing.'],
  [engine.includes('product.longDescription'), 'Catalogue description mapping is missing.'],
  [engine.includes('missingInformation'), 'Missing-information boundary is missing.'],
  [responseCard.includes(marker), 'Response card Product Library marker is missing.'],
  [responseCard.includes('lg:grid-cols-2'), 'The two-column Product Library grid is missing.'],
  [responseCard.includes('AssistantProductLibraryCard'), 'Product Library card integration is missing.'],
  [responseCard.includes('AssistantPlanFaqs'), 'Plan FAQ integration is missing.'],
  [productCard.includes('<details'), 'Product accordions are missing.'],
  [productCard.includes('AJ must not invent'), 'Safety uncertainty boundary is missing.'],
  [productCard.includes('canonical marketplace Product ID'), 'Canonical Product ID FAQ is missing.'],
  [faqs.includes('Plan FAQs'), 'Plan FAQ component is missing.'],
  [faqs.includes('must never overwrite live price'), 'Source authority wording is missing.']
];

for (const [passed, message] of assertions) {
  if (!passed) {
    fail(message);
  }
}

console.log('AJ Product Library Presentation V1 validation passed.');
