#!/usr/bin/env node

import {
  existsSync,
  readFileSync
} from 'node:fs';

import {
  resolve
} from 'node:path';

const root = process.cwd();
const targetPath = resolve(
  root,
  'components/discovery-hub-panel/widgets/ProductDeepInsightWidget.tsx'
);

if (!existsSync(targetPath)) {
  console.error('ProductDeepInsightWidget.tsx is missing.');
  process.exit(1);
}

const source = readFileSync(targetPath, 'utf8')
  .replace(/\r\n/g, '\n');

const checks = [
  [
    'hotfix marker',
    source.includes('AJ_HUB_PRODUCT_PREVIEW_SEPARATION_HOTFIX_V1')
  ],
  [
    'primary product action uses normal Product Experience',
    source.includes('actions.openExperience({') &&
      source.includes("type:\n          'product'") &&
      source.includes('productId')
  ],
  [
    'related ProductCard no longer receives dedicated onAskAI',
    !/data-aj-consistent-product-grid[\s\S]*?<ProductCard[\s\S]*?onAskAI=/.test(source)
  ],
  [
    'shared card remains installed',
    source.includes('data-aj-consistent-product-grid') &&
      source.includes('<ProductCard')
  ],
  [
    'Deep Insight bridge remains available through shared tray',
    !source.includes('openProductDeepInsight,')
  ]
];

const failures = checks.filter(([, passed]) => !passed);

if (failures.length) {
  console.error('\nAJ Hub product preview separation validation failed:\n');

  for (const [label] of failures) {
    console.error('- ' + label);
  }

  process.exit(1);
}

console.log('\nAJ Hub product preview separation validation passed.');

for (const [label] of checks) {
  console.log('✓ ' + label);
}
