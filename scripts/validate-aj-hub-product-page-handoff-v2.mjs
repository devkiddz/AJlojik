#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const target = path.join(process.cwd(), 'components/ActiveProductWidget.tsx');

if (!fs.existsSync(target)) {
  console.error('[validate-aj-hub-product-page-handoff-v2] Missing components/ActiveProductWidget.tsx');
  process.exit(1);
}

const content = fs.readFileSync(target, 'utf8');
const failures = [];

function requireText(value, message) {
  if (!content.includes(value)) failures.push(message);
}

function forbidText(value, message) {
  if (content.includes(value)) failures.push(message);
}

requireText('AJ_HUB_PRODUCT_PAGE_HANDOFF_V2', 'Missing V2 handoff marker.');
requireText('CANONICAL PRODUCT PAGE CONTROL', 'Missing canonical Product Page footer control.');
requireText('View full product details', 'Missing Product Page footer label.');
requireText('encodeURIComponent(product.slug)', 'Footer does not target the canonical product route.');
requireText('Continue Discovery', 'Continue Discovery was removed.');
forbidText('Full Page', 'Header Full Page action still exists.');
forbidText('handleRevealInFeed', 'Legacy Feed reveal handler still exists.');
forbidText('productDetailsDisclosure', 'Legacy Feed disclosure state still exists in ActiveProductWidget.');
forbidText('productDetailsControls', 'Legacy Feed disclosure controls still exist in ActiveProductWidget.');
forbidText('CENTRAL FEED DETAILS CONTROL', 'Legacy Feed footer control still exists.');

if (failures.length) {
  console.error('[validate-aj-hub-product-page-handoff-v2] Validation failed:');
  for (const failure of failures) console.error(' - ' + failure);
  process.exit(1);
}

console.log('[validate-aj-hub-product-page-handoff-v2] Passed');
