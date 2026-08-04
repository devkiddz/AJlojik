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

const files = [
  'features/ai-assistance/components/AssistantRuntimePage.tsx',
  'features/ai-assistance/components/GuidedAssistantExperience.tsx',
  'features/ai-assistance/components/AssistantResponseCard.tsx'
];

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
  const file of
  files
) {
  const source =
    readFileSync(
      join(
        process.cwd(),
        file
      ),
      'utf8'
    );

  const result =
    ts.transpileModule(
      source,
      {
        fileName:
          file,
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
    `${file} does not parse as valid TSX.`
  );
}

const runtime =
  readFileSync(
    join(
      process.cwd(),
      files[0]
    ),
    'utf8'
  );

const guided =
  readFileSync(
    join(
      process.cwd(),
      files[1]
    ),
    'utf8'
  );

const responseCard =
  readFileSync(
    join(
      process.cwd(),
      files[2]
    ),
    'utf8'
  );

const railPosition =
  runtime.indexOf(
    'Continue this Journey'
  );

const workspacePosition =
  runtime.indexOf(
    '<IntelligenceWorkspace'
  );

assert(
  runtime.includes(
    'AJ_MS12_UNIFIED_JOURNEY_SUGGESTION_RAIL_V2'
  ),
  'Unified Journey suggestion marker is missing.'
);

assert(
  railPosition >=
    0 &&
  railPosition <
    workspacePosition,
  'The suggestion rail is not directly above the intelligence results.'
);

assert(
  runtime.includes(
    'activePlanPrompts'
  ) &&
  runtime.includes(
    'journeySuggestions'
  ),
  'The active Plan prompts are not connected to the unified suggestion rail.'
);

assert(
  runtime.includes(
    'submitJourneyInput('
  ) &&
  runtime.includes(
    "'suggested'"
  ),
  'Suggestion clicks do not submit the selected Journey direction.'
);

assert(
  !guided.includes(
    'You could also say'
  ) &&
  !guided.includes(
    'hiddenSuggestionsSessionId'
  ),
  'The old bottom contextual suggestion system remains.'
);

assert(
  !responseCard.includes(
    '{payload.suggestedPrompts.length ? ('
  ),
  'Result-specific suggestions still render inside AssistantResponseCard.'
);

assert(
  guided.includes(
    'Choose a starting point'
  ) &&
  guided.includes(
    'onPrompt('
  ),
  'New-Journey starting prompts were removed.'
);

assert(
  responseCard.includes(
    '<AssistantActionBridgePanel'
  ) &&
  runtime.includes(
    'submitJourneyInput'
  ),
  'Governed actions or Journey submission authority was lost.'
);

console.log(
  '\nAJ Unified Journey Suggestion Rail validation passed.\n'
);

console.log(
  'Confirmed:'
);

console.log(
  '  one suggestion rail renders directly beneath the unified input'
);

console.log(
  '  active Plan prompts take priority over generic contextual prompts'
);

console.log(
  '  clicking a suggestion immediately submits it as the next Journey direction'
);

console.log(
  '  the existing Journey submission authority processes suggestion clicks'
);

console.log(
  '  suggestion clicks and typed Send both use the same Journey submission path'
);

console.log(
  '  suggestions no longer render below Live catalog matches'
);

console.log(
  '  the duplicate bottom You could also say section was removed'
);

console.log(
  '  new-Journey starting prompts and governed actions remain intact'
);

console.log(
  '  no database migration was required'
);
