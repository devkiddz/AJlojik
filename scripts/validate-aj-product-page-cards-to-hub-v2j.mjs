#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const files = {
  "relationships": "features/product-page/components/ProductRelationshipSection.tsx",
  "bridge": "features/product-experience-state/hubProductPreviewBridge.ts",
  "active": "components/ActiveProductWidget.tsx",
  "validator": "scripts/validate-aj-product-page-cards-to-hub-v2j.mjs"
};
const failures = [];

function read(key) {
  const target = path.join(root, files[key]);
  if (!fs.existsSync(target)) {
    failures.push(`Missing: ${files[key]}`);
    return '';
  }
  return fs.readFileSync(target, 'utf8').replace(/\r\n/g, '\n');
}

const relationships = read('relationships');
const bridge = read('bridge');
const active = read('active');

if (!relationships.includes('AJ_PRODUCT_PAGE_RELATIONSHIPS_PREVIEW_HUB_V2J')) {
  failures.push('Product Page relationship Hub-preview marker is missing.');
}

if (!relationships.includes('previewProductFromPage')) {
  failures.push('Product Page cards do not expose the Hub-preview handler.');
}

if (!relationships.includes('previewProductInHub({')) {
  failures.push('Product Page cards are not connected to the Hub preview bridge.');
}

if (!relationships.includes("source:\n          'product-page'")) {
  failures.push('Product Page relationship preview source is missing.');
}

if (!relationships.includes('reveal:\n          true')) {
  failures.push('Product Page relationship cards do not reveal/update the Hub.');
}

if (!relationships.includes('onOpenExperience={\n                previewProductFromPage') ||
    !relationships.includes('onPreview={\n                previewProductFromPage')) {
  failures.push('Both Product Card interaction paths must update the Hub.');
}

if (relationships.includes('useRouter') ||
    relationships.includes('router.push(') ||
    relationships.includes('openProductPage')) {
  failures.push('Product Page relationship cards still contain direct route navigation.');
}

if (!bridge.includes('AJ_HUB_PRODUCT_PREVIEW_AUTHORITY_V1')) {
  failures.push('The independent Hub Product Preview bridge is missing.');
}

const activePageCalls = (active.match(/openProductPageFromHub\s*\(/g) ?? []).length;
if (!active.includes('View more') || activePageCalls !== 1) {
  failures.push('Only the Hub View more control should retain Product Page navigation.');
}

if (failures.length) {
  console.error('[validate-aj-product-page-cards-to-hub-v2j] Validation failed.');
  for (const failure of failures) console.error('- ' + failure);
  process.exit(1);
}

console.log('[validate-aj-product-page-cards-to-hub-v2j] Product Page discovery cards update the Hub only; the page route remains unchanged; Hub View more remains the sole product-page handoff.');
