#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const VALIDATOR_ID = 'validate-aj-product-page-v2a-fluid-ui';

function fail(message) {
  console.error(`\n[${VALIDATOR_ID}] ${message}\n`);
  process.exit(1);
}

function read(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);

  if (!fs.existsSync(absolutePath)) {
    fail(`Missing file: ${relativePath}`);
  }

  return fs.readFileSync(absolutePath, 'utf8');
}

const experience = read(
  'features/product-page/components/ProductPageExperience.tsx'
);
const gallery = read(
  'features/product-page/components/ProductPageGallery.tsx'
);
const purchase = read(
  'features/product-page/components/ProductPurchasePanel.tsx'
);
const mobile = read(
  'features/product-page/components/ProductPageMobileBar.tsx'
);
const styles = read(
  'features/product-page/components/ProductPageExperience.module.css'
);
const discoveryHost = read(
  'features/feed-experience/layout/GlobalDiscoveryHost.tsx'
);

const checks = [
  [
    experience.includes('AJ_PRODUCT_PAGE_EXPERIENCE_V2A_FLUID_UI'),
    'Missing Product Page V2-A marker.'
  ],
  [
    experience.includes('data-aj-product-page-root'),
    'Missing Product Page root marker.'
  ],
  [
    experience.includes('ProductPageExperience.module.css'),
    'The Product Page is not using its fluid CSS module.'
  ],
  [
    gallery.includes('styles.galleryProductImage'),
    'The gallery is not using the contained product-artwork presentation.'
  ],
  [
    purchase.includes('Choose your option'),
    'The option-selection copy was not normalized.'
  ],
  [
    purchase.includes('No reviews yet'),
    'The empty-review state was not normalized.'
  ],
  [
    purchase.includes('Ask AJ about this product'),
    'The AJ action copy was not normalized.'
  ],
  [
    !purchase.includes('Current price'),
    'Legacy Current price copy remains.'
  ],
  [
    !purchase.includes('Catalog availability'),
    'Legacy duplicate catalog-availability card remains.'
  ],
  [
    mobile.includes('styles.mobileBar'),
    'The mobile purchase bar is not using the fluid presentation.'
  ],
  [
    styles.includes('container-name: product-page'),
    'Missing Product Page container authority.'
  ],
  [
    styles.includes('container-name: purchase-panel'),
    'Missing purchase-panel container authority.'
  ],
  [
    styles.includes('@container product-page'),
    'Missing Product Page container-query breakpoints.'
  ],
  [
    styles.includes('var(--app-page-gutter)'),
    'The Product Page is not consuming the application fluid gutter.'
  ],
  [
    styles.includes('var(--app-card-radius)'),
    'The Product Page is not consuming the application fluid radius.'
  ],
  [
    styles.includes('object-fit: contain'),
    'The primary product artwork is not preserved with object-contain.'
  ],
  [
    styles.includes('#customer-experience-back-slot:not(:empty)'),
    'The Back-control spacing boundary is missing.'
  ],
  [
    discoveryHost.includes('data-aj-fluid-discovery-hub-width'),
    'Missing fluid Discovery Hub width marker.'
  ],
  [
    discoveryHost.includes("'w-[var(--app-panel-width)]'"),
    'The expanded Discovery Hub is not using --app-panel-width.'
  ],
  [
    !discoveryHost.includes("'w-[28rem] xl:w-[31rem]'"),
    'The fixed Discovery Hub width remains.'
  ]
];

for (const [passed, message] of checks) {
  if (!passed) {
    fail(message);
  }
}

console.log(`[${VALIDATOR_ID}] All V2-A fluid UI checks passed.`);
