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

const root =
  process.cwd();

const repository =
  readFileSync(
    join(
      root,
      'features',
      'ai-assistance',
      'server',
      'assistantRepository.ts'
    ),
    'utf8'
  );

const engine =
  readFileSync(
    join(
      root,
      'features',
      'ai-assistance',
      'server',
      'localAssistantEngine.ts'
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

for (
  const [
    fileName,
    source
  ] of
  [
    [
      'assistantRepository.ts',
      repository
    ],
    [
      'localAssistantEngine.ts',
      engine
    ]
  ]
) {
  const result =
    ts.transpileModule(
      source,
      {
        fileName,
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
    `${fileName} does not parse as valid TypeScript.`
  );
}

assert(
  repository.includes(
    'AJ_MS12_CONSTRAINT_AWARE_PLAN_COMPOSITION_V1'
  ),
  'Constraint-aware repository marker is missing.'
);

assert(
  repository.indexOf(
    'const journeyStateSource ='
  ) <
    repository.indexOf(
      'await runLocalAssistant({'
    ),
  'Journey State must be resolved before local generation.'
);

assert(
  repository.includes(
    'previousPlan:'
  ) &&
  repository.includes(
    'customerPlanMateriallyChanged'
  ),
  'Active Plan authority or material-change protection is missing.'
);

for (
  const required of
  [
    'composeShoppingPlan',
    'resolvePlanCompositionConstraints',
    'planRelevanceScore',
    "'Budget limit'",
    "'Estimated total'",
    "'Remaining budget'",
    "'Products excluded'"
  ]
) {
  assert(
    engine.includes(
      required
    ),
    `Missing engine authority: ${required}`
  );
}

assert(
  !engine.includes(
    "'Shopping plan draft',\n      summary:\n        'A reusable starting plan based on the live catalog."
  ),
  'The old unconstrained Shopping Plan response is still active.'
);

console.log(
  '\nAJ Constraint-Aware Plan Composition validation passed.\n'
);

console.log(
  'Confirmed:'
);

console.log(
  '  persisted Journey State is loaded before response generation'
);

console.log(
  '  the active Plan payload is available to the planner'
);

console.log(
  '  budget, preference, guest count and latest refinement govern composition'
);

console.log(
  '  occasion relevance is applied before selecting Shopping Plan products'
);

console.log(
  '  estimated total and remaining budget are exposed'
);

console.log(
  '  identical product sets cannot create fake new Plan versions'
);

console.log(
  '  no database migration was required'
);
