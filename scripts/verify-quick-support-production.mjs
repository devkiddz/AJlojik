import fs from 'node:fs';
import path from 'node:path';

const root =
  process.cwd();

const checks = [
  {
    label:
      'Visual viewport and keyboard tracking',
    file:
      'features/support/client/useQuickSupportViewport.ts',
    markers: [
      'window.visualViewport',
      '--quick-support-viewport-height',
      '--quick-support-keyboard-inset',
      'orientationchange'
    ]
  },
  {
    label:
      'Overlay surface customization contract',
    file:
      'features/global-overlay/contracts.ts',
    markers: [
      'surfaceClassName?: string',
      'bodyClassName?: string'
    ]
  },
  {
    label:
      'Overlay surface customization runtime',
    file:
      'features/global-overlay/GlobalOverlayProvider.tsx',
    markers: [
      'data-overlay-id',
      'activeOverlay.surfaceClassName',
      'activeOverlay.bodyClassName'
    ]
  },
  {
    label:
      'Mobile-safe Quick Support overlay',
    file:
      'features/support/components/QuickSupportChatLauncher.tsx',
    markers: [
      'useQuickSupportViewport',
      '--quick-support-viewport-height',
      "bodyClassName:\n            '!overflow-hidden !p-0'",
      'hasRestorableCase'
    ]
  },
  {
    label:
      'Multi-case minimized attention',
    file:
      'features/support/client/useQuickSupportAttentionStream.ts',
    markers: [
      'MAX_ATTENTION_STREAMS',
      'caseIds:',
      'reconnectEpoch',
      'seenEventsRef'
    ]
  },
  {
    label:
      'Cursor-safe live reconnection',
    file:
      'features/support/client/useSupportLiveCase.ts',
    markers: [
      'appendCursor',
      'cursorRef',
      'retry:',
      'pagehide'
    ]
  },
  {
    label:
      'Visibility-aware presence heartbeat',
    file:
      'features/support/client/useSupportLiveCase.ts',
    markers: [
      "document.visibilityState !==\n              'visible'",
      'browserOnline()',
      'sendHeartbeat'
    ]
  },
  {
    label:
      'Stale response and request cancellation',
    file:
      'features/support/components/QuickSupportChatWorkspace.tsx',
    markers: [
      'viewSequenceRef',
      'navigationControllerRef',
      'refreshControllerRef',
      'workspaceRef.current'
    ]
  },
  {
    label:
      'Duplicate send prevention',
    file:
      'features/support/components/QuickSupportChatWorkspace.tsx',
    markers: [
      'sendInFlightRef',
      'sendControllerRef',
      'stillViewingRequest'
    ]
  },
  {
    label:
      'Mobile composer and safe-area boundary',
    file:
      'features/support/components/QuickSupportChatWorkspace.tsx',
    markers: [
      'enterKeyHint="send"',
      'env(safe-area-inset-bottom)',
      'event.nativeEvent.isComposing',
      'touch-manipulation'
    ]
  },
  {
    label:
      'Accessible message and network status',
    file:
      'features/support/components/QuickSupportChatWorkspace.tsx',
    markers: [
      'role="log"',
      'aria-relevant="additions text"',
      'role="alert"',
      'live.retry'
    ]
  },
  {
    label:
      'Production verifier registration',
    file:
      'package.json',
    markers: [
      'verify:support-quick-production'
    ]
  }
];

const requiredLegacyScripts = [
  'verify:support-live',
  'verify:support-quick-chat',
  'verify:support-quick-continuity',
  'verify:support-quick-unread',
  'verify:support-quick-history'
];

const failures = [];

for (
  const check of checks
) {
  const filePath =
    path.join(
      root,
      ...check.file.split(
        '/'
      )
    );

  if (
    !fs.existsSync(
      filePath
    )
  ) {
    failures.push(
      `${check.label}: ${check.file} is missing`
    );

    continue;
  }

  const source =
    fs.readFileSync(
      filePath,
      'utf8'
    );

  for (
    const marker of
    check.markers
  ) {
    if (
      !source.includes(
        marker
      )
    ) {
      failures.push(
        `${check.label}: ${check.file} is missing "${marker}"`
      );
    }
  }
}

const packagePath =
  path.join(
    root,
    'package.json'
  );

if (
  fs.existsSync(
    packagePath
  )
) {
  const packageSource =
    fs.readFileSync(
      packagePath,
      'utf8'
    );

  for (
    const script of
    requiredLegacyScripts
  ) {
    if (
      !packageSource.includes(
        `"${script}"`
      )
    ) {
      failures.push(
        `Regression suite: package.json is missing "${script}"`
      );
    }
  }
}

if (
  failures.length
) {
  console.error('');
  console.error(
    'Quick Support production-closure verification failed:'
  );
  console.error('');

  for (
    const failure of
    failures
  ) {
    console.error(
      `  - ${failure}`
    );
  }

  console.error('');
  process.exitCode = 1;
} else {
  console.log('');
  console.log(
    'AJ Logik Quick Customer Chat production contract is complete.'
  );
  console.log(
    `Validated ${checks.length} production boundaries and ${requiredLegacyScripts.length} regression commands.`
  );
  console.log('');
}
