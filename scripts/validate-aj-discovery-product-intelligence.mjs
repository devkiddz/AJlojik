#!/usr/bin/env node

import {
  readFileSync
} from 'node:fs';

import {
  resolve
} from 'node:path';

const root =
  process.cwd();

const target =
  resolve(
    root,
    'components/ActiveProductWidget.tsx'
  );

const source =
  readFileSync(
    target,
    'utf8'
  ).replace(
    /\r\n/g,
    '\n'
  );

const checks = [
  [
    'installation marker',
    source.includes(
      'AJ_HUB_PRODUCT_INTELLIGENCE_V1'
    )
  ],
  [
    'intelligence panel',
    source.includes(
      'data-aj-product-intelligence-panel'
    )
  ],
  [
    'comparison resolver',
    source.includes(
      'const comparisonProducts ='
    )
  ],
  [
    'recommendation resolver',
    source.includes(
      'const recommendationProducts ='
    )
  ],
  [
    'product handoff',
    source.includes(
      'openProductInFeed'
    )
  ],
  [
    'deep intelligence CTA',
    source.includes(
      'Explore deeper with AJ Intelligence'
    )
  ],
  [
    'catalog-grounded boundary',
    source.includes(
      'Catalog-grounded'
    )
  ]
];

const failures =
  checks.filter(
    (
      [
        ,
        passed
      ]
    ) =>
      !passed
  );

const markerCount =
  source.split(
    'AJ_HUB_PRODUCT_INTELLIGENCE_V1'
  ).length -
  1;

if (
  markerCount !==
  1
) {
  failures.push([
    'single installation marker',
    false
  ]);
}

if (
  failures.length >
  0
) {
  console.error(
    '\nAJ Discovery Product Intelligence validation failed:\n'
  );

  for (
    const [
      label
    ] of failures
  ) {
    console.error(
      `- ${label}`
    );
  }

  process.exit(
    1
  );
}

console.log(
  '\nAJ Discovery Product Intelligence validation passed.'
);

for (
  const [
    label
  ] of checks
) {
  console.log(
    `✓ ${label}`
  );
}
