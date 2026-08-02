import fs from 'node:fs';
import path from 'node:path';

const root =
  process.cwd();

const checks = [
  {
    label:
      'Workspace-scoped panel persistence',
    file:
      'features/support/client/useQuickSupportPanelState.ts',
    markers: [
      'aj_quick_support_panel_state',
      "QuickSupportPanelMode",
      'markMinimized',
      'workspaceId'
    ]
  },
  {
    label:
      'Passive Support attention stream',
    file:
      'features/support/client/useQuickSupportAttentionStream.ts',
    markers: [
      '/api/support/quick-chat/live',
      'EventSource',
      "addEventListener(\n        'support'"
    ]
  },
  {
    label:
      'Presence-free passive SSE route',
    file:
      'app/api/support/quick-chat/live/route.ts',
    markers: [
      'createSupportLiveStreamResponse',
      'prisma.supportCase.findFirst',
      "audience:\n        'CUSTOMER'"
    ],
    forbidden: [
      'touchSupportLivePresence'
    ]
  },
  {
    label:
      'Unread-aware Quick Support launcher',
    file:
      'features/support/components/QuickSupportChatLauncher.tsx',
    markers: [
      'data-support-unread',
      'New Support reply',
      'useQuickSupportAttentionStream',
      'useQuickSupportPanelState',
      '99+'
    ]
  },
  {
    label:
      'Automatic open-state restoration',
    file:
      'features/support/components/QuickSupportChatLauncher.tsx',
    markers: [
      "mode ===\n          'open'",
      'restoredWorkspaceRef',
      'markMinimized',
      'QUICK_SUPPORT_OVERLAY_ID'
    ]
  },
  {
    label:
      'Support client exports',
    file:
      'features/support/index.ts',
    markers: [
      "from './client/useQuickSupportAttentionStream'",
      "from './client/useQuickSupportPanelState'"
    ]
  }
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

  for (
    const marker of
    check.forbidden ??
    []
  ) {
    if (
      source.includes(
        marker
      )
    ) {
      failures.push(
        `${check.label}: ${check.file} must not include "${marker}"`
      );
    }
  }
}

if (
  failures.length
) {
  console.error('');
  console.error(
    'Quick Support unread-state verification failed:'
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
    'AJ Logik Quick Support unread and minimized-state contract is complete.'
  );
  console.log(
    `Validated ${checks.length} unread-state boundaries.`
  );
  console.log('');
}
