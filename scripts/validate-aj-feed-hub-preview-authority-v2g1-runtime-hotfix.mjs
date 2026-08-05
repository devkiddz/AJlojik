#!/usr/bin/env node

import {
  existsSync,
  readFileSync
} from 'node:fs';

import {
  resolve
} from 'node:path';

const root = process.cwd();

const providerPath = resolve(
  root,
  'features/feed-experience/providers/FeedExperienceProvider.tsx'
);

if (!existsSync(providerPath)) {
  console.error('[validate-aj-feed-hub-preview-authority-v2g1-runtime-hotfix] FeedExperienceProvider.tsx is missing.');
  process.exit(1);
}

const source = readFileSync(providerPath, 'utf8')
  .replace(/\r\n/g, '\n');

const checks = [
  [
    'V2-G preview authority remains installed',
    source.includes('AJ_FEED_HUB_PREVIEW_AUTHORITY_V2G') &&
      source.includes('hubProductPreviewId: string | null;') &&
      source.includes('setHubProductPreviewId(product.id);')
  ],
  [
    'Runtime hotfix marker is installed',
    source.includes('AJ_FEED_HUB_PREVIEW_AUTHORITY_V2G1_RUNTIME_HOTFIX')
  ],
  [
    'Undefined legacy product opener is fully removed',
    !/\bopenProductInFeed\b/.test(source)
  ],
  [
    'Hub preview state is published through context',
    source.includes('pendingIntent,\n\n      hubProductPreviewId,') ||
      source.includes('pendingIntent,\n      hubProductPreviewId,')
  ],
  [
    'Hub preview state remains in memo dependencies',
    source.includes('pendingIntent,\n      hubProductPreviewId,') ||
      source.includes('pendingIntent,\n\n      hubProductPreviewId,')
  ]
];

const failures = checks.filter(([, passed]) => !passed);

if (failures.length > 0) {
  console.error('\nV2-G.1 runtime validation failed:\n');

  for (const [label] of failures) {
    console.error('- ' + label);
  }

  process.exit(1);
}

console.log('[validate-aj-feed-hub-preview-authority-v2g1-runtime-hotfix] All runtime checks passed.');
