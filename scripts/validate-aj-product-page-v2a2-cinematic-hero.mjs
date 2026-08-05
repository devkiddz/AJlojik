#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const ID = 'validate-aj-product-page-v2a2-cinematic-hero';

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

const experience = read('features/product-page/components/ProductPageExperience.tsx');
const gallery = read('features/product-page/components/ProductPageGallery.tsx');
const panel = read('features/product-page/components/ProductPurchasePanel.tsx');
const styles = read('features/product-page/components/ProductPageExperience.module.css');

for (const marker of [
  'AJ_PRODUCT_PAGE_V2A2_RCENTZ_CINEMATIC_HERO',
  'data-aj-product-cinematic-hero',
  'data.category.coverImage',
  'ProductPageGallery',
  'ProductPurchasePanel'
]) {
  if (!experience.includes(marker)) {
    fail(`ProductPageExperience is missing ${marker}.`);
  }
}

for (const marker of [
  'AJ_PRODUCT_PAGE_V2A2_PREVIEWER_ONLY',
  'ProductGalleryDialog',
  'selectedVariantId',
  'showPrevious',
  'showNext',
  'Use variants to change the purchasable option'
]) {
  if (!gallery.includes(marker)) {
    fail(`ProductPageGallery is missing ${marker}.`);
  }
}

for (const forbidden of [
  'thumbnailRail',
  'thumbnailActive',
  'thumbnailImage',
  'categoryCoverImage'
]) {
  if (gallery.includes(forbidden)) {
    fail(`ProductPageGallery still contains forbidden authority: ${forbidden}.`);
  }
}

for (const marker of [
  'AJ_PRODUCT_PAGE_V2A2_COMPACT_PURCHASE_PANEL',
  'Choose your option',
  'Selected option',
  'Ask AJ about this product',
  'Live catalog availability'
]) {
  if (!panel.includes(marker)) {
    fail(`ProductPurchasePanel is missing ${marker}.`);
  }
}

for (const marker of [
  'AJ_PRODUCT_PAGE_V2A2_RCENTZ_CINEMATIC_HERO',
  '.heroCover',
  '.heroShade',
  '.heroContent',
  '.productTitle',
  'container-name: product-page',
  '@container product-page',
  '--app-page-gutter',
  '--app-card-radius'
]) {
  if (!styles.includes(marker)) {
    fail(`Product Page styles are missing ${marker}.`);
  }
}

if (/\.thumbnail(?:Rail|Active|Image)?/.test(styles)) {
  fail('Product Page styles still contain thumbnail selectors.');
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

console.log('[validate-aj-product-page-v2a2-cinematic-hero] All cinematic hero, compact panel, fluid scaling and gallery-authority checks passed.');
