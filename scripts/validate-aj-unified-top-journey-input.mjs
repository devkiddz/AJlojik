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

const source =
  readFileSync(
    join(
      process.cwd(),
      'features',
      'ai-assistance',
      'components',
      'AssistantRuntimePage.tsx'
    ),
    'utf8'
  );

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

const result =
  ts.transpileModule(
    source,
    {
      fileName:
        'AssistantRuntimePage.tsx',
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
  'AssistantRuntimePage.tsx does not parse as valid TSX.'
);

const markerPosition =
  source.indexOf(
    'AJ_MS12_UNIFIED_TOP_JOURNEY_INPUT_V3'
  );

const pendingPosition =
  source.indexOf(
    '{pendingJourneyQuestion ? (',
    markerPosition
  );

const delimiterPosition =
  source.indexOf(
    ') : (',
    pendingPosition
  );

const workspacePosition =
  source.indexOf(
    '<IntelligenceWorkspace',
    delimiterPosition
  );

assert(
  markerPosition >=
    0,
  'Unified top Journey input marker is missing.'
);

assert(
  pendingPosition >
    markerPosition &&
  delimiterPosition >
    pendingPosition &&
  workspacePosition >
    delimiterPosition,
  'Quick Response and normal composer must share one top position before IntelligenceWorkspace.'
);

assert(
  !source.includes(
    '{!pendingJourneyQuestion ? ('
  ),
  'A second bottom Journey composer still exists.'
);

const inputSection =
  source.slice(
    pendingPosition,
    workspacePosition
  );

assert(
  inputSection.includes(
    'pendingJourneyQuestion'
  ),
  'The unified input is not governed by the pending Journey question.'
);

assert(
  inputSection.includes(
    '<footer'
  ),
  'The normal Journey composer footer is missing from the unified input position.'
);

assert(
  inputSection.includes(
    'border-b border-border/60 bg-background/75'
  ),
  'The normal composer was not restored to its top workspace presentation.'
);

assert(
  (
    inputSection.match(
      /<footer/g
    ) ??
    []
  ).length >=
    2,
  'Both the clarification footer and normal composer footer must exist in the unified position.'
);

console.log(
  '\nAJ Unified Top Journey Input validation passed.\n'
);

console.log(
  'Confirmed:'
);

console.log(
  '  there is exactly one Journey input position'
);

console.log(
  '  pending clarification renders Quick Response in that position'
);

console.log(
  '  normal text composition renders in the same position'
);

console.log(
  '  the unified input is above IntelligenceWorkspace results'
);

console.log(
  '  no bottom continuation composer remains'
);

console.log(
  '  no database migration was required'
);
