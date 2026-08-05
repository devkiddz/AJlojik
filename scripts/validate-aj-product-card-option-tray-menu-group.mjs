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

const targetPath =
  resolve(
    root,
    'features/products/cards/ProductActionTray.tsx'
  );

function fail(
  message
) {
  console.error(
    'AJ Product Card Option Tray menu-group validation failed: ' +
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

const contentIndex =
  source.indexOf(
    '<DropdownMenuContent'
  );

const groupIndex =
  source.indexOf(
    '<DropdownMenuGroup>',
    contentIndex
  );

const labelIndex =
  source.indexOf(
    '<DropdownMenuLabel',
    contentIndex
  );

const separatorIndex =
  source.indexOf(
    '<DropdownMenuSeparator />',
    contentIndex
  );

const firstItemIndex =
  source.indexOf(
    '<DropdownMenuItem',
    contentIndex
  );

const groupCloseIndex =
  source.indexOf(
    '</DropdownMenuGroup>',
    contentIndex
  );

const contentCloseIndex =
  source.indexOf(
    '</DropdownMenuContent>',
    contentIndex
  );

const checks = [
  [
    'hotfix marker',
    source.includes(
      'AJ_PRODUCT_CARD_OPTION_TRAY_MENU_GROUP_HOTFIX_V1'
    )
  ],
  [
    'dropdown content',
    contentIndex >= 0
  ],
  [
    'group opens before label',
    groupIndex >
      contentIndex &&
      groupIndex <
        labelIndex
  ],
  [
    'label remains inside group',
    labelIndex >
      groupIndex &&
      labelIndex <
        groupCloseIndex
  ],
  [
    'separator remains inside group',
    separatorIndex >
      labelIndex &&
      separatorIndex <
        groupCloseIndex
  ],
  [
    'menu items remain inside group',
    firstItemIndex >
      separatorIndex &&
      firstItemIndex <
        groupCloseIndex
  ],
  [
    'group closes before content',
    groupCloseIndex >
      firstItemIndex &&
      groupCloseIndex <
        contentCloseIndex
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
  '\nAJ Product Card Option Tray menu-group validation passed.'
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
