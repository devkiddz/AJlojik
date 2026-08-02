import fs from 'node:fs';
import path from 'node:path';

const root =
  process.cwd();

const checks = [
  {
    label:
      'Quick Support continuity contracts',
    file:
      'features/support/quickSupportTypes.ts',
    markers: [
      'QuickSupportSummary',
      'QuickSupportCaseContinuity',
      'latestAgentReply'
    ]
  },
  {
    label:
      'Canonical Quick Support summary resolver',
    file:
      'features/support/server/quickSupportSummaryRepository.ts',
    markers: [
      'getCustomerQuickSupportSummary',
      'unreadCount',
      'latestAgentReply',
      'reusableStatuses'
    ]
  },
  {
    label:
      'Quick Support summary API',
    file:
      'app/api/support/quick-chat/summary/route.ts',
    markers: [
      'getCustomerQuickSupportSummary',
      'ACTIVE_WORKSPACE_COOKIE',
      'private, no-store'
    ]
  },
  {
    label:
      'Workspace-safe Quick Support summary hook',
    file:
      'features/support/client/useQuickSupportSummary.ts',
    markers: [
      'useWorkspace',
      'QUICK_SUPPORT_SUMMARY_INVALIDATED_EVENT',
      '20_000',
      'next.workspaceId'
    ]
  },
  {
    label:
      'Continuity-aware Support launcher',
    file:
      'features/support/components/QuickSupportChatLauncher.tsx',
    markers: [
      'useQuickSupportSummary',
      'Continue Support',
      'data-support-workspace'
    ]
  },
  {
    label:
      'Quick chat canonical active-case restoration',
    file:
      'features/support/components/QuickSupportChatWorkspace.tsx',
    markers: [
      '/api/support/quick-chat/summary',
      'snapshot.activeCase',
      'invalidateQuickSupportSummary',
      'workspaceId'
    ]
  },
  {
    label:
      'Quick Support public exports',
    file:
      'features/support/index.ts',
    markers: [
      "from './quickSupportTypes'",
      "from './client/useQuickSupportSummary'"
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
}

if (
  failures.length
) {
  console.error('');
  console.error(
    'Quick Support continuity verification failed:'
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
    'AJ Logik Quick Support continuity contract is complete.'
  );
  console.log(
    `Validated ${checks.length} continuity boundaries.`
  );
  console.log('');
}
