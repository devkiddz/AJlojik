import fs from 'node:fs';
import path from 'node:path';
import {
  spawnSync
} from 'node:child_process';

const root =
  process.cwd();

const failures = [];
const notes = [];

function targetPath(
  relativePath
) {
  return path.join(
    root,
    ...relativePath.split(
      '/'
    )
  );
}

function readSource(
  relativePath
) {
  const target =
    targetPath(
      relativePath
    );

  if (
    !fs.existsSync(
      target
    )
  ) {
    failures.push(
      `${relativePath} is missing`
    );

    return null;
  }

  return fs.readFileSync(
    target,
    'utf8'
  );
}

function requireMarkers(
  relativePath,
  markers
) {
  const source =
    readSource(
      relativePath
    );

  if (
    source ===
      null
  ) {
    return;
  }

  for (
    const marker of
    markers
  ) {
    if (
      !source.includes(
        marker
      )
    ) {
      failures.push(
        `${relativePath} is missing "${marker}"`
      );
    }
  }
}

function runGitCheck(
  args,
  label
) {
  const result =
    spawnSync(
      'git',
      args,
      {
        cwd:
          root,
        encoding:
          'utf8',
        shell:
          false
      }
    );

  if (
    result.error
  ) {
    failures.push(
      `${label}: ${result.error.message}`
    );

    return;
  }

  if (
    result.status !==
    0
  ) {
    failures.push(
      `${label} failed:\n${(
        result.stdout ||
        result.stderr ||
        'Unknown git error'
      ).trim()}`
    );
  }
}

const checks = [
  {
    file:
      'app/api/support/guide/route.ts',
    markers: [
      'resolveSupportGuideQuestion',
      'session.user.id',
      'activeWorkspace'
    ]
  },
  {
    file:
      'app/api/support/guide/feedback/route.ts',
    markers: [
      'recordSupportKnowledgeFeedback',
      'session.user.id',
      'interactionId'
    ]
  },
  {
    file:
      'app/api/support/cases/route.ts',
    markers: [
      'linkSupportKnowledgeInteractionToCase',
      'guideInteractionId',
      'createSupportCase'
    ]
  },
  {
    file:
      'app/api/admin/support/knowledge/route.ts',
    markers: [
      'support:view',
      'support:configure',
      'resolveSupportKnowledgeStudio'
    ]
  },
  {
    file:
      'app/api/admin/support/knowledge/[entryId]/route.ts',
    markers: [
      'support:configure',
      'mutateSupportKnowledgeEntry'
    ]
  },
  {
    file:
      'app/admin/support/knowledge/page.tsx',
    markers: [
      'SupportKnowledgeStudio',
      'support:configure'
    ]
  },
  {
    file:
      'features/support/components/SupportGuidePanel.tsx',
    markers: [
      'Control+Shift+Backspace Meta+Shift+Backspace',
      'Continue with a human Support agent',
      'Was this answer helpful?'
    ]
  },
  {
    file:
      'features/support/components/SupportKnowledgeStudio.tsx',
    markers: [
      'Runtime conversations never publish themselves.',
      'Prepare draft',
      'Publish'
    ]
  },
  {
    file:
      'features/support/server/supportGuideService.ts',
    markers: [
      'response.interactionId',
      'recordInteractionSafely',
      'resolveSupportCustomerContext'
    ]
  },
  {
    file:
      'features/support/supportGuideHandoff.ts',
    markers: [
      'buildSupportGuideHandoffDraft',
      'supportGuideTranscript',
      'supportKnowledgeInteractionId'
    ]
  },
  {
    file:
      'features/support/server/supportCustomerContextRepository.ts',
    markers: [
      'workspaceId',
      'customerId'
    ]
  },
  {
    file:
      'features/support/server/supportCustomerContextResolver.ts',
    markers: [
      'AMBIGUOUS',
      'requiresHuman',
      'snapshot'
    ]
  },
  {
    file:
      'features/support/server/supportKnowledgeMatcher.ts',
    markers: [
      'normalizeSupportKnowledgeText',
      'confidenceThreshold'
    ]
  },
  {
    file:
      'features/support/server/supportKnowledgeManagementValidation.ts',
    markers: [
      'Active Support Knowledge requires at least one question example.',
      'parseSupportKnowledgeMutation'
    ]
  },
  {
    file:
      'features/support/server/supportKnowledgeLearning.ts',
    markers: [
      'buildSupportKnowledgeLearningCandidates',
      'reviewScore',
      'suggestedIntent'
    ]
  },
  {
    file:
      'features/support/server/supportKnowledgeManagementRepository.ts',
    markers: [
      'SUPPORT_KNOWLEDGE_PUBLISHED',
      'adminAuditEvent.create',
      'version'
    ]
  },
  {
    file:
      'features/support/server/supportKnowledgeRepository.ts',
    markers: [
      'recordSupportKnowledgeInteraction',
      'recordSupportKnowledgeFeedback',
      'linkSupportKnowledgeInteractionToCase'
    ]
  },
  {
    file:
      'prisma/migrations/20260803090000_add_support_knowledge_foundation/migration.sql',
    markers: [
      'support_knowledge_bucket',
      'support_knowledge_entry'
    ]
  },
  {
    file:
      'prisma/migrations/20260803124500_upgrade_support_knowledge_resolution/migration.sql',
    markers: [
      'supportKnowledgeBucketId',
      'primaryQuestion',
      'answerTemplate'
    ]
  },
  {
    file:
      'scripts/verify-support-knowledge-runtime.ts',
    markers: [
      'Support Knowledge runtime is healthy'
    ]
  },
  {
    file:
      'scripts/verify-support-guide.ts',
    markers: [
      'Support Guide deterministic database matcher is complete'
    ]
  },
  {
    file:
      'scripts/verify-support-guide-context.ts',
    markers: [
      'Support customer-context selection is complete'
    ]
  },
  {
    file:
      'scripts/verify-support-guide-handoff.ts',
    markers: [
      'Support Guide human handoff is complete'
    ]
  },
  {
    file:
      'scripts/verify-support-knowledge-studio.ts',
    markers: [
      'Support Knowledge Studio and governed learning loop are complete'
    ]
  }
];

for (
  const check of
  checks
) {
  requireMarkers(
    check.file,
    check.markers
  );
}

const typeSource =
  readSource(
    'features/support/supportGuideTypes.ts'
  );

if (
  typeSource
) {
  const responseStart =
    typeSource.indexOf(
      'export type SupportGuideResponse = {'
    );

  const responseEnd =
    responseStart >=
      0
      ? typeSource.indexOf(
          '\n};',
          responseStart
        )
      : -1;

  if (
    responseStart <
      0 ||
    responseEnd <
      0
  ) {
    failures.push(
      'SupportGuideResponse contract could not be inspected'
    );
  } else {
    const block =
      typeSource.slice(
        responseStart,
        responseEnd
      );

    for (
      const field of
      [
        'interactionId: string | null;',
        'context:',
        'shouldOfferHuman:'
      ]
    ) {
      if (
        !block.includes(
          field
        )
      ) {
        failures.push(
          `SupportGuideResponse is missing "${field}"`
        );
      }
    }
  }
}

const packageSource =
  readSource(
    'package.json'
  );

if (
  packageSource
) {
  try {
    const packageJson =
      JSON.parse(
        packageSource
      );

    const scripts =
      packageJson.scripts ??
      {};

    for (
      const script of
      [
        'verify:support-knowledge-runtime',
        'verify:support-guide',
        'verify:support-guide-context',
        'verify:support-guide-handoff',
        'verify:support-knowledge-studio',
        'verify:support-auto-response-production',
        'verify:support-auto-response-live-boundary',
        'verify:support-auto-response-release'
      ]
    ) {
      if (
        typeof scripts[
          script
        ] !==
        'string'
      ) {
        failures.push(
          `package.json is missing "${script}"`
        );
      }
    }

    if (
      typeof scripts.build !==
        'string' ||
      !scripts.build.includes(
        'prisma migrate deploy'
      ) ||
      !scripts.build.includes(
        'next build'
      )
    ) {
      failures.push(
        'The production build script must deploy Prisma migrations before the Next.js build.'
      );
    }
  } catch (
    cause
  ) {
    failures.push(
      `package.json could not be parsed: ${
        cause instanceof
          Error
          ? cause.message
          : 'unknown error'
      }`
    );
  }
}

const temporaryPatterns = [
  /^\.ajlojik-install-backups$/u,
  /^\.support-auto-response-.*-payload$/u,
  /^\.support-knowledge-.*-payload$/u,
  /^AJLogik-Support-Runtime-Audit/u,
  /^collect\.support-runtime-audit\.mjs$/u,
  /^apply\.support-.*\.mjs$/u
];

for (
  const entry of
  fs.readdirSync(
    root,
    {
      withFileTypes:
        true
    }
  )
) {
  if (
    temporaryPatterns.some(
      pattern =>
        pattern.test(
          entry.name
        )
    )
  ) {
    failures.push(
      `Temporary installer or audit artifact remains in the project root: ${entry.name}`
    );
  }
}

const tracked =
  spawnSync(
    'git',
    [
      'ls-files'
    ],
    {
      cwd:
        root,
      encoding:
        'utf8',
      shell:
        false
    }
  );

if (
  tracked.status ===
  0
) {
  for (
    const trackedPath of
    tracked.stdout
      .split(
        /\r?\n/u
      )
      .filter(
        Boolean
      )
  ) {
    const firstSegment =
      trackedPath.split(
        '/'
      )[0];

    if (
      temporaryPatterns.some(
        pattern =>
          pattern.test(
            firstSegment
          )
      )
    ) {
      failures.push(
        `Temporary artifact is tracked by git: ${trackedPath}`
      );
    }
  }
} else {
  notes.push(
    'Git tracked-file inspection was unavailable.'
  );
}

runGitCheck(
  [
    'diff',
    '--check'
  ],
  'Working-tree whitespace check'
);

runGitCheck(
  [
    'diff',
    '--cached',
    '--check'
  ],
  'Staged whitespace check'
);

const branch =
  spawnSync(
    'git',
    [
      'branch',
      '--show-current'
    ],
    {
      cwd:
        root,
      encoding:
        'utf8',
      shell:
        false
    }
  );

if (
  branch.status ===
    0
) {
  notes.push(
    `Current branch: ${branch.stdout.trim() || 'detached'}`
  );
}

if (
  failures.length
) {
  console.error('');
  console.error(
    'AJ Logik Support Auto Response production-closure verification failed:'
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

  if (
    notes.length
  ) {
    console.error('');

    for (
      const note of
      notes
    ) {
      console.error(
        `  • ${note}`
      );
    }
  }

  console.error('');
  process.exitCode =
    1;
} else {
  console.log('');
  console.log(
    'AJ Logik Support Auto Response production contract is complete.'
  );
  console.log(
    `Validated ${checks.length} runtime, context, handoff, knowledge-governance and release boundaries.`
  );

  for (
    const note of
    notes
  ) {
    console.log(
      `  • ${note}`
    );
  }

  console.log('');
}
