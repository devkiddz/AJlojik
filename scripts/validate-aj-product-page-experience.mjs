import fs from 'node:fs';
import path from 'node:path';

const root =
  process.cwd();

const requiredFiles = [
  'app/(store)/products/[id]/page.tsx',
  'app/(store)/products/[id]/loading.tsx',
  'app/(store)/products/[id]/not-found.tsx',
  'features/product-page/contracts.ts',
  'features/product-page/server/getProductPage.ts',
  'features/product-page/components/ProductPageExperience.tsx',
  'features/product-experience-state/productVariantSelectionBridge.ts',
  'features/products/resolution/resolveProductRelationships.ts'
];

const failures = [];

function read(relativePath) {
  const absolutePath =
    path.join(
      root,
      relativePath
    );

  if (
    !fs.existsSync(
      absolutePath
    )
  ) {
    failures.push(
      `Missing ${relativePath}`
    );

    return '';
  }

  return fs.readFileSync(
    absolutePath,
    'utf8'
  );
}

for (const requiredFile of requiredFiles) {
  read(requiredFile);
}

const checks = [
  {
    file:
      'features/product-experience-state/productVariantSelectionBridge.ts',
    marker:
      'AJ_SHARED_PRODUCT_VARIANT_SELECTION_V1'
  },
  {
    file:
      'features/products/resolution/resolveProductRelationships.ts',
    marker:
      'AJ_PRODUCT_RELATIONSHIP_RESOLVER_V1'
  },
  {
    file:
      'features/feed-experience/runtime/GlobalExperienceRuntime.tsx',
    marker:
      'AJ_PRODUCT_ROUTE_INTENT_NORMALIZATION_V1'
  },
  {
    file:
      'features/feed-experience/layout/GlobalDiscoveryHost.tsx',
    marker:
      'AJ_PRODUCT_PAGE_HUB_EXPANSION_V1'
  },
  {
    file:
      'components/ActiveProductWidget.tsx',
    marker:
      'AJ_SHARED_PRODUCT_VARIANT_SELECTION_V1'
  },
  {
    file:
      'features/products/cards/ProductActionTray.tsx',
    marker:
      'AJ_PRODUCT_FULL_PAGE_ACTION_V1'
  },
  {
    file:
      'features/feed-experience/builders/buildProductExperience.ts',
    marker:
      'resolveProductRelationships'
  },
  {
    file:
      'features/catalog/mappers/map-database-product.ts',
    marker:
      'images:'
  },
  {
    file:
      'types/types.ts',
    marker:
      'images?: string[]'
  },
  {
    file:
      'features/product-intelligence/productDeepInsightBridge.ts',
    marker:
      "'product-page'"
  }
];

for (const check of checks) {
  const content =
    read(
      check.file
    );

  if (
    content &&
    !content.includes(
      check.marker
    )
  ) {
    failures.push(
      `${check.file} is missing ${check.marker}`
    );
  }
}

const activeProductWidget =
  read(
    'components/ActiveProductWidget.tsx'
  );

if (
  activeProductWidget.includes(
    'setVariantSelection({'
  )
) {
  failures.push(
    'ActiveProductWidget still owns local variant selection.'
  );
}

const productPage =
  read(
    'app/(store)/products/[id]/page.tsx'
  );

if (
  !productPage.includes(
    'generateMetadata'
  ) ||
  !productPage.includes(
    'application/ld+json'
  )
) {
  failures.push(
    'Canonical product metadata or JSON-LD is incomplete.'
  );
}

if (
  failures.length >
  0
) {
  console.error(
    '\nAJ Product Page Experience validation failed:\n'
  );

  for (const failure of failures) {
    console.error(
      `- ${failure}`
    );
  }

  process.exit(
    1
  );
}

console.log(
  'AJ Product Page Experience V1 validation passed.'
);
