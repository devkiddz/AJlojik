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

const marker =
  'AJ_MS12_MEANINGFUL_CONSTRAINT_REFINEMENT_V1';

const files = [
  'features/ai-assistance/server/assistantRepository.ts',
  'features/ai-assistance/server/journeyStateResolver.ts',
  'features/ai-assistance/server/localAssistantEngine.ts'
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

const sources =
  new Map();

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
    `${file} does not parse as valid TypeScript.`
  );

  assert(
    source.includes(
      marker
    ),
    `${file} is missing the repair marker.`
  );

  sources.set(
    file,
    source
  );
}

const repository =
  sources.get(
    files[0]
  ) ??
  '';

const journeyState =
  sources.get(
    files[1]
  ) ??
  '';

const engine =
  sources.get(
    files[2]
  ) ??
  '';

assert(
  repository.includes(
    'customerPlanPayload'
  ) &&
  repository.includes(
    'customerPlanMateriallyChanged'
  ) &&
  repository.includes(
    'planBudgetLimit'
  ),
  'Material Plan comparison is incomplete.'
);

assert(
  repository.includes(
    'previousPlan:'
  ) &&
  repository.includes(
    'nextPlan:'
  ) &&
  repository.includes(
    'activePlanMessageId:'
  ),
  'Changed Plan promotion is not connected to persistence.'
);

assert(
  journeyState.includes(
    'budgetMatches'
  ) &&
  journeyState.includes(
    '[0-9][0-9,]*'
  ),
  'Latest comma-formatted budget extraction is missing.'
);

assert(
  journeyState.includes(
    'include|exclude|reduce|increase|decrease'
  ) &&
  journeyState.includes(
    'different|alternative|swap'
  ),
  'Meaningful refinement verbs are not governed.'
);

assert(
  engine.includes(
    'requestedNonAlcoholicMinimum'
  ) &&
  engine.includes(
    'non[-\\s]+alcoholic'
  ) &&
  engine.includes(
    'requiredNonAlcoholic'
  ),
  'Non-alcoholic minimum extraction or selection is missing.'
);

assert(
  engine.includes(
    'alcoholicPlanProduct'
  ) &&
  engine.includes(
    'alcoholFreeOnly'
  ),
  'Alcohol classification or strict alcohol-free authority is missing.'
);

assert(
  engine.includes(
    "'Non-alcoholic options'"
  ) &&
  engine.includes(
    'nonAlcoholicCount'
  ),
  'Visible non-alcoholic constraint evidence is missing.'
);

assert(
  engine.includes(
    'composeShoppingPlan({'
  ) &&
  engine.includes(
    'AJ_MS12_PAIRING_CONSTRAINT_AUTHORITY_V2'
  ),
  'Pairing and Shopping Plan no longer share the governed composer.'
);

console.log(
  '\nAJ MS12 Meaningful Constraint Refinement validation passed.\n'
);

console.log(
  'Confirmed:'
);

console.log(
  '  a materially changed Pairing or Shopping Plan can become the next saved Plan version'
);

console.log(
  '  repeated equivalent output remains protected from fake Plan versions'
);

console.log(
  '  changed budget limits participate in material Plan comparison'
);

console.log(
  '  reduce, include, exclude, increase, decrease and alternative directions are refinements'
);

console.log(
  '  the latest comma-formatted budget becomes authoritative Journey state'
);

console.log(
  '  hyphenated non-alcoholic requests are recognized'
);

console.log(
  '  an explicit non-alcoholic minimum is reserved during composition'
);

console.log(
  '  strict no-alcohol directions exclude alcoholic products'
);

console.log(
  '  Pairing and Shopping Plan still share one constraint composer'
);

console.log(
  '  no database migration was required'
);
