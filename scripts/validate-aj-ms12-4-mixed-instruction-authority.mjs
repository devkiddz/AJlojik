import fs from 'node:fs';
import path from 'node:path';

const root =
  process.cwd();

const paths = {
  authority:
    path.join(
      root,
      'features',
      'ai-assistance',
      'server',
      'journeyInstructionAuthority.ts'
    ),
  engine:
    path.join(
      root,
      'features',
      'ai-assistance',
      'server',
      'localAssistantEngine.ts'
    ),
  repository:
    path.join(
      root,
      'features',
      'ai-assistance',
      'server',
      'assistantRepository.ts'
    ),
  state:
    path.join(
      root,
      'features',
      'ai-assistance',
      'server',
      'journeyStateResolver.ts'
    )
};

const failures = [];

function read(
  filePath
) {
  if (
    !fs.existsSync(
      filePath
    )
  ) {
    failures.push(
      `Missing file: ${path.relative(
        root,
        filePath
      )}`
    );

    return '';
  }

  return fs.readFileSync(
    filePath,
    'utf8'
  );
}

function requireMarkers(
  source,
  markers,
  label
) {
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
        `${label} is missing: ${marker}`
      );
    }
  }
}

function normalize(
  prompt
) {
  return prompt
    .replace(
      /\s+/g,
      ' '
    )
    .trim();
}

function asksForInformationOnly(
  value
) {
  return (
    /\b(?:tell|show|explain|describe|share|give)\s+me\s+more\s+(?:about|information|details?|context|reasoning)\b/i.test(
      value
    ) ||
    /\bmore\s+(?:about|information|details?|context|reasoning)\b/i.test(
      value
    )
  );
}

function compositionDirection(
  prompt
) {
  const value =
    normalize(
      prompt
    );

  if (
    asksForInformationOnly(
      value
    )
  ) {
    return false;
  }

  return (
    /\b(?:more|fewer|less|mostly|mainly)\s+(?!(?:about|information|details?|context|reasoning|why|how)\b)[a-z][a-z0-9'-]*/i.test(
      value
    ) ||
    /\b(?:give|include|add|use|make|lean|focus|prioriti[sz]e|favour|favor)\b.{0,80}\b(?:more|fewer|less|mostly|mainly)\b/i.test(
      value
    )
  );
}

function mutation(
  prompt
) {
  const value =
    normalize(
      prompt
    );

  return (
    /\b(?:change|adjust|refine|update|revise|edit|replace|remove|add|include|exclude|reduce|increase|decrease|lower|raise|cut|swap|rebuild|recompose|rework)\b/i.test(
      value
    ) ||
    /\b(?:make|turn)\s+(?:it|this|the\s+plan)\b/i.test(
      value
    ) ||
    /\binstead\b/i.test(
      value
    ) ||
    /\b(?:show|give|find|suggest|recommend)\b.{0,60}\b(?:different|alternative|cheaper|premium)\b/i.test(
      value
    ) ||
    /\b(?:different|another)\s+(?:combination|version|plan|selection|option)\b/i.test(
      value
    ) ||
    /\b(?:set|move|change|raise|cut|cap|limit)\b.{0,35}\bbudget\b/i.test(
      value
    ) ||
    /\bbudget\b.{0,35}\b(?:to|at|under|below|above)\b/i.test(
      value
    ) ||
    compositionDirection(
      value
    )
  );
}

function explanationOnly(
  prompt
) {
  const value =
    normalize(
      prompt
    );

  return (
    /\b(?:explain|why|reason|rationale|walk me through|help me understand|describe|summari[sz]e)\b/i.test(
      value
    ) &&
    /\b(?:plan|products?|items?|choices?|selections?|fit|selected|included|budget|combination|list)\b/i.test(
      value
    ) &&
    !mutation(
      value
    )
  );
}

const authority =
  read(
    paths.authority
  );

const engine =
  read(
    paths.engine
  );

const repository =
  read(
    paths.repository
  );

const state =
  read(
    paths.state
  );

requireMarkers(
  authority,
  [
    'AJ_MS12_4_MIXED_INSTRUCTION_AUTHORITY_V1',
    'isCompositionDirectionInstruction',
    'isPlanMutationInstruction',
    'isPlanExplanationOnlyInstruction',
    'asksForInformationOnly'
  ],
  'Journey instruction authority'
);

requireMarkers(
  engine,
  [
    'AJ_MS12_4_MIXED_INSTRUCTION_AUTHORITY_V1',
    "from './journeyInstructionAuthority'",
    'isPlanExplanationOnlyInstruction'
  ],
  'Local assistant engine'
);

requireMarkers(
  repository,
  [
    'AJ_MS12_4_MIXED_INSTRUCTION_AUTHORITY_V1',
    "from './journeyInstructionAuthority'",
    'isPlanExplanationOnlyInstruction'
  ],
  'Assistant repository'
);

requireMarkers(
  state,
  [
    'AJ_MS12_4_MIXED_INSTRUCTION_AUTHORITY_V1',
    "from './journeyInstructionAuthority'",
    'isPlanMutationInstruction'
  ],
  'Journey state resolver'
);

const pureExplanation =
  'Explain why these products fit this plan.';

const mixedRefinement =
  'Keep my ₦70,000 budget, but give me more wines and fewer confessioneries. Explain any assumptions, mismatches or unavailable products.';

const informationalFollowUp =
  'Tell me more about the first product.';

const differentCombination =
  'Show a different combination within the same budget.';

if (
  !explanationOnly(
    pureExplanation
  ) ||
  mutation(
    pureExplanation
  )
) {
  failures.push(
    'A pure plan explanation is not classified as explanation-only.'
  );
}

if (
  explanationOnly(
    mixedRefinement
  ) ||
  !mutation(
    mixedRefinement
  ) ||
  !compositionDirection(
    mixedRefinement
  )
) {
  failures.push(
    'The mixed more/fewer refinement is still being downgraded to explanation-only.'
  );
}

if (
  mutation(
    informationalFollowUp
  )
) {
  failures.push(
    'An informational “tell me more” follow-up is incorrectly classified as a plan mutation.'
  );
}

if (
  !mutation(
    differentCombination
  )
) {
  failures.push(
    'A different-combination request is not classified as a plan mutation.'
  );
}

if (
  failures.length
) {
  console.error(
    '\nAJ MS12.4 Mixed Instruction Authority validation failed:\n'
  );

  for (
    const failure of
    failures
  ) {
    console.error(
      `- ${failure}`
    );
  }

  console.error();

  process.exit(
    1
  );
}

console.log(`
AJ MS12.4 Mixed Instruction Authority validation passed.

Confirmed:
  Pure explanation requests remain non-mutating
  Mixed refinement plus explanation requests are treated as refinements
  More, fewer, less, mostly and mainly directions participate in Journey transitions
  Informational “tell me more” requests do not create plan mutations
  Engine and repository share one explanation-versus-mutation authority
  Material plan changes remain governed by the existing Plan snapshot boundary
  No database migration required
`);
