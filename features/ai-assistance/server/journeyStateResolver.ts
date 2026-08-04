import 'server-only';

/* AJ_JOURNEY_STATE_ENGINE_STAGE_1 */
/* AJ_MS12_STATE_AWARE_TRANSITIONS */
/* AJ_MS12_MEANINGFUL_CONSTRAINT_REFINEMENT_V1 */
/* AJ_MS12_4_MIXED_INSTRUCTION_AUTHORITY_V1 */
/* AJ_MS12_4_RELATIVE_BUDGET_CLARIFICATION_V1 */
/* AJ_MS12_4_CONTEXTUAL_NAIRA_INPUT_V1 */
/* AJ_MS12_4_JOURNEY_SUMMARY_RECONCILIATION_V1 */

import type {
  AIAssistantJourneyStage,
  AIAssistantJourneyState,
  AIAssistantJourneyTransition,
  AIAssistantJourneyTransitionReason,
  AIAssistantResponsePayload
} from '../contracts';

import {
  canonicalizeJourneyConversation
} from './journeyContinuationInput';

import {
  isPlanMutationInstruction
} from './journeyInstructionAuthority';

import {
  hasPendingBudgetClarification,
  parseNairaAmount
} from './nairaAmountAuthority';

type JourneyStateInput = {
  previous:
    unknown;
  conversation:
    string[];
  prompt:
    string;
  payload:
    AIAssistantResponsePayload;
  planVersion:
    number;
};

type ControlledStageInput = {
  previousStage:
    AIAssistantJourneyStage |
    null;
  proposedStage:
    AIAssistantJourneyStage;
  prompt:
    string;
  planVersion:
    number;
  questions:
    string[];
  hasDecision:
    boolean;
  hasRejection:
    boolean;
  hasActions:
    boolean;
  confidence:
    number;
};

type JourneyStateUpdate = {
  state:
    AIAssistantJourneyState;
  transition:
    AIAssistantJourneyTransition;
};

function recordValue(
  value:
    unknown
): Record<string, unknown> | null {
  if (
    !value ||
    typeof value !==
      'object' ||
    Array.isArray(
      value
    )
  ) {
    return null;
  }

  return value as
    Record<string, unknown>;
}

function stringValue(
  value:
    unknown
) {
  return typeof value ===
    'string' &&
    value.trim()
      ? value.trim()
      : null;
}

function stringArray(
  value:
    unknown
) {
  if (
    !Array.isArray(
      value
    )
  ) {
    return [];
  }

  return value
    .filter(
      (
        item
      ): item is string =>
        typeof item ===
          'string' &&
        Boolean(
          item.trim()
        )
    )
    .map(
      item =>
        item.trim()
    );
}

function stageValue(
  value:
    unknown
): AIAssistantJourneyStage | null {
  return [
    'UNDERSTANDING',
    'PLANNING',
    'REFINING',
    'AWAITING_DECISION',
    'READY',
    'COMPLETED'
  ].includes(
    String(
      value
    )
  )
    ? value as
        AIAssistantJourneyStage
    : null;
}

function numberValue(
  value:
    unknown
) {
  return typeof value ===
    'number' &&
    Number.isFinite(
      value
    )
      ? value
      : null;
}

function unique(
  values:
    string[]
) {
  const seen =
    new Set<string>();

  return values.filter(
    value => {
      const normalized =
        value
          .toLowerCase()
          .replace(
            /\s+/g,
            ' '
          )
          .trim();

      if (
        !normalized ||
        seen.has(
          normalized
        )
      ) {
        return false;
      }

      seen.add(
        normalized
      );

      return true;
    }
  );
}

function clean(
  value:
    string
) {
  return value
    .replace(
      /\s+/g,
      ' '
    )
    .trim();
}

function meaningfulObjective(
  messages:
    string[]
) {
  const generic =
    /^(help me think this through|help me get started|start a new journey|new journey|continue|go ahead|yes|no|okay|ok|sure)$/i;

  const constraintOnly =
    /^(?:my\s+)?budget\b|^(?:for\s+)?\d+\s+(?:people|guests|persons|attendees)\b|^(?:under|within)\s+[₦$£€]?\d+/i;

  const selected =
    messages.find(
      message => {
        const value =
          clean(
            message
          );

        return (
          value.length >=
            8 &&
          !generic.test(
            value
          ) &&
          !constraintOnly.test(
            value
          )
        );
      }
    );

  if (!selected) {
    return null;
  }

  return clean(
    selected
      .replace(
        /^(please\s+)?(can|could|would)\s+you\s+/i,
        ''
      )
      .replace(
        /^(please\s+)?help\s+me\s+(to\s+)?/i,
        ''
      )
      .replace(
        /^i\s+(want|need|would like)\s+(to\s+)?/i,
        ''
      )
  ).slice(
    0,
    240
  );
}

function extractConstraints(
  combined:
    string,
  options?: {
    prompt?:
      string;
    allowBareBudget?:
      boolean;
  }
) {
  const constraints:
    string[] = [];

  const contextualBudget =
    options?.prompt
      ? parseNairaAmount(
          options.prompt,
          {
            allowBare:
              options.allowBareBudget ??
              false
          }
        )
      : null;

  const budget =
    contextualBudget ??
    parseNairaAmount(
      combined
    );

  if (
    budget
  ) {
    constraints.push(
      `Budget limit: ${budget}.`
    );
  } else if (
    /\b(?:my\s+|the\s+)?budget\s+is\s+flexible\b|\bflexible\s+budget\b|\bno\s+fixed\s+budget\b/i.test(
      combined
    )
  ) {
    constraints.push(
      'Budget: flexible.'
    );
  }

  const audience =
    combined.match(
      /\b(?:for|about|around|expecting|hosting|serving)?\s*([0-9]{1,4})\s+(people|persons|guests|visitors|friends|customers|attendees|of us)\b/i
    );

  if (
    audience
  ) {
    constraints.push(
      `Audience size: ${audience[1]} ${audience[2]}.`
    );
  }

  const timing =
    combined.match(
      /\b(today|tonight|tomorrow|this weekend|next week|this evening|this afternoon|this morning|on saturday|on sunday)\b/i
    );

  if (
    timing
  ) {
    constraints.push(
      `Timing: ${timing[1]}.`
    );
  }

  for (
    const match of
    combined.matchAll(
      /(?:no|without|avoid|exclude|except|do not want|don't want)\s+([a-z][a-z\s-]{2,45})/gi
    )
  ) {
    const value =
      match[1]
        ?.split(
          /[.,;]|\bbut\b/i
        )[0]
        ?.trim();

    if (
      value
    ) {
      constraints.push(
        `Exclude: ${value}.`
      );
    }
  }

  return unique(
    constraints
  );
}

function extractPreferences(
  combined:
    string
) {
  const normalized =
    combined
      .toLowerCase()
      .replace(
        /\bnon-alcoholic\b/g,
        'nonalcoholic'
      );

  const terms = [
    'premium',
    'affordable',
    'balanced',
    'casual',
    'elegant',
    'sweet',
    'dry',
    'bold',
    'light',
    'wine',
    'whisky',
    'cognac',
    'champagne',
    'snacks',
    'chocolate',
    'meals',
    'drinks',
    'groceries',
    'gift',
    'local',
    'imported'
  ] as const;

  const preferences:
    string[] =
    terms.filter(
      term =>
        new RegExp(
          `\\b${term}\\b`,
          'i'
        ).test(
          normalized
        )
    );

  if (
    /\bnonalcoholic\b/.test(
      normalized
    )
  ) {
    preferences.push(
      'non-alcoholic'
    );
  }

  if (
    /\balcoholic\b/.test(
      normalized
    )
  ) {
    preferences.push(
      'alcoholic'
    );
  }

  return unique(
    preferences.map(
      term =>
        term
          .charAt(
            0
          )
          .toUpperCase() +
        term.slice(
          1
        )
    )
  );
}

function extractDecision(
  prompt:
    string
) {
  const value =
    clean(
      prompt
    );

  if (
    /\b(i choose|i chose|go with|use this|keep this|retain|select|i prefer|let us use|let's use|option\s+\d+|the first one|the second one|the third one)\b/i.test(
      value
    )
  ) {
    return value;
  }

  return null;
}

function extractRejection(
  prompt:
    string
) {
  const value =
    clean(
      prompt
    );

  if (
    /\b(remove|exclude|avoid|do not|don't|without|not this|reject|replace)\b/i.test(
      value
    )
  ) {
    return value;
  }

  return null;
}

function isCompletionInstruction(
  prompt:
    string
) {
  return /\b(mark|consider)\s+(this\s+)?journey\s+(complete|completed)|\bwe are done\b|\bjourney complete\b|\bfinish this journey\b/i.test(
    prompt
  );
}

function isReopenInstruction(
  prompt:
    string
) {
  return (
    /\b(reopen|continue|resume|change|adjust|refine|update|revise|edit|replace|remove|add|include|exclude|reduce|increase|decrease|lower|different|alternative|swap|cheaper|premium version|another version)\b/i.test(
      prompt
    ) ||
    isPlanMutationInstruction(
      prompt
    )
  );
}


function isRefinementInstruction(
  prompt:
    string
) {
  return (
    /\b(change|adjust|refine|update|revise|edit|replace|remove|add|include|exclude|reduce|increase|decrease|lower|different|alternative|swap|cheaper|lower-cost|premium version|another version|make it|instead)\b/i.test(
      prompt
    ) ||
    isPlanMutationInstruction(
      prompt
    )
  );
}


/* AJ_MS12_REQUIRED_CONTEXT_AUTHORITY */
/* AJ_MS12_COMMA_SAFE_BUDGET_STATE */

function hasEventPlanningContext(
  messages:
    string[]
) {
  const combined =
    messages.join(
      ' '
    );

  return /\b(?:plan|planning|prepare|organize|host|hosting|party|birthday|wedding|anniversary|dinner|lunch|breakfast|event|gathering|celebration|meeting|occasion|guests|attendees|people)\b/i.test(
    combined
  );
}

function hasOccasionContext(
  messages:
    string[]
) {
  const combined =
    messages.join(
      ' '
    );

  return /\b(?:birthday|wedding|anniversary|dinner|lunch|breakfast|party|celebration|meeting|date night|family gathering|office event|corporate event|occasion|event)\b/i.test(
    combined
  );
}

function hasAudienceContext(
  messages:
    string[]
) {
  const combined =
    messages.join(
      ' '
    );

  return /\b(?:for|about|around|expecting|hosting|serving)?\s*[0-9]{1,4}\s+(?:people|persons|guests|visitors|friends|customers|attendees|of us)\b/i.test(
    combined
  ) ||
  /\b(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|dozen)\s+(?:people|persons|guests|attendees|of us)\b/i.test(
    combined
  );
}

function hasBudgetContext(
  messages:
    string[]
) {
  const combined =
    messages.join(
      ' '
    )
      .replace(
        /,/g,
        ''
      );

  return /\b(?:budget|spend|within|under|below|max(?:imum)?|limit)\b[^.!?\n]{0,35}(?:₦|ngn|n|\$|£|€)?\s*[0-9]+(?:\.[0-9]+)?\s*(?:k|m|thousand|million)?\b/i.test(
    combined
  ) ||
  /(?:₦|ngn|\$|£|€)\s*[0-9]+(?:\.[0-9]+)?\s*(?:k|m|thousand|million)?\b/i.test(
    combined
  ) ||
  /\b(?:my\s+|the\s+)?budget\s+is\s+flexible\b|\bflexible\s+budget\b|\bno\s+fixed\s+budget\b/i.test(
    combined
  );
}

function hasPreferenceContext(
  messages:
    string[]
) {
  const combined =
    messages.join(
      ' '
    );

  return /\b(?:premium|affordable|balanced|casual|elegant|relaxed|simple|luxury|luxurious|budget-friendly|cheap|cheaper|quality|formal|intimate|fun|colourful|colorful|minimal|traditional|modern|local|imported|non-alcoholic|alcoholic)\b/i.test(
    combined
  ) ||
  /\b(?:i\s+prefer|we\s+prefer|make\s+it|keep\s+it|the\s+mood\s+should|it\s+should\s+feel)\b/i.test(
    combined
  );
}

function payloadQuestions(
  payload:
    AIAssistantResponsePayload
) {
  const questionSections =
    payload.sections.filter(
      section =>
        /what i need|need from you|little more detail|still open|unresolved|next question/i.test(
          section.title
        )
    );

  const candidates = [
    payload.summary,
    ...questionSections.flatMap(
      section =>
        section.bullets
    ),
    ...payload.sections.flatMap(
      section =>
        section.bullets.filter(
          bullet =>
            bullet
              .trim()
              .endsWith(
                '?'
              )
        )
    )
  ];

  return unique(
    candidates
      .map(
        clean
      )
      .filter(
        value =>
          value.endsWith(
            '?'
          ) ||
          questionSections.some(
            section =>
              section.bullets.some(
                bullet =>
                  clean(
                    bullet
                  ) ===
                  value
              )
          )
      )
  );
}

function requiredJourneyQuestions(
  messages:
    string[]
) {
  if (
    !hasEventPlanningContext(
      messages
    )
  ) {
    return [];
  }

  const required:
    string[] = [];

  if (
    !hasOccasionContext(
      messages
    )
  ) {
    required.push(
      'What kind of occasion or situation is this for?'
    );
  }

  if (
    !hasAudienceContext(
      messages
    )
  ) {
    required.push(
      'About how many people should I plan for?'
    );
  }

  if (
    !hasBudgetContext(
      messages
    )
  ) {
    required.push(
      'What budget would you like me to work within?'
    );
  }

  if (
    !hasPreferenceContext(
      messages
    )
  ) {
    required.push(
      'What should the result feel like—balanced, affordable, premium or something else?'
    );
  }

  return required;
}

function unresolvedQuestions(
  messages:
    string[],
  payload:
    AIAssistantResponsePayload
) {
  const latestInstruction =
    messages[
      messages.length -
      1
    ] ??
    '';

  if (
    isCompletionInstruction(
      latestInstruction
    )
  ) {
    return [];
  }

  const required =
    requiredJourneyQuestions(
      messages
    );

  if (
    required.length
  ) {
    return [
      required[0]
    ];
  }

  return payloadQuestions(
    payload
  ).slice(
    0,
    1
  );
}

function assumptions(
  payload:
    AIAssistantResponsePayload
) {
  return unique(
    payload.sections
      .filter(
        section =>
          /assumption|understand|recognition|why these appeared|context/i.test(
            section.title
          )
      )
      .flatMap(
        section =>
          section.bullets
      )
      .map(
        clean
      )
  );
}

function proposedStage(
  input: {
    payload:
      AIAssistantResponsePayload;
    planVersion:
      number;
    questions:
      string[];
  }
): AIAssistantJourneyStage {
  if (
    input.questions.length
  ) {
    return 'UNDERSTANDING';
  }

  if (
    (
      input.payload.outputType ===
        'COMPARISON' ||
      input.payload.outputType ===
        'RECOMMENDATION'
    ) &&
    input.payload.products.length >
      1
  ) {
    return 'AWAITING_DECISION';
  }

  if (
    input.payload.actions.length >
      0 &&
    input.payload.confidence >=
      0.7
  ) {
    return 'READY';
  }

  if (
    input.planVersion >
      1
  ) {
    return 'REFINING';
  }

  return 'PLANNING';
}

function controlledStage(
  input:
    ControlledStageInput
): {
  stage:
    AIAssistantJourneyStage;
  reason:
    AIAssistantJourneyTransitionReason;
} {
  if (
    isCompletionInstruction(
      input.prompt
    )
  ) {
    return {
      stage:
        'COMPLETED',
      reason:
        'COMPLETED'
    };
  }

  if (
    input.previousStage ===
      'COMPLETED' &&
    !isReopenInstruction(
      input.prompt
    )
  ) {
    return {
      stage:
        'COMPLETED',
      reason:
        'STAGE_PRESERVED'
    };
  }

  if (
    input.questions.length
  ) {
    return {
      stage:
        'UNDERSTANDING',
      reason:
        'NEEDS_CONTEXT'
    };
  }

  if (
    input.previousStage ===
      'COMPLETED' &&
    isReopenInstruction(
      input.prompt
    )
  ) {
    return {
      stage:
        'REFINING',
      reason:
        'REOPENED'
    };
  }

  if (
    isRefinementInstruction(
      input.prompt
    ) ||
    input.hasRejection
  ) {
    return {
      stage:
        'REFINING',
      reason:
        'PLAN_REFINED'
    };
  }

  if (
    input.hasDecision
  ) {
    return {
      stage:
        'READY',
      reason:
        'DECISION_CONFIRMED'
    };
  }

  if (
    input.proposedStage ===
      'AWAITING_DECISION'
  ) {
    return {
      stage:
        'AWAITING_DECISION',
      reason:
        'AWAITING_CHOICE'
    };
  }

  if (
    input.hasActions &&
    input.confidence >=
      0.7
  ) {
    return {
      stage:
        'READY',
      reason:
        'ACTION_READY'
    };
  }

  if (
    input.previousStage ===
      'READY' &&
    input.proposedStage ===
      'PLANNING'
  ) {
    return {
      stage:
        'READY',
      reason:
        'STAGE_PRESERVED'
    };
  }

  if (
    input.proposedStage ===
      'REFINING' ||
    input.planVersion >
      1
  ) {
    return {
      stage:
        'REFINING',
      reason:
        'PLAN_REFINED'
    };
  }

  if (
    input.previousStage ===
      'UNDERSTANDING'
  ) {
    return {
      stage:
        'PLANNING',
      reason:
        'CONTEXT_CONFIRMED'
    };
  }

  return {
    stage:
      input.proposedStage,
    reason:
      input.previousStage
        ? 'PLAN_CREATED'
        : 'STARTED'
  };
}

function previousState(
  value:
    unknown
): Partial<AIAssistantJourneyState> {
  const record =
    recordValue(
      value
    );

  if (!record) {
    return {};
  }

  return {
    objective:
      stringValue(
        record.objective
      ),
    confirmedContext:
      stringArray(
        record.confirmedContext
      ),
    constraints:
      stringArray(
        record.constraints
      ),
    preferences:
      stringArray(
        record.preferences
      ),
    confirmedDecisions:
      stringArray(
        record.confirmedDecisions
      ),
    rejectedSuggestions:
      stringArray(
        record.rejectedSuggestions
      ),
    unresolvedQuestions:
      stringArray(
        record.unresolvedQuestions
      ),
    assumptions:
      stringArray(
        record.assumptions
      ),
    latestInstruction:
      stringValue(
        record.latestInstruction
      ) ??
      '',
    currentStage:
      stageValue(
        record.currentStage
      ) ??
      undefined,
    planVersion:
      numberValue(
        record.planVersion
      ) ??
      undefined,
    updatedAt:
      stringValue(
        record.updatedAt
      ) ??
      undefined
  };
}

export function createJourneyRestoreTransition(
  input: {
    from:
      AIAssistantJourneyStage |
      null;
    to:
      AIAssistantJourneyStage;
    planVersion:
      number;
    at?:
      string;
  }
): AIAssistantJourneyTransition {
  return {
    from:
      input.from,
    proposed:
      input.to,
    to:
      input.to,
    reason:
      'RESTORED',
    changed:
      input.from !==
      input.to,
    planVersion:
      input.planVersion,
    at:
      input.at ??
      new Date()
        .toISOString()
  };
}

export function resolveJourneyStateUpdate({
  previous,
  conversation,
  prompt,
  payload,
  planVersion
}: JourneyStateInput): JourneyStateUpdate {
  const prior =
    previousState(
      previous
    );

  const messages =
    canonicalizeJourneyConversation(
      [
        ...conversation,
        prompt
      ]
    );

  const combined =
    messages.join(
      ' '
    );

  const objective =
    prior.objective ??
    meaningfulObjective(
      messages
    );

  const knowledgeMessages =
    canonicalizeJourneyConversation(
      [
        ...messages,
        prior.objective ??
          '',
        ...(
          prior.confirmedContext ??
          []
        ),
        ...(
          prior.constraints ??
          []
        ),
        ...(
          prior.preferences ??
          []
        )
      ]
    );

  const awaitingBudgetAnswer =
    hasPendingBudgetClarification(
      prior
    );

  const extractedConstraints =
    extractConstraints(
      combined,
      {
        prompt,
        allowBareBudget:
          awaitingBudgetAnswer
      }
    );

  const hasResolvedBudgetConstraint =
    extractedConstraints.some(
      value =>
        /^Budget(?:\s+limit)?:/i.test(
          value
        )
    );

  const retainedPriorConstraints =
    (
      prior.constraints ??
      []
    ).filter(
      value =>
        !hasResolvedBudgetConstraint ||
        !/^Budget(?:\s+limit)?:/i.test(
          value
        )
    );

  const constraints =
    unique(
      [
        ...retainedPriorConstraints,
        ...extractedConstraints
      ]
    );

  const preferences =
    unique(
      [
        ...(
          prior.preferences ??
          []
        ),
        ...extractPreferences(
          combined
        )
      ]
    );

  const decision =
    extractDecision(
      prompt
    );

  const rejection =
    extractRejection(
      prompt
    );

  const questions =
    unresolvedQuestions(
      knowledgeMessages,
      payload
    );

  const resolvedAssumptions =
    unique(
      [
        ...(
          prior.assumptions ??
          []
        ),
        ...assumptions(
          payload
        )
      ]
    ).slice(
      -20
    );

  const confirmedContext =
    unique(
      [
        ...(
          prior.confirmedContext ??
          []
        ),
        ...(objective
          ? [
              `Objective: ${objective}.`
            ]
          : []),
        ...constraints,
        ...preferences.map(
          preference =>
            `Preference: ${preference}.`
        )
      ]
    ).slice(
      -30
    );

  const proposed =
    proposedStage({
      payload,
      planVersion,
      questions
    });

  const resolved =
    controlledStage({
      previousStage:
        prior.currentStage ??
        null,
      proposedStage:
        proposed,
      prompt,
      planVersion,
      questions,
      hasDecision:
        Boolean(
          decision
        ),
      hasRejection:
        Boolean(
          rejection
        ),
      hasActions:
        payload.actions.length >
        0,
      confidence:
        payload.confidence
    });

  const updatedAt =
    new Date()
      .toISOString();

  const state:
    AIAssistantJourneyState = {
    schemaVersion:
      1,
    objective,
    confirmedContext,
    constraints,
    preferences,
    confirmedDecisions:
      unique(
        [
          ...(
            prior.confirmedDecisions ??
            []
          ),
          ...(decision
            ? [
                decision
              ]
            : [])
        ]
      ).slice(
        -20
      ),
    rejectedSuggestions:
      unique(
        [
          ...(
            prior.rejectedSuggestions ??
            []
          ),
          ...(rejection
            ? [
                rejection
              ]
            : [])
        ]
      ).slice(
        -20
      ),
    unresolvedQuestions:
      questions,
    assumptions:
      resolvedAssumptions,
    latestInstruction:
      clean(
        prompt
      ),
    currentStage:
      resolved.stage,
    planVersion,
    updatedAt
  };

  const transition:
    AIAssistantJourneyTransition = {
    from:
      prior.currentStage ??
      null,
    proposed,
    to:
      resolved.stage,
    reason:
      resolved.reason,
    changed:
      (
        prior.currentStage ??
        null
      ) !==
      resolved.stage,
    planVersion,
    at:
      updatedAt
  };

  return {
    state,
    transition
  };
}

export function resolveJourneyState(
  input:
    JourneyStateInput
): AIAssistantJourneyState {
  return resolveJourneyStateUpdate(
    input
  ).state;
}
