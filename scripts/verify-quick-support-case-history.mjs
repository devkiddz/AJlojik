import fs from 'node:fs';
import path from 'node:path';

const root =
  process.cwd();

const checks = [
  {
    label:
      'Quick Support multi-case contracts',
    file:
      'features/support/quickSupportTypes.ts',
    markers: [
      'recentCases',
      'historyCount',
      'lastMessagePreview',
      'reusable'
    ]
  },
  {
    label:
      'Canonical recent-case projection',
    file:
      'features/support/server/quickSupportSummaryRepository.ts',
    markers: [
      'recentCaseLimit',
      'communicationMessage.findFirst',
      'recentCases:',
      'historyCount:'
    ]
  },
  {
    label:
      'Workspace-scoped selected case storage',
    file:
      'features/support/client/quickSupportSelectionStorage.ts',
    markers: [
      'aj_quick_support_selected_case',
      'readQuickSupportSelectedCaseId',
      'writeQuickSupportSelectedCaseId',
      'clearQuickSupportSelectedCaseId'
    ]
  },
  {
    label:
      'Compact case continuity switcher',
    file:
      'features/support/components/QuickSupportCaseContinuityBar.tsx',
    markers: [
      'Active cases',
      'Resolution history',
      'Start another Support conversation',
      'Full Support history'
    ]
  },
  {
    label:
      'Selected-case restoration',
    file:
      'features/support/components/QuickSupportChatWorkspace.tsx',
    markers: [
      'readQuickSupportSelectedCaseId',
      'snapshot.recentCases.find',
      'selectSupportCase',
      'writeQuickSupportSelectedCaseId'
    ]
  },
  {
    label:
      'Parallel conversation creation',
    file:
      'features/support/components/QuickSupportChatWorkspace.tsx',
    markers: [
      'startAnotherConversation',
      'startingNew',
      'Start another conversation'
    ]
  },
  {
    label:
      'Support multi-case exports and script',
    file:
      'features/support/index.ts',
    markers: [
      "from './client/quickSupportSelectionStorage'",
      'QuickSupportMessageDirection'
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

const packagePath =
  path.join(
    root,
    'package.json'
  );

if (
  !fs.existsSync(
    packagePath
  ) ||
  !fs
    .readFileSync(
      packagePath,
      'utf8'
    )
    .includes(
      'verify:support-quick-history'
    )
) {
  failures.push(
    'Package script: verify:support-quick-history is missing'
  );
}

if (
  failures.length
) {
  console.error('');
  console.error(
    'Quick Support case-history verification failed:'
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
    'AJ Logik Quick Support multi-case continuity contract is complete.'
  );
  console.log(
    `Validated ${checks.length} multi-case boundaries.`
  );
  console.log('');
}
