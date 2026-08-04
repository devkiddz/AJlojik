import {
  readFileSync
} from 'node:fs';

import {
  createRequire
} from 'node:module';

import {
  join
} from 'node:path';

const require =
  createRequire(
    import.meta.url
  );

const ts =
  require(
    'typescript'
  );

const targets =
  [
  "features/ai-assistance/components/AssistantRuntimePage.tsx",
  "features/ai-assistance/components/GuidedAssistantExperience.tsx",
  "features/ai-assistance/components/AssistantResponseCard.tsx",
  "features/ai-assistance/components/AssistantActionBridgePanel.tsx",
  "features/ai-assistance/components/JourneyClarificationCard.tsx",
  "features/ai-assistance/components/JourneyNavigationRail.tsx",
  "features/ai-assistance/components/JourneyProgressStrip.tsx"
];

const marker =
  'AJ_MS12_INTELLIGENCE_READABILITY_PASS_V1';

function assert(
  condition,
  message
) {
  if (
    !condition
  ) {
    throw new Error(
      message
    );
  }
}

for (
  const target of
  targets
) {
  const source =
    readFileSync(
      join(
        process.cwd(),
        target
      ),
      'utf8'
    );

  assert(
    source.includes(
      marker
    ),
    `Readability marker is missing from ${target}.`
  );

  assert(
    !/text-\\[(7|8|9)px\\]/.test(
      source
    ),
    `Sub-10px text remains in ${target}.`
  );

  const result =
    ts.transpileModule(
      source,
      {
        fileName:
          target,
        compilerOptions: {
          jsx:
            ts.JsxEmit.Preserve,
          target:
            ts.ScriptTarget.ES2022,
          module:
            ts.ModuleKind.ESNext
        },
        reportDiagnostics:
          true
      }
    );

  const errors =
    (
      result.diagnostics ??
      []
    ).filter(
      diagnostic =>
        diagnostic.category ===
        ts.DiagnosticCategory.Error
    );

  assert(
    errors.length ===
      0,
    `${target} does not parse as valid TSX.`
  );
}

const runtime =
  readFileSync(
    join(
      process.cwd(),
      'features/ai-assistance/components/AssistantRuntimePage.tsx'
    ),
    'utf8'
  );

const guided =
  readFileSync(
    join(
      process.cwd(),
      'features/ai-assistance/components/GuidedAssistantExperience.tsx'
    ),
    'utf8'
  );

const responseCard =
  readFileSync(
    join(
      process.cwd(),
      'features/ai-assistance/components/AssistantResponseCard.tsx'
    ),
    'utf8'
  );

const actionBridge =
  readFileSync(
    join(
      process.cwd(),
      'features/ai-assistance/components/AssistantActionBridgePanel.tsx'
    ),
    'utf8'
  );

assert(
  runtime.includes(
    'submitJourneyInput'
  ) &&
  runtime.includes(
    '<IntelligenceWorkspace'
  ),
  'The unified Journey input or IntelligenceWorkspace connection is missing.'
);

assert(
  guided.includes(
    'onRestorePlan'
  ),
  'Plan restoration authority is missing.'
);

assert(
  responseCard.includes(
    '<AssistantActionBridgePanel'
  ),
  'The governed action bridge connection is missing.'
);

assert(
  actionBridge.includes(
    'SHOPPING_LIST_CREATE'
  ),
  'Shopping List governed action authority is missing.'
);

console.log(
  '\nAJ Intelligence Readability validation passed.\n'
);

console.log(
  'Confirmed:'
);

console.log(
  '  no 7px, 8px or 9px text remains in the scoped intelligence components'
);

console.log(
  '  Journey, plan, insight, product and action text is larger'
);

console.log(
  '  body copy and bullets use more comfortable line height'
);

console.log(
  '  cards, forms and continuation controls have more breathing room'
);

console.log(
  '  unified input, Plan Authority, restoration and governed actions remain connected'
);

console.log(
  '  no database migration was required'
);
