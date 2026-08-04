import 'server-only';

/* AJ_MS12_TYPED_JOURNEY_CONTINUATION */

/* AJ_ASSISTANCE_WORKSPACE_STAGE_2 */

import type {
  AIAssistantAudience,
  AIAssistantResponsePayload
} from '../contracts';

type CollaborativeMissingField =
  | 'goal'
  | 'audienceSize'
  | 'occasion'
  | 'budget'
  | 'preferences';

type CollaborativeIntent = {
  active: boolean;
  goal: string | null;
  audienceSize: number | null;
  occasion: string | null;
  budget: number | null;
  budgetFlexible: boolean;
  preferences: string[];
  exclusions: string[];
  urgency: 'now' | 'today' | 'scheduled' | null;
  planningContext: boolean;
  missing: CollaborativeMissingField[];
};

type CollaborativeInput = {
  audience: AIAssistantAudience;
  prompt: string;
  conversation: string[];
};

import {
  canonicalizeJourneyConversation,
  hasFlexibleJourneyBudget
} from './journeyContinuationInput';

const collaborationTriggers = [
  'help me think this through',
  'help me think through',
  'build this idea with me',
  'build this idea together',
  'help me shape this',
  'ask me the right questions',
  'help me decide what to do',
  'i am not sure what i need',
  "i'm not sure what i need",
  'let us work this out',
  "let's work this out"
] as const;

const genericReplies = [
  'yes',
  'no',
  'okay',
  'ok',
  'sure',
  'maybe',
  'continue',
  'go ahead',
  'show me'
] as const;

function normalize(
  value: string
) {
  return value
    .toLowerCase()
    .replace(
      /[,]/g,
      ''
    )
    .replace(
      /\s+/g,
      ' '
    )
    .trim();
}

function uniqueMessages(
  conversation: string[],
  prompt: string
) {
  const messages = [
    ...conversation,
    prompt
  ]
    .map(
      message =>
        message
          .replace(
            /\s+/g,
            ' '
          )
          .trim()
    )
    .filter(
      Boolean
    );

  return messages.filter(
    (
      message,
      index
    ) =>
      index ===
        0 ||
      normalize(
        message
      ) !==
        normalize(
          messages[
            index - 1
          ] ??
          ''
        )
  );
}

function includesAny(
  value: string,
  terms: readonly string[]
) {
  return terms.some(
    term =>
      value.includes(
        term
      )
  );
}

function extractBudget(
  value: string
) {
  const patterns = [
    /(?:₦|ngn|n)\s*([0-9]+(?:\.[0-9]+)?)\s*(k|m|thousand|million)?\b/i,
    /(?:budget|spend|under|below|within|around|about|max(?:imum)?|cost)\s*(?:is|of|:)?\s*(?:₦|ngn|n)?\s*([0-9]+(?:\.[0-9]+)?)\s*(k|m|thousand|million)?\b/i
  ];

  for (
    const pattern of
    patterns
  ) {
    const match =
      value.match(
        pattern
      );

    if (!match) {
      continue;
    }

    const number =
      Number(
        match[1]
      );

    if (
      !Number.isFinite(
        number
      )
    ) {
      continue;
    }

    const scale =
      (
        match[2] ??
        ''
      ).toLowerCase();

    if (
      scale ===
        'k' ||
      scale ===
        'thousand'
    ) {
      return Math.round(
        number *
          1000
      );
    }

    if (
      scale ===
        'm' ||
      scale ===
        'million'
    ) {
      return Math.round(
        number *
          1000000
      );
    }

    return Math.round(
      number
    );
  }

  return null;
}

function extractAudienceSize(
  value: string
) {
  const patterns = [
    /\b(?:for|about|around|expecting|hosting|serving)\s+([0-9]{1,4})\s+(?:people|persons|guests|visitors|friends|customers|attendees)\b/i,
    /\b([0-9]{1,4})\s+(?:people|persons|guests|visitors|friends|customers|attendees)\b/i
  ];

  for (
    const pattern of
    patterns
  ) {
    const match =
      value.match(
        pattern
      );

    const number =
      Number(
        match?.[1]
      );

    if (
      Number.isInteger(
        number
      ) &&
      number >
        0
    ) {
      return number;
    }
  }

  return null;
}

function extractOccasion(
  value: string
) {
  const occasions = [
    'birthday',
    'wedding',
    'anniversary',
    'dinner',
    'party',
    'celebration',
    'meeting',
    'visit',
    'get-together',
    'gathering',
    'date night',
    'gift',
    'restock',
    'weekend',
    'holiday',
    'housewarming',
    'graduation'
  ] as const;

  return occasions.find(
    occasion =>
      value.includes(
        occasion
      )
  ) ??
    null;
}

function extractUrgency(
  value: string
) {
  if (
    includesAny(
      value,
      [
        'right now',
        'immediately',
        'as soon as possible',
        'urgent'
      ]
    )
  ) {
    return 'now' as const;
  }

  if (
    includesAny(
      value,
      [
        'today',
        'tonight',
        'this evening',
        'this afternoon',
        'this morning'
      ]
    )
  ) {
    return 'today' as const;
  }

  if (
    includesAny(
      value,
      [
        'tomorrow',
        'next week',
        'this weekend',
        'on saturday',
        'on sunday',
        'scheduled'
      ]
    )
  ) {
    return 'scheduled' as const;
  }

  return null;
}

function extractPreferences(
  value: string
) {
  const preferenceTerms = [
    'premium',
    'affordable',
    'balanced',
    'casual',
    'elegant',
    'sweet',
    'dry',
    'bold',
    'light',
    'non-alcoholic',
    'alcoholic',
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

  return preferenceTerms.filter(
    term =>
      value.includes(
        term
      )
  );
}

function extractExclusions(
  value: string
) {
  const exclusions:
    string[] = [];

  const patterns = [
    /(?:no|without|avoid|exclude|except)\s+([a-z][a-z\s-]{2,40})/gi,
    /(?:do not want|don't want|dislike)\s+([a-z][a-z\s-]{2,40})/gi
  ];

  for (
    const pattern of
    patterns
  ) {
    for (
      const match of
      value.matchAll(
        pattern
      )
    ) {
      const exclusion =
        match[1]
          ?.split(
            /[.,;]|\bbut\b/i
          )[0]
          ?.trim();

      if (
        exclusion
      ) {
        exclusions.push(
          exclusion
        );
      }
    }
  }

  return [
    ...new Set(
      exclusions
    )
  ].slice(
    0,
    5
  );
}

function meaningfulGoalMessage(
  message: string
) {
  const value =
    normalize(
      message
    );

  if (
    value.length <
      8 ||
    collaborationTriggers.some(
      trigger =>
        value.includes(
          trigger
        )
    ) ||
    genericReplies.includes(
      value as
        typeof genericReplies[number]
    )
  ) {
    return false;
  }

  if (
    /^(?:₦|ngn|n)?\s*[0-9]+(?:k|m|thousand|million)?$/.test(
      value
    ) ||
    /^(?:for\s+)?[0-9]+\s+(?:people|guests|persons|attendees)$/.test(
      value
    )
  ) {
    return false;
  }

  return true;
}

function extractGoal(
  messages: string[]
) {
  const meaningful =
    messages.find(
      meaningfulGoalMessage
    );

  if (!meaningful) {
    return null;
  }

  return meaningful
    .replace(
      /^(i want to|i need to|help me|i am trying to|i'm trying to|please help me)\s+/i,
      ''
    )
    .trim()
    .slice(
      0,
      180
    );
}

function planningContext(
  value: string
) {
  return includesAny(
    value,
    [
      'plan',
      'prepare',
      'party',
      'occasion',
      'celebration',
      'birthday',
      'wedding',
      'anniversary',
      'dinner',
      'gathering',
      'guests',
      'people',
      'visitors',
      'shopping list',
      'basket',
      'event'
    ]
  );
}

function requiresAudienceSize(
  value: string
) {
  return includesAny(
    value,
    [
      'party',
      'celebration',
      'birthday',
      'wedding',
      'anniversary',
      'dinner',
      'gathering',
      'guests',
      'people',
      'visitors',
      'attendees',
      'event'
    ]
  );
}

function requiresOccasion(
  value: string
) {
  return (
    includesAny(
      value,
      [
        'plan',
        'prepare',
        'shopping list',
        'basket',
        'for guests',
        'for visitors'
      ]
    ) &&
    !includesAny(
      value,
      [
        'restock',
        'weekly shopping',
        'monthly shopping',
        'household',
        'groceries'
      ]
    )
  );
}

function requiresBudget(
  value: string,
  intent: {
    audienceSize:
      number |
      null;
    occasion:
      string |
      null;
  }
) {
  return (
    includesAny(
      value,
      [
        'budget',
        'affordable',
        'cheaper',
        'cheap',
        'lower cost',
        'under ',
        'within ',
        'spend',
        'cost'
      ]
    ) ||
    Boolean(
      intent.audienceSize &&
      intent.occasion
    )
  );
}

function analyseConversation(
  conversation: string[]
): CollaborativeIntent {
  const canonicalConversation =
    canonicalizeJourneyConversation(
      conversation
    );

  const normalizedMessages =
    canonicalConversation.map(
      normalize
    );

  const combined =
    normalizedMessages.join(
      ' '
    );

  const active =
    normalizedMessages.some(
      message =>
        collaborationTriggers.some(
          trigger =>
            message.includes(
              trigger
            )
        )
    );

  const goal =
    extractGoal(
      conversation
    );

  const audienceSize =
    extractAudienceSize(
      combined
    );

  const occasion =
    extractOccasion(
      combined
    );

  const budget =
    extractBudget(
      combined
    );

  const budgetFlexible =
    hasFlexibleJourneyBudget(
      combined
    );

  const preferences =
    extractPreferences(
      combined
    );

  const exclusions =
    extractExclusions(
      combined
    );

  const urgency =
    extractUrgency(
      combined
    );

  const isPlanning =
    planningContext(
      combined
    );

  const missing:
    CollaborativeMissingField[] =
    [];

  if (!goal) {
    missing.push(
      'goal'
    );
  } else if (
    requiresAudienceSize(
      combined
    ) &&
    !audienceSize
  ) {
    missing.push(
      'audienceSize'
    );
  } else if (
    requiresOccasion(
      combined
    ) &&
    !occasion
  ) {
    missing.push(
      'occasion'
    );
  } else if (
    requiresBudget(
      combined,
      {
        audienceSize,
        occasion
      }
    ) &&
    !budget
  ) {
    missing.push(
      'budget'
    );
  }

  return {
    active,
    goal,
    audienceSize,
    occasion,
    budget,
    budgetFlexible,
    preferences,
    exclusions,
    urgency,
    planningContext:
      isPlanning,
    missing
  };
}

function money(
  value: number
) {
  return new Intl.NumberFormat(
    'en-NG',
    {
      style:
        'currency',
      currency:
        'NGN',
      maximumFractionDigits:
        0
    }
  ).format(
    value
  );
}

/* AJ_MS12_UNIFIED_JOURNEY_INPUT_TYPE_REPAIR */
function questionFor(
  value:
    CollaborativeIntent |
    string |
    null |
    undefined
) {
  const questions:
    Record<
      CollaborativeIntent['missing'][number],
      string
    > = {
    goal:
      'What are you hoping to prepare, solve or decide?',
    audienceSize:
      'About how many people should I plan for?',
    occasion:
      'What kind of occasion or situation is this for?',
    budget:
      'What budget would you like me to work within?',
    preferences:
      'What should the result feel like—balanced, affordable, premium or something else?'
  };

  const candidate =
    typeof value ===
    'string'
      ? value
      : value?.missing[0];

  if (
    !candidate ||
    !(
      candidate in
      questions
    )
  ) {
    return '';
  }

  return questions[
    candidate as
      CollaborativeIntent['missing'][number]
  ];
}

function promptOptionsFor(
  field:
    CollaborativeMissingField
) {
  const options:
    Record<
      CollaborativeMissingField,
      string[]
    > = {
    goal: [
      'Plan a birthday dinner',
      'Help me compare two products',
      'Build a household Shopping List'
    ],
    audienceSize: [
      'Plan for 5 people',
      'Plan for 10 people',
      'Plan for 20 people'
    ],
    occasion: [
      'It is for a birthday',
      'It is for a dinner',
      'It is a household restock'
    ],
    budget: [
      'Keep it within ₦50,000',
      'Keep it within ₦100,000',
      'The budget is flexible'
    ],
    preferences: [
      'Keep it affordable',
      'Make it balanced',
      'Make it premium'
    ]
  };

  return options[
    field
  ];
}

function summaryBullets(
  intent:
    CollaborativeIntent
) {
  const bullets:
    string[] = [];

  if (
    intent.goal
  ) {
    bullets.push(
      `Goal: ${intent.goal}.`
    );
  }

  if (
    intent.audienceSize
  ) {
    bullets.push(
      `People: approximately ${intent.audienceSize}.`
    );
  }

  if (
    intent.occasion
  ) {
    bullets.push(
      `Occasion: ${intent.occasion}.`
    );
  }

  if (
    intent.budget
  ) {
    bullets.push(
      `Budget: ${money(
        intent.budget
      )}.`
    );
  }

  if (
    intent.preferences.length
  ) {
    bullets.push(
      `Preferences: ${intent.preferences.join(
        ', '
      )}.`
    );
  }

  if (
    intent.exclusions.length
  ) {
    bullets.push(
      `Avoid: ${intent.exclusions.join(
        ', '
      )}.`
    );
  }

  if (
    intent.urgency
  ) {
    bullets.push(
      `Timing: ${intent.urgency}.`
    );
  }

  if (
    intent.budgetFlexible
  ) {
    bullets.push(
      'Budget: flexible.'
    );
  }

  return bullets;
}

export function resolveCollaborativeIntentResponse({
  audience,
  prompt,
  conversation
}: CollaborativeInput): AIAssistantResponsePayload | null {
  const messages =
    uniqueMessages(
      conversation,
      prompt
    );

  const intent =
    analyseConversation(
      messages
    );

  if (
    !intent.active
  ) {
    return null;
  }

  const understood =
    summaryBullets(
      intent
    );

  const nextMissing =
    intent.missing[0] ??
    null;

  if (
    nextMissing
  ) {
    const question =
      questionFor(
        nextMissing
      );

    return {
      headline:
        nextMissing ===
        'goal'
          ? 'Let’s define this Journey'
          : 'One detail before I build the plan',
      summary:
        question,
      outputType:
        audience ===
        'customer'
          ? 'SHOPPING_PLAN'
          : 'OPERATIONS_BRIEF',
      confidence:
        understood.length
          ? 0.82
          : 0.66,
      metrics: [
        {
          label:
            'Understood',
          value:
            String(
              understood.length
            ),
          helper:
            'Saved from this Journey’s conversation.'
        },
        {
          label:
            'Next question',
          value:
            '1',
          tone:
            'warning'
        }
      ],
      products: [],
      productDraft:
        null,
      sections: [
        {
          title:
            'What I understand',
          bullets:
            understood.length
              ? understood
              : [
                  'You want AJ to help turn an unfinished idea into a useful plan.'
                ]
        },
        {
          title:
            'What I need next',
          description:
            'Answer naturally. AJ will continue this same Journey.',
          bullets: [
            question
          ]
        }
      ],
      draftFields: [],
      warnings: [],
      suggestedPrompts:
        promptOptionsFor(
          nextMissing
        ),
      actions: []
    };
  }

  /*
   * Once the minimum context is complete, return control to the
   * customer engine. It will build the live catalog response from
   * the complete Journey conversation instead of asking the user
   * to issue another "build it" command.
   */
  if (
    audience ===
    'customer'
  ) {
    return null;
  }

  return {
    headline:
      'The Journey is clear enough to prepare',
    summary:
      'AJ has enough context to prepare the next governed draft.',
    outputType:
      'OPERATIONS_BRIEF',
    confidence:
      0.9,
    metrics: [
      {
        label:
          'Details understood',
        value:
          String(
            understood.length
          )
      }
    ],
    products: [],
    productDraft:
      null,
    sections: [
      {
        title:
          'What I understand',
        bullets:
          understood
      }
    ],
    draftFields: [],
    warnings: [
      'Nothing will be published or changed until an authorised user reviews the available action.'
    ],
    suggestedPrompts: [
      'Prepare the next safe action',
      'Show me the highest-priority version',
      'Let me change one detail'
    ],
    actions: []
  };
}
