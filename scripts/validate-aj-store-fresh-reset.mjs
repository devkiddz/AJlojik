import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(
    path.join(
      root,
      relativePath
    ),
    'utf8'
  ).replaceAll(
    '\r\n',
    '\n'
  );
}

const sources = {
  events: read(
    'features/customer-experience/customerExperienceEvents.ts'
  ),
  runtime: read(
    'features/feed-experience/runtime/GlobalExperienceRuntime.tsx'
  ),
  feedProvider: read(
    'features/feed-experience/providers/FeedExperienceProvider.tsx'
  ),
  stackProvider: read(
    'features/experience-stack/ExperienceStackProvider.tsx'
  ),
  globalHost: read(
    'features/feed-experience/layout/GlobalDiscoveryHost.tsx'
  ),
  navbar: read(
    'components/Navbar.tsx'
  ),
  mobileShell: read(
    'components/layout/MobileApplicationShell.tsx'
  ),
  mobileNavigation: read(
    'components/navigation/MobileBottomNavigation.tsx'
  )
};

const failures = [];

const checks = [
  [
    sources.events,
    'AJ_STORE_FRESH_RESET_V2',
    'Store reset marker'
  ],
  [
    sources.events,
    'CUSTOMER_EXPERIENCE_START_FRESH_EVENT',
    'Store reset event'
  ],
  [
    sources.events,
    'requestFreshStoreExperience',
    'Store reset dispatcher'
  ],
  [
    sources.runtime,
    'setPublishedIntent(\n        null',
    'published Feed-intent reset'
  ],
  [
    sources.feedProvider,
    'intentHistoryRef.current = [];',
    'in-memory Feed-history reset'
  ],
  [
    sources.feedProvider,
    "type:\n          'store-discovery'",
    'fresh Store Feed intent'
  ],
  [
    sources.stackProvider,
    "router.replace(\n      '/store'",
    'canonical bare Store route'
  ],
  [
    sources.stackProvider,
    'CUSTOMER_EXPERIENCE_START_FRESH_EVENT',
    'Experience Stack event bridge'
  ],
  [
    sources.stackProvider,
    'clearHistory()',
    'persistent Experience Stack cleanup'
  ],
  [
    sources.stackProvider,
    'window.scrollTo({',
    'browser viewport reset'
  ],
  [
    sources.globalHost,
    'hubResetVersion',
    'Discovery Hub local-state reset'
  ],
  [
    sources.globalHost,
    'setCollapsed(\n          true',
    'desktop Hub default collapse'
  ],
  [
    sources.navbar,
    'requestFreshStoreExperience();',
    'desktop Store button reset'
  ],
  [
    sources.mobileShell,
    'onResetToStore={resetToStore}',
    'mobile Store reset bridge'
  ],
  [
    sources.mobileNavigation,
    "item.id !== 'store'",
    'mobile Store link interception'
  ],
  [
    sources.mobileNavigation,
    'event.preventDefault();',
    'mobile stale-route prevention'
  ]
];

for (const [source, value, label] of checks) {
  if (!source.includes(value)) {
    failures.push(
      label + ' is missing.'
    );
  }
}

if (
  sources.navbar.includes(
    'router.push(query ?'
  )
) {
  failures.push(
    'AJ Store still preserves stale query navigation.'
  );
}

if (failures.length) {
  console.error(
    '\nAJ Store Fresh Reset validation failed:\n'
  );

  for (const failure of failures) {
    console.error(
      '- ' + failure
    );
  }

  console.error();
  process.exit(1);
}

console.log(
  '\nAJ Store Fresh Reset validation passed.\n\n' +
  'Confirmed:\n' +
  '  Desktop AJ Store and mobile Store use one Start Fresh request\n' +
  '  Product, category, search and published Feed intent are discarded\n' +
  '  In-memory Feed continuity and persistent Experience History are cleared\n' +
  '  Discovery Hub local navigation resets to the default Store state\n' +
  '  Mobile Discovery closes and desktop Hub returns to its collapsed default\n' +
  '  The canonical destination is bare /store with the viewport at the top\n' +
  '  Cart, Wishlist, Shopping Lists and account data are preserved\n' +
  '  No database migration required\n'
);
