#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const ID = 'validate-aj-product-page-v2c-completion';

function fail(message) {
  console.error(`[${ID}] ${message}`);
  process.exit(1);
}

function read(relativePath) {
  const filePath = path.join(ROOT, relativePath);

  if (!fs.existsSync(filePath)) {
    fail(`Missing ${relativePath}.`);
  }

  return fs.readFileSync(filePath, 'utf8');
}

const details = read('features/product-page/components/ProductPageDetails.tsx');
const detailsStyles = read('features/product-page/components/ProductPageDetails.module.css');
const relationships = read('features/product-page/components/ProductRelationshipSection.tsx');
const relationshipStyles = read('features/product-page/components/ProductRelationshipSection.module.css');
const experience = read('features/product-page/components/ProductPageExperience.tsx');

for (const marker of [
  'AJ_PRODUCT_PAGE_V2C_PREMIUM_DETAILS',
  'The story behind this selection',
  'The essentials, without the noise',
  'Everything important, clearly arranged',
  'ProductReviewsSection',
  'Tracked fulfillment',
  'Shared customer state'
]) {
  if (!details.includes(marker)) {
    fail(`ProductPageDetails is missing ${marker}.`);
  }
}

for (const forbidden of [
  'Products sold',
  'Product options',
  'Units available',
  'In-stock options',
  'Delivery awareness'
]) {
  if (details.includes(forbidden)) {
    fail(`ProductPageDetails still contains the old lower-page copy: ${forbidden}.`);
  }
}

for (const marker of [
  'AJ_PRODUCT_PAGE_V2C_PREMIUM_DETAILS',
  '.storyLayout',
  '.informationLayout',
  '.categoryCard',
  '.reviewsShell',
  '.confidenceGrid',
  '@container product-page',
  '--app-card-radius',
  '--app-section-gap'
]) {
  if (!detailsStyles.includes(marker)) {
    fail(`ProductPageDetails styles are missing ${marker}.`);
  }
}

for (const marker of [
  'AJ_PRODUCT_PAGE_V2C_COMPACT_DISCOVERY_RAIL',
  'Swipe to explore',
  'router.push',
  'ProductCard'
]) {
  if (!relationships.includes(marker)) {
    fail(`ProductRelationshipSection is missing ${marker}.`);
  }
}

for (const marker of [
  'AJ_PRODUCT_PAGE_V2C_COMPACT_DISCOVERY_RAIL',
  'grid-auto-flow: column',
  'scroll-snap-type: inline mandatory',
  'grid-auto-columns: clamp',
  '@container product-page'
]) {
  if (!relationshipStyles.includes(marker)) {
    fail(`Product relationship styles are missing ${marker}.`);
  }
}

for (const marker of [
  'ProductPageDetails',
  'Similar Products',
  'Continue Discovering'
]) {
  if (!experience.includes(marker)) {
    fail(`ProductPageExperience no longer contains ${marker}.`);
  }
}

const payloadDirectories = fs
  .readdirSync(ROOT, { withFileTypes: true })
  .filter(entry =>
    entry.isDirectory() &&
    /^install-aj-.*\.payload$/i.test(entry.name)
  );

if (payloadDirectories.length > 0) {
  fail(`Installer payload directories still pollute TypeScript scope: ${payloadDirectories.map(entry => entry.name).join(', ')}`);
}

console.log('[validate-aj-product-page-v2c-completion] Product story, facts, category context, merchant trust, approved review presentation, fulfillment confidence and compact discovery rails all passed.');
