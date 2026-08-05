#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const ID = 'validate-aj-product-page-v2a1-gallery-authority';

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

const gallery = read('features/product-page/components/ProductPageGallery.tsx');
const styles = read('features/product-page/components/ProductPageExperience.module.css');

for (const marker of [
  'AJ_PRODUCT_PAGE_GALLERY_VARIANT_DRIVEN_V1',
  'ProductGalleryDialog',
  'selectedVariantId',
  'preferredImageId'
]) {
  if (!gallery.includes(marker)) {
    fail(`ProductPageGallery is missing ${marker}.`);
  }
}

for (const forbidden of [
  'thumbnailRail',
  'thumbnailActive',
  'thumbnailImage',
  'Show ${image.alt}'
]) {
  if (gallery.includes(forbidden)) {
    fail(`ProductPageGallery still contains thumbnail authority: ${forbidden}.`);
  }
}

if (/\.thumbnail(?:Rail|Active|Image)?\b/.test(styles)) {
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

console.log('[validate-aj-product-page-v2a1-gallery-authority] All gallery-authority and payload-cleanup checks passed.');
