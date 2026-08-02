import fs from 'node:fs';
import path from 'node:path';

const root =
  process.cwd();

const checks = [
  {
    label:
      'Global Quick Support launcher',
    file:
      'features/support/components/QuickSupportChatLauncher.tsx',
    markers: [
      'QuickSupportChatWorkspace',
      'Chat with Support',
      'quick-support-chat'
    ]
  },
  {
    label:
      'Quick Support workspace',
    file:
      'features/support/components/QuickSupportChatWorkspace.tsx',
    markers: [
      'useSupportLiveCase',
      'Start live chat',
      '/api/support/cases',
      'SupportLiveActivityBar'
    ]
  },
  {
    label:
      'Customer shell integration',
    file:
      'components/layout/ApplicationShell.tsx',
    markers: [
      'QuickSupportChatLauncher',
      '<QuickSupportChatLauncher />'
    ]
  },
  {
    label:
      'Admin Support attention card',
    file:
      'app/admin/page.tsx',
    markers: [
      'activeSupportCases',
      'Open support',
      'tone="rose"'
    ]
  },
  {
    label:
      'Support todo reconciliation',
    file:
      'features/admin/todos/generateAdminTodos.ts',
    markers: [
      'newSupportCases',
      "source: 'SUPPORT'",
      'support:case:'
    ]
  },
  {
    label:
      'Immediate Support todo lifecycle',
    file:
      'features/support/server/supportService.ts',
    markers: [
      'upsertOperationalTodo',
      'completeOperationalTodos',
      'Review new Support Case'
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
    'Quick Support verification failed:'
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
    'AJ Logik Quick Support runtime contract is complete.'
  );
  console.log(
    `Validated ${checks.length} Quick Support boundaries.`
  );
  console.log('');
}
