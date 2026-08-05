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
    'features/products/cards/ProductActionTray.tsx'
  );

function fail(
  message
) {
  console.error(
    'AJ Product Tray neutral-hover validation failed: ' +
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
    'ProductActionTray.tsx is missing.'
  );
}

const source =
  readFileSync(
    targetPath,
    'utf8'
  )
    .replace(
      /\\r\\n/g,
      '\\n'
    );

const checks = [
  [
    'installation marker',
    source.includes(
      'AJ_PRODUCT_TRAY_NEUTRAL_HOVER_V1'
    )
  ],
  [
    'Shopping List neutral hover',
    /Add to Shopping List[\s\S]*?hover:bg-muted\/70[\s\S]*?focus:bg-muted\/70/.test(
      source
    ) ||
      /hover:bg-muted\/70[\s\S]*?focus:bg-muted\/70[\s\S]*?Add to Shopping List/.test(
        source
      )
  ],
  [
    'Deep Insight neutral hover',
    /Deep Insight[\s\S]*?hover:bg-muted\/70[\s\S]*?focus:bg-muted\/70/.test(
      source
    ) ||
      /hover:bg-muted\/70[\s\S]*?focus:bg-muted\/70[\s\S]*?Deep Insight/.test(
        source
      )
  ],
  [
    'accent hover not added locally',
    !/DropdownMenuItem[\s\S]{0,280}focus:bg-accent/.test(
      source
    )
  ],
  [
    'product actions preserved',
    source.includes(
      'handleOpenShoppingList'
    ) &&
      source.includes(
        'handleDeepInsight'
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
  '\nAJ Product Tray neutral-hover validation passed.'
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
