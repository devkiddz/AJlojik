import fs from 'node:fs';
import path from 'node:path';

const root =
  process.cwd();

const paths = {
  engine:
    path.join(
      root,
      'features',
      'ai-assistance',
      'server',
      'localAssistantEngine.ts'
    ),
  resolver:
    path.join(
      root,
      'features',
      'ai-assistance',
      'server',
      'marketplaceProductResolver.ts'
    )
};

const failures = [];

function read(
  filePath
) {
  if (
    !fs.existsSync(
      filePath
    )
  ) {
    failures.push(
      `Missing file: ${path.relative(
        root,
        filePath
      )}`
    );

    return '';
  }

  return fs.readFileSync(
    filePath,
    'utf8'
  );
}

function requireMarkers(
  source,
  markers,
  label
) {
  for (
    const marker of
    markers
  ) {
    if (
      !source.includes(
        marker
      )
    ) {
      failures.push(
        `${label} is missing: ${marker}`
      );
    }
  }
}

const engine =
  read(
    paths.engine
  );

const resolver =
  read(
    paths.resolver
  );

requireMarkers(
  resolver,
  [
    'AJ_MS12_4_MARKETPLACE_PRODUCT_RESOLUTION_V1',
    'normalizeMarketplaceText',
    'confessioneries',
    'shortDescription',
    'longDescription',
    'product.category.label',
    'product.subcategory',
    'product.brand',
    'product.tags',
    'variant.label',
    'EXACT_MATCH',
    'CONTEXTUAL_MATCH',
    'ALTERNATIVE_FOUND',
    'UNAVAILABLE',
    'resolveConceptDirections',
    'marketplaceResolutionSections',
    'marketplacePriceComparison',
    'lowest comparable unit cost',
    'clearly labelled alternative'
  ],
  'Marketplace resolver'
);

requireMarkers(
  engine,
  [
    'AJ_MS12_4_MARKETPLACE_PRODUCT_RESOLUTION_V1',
    "from './marketplaceProductResolver'",
    'subcategory: {',
    'resolveMarketplaceRequest({',
    'marketplaceProductSignal(',
    'productScore(',
    'marketplace.score',
    '.preferred',
    '.deprioritized',
    '.excluded',
    'preferredMinimum',
    'marketplaceReason(',
    'marketplaceResolutionSections(',
    'marketplacePriceComparison(',
    'marketplaceResolution\n          .warnings'
  ],
  'Local assistant engine'
);

if (
  engine.includes(
    'prisma.marketplace'
  )
) {
  failures.push(
    'Marketplace resolution unexpectedly depends on a new database model.'
  );
}

if (
  failures.length
) {
  console.error(
    '\nAJ MS12.4 Marketplace Product Resolution validation failed:\n'
  );

  for (
    const failure of
    failures
  ) {
    console.error(
      `- ${failure}`
    );
  }

  console.error();

  process.exit(
    1
  );
}

console.log(`
AJ MS12.4 Marketplace Product Resolution validation passed.

Confirmed:
  Product matching reads title, category, subcategory, brand, tags, descriptions and variant identity
  Common marketplace misspellings are normalised without silently changing marketplace facts
  Latest category proportions can increase, prefer, reduce or exclude product concepts
  Exact, contextual, alternative and unavailable resolution states are present
  Available alternatives remain clearly labelled rather than silently substituted
  Price comparison separates checkout price from comparable unit value
  Explicit customer direction participates in product ranking and constrained composition
  Marketplace assumptions and reconciliation are exposed in customer-facing response sections
  Plan snapshot authority remains in the existing repository material-change boundary
  No database migration required
`);
