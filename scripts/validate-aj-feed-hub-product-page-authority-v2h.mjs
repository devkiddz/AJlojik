#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

const checks = [
  {
    path: 'features/product-experience-state/hubProductPreviewBridge.ts',
    includes: [
      'AJ_HUB_PRODUCT_PREVIEW_AUTHORITY_V1',
      'previewProductInHub',
      'clearHubProductPreview',
      'useHubProductPreview',
      'reveal'
    ]
  },
  {
    path: 'features/feed-experience/providers/FeedExperienceProvider.tsx',
    includes: [
      'AJ_FEED_PREVIEW_UPDATES_HUB_ONLY_V1',
      'previewCatalogProductInHub',
      "if (target.type === 'product')",
      'previewProductInHub',
      "source:\n            'feed'",
      'previewCatalogProductInHub(\n          product.id'
    ],
    excludes: [
      'openProductInFeed',
      'revealProductInFeedRef'
    ]
  },
  {
    path: 'components/ActiveProductWidget.tsx',
    includes: [
      'AJ_FEED_HUB_PRODUCT_PAGE_AUTHORITY_V1',
      'useHubProductPreview',
      'useHubProductPageNavigation',
      'Similar Products',
      'Continue Discovering',
      'View more'
    ],
    excludes: [
      'onRevealInFeed',
      'const router =\n    useRouter()'
    ]
  },
  {
    path: 'components/discovery-hub-panel/DesktopDiscoveryRail.tsx',
    includes: [
      'AJ_DESKTOP_HUB_PREVIEW_AUTHORITY_V1',
      'useHubProductPreview',
      'clearHubProductPreview',
      "view:\n                'discovery'"
    ],
    excludes: [
      'continueDiscovery();'
    ]
  },
  {
    path: 'components/discovery-hub-panel/DiscoverExperienceShell.tsx',
    includes: [
      'AJ_MOBILE_HUB_PREVIEW_AUTHORITY_V1',
      'useHubProductPreview',
      'clearHubProductPreview'
    ],
    excludes: [
      'continueDiscovery();',
      'onRevealInFeed'
    ]
  },
  {
    path: 'components/discovery-hub-panel/MobileDiscoverySheetHost.tsx',
    includes: [
      'AJ_MOBILE_SHEET_HUB_PREVIEW_AUTHORITY_V1',
      'useHubProductPreview',
      'hubProductPreview?.reveal'
    ],
    excludes: [
      'activeProductIntentId',
      'useFeedExperience'
    ]
  },
  {
    path: 'components/discovery-hub-panel/components/DiscoveryContinuityCarousel.tsx',
    includes: [
      'AJ_HUB_CONTINUITY_TO_PRODUCT_PAGE_V1',
      'useHubProductPreview',
      'useHubProductPageNavigation',
      'openProductPageFromHub'
    ],
    excludes: [
      'openProductInFeed'
    ]
  },
  {
    path: 'components/discovery-hub-panel/navigation/useHubProductPageNavigation.ts',
    includes: [
      'AJ_HUB_TO_PRODUCT_PAGE_AUTHORITY_V1',
      'selectProductVariant',
      'previewProductInHub',
      "source:\n          'hub'",
      '`/products/${encodeURIComponent(product.slug)}`'
    ]
  },
  {
    path: 'features/product-page/components/ProductPageExperience.tsx',
    includes: [
      'AJ_PRODUCT_PAGE_SYNCHRONIZES_HUB_V1',
      'previewProductInHub',
      "source:\n        'product-page'",
      "reveal:\n        false"
    ]
  },
  {
    path: 'features/feed-experience/layout/FeedExperienceWorkspace.tsx',
    includes: [
      'AJ_STORE_PRODUCT_QUERY_UPDATES_HUB_ONLY_V1',
      'Legacy `/store?product=` links now resolve into the Hub only',
      "source:\n        'legacy-route'"
    ],
    excludes: [
      'id: `product:${selectedProductId}:route`'
    ]
  },
  {
    path: 'features/feed-experience/runtime/GlobalExperienceRuntime.tsx',
    includes: [
      'AJ_GLOBAL_HUB_PREVIEW_FALLBACK_V1',
      'previewProductInHub',
      "source:\n            'feed'"
    ],
    excludes: [
      'openCustomerProductExperience'
    ]
  }
];

const failures = [];

function read(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);

  if (!fs.existsSync(absolutePath)) {
    failures.push(`Missing ${relativePath}`);
    return '';
  }

  return fs.readFileSync(absolutePath, 'utf8').replace(/\r\n/g, '\n');
}

for (const check of checks) {
  const source = read(check.path);

  for (const expected of check.includes ?? []) {
    if (!source.includes(expected)) {
      failures.push(`${check.path} is missing required marker or structure: ${JSON.stringify(expected)}`);
    }
  }

  for (const forbidden of check.excludes ?? []) {
    if (source.includes(forbidden)) {
      failures.push(`${check.path} still contains retired authority: ${JSON.stringify(forbidden)}`);
    }
  }
}

const scanRoots = [
  'components',
  'features/feed-experience'
];

function walk(directory) {
  if (!fs.existsSync(directory)) {
    return [];
  }

  const entries = fs.readdirSync(directory, {
    withFileTypes: true
  });

  return entries.flatMap(entry => {
    if (
      entry.name === 'node_modules' ||
      entry.name === '.next' ||
      entry.name.startsWith('install-aj-') ||
      entry.name === '.aj-installer-backups'
    ) {
      return [];
    }

    const absolute = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return walk(absolute);
    }

    return /\.(?:ts|tsx|js|jsx|mjs)$/.test(entry.name)
      ? [absolute]
      : [];
  });
}

for (const scanRoot of scanRoots) {
  for (const absolutePath of walk(path.join(ROOT, scanRoot))) {
    const source = fs.readFileSync(absolutePath, 'utf8').replace(/\r\n/g, '\n');

    if (source.includes('openProductInFeed')) {
      failures.push(
        `${path.relative(ROOT, absolutePath)} still references openProductInFeed.`
      );
    }
  }
}

if (failures.length > 0) {
  console.error('[validate-aj-feed-hub-product-page-authority-v2h] Validation failed.');

  for (const failure of failures) {
    console.error(`- ${failure}`);
  }

  process.exit(1);
}

console.log(
  '[validate-aj-feed-hub-product-page-authority-v2h] Feed previews update only the Hub; Hub product choices navigate the canonical Product Page; Product Page state synchronizes back to the Hub.'
);
