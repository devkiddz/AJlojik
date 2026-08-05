#!/usr/bin/env node

import {
  existsSync,
  readFileSync
} from 'node:fs';

import {
  resolve
} from 'node:path';

const targetPath =
  resolve(
    process.cwd(),
    'components/discovery-hub-panel/widgets/ProductDeepInsightWidget.tsx'
  );

function fail(
  message
) {
  console.error(
    'AJ Hub consistent product-grid validation failed: ' +
      message
  );

  process.exit(
    1
  );
}

if (
  !existsSync(
    targetPath
  )
) {
  fail(
    'ProductDeepInsightWidget.tsx is missing.'
  );
}

const source =
  readFileSync(
    targetPath,
    'utf8'
  )
    .replace(
      /\r\n/g,
      '\n'
    );

const checks = [
  [
    'installation marker',
    source.includes(
      'AJ_HUB_CONSISTENT_PRODUCT_GRID_V1'
    )
  ],
  [
    'shared ProductCard import',
    source.includes(
      "import {\n  ProductCard\n} from '@/features/products/cards';"
    )
  ],
  [
    'shared card renderer',
    source.includes(
      '<ProductCard'
    ) &&
      source.includes(
        'item.product'
      )
  ],
  [
    'compact responsive grid',
    source.includes(
      'data-aj-consistent-product-grid'
    ) &&
      source.includes(
        'grid-cols-2'
      ) &&
      source.includes(
        'sm:grid-cols-3'
      )
  ],
  [
    'shared commerce action',
    source.includes(
      'onAddToCart={'
    ) &&
      source.includes(
        'actions.addToCart'
      )
  ],
  [
    'shared Deep Insight action',
    source.includes(
      'onAskAI={'
    ) &&
      source.includes(
        'openProductDeepInsight({'
      )
  ],
  [
    'comparison reason preserved',
    source.includes(
      'data-aj-related-product-reason'
    )
  ],
  [
    'oversized custom product card removed',
    !source.includes(
      'sizes="180px"'
    ) &&
      !source.includes(
        'group overflow-hidden\n                      rounded-2xl border'
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

console.log(
  '\nAJ Hub consistent product-grid validation passed.'
);

for (
  const [
    label
  ] of checks
) {
  console.log(
    '✓ ' +
      label
  );
}
