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
    'AJ Product Tray hover-contrast validation failed: ' +
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
      'AJ_PRODUCT_TRAY_HOVER_CONTRAST_HOTFIX_V1'
    )
  ],
  [
    'neutral hover background preserved',
    (
      source.match(
        /hover:bg-muted\/70/g
      ) ??
      []
    ).length >=
      2
  ],
  [
    'hover descendant foreground override',
    (
      source.match(
        /hover:\[&_\*\]:!text-foreground/g
      ) ??
      []
    ).length >=
      2
  ],
  [
    'focus descendant foreground override',
    (
      source.match(
        /focus:\[&_\*\]:!text-foreground/g
      ) ??
      []
    ).length >=
      2
  ],
  [
    'Shopping List icon contrast',
    source.includes(
      'focus:[&_svg]:!text-emerald-700'
    ) &&
      source.includes(
        'dark:focus:[&_svg]:!text-emerald-300'
      )
  ],
  [
    'Deep Insight icon contrast',
    source.includes(
      'focus:[&_svg]:!text-primary'
    )
  ],
  [
    'actions preserved',
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
  '\nAJ Product Tray hover-contrast validation passed.'
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
