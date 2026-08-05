#!/usr/bin/env node

import {
  existsSync,
  readFileSync
} from 'node:fs';

import {
  resolve
} from 'node:path';

const root = process.cwd();

const files = {
  active:
    resolve(root, 'components/ActiveProductWidget.tsx'),
  continuity:
    resolve(root, 'components/discovery-hub-panel/components/DiscoveryContinuityCarousel.tsx'),
  insight:
    resolve(root, 'components/discovery-hub-panel/widgets/ProductDeepInsightWidget.tsx'),
  relationship:
    resolve(root, 'features/product-page/components/ProductRelationshipSection.tsx'),
  relationshipStyles:
    resolve(root, 'features/product-page/components/ProductRelationshipSection.module.css')
};

const missing =
  Object.entries(files)
    .filter(([, path]) => !existsSync(path))
    .map(([label]) => label);

if (missing.length) {
  console.error('[validate-aj-product-page-v2d-hub-page-authority] Missing files:');
  for (const label of missing) {
    console.error('- ' + label);
  }
  process.exit(1);
}

const source =
  Object.fromEntries(
    Object.entries(files).map(
      ([label, path]) => [
        label,
        readFileSync(path, 'utf8').replace(/\r\n/g, '\n')
      ]
    )
  );

const checks = [
  [
    'Active Product Hub routes related-card selections to canonical Product Pages',
    source.active.includes('AJ_HUB_PRODUCT_PAGE_AUTHORITY_V2D') &&
      source.active.includes('openProductPageFromHub') &&
      source.active.includes('router.push(') &&
      source.active.includes('encodeURIComponent(candidate.slug)') &&
      !source.active.includes('openProductInFeed')
  ],
  [
    'Continuity cards route to canonical Product Pages',
    source.continuity.includes('AJ_HUB_PRODUCT_PAGE_AUTHORITY_V2D') &&
      source.continuity.includes('selectProductVariant({') &&
      source.continuity.includes('encodeURIComponent(item.product.slug)') &&
      !source.continuity.includes('openProductInFeed')
  ],
  [
    'Deep Insight related products route to canonical Product Pages',
    source.insight.includes('AJ_HUB_PRODUCT_PAGE_AUTHORITY_V2D') &&
      source.insight.includes('encodeURIComponent(candidate.slug)') &&
      source.insight.includes("source:") &&
      source.insight.includes("'hub'") &&
      !source.insight.includes("type:\n          'product',\n\n        productId")
  ],
  [
    'Product Page suggestions retain canonical navigation',
    source.relationship.includes('onOpenExperience={') &&
      source.relationship.includes('openProductPage') &&
      source.relationship.includes('/products/${encodeURIComponent(product.slug)}')
  ],
  [
    'Desktop relationship controls are installed',
    source.relationship.includes('AJ_PRODUCT_PAGE_V2D_DESKTOP_RAIL_CONTROLS') &&
      source.relationship.includes('railRef') &&
      source.relationship.includes('scrollProducts') &&
      source.relationship.includes('canScrollBackward') &&
      source.relationship.includes('canScrollForward')
  ],
  [
    'Desktop controls use pointer-aware presentation',
    source.relationshipStyles.includes('AJ_PRODUCT_PAGE_V2D_DESKTOP_RAIL_CONTROLS') &&
      source.relationshipStyles.includes('(pointer: fine)') &&
      source.relationshipStyles.includes('.desktopControls') &&
      source.relationshipStyles.includes('.scrollButtonPrimary')
  ]
];

const failures =
  checks.filter(([, passed]) => !passed);

if (failures.length) {
  console.error('\nAJ Product Page V2-D validation failed:\n');

  for (const [label] of failures) {
    console.error('- ' + label);
  }

  process.exit(1);
}

console.log('[validate-aj-product-page-v2d-hub-page-authority] All checks passed.');
