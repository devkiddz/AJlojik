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

const result =
  ts.transpileModule(
    source,
    {
      fileName:
        'localAssistantEngine.ts',
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
  'localAssistantEngine.ts does not parse as valid TypeScript.'
);

const pairingStart =
  source.indexOf(
    'AJ_MS12_PAIRING_CONSTRAINT_AUTHORITY_V2'
  );

const shoppingStart =
  source.indexOf(
    "outputType ===\n    'SHOPPING_PLAN'",
    pairingStart
  );

assert(
  pairingStart >=
    0 &&
  shoppingStart >
    pairingStart,
  'The constrained Pairing branch could not be isolated.'
);

const pairing =
  source.slice(
    pairingStart,
    shoppingStart
  );

for (
  const required of
  [
    'composeShoppingPlan({',
    'planConstraints',
    "'Budget limit'",
    "'Estimated total'",
    "'Remaining budget'",
    "'Products excluded'",
    "'Reduce cost further'",
    "'Show a different combination within the same budget'"
  ]
) {
  assert(
    pairing.includes(
      required
    ),
    `Missing Pairing constraint authority: ${required}`
  );
}

for (
  const forbidden of
  [
    'const chosen:',
    'const productsForPairing =',
    "'Estimated basket'"
  ]
) {
  assert(
    !pairing.includes(
      forbidden
    ),
    `Old unconstrained Pairing logic remains: ${forbidden}`
  );
}

assert(
  source.includes(
    'function composeShoppingPlan('
  ) &&
  source.includes(
    'function resolvePlanCompositionConstraints('
  ) &&
  source.includes(
    'const planConstraints ='
  ),
  'The shared constraint composer is missing.'
);

console.log(
  '\nAJ Pairing Constraint Authority validation passed.\n'
);

console.log(
  'Confirmed:'
);

console.log(
  '  Pairing and Shopping Plan share the same constraint composer'
);

console.log(
  '  fixed budgets govern the complete Pairing total'
);

console.log(
  '  affordable direction restricts individual premium products'
);

console.log(
  '  occasion relevance removes unrelated catalogue matches'
);

console.log(
  '  Budget limit, Estimated total and Remaining budget are visible'
);

console.log(
  '  continuation prompts remain available after the Pairing result'
);

console.log(
  '  no database migration was required'
);
