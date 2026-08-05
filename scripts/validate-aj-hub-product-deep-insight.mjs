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

function read(
  relativePath
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
    console.error(
      `Missing required file: ${relativePath}`
    );

    process.exit(
      1
    );
  }

  return readFileSync(
    path,
    'utf8'
  )
    .replace(
      /\r\n/g,
      '\n'
    );
}

const bridge =
  read(
    'features/product-intelligence/productDeepInsightBridge.ts'
  );

const resolver =
  read(
    'features/product-intelligence/resolveCatalogProductDeepInsight.ts'
  );

const widget =
  read(
    'components/discovery-hub-panel/widgets/ProductDeepInsightWidget.tsx'
  );

const aiWidget =
  read(
    'components/discovery-hub-panel/widgets/AIIntelligenceWidget.tsx'
  );

const desktop =
  read(
    'components/discovery-hub-panel/DesktopDiscoveryRail.tsx'
  );

const mobileShell =
  read(
    'components/discovery-hub-panel/DiscoverExperienceShell.tsx'
  );

const mobileHost =
  read(
    'components/discovery-hub-panel/MobileDiscoverySheetHost.tsx'
  );

const activeProduct =
  read(
    'components/ActiveProductWidget.tsx'
  );

const cardTray =
  read(
    'features/products/cards/ProductActionTray.tsx'
  );

const hubData =
  read(
    'data/discoveryHubData.ts'
  );

const checks = [
  [
    'installation marker',
    bridge.includes(
      'AJ_HUB_PRODUCT_DEEP_INSIGHT_V1'
    ) &&
      aiWidget.includes(
        'AJ_HUB_PRODUCT_DEEP_INSIGHT_WIRING_V1'
      )
  ],

  [
    'product insight bridge',
    bridge.includes(
      'openProductDeepInsight'
    ) &&
      bridge.includes(
        'useProductDeepInsight'
      ) &&
      bridge.includes(
        'clearProductDeepInsight'
      )
  ],

  [
    'catalog resolver',
    resolver.includes(
      'resolveCatalogProductDeepInsight'
    ) &&
      resolver.includes(
        'awarenessSignals'
      ) &&
      resolver.includes(
        'relatedProducts'
      ) &&
      resolver.includes(
        'sourceNote'
      )
  ],

  [
    'rich Hub AI product expression',
    widget.includes(
      'data-aj-product-deep-insight'
    ) &&
      widget.includes(
        'data-aj-product-deep-insight-awareness'
      ) &&
      widget.includes(
        'data-aj-product-deep-insight-media'
      ) &&
      widget.includes(
        'data-aj-product-deep-insight-suggestions'
      ) &&
      widget.includes(
        'data-aj-product-deep-insight-faqs'
      ) &&
      widget.includes(
        'data-aj-product-deep-insight-source-boundary'
      )
  ],

  [
    'AI section runtime switch',
    aiWidget.includes(
      'useProductDeepInsight'
    ) &&
      aiWidget.includes(
        '<ProductDeepInsightWidget'
      )
  ],

  [
    'desktop Hub activation',
    /setActiveHubGroupId\(\s*'ai'\s*\)/.test(
      desktop
    ) &&
      desktop.includes(
        'useProductDeepInsight'
      )
  ],

  [
    'mobile Hub activation',
    /setActiveGroupId\(\s*'ai'\s*\)/.test(
      mobileShell
    ) &&
      mobileShell.includes(
        'useProductDeepInsight'
      ) &&
      mobileHost.includes(
        'useProductDeepInsight'
      ) &&
      mobileHost.includes(
        'openDiscovery();'
      )
  ],

  [
    'active product Deep Insight stays in Hub',
    activeProduct.includes(
      'openProductDeepInsight({'
    ) &&
      activeProduct.includes(
        "source:\n          'active-product'"
      ) &&
      !activeProduct.includes(
        'router.push(\n        `/ai?'
      )
  ],

  [
    'product-card Deep Insight stays in Hub',
    cardTray.includes(
      'openProductDeepInsight({'
    ) &&
      cardTray.includes(
        "source:\n        'product-card'"
      ) &&
      !cardTray.includes(
        'router.push'
      )
  ],

  [
    'AI group exposes catalog-grounded product insight',
    /id:\s*'ai'[\s\S]*?anySignals:\s*\[[\s\S]*?'products'/.test(
      hubData
    ) &&
      /id:\s*'ai-suggestions'[\s\S]*?anySignals:\s*\[[\s\S]*?'products'/.test(
        hubData
      )
  ],

  [
    'dedicated AI page handoff wording removed',
    !activeProduct.includes(
      'full intelligence workspace'
    ) &&
      !cardTray.includes(
        'continue with AJ Intelligence'
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

if (
  failures.length >
  0
) {
  console.error(
    '\nAJ Hub Product Deep Insight validation failed:\n'
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
  '\nAJ Hub Product Deep Insight validation passed.'
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
