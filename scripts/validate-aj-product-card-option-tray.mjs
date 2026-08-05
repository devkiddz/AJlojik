#!/usr/bin/env node

import {
  existsSync,
  readFileSync
} from 'node:fs';

import {
  resolve
} from 'node:path';

const root =
  process.cwd();

const trayPath =
  resolve(
    root,
    'features/products/cards/ProductActionTray.tsx'
  );

const requiredCardPaths = [
  'features/products/cards/ProductCard.tsx',
  'features/products/cards/FeaturedProductCard.tsx',
  'features/products/cards/CollectionFeatureProductCard.tsx',
  'features/products/cards/PromoProductCard.tsx',
  'components/discovery-hub-panel/components/DiscoveryContinuityCarousel.tsx'
];

function fail(
  message
) {
  console.error(
    'AJ Product Card Option Tray validation failed: ' + message
  );

  process.exit(
    1
  );
}

if (
  !existsSync(
    trayPath
  )
) {
  fail(
    'ProductActionTray.tsx is missing.'
  );
}

const tray =
  readFileSync(
    trayPath,
    'utf8'
  )
    .replace(
      /\r\n/g,
      '\n'
    );

const checks = [
  [
    'installation marker',
    tray.includes(
      'AJ_PRODUCT_CARD_OPTION_TRAY_V1'
    )
  ],
  [
    'default router handoff',
    tray.includes(
      "from 'next/navigation'"
    ) &&
      tray.includes(
        'useRouter'
      )
  ],
  [
    'unconditional More menu',
    tray.includes(
      'aria-label'
    ) &&
      tray.includes(
        'More options for'
      
    ) &&
      !/onAskAI\s*&&\s*!compact/.test(
        tray
      )
  ],
  [
    'Shopping List menu option',
    tray.includes(
      'Add to Shopping List'
    ) &&
      tray.includes(
        'handleOpenShoppingList'
      )
  ],
  [
    'Deep Insight menu option',
    tray.includes(
      'Deep Insight'
    ) &&
      tray.includes(
        'handleDeepInsight'
      )
  ],
  [
    'product-aware AI route',
    tray.includes(
      "mode:"
    ) &&
      tray.includes(
        "'deep-insight'"
      ) &&
      tray.includes(
        "'product-decision'"
      ) &&
      tray.includes(
        'productName:'
      ) &&
      tray.includes(
        'router.push'
      )
  ],
  [
    'custom AI override preserved',
    /if\s*\(\s*onAskAI\s*\)/.test(
      tray
    ) &&
      /void\s+onAskAI\s*\(/.test(
        tray
      )
  ],
  [
    'shopping-list dialog preserved',
    tray.includes(
      '<AddToShoppingListDialog'
    )
  ],
  [
    'compact presentation preserved',
    tray.includes(
      "compact\n      ? 'size-3.5'"
    ) ||
      tray.includes(
        "compact\n      ? 'size-3.5'"
      )
  ]
];

for (
  const [
    label,
    passed
  ] of checks
) {
  if (
    !passed
  ) {
    fail(
      label
    );
  }
}

for (
  const relativePath of
    requiredCardPaths
) {
  const path =
    resolve(
      root,
      relativePath
    );

  if (
    !existsSync(
      path
    )
  ) {
    fail(
      'Required product-card surface is missing: ' + relativePath
    );
  }

  const source =
    readFileSync(
      path,
      'utf8'
    );

  if (
    !source.includes(
      'ProductActionTray'
    )
  ) {
    fail(
      'ProductActionTray is not mounted in ' + relativePath
    );
  }
}

console.log(
  '\nAJ Product Card Option Tray validation passed.'
);

for (
  const [
    label
  ] of checks
) {
  console.log(
    '✓ ' + label
  );
}

for (
  const relativePath of
    requiredCardPaths
) {
  console.log(
    '✓ shared tray coverage: ' + relativePath
  );
}
