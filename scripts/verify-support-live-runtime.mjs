import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const checks = [
  {
    label:
      'Support live event types',
    path:
      'features/support/supportLiveTypes.ts',
    patterns: [
      'MESSAGE_CREATED',
      'PRESENCE_UPDATED',
      'TYPING_UPDATED',
      'UNREAD_UPDATED'
    ]
  },
  {
    label:
      'Persistent live event repository',
    path:
      'features/support/server/supportLiveRepository.ts',
    patterns: [
      'publishSupportLiveEvent',
      'readSupportLiveEvents',
      'scheduleSupportLiveRuntimeCleanup'
    ]
  },
  {
    label:
      'SSE transport',
    path:
      'features/support/server/supportLiveStream.ts',
    patterns: [
      'text/event-stream',
      'presence-snapshot',
      'last-event-id',
      'heartbeat'
    ]
  },
  {
    label:
      'Presence runtime',
    path:
      'features/support/server/supportLivePresenceRepository.ts',
    patterns: [
      'touchSupportLivePresence',
      'setSupportLiveTyping',
      'readSupportLivePresence',
      'hasActiveSupportPresence'
    ]
  },
  {
    label:
      'Production maintenance',
    path:
      'features/support/server/supportLiveMaintenance.ts',
    patterns: [
      'pruneSupportLiveRuntime',
      'getSupportLiveRuntimeDiagnostics',
      'EVENT_RETENTION_DAYS'
    ]
  },
  {
    label:
      'Customer live endpoint',
    path:
      'app/api/support/cases/[caseId]/live/route.ts',
    patterns: [
      'export async function GET',
      'export async function POST',
      'CUSTOMER'
    ]
  },
  {
    label:
      'Admin live endpoint',
    path:
      'app/api/admin/support/cases/[caseId]/live/route.ts',
    patterns: [
      'export async function GET',
      'export async function POST',
      'AGENT'
    ]
  },
  {
    label:
      'Admin diagnostics endpoint',
    path:
      'app/api/admin/support/live/health/route.ts',
    patterns: [
      'getSupportLiveRuntimeDiagnostics',
      'pruneSupportLiveRuntime'
    ]
  },
  {
    label:
      'Customer live workspace',
    path:
      'features/support/components/CustomerSupportCaseWorkspace.tsx',
    patterns: [
      'useSupportLiveCase',
      'SupportLiveStatusBadge',
      'SupportLiveActivityBar',
      'live.setTyping'
    ]
  },
  {
    label:
      'Agent live workspace',
    path:
      'features/support/components/AgentSupportCaseWorkspace.tsx',
    patterns: [
      'useSupportLiveCase',
      'SupportLiveStatusBadge',
      'SupportLiveActivityBar',
      "'mark-read'"
    ]
  },
  {
    label:
      'Active-conversation notification suppression',
    path:
      'features/communication/server/communicationNotificationService.ts',
    patterns: [
      'activeSupportRecipients',
      'notificationRecipients',
      'supportLivePresence'
    ]
  },
  {
    label:
      'Live-event migration',
    path:
      'prisma/migrations/20260802143500_add_support_live_events/migration.sql',
    patterns: [
      'support_live_event'
    ]
  },
  {
    label:
      'Presence migration',
    path:
      'prisma/migrations/20260802151500_add_support_live_presence/migration.sql',
    patterns: [
      'support_live_presence'
    ]
  },
  {
    label:
      'Prisma runtime models',
    path:
      'prisma/schema.prisma',
    patterns: [
      'model SupportLiveEvent',
      'model SupportLivePresence',
      'enum SupportLiveAudience'
    ]
  }
];

const failures = [];

for (const check of checks) {
  const filePath =
    path.join(
      root,
      ...check.path.split('/')
    );

  if (!fs.existsSync(filePath)) {
    failures.push(
      `${check.label}: missing ${check.path}`
    );

    continue;
  }

  const source =
    fs.readFileSync(
      filePath,
      'utf8'
    );

  for (
    const pattern of check.patterns
  ) {
    if (
      !source.includes(pattern)
    ) {
      failures.push(
        `${check.label}: ${check.path} is missing "${pattern}"`
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
  fs.existsSync(packagePath)
) {
  const packageJson =
    JSON.parse(
      fs.readFileSync(
        packagePath,
        'utf8'
      )
    );

  if (
    packageJson.scripts?.[
      'verify:support-live'
    ] !==
    'node scripts/verify-support-live-runtime.mjs'
  ) {
    failures.push(
      'package.json is missing the verify:support-live script.'
    );
  }
} else {
  failures.push(
    'package.json is missing.'
  );
}

if (failures.length) {
  console.error(
    '\nSupport live runtime verification failed:\n'
  );

  failures.forEach(
    failure =>
      console.error(
        `  - ${failure}`
      )
  );

  console.error('');
  process.exit(1);
}

console.log('');
console.log(
  'AJ Logik Support live runtime contract is complete.'
);
console.log(
  `Validated ${checks.length} runtime boundaries.`
);
console.log(
  'Proceed with Prisma, typecheck, lint, build and two-browser testing.'
);
console.log('');
