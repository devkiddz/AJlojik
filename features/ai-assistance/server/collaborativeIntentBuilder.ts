import 'server-only';

import type {
  AIAssistantAudience,
  AIAssistantResponsePayload
} from '../contracts';

type CollaborativeIntent = {
  active: boolean;
  goal: string | null;
  audienceSize: number | null;
  occasion: string | null;
  budget: number | null;
  preferences: string[];
  exclusions: string[];
  urgency: 'now' | 'today' | 'scheduled' | null;
  missing: Array<
    | 'goal'
    | 'audienceSize'
    | 'occasion'
    | 'budget'
    | 'preferences'
  >;
};

type CollaborativeInput = {
  audience: AIAssistantAudience;
  prompt: string;
  conversation: string[];
};

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
];

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[,]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function includesAny(
  value: string,
  terms: string[]
) {
  return terms.some(term => value.includes(term));
}

function extractBudget(value: string) {
  const patterns = [
    /(?:₦|ngn|n)\s*([0-9]+(?:\.[0-9]+)?)\s*(k|m|thousand|million)?\b/i,
    /(?:budget|spend|under|below|within|around|about|max(?:imum)?)\s*(?:is|of|:)?\s*(?:₦|ngn|n)?\s*([0-9]+(?:\.[0-9]+)?)\s*(k|m|thousand|million)?\b/i
  ];

  for (const pattern of patterns) {
    const match = value.match(pattern);

    if (!match) {
      continue;
    }

    const number = Number(match[1]);

    if (!Number.isFinite(number)) {
      continue;
    }

    const scale = (match[2] ?? '').toLowerCase();

    if (scale === 'k' || scale === 'thousand') {
      return Math.round(number * 1000);
    }

    if (scale === 'm' || scale === 'million') {
      return Math.round(number * 1000000);
    }

    return Math.round(number);
  }

  return null;
}

function extractAudienceSize(value: string) {
  const patterns = [
    /\b(?:for|about|around|expecting|hosting)\s+([0-9]{1,4})\s+(?:people|persons|guests|visitors|friends|customers|attendees)\b/i,
    /\b([0-9]{1,4})\s+(?:people|persons|guests|visitors|friends|customers|attendees)\b/i
  ];

  for (const pattern of patterns) {
    const match = value.match(pattern);
    const number = Number(match?.[1]);

    if (Number.isInteger(number) && number > 0) {
      return number;
    }
  }

  return null;
}

function extractOccasion(value: string) {
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
    'holiday'
  ];

  return occasions.find(
    occasion => value.includes(occasion)
  ) ?? null;
}

function extractUrgency(value: string) {
  if (
    includesAny(value, [
      'right now',
      'immediately',
      'as soon as possible',
      'urgent'
    ])
  ) {
    return 'now' as const;
  }

  if (
    includesAny(value, [
      'today',
      'tonight',
      'this evening',
      'this afternoon',
      'this morning'
    ])
  ) {
    return 'today' as const;
  }

  if (
    includesAny(value, [
      'tomorrow',
      'next week',
      'this weekend',
      'on saturday',
      'on sunday',
      'scheduled'
    ])
  ) {
    return 'scheduled' as const;
  }

  return null;
}

function extractPreferences(value: string) {
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
    'fashion',
    'gift'
  ];

  return preferenceTerms.filter(
    term => value.includes(term)
  );
}

function extractExclusions(value: string) {
  const exclusions: string[] = [];

  const patterns = [
    /(?:no|without|avoid|exclude|except)\s+([a-z][a-z\s-]{2,40})/gi,
    /(?:do not want|don't want|dislike)\s+([a-z][a-z\s-]{2,40})/gi
  ];

  for (const pattern of patterns) {
    for (const match of value.matchAll(pattern)) {
      const exclusion = match[1]
        ?.split(/[.,;]|\bbut\b/i)[0]
        ?.trim();

      if (exclusion) {
        exclusions.push(exclusion);
      }
    }
  }

  return [...new Set(exclusions)].slice(0, 5);
}

function extractGoal(
  messages: string[],
  combined: string
) {
  const meaningful = messages.find(message => {
    const value = normalize(message);

    return (
      value.length >= 12 &&
      !collaborationTriggers.some(
        trigger => value.includes(trigger)
      ) &&
      !/^(yes|no|okay|ok|sure|maybe|around|about)\b/.test(value)
    );
  });

  if (meaningful) {
    return meaningful
      .replace(/^(i want to|i need to|help me|i am trying to|i'm trying to)\s+/i, '')
      .trim()
      .slice(0, 180);
  }

  if (combined.includes('visitors') || combined.includes('guests')) {
    return 'prepare something suitable for visitors';
  }

  return null;
}

function analyseConversation(
  conversation: string[]
): CollaborativeIntent {
  const normalizedMessages =
    conversation.map(normalize);

  const combined =
    normalizedMessages.join(' ');

  const active =
    normalizedMessages.some(
      message =>
        collaborationTriggers.some(
          trigger => message.includes(trigger)
        )
    );

  const goal =
    extractGoal(conversation, combined);

  const audienceSize =
    extractAudienceSize(combined);

  const occasion =
    extractOccasion(combined);

  const budget =
    extractBudget(combined);

  const preferences =
    extractPreferences(combined);

  const exclusions =
    extractExclusions(combined);

  const urgency =
    extractUrgency(combined);

  const missing: CollaborativeIntent['missing'] = [];

  if (!goal) {
    missing.push('goal');
  }

  if (
    includesAny(combined, [
      'guest',
      'visitor',
      'party',
      'gathering',
      'people',
      'occasion'
    ]) &&
    !audienceSize
  ) {
    missing.push('audienceSize');
  }

  if (
    includesAny(combined, [
      'plan',
      'prepare',
      'event',
      'guest',
      'visitor'
    ]) &&
    !occasion
  ) {
    missing.push('occasion');
  }

  if (!budget) {
    missing.push('budget');
  }

  if (!preferences.length) {
    missing.push('preferences');
  }

  return {
    active,
    goal,
    audienceSize,
    occasion,
    budget,
    preferences,
    exclusions,
    urgency,
    missing
  };
}

function money(value: number) {
  return new Intl.NumberFormat(
    'en-NG',
    {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0
    }
  ).format(value);
}

function questionFor(
  intent: CollaborativeIntent
) {
  const first = intent.missing[0];
  const second = intent.missing[1];

  const questions: Record<
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
      'Should the result feel affordable, balanced, premium, casual or something else?'
  };

  const selected = [first, second]
    .filter(
      (item): item is NonNullable<typeof item> =>
        Boolean(item)
    )
    .map(item => questions[item]);

  return selected.join(' ');
}

function summaryBullets(
  intent: CollaborativeIntent
) {
  const bullets: string[] = [];

  if (intent.goal) {
    bullets.push(
      `Goal: ${intent.goal}.`
    );
  }

  if (intent.audienceSize) {
    bullets.push(
      `People: approximately ${intent.audienceSize}.`
    );
  }

  if (intent.occasion) {
    bullets.push(
      `Occasion: ${intent.occasion}.`
    );
  }

  if (intent.budget) {
    bullets.push(
      `Budget: ${money(intent.budget)}.`
    );
  }

  if (intent.preferences.length) {
    bullets.push(
      `Preferences: ${intent.preferences.join(', ')}.`
    );
  }

  if (intent.exclusions.length) {
    bullets.push(
      `Avoid: ${intent.exclusions.join(', ')}.`
    );
  }

  if (intent.urgency) {
    bullets.push(
      `Timing: ${intent.urgency}.`
    );
  }

  return bullets;
}

export function resolveCollaborativeIntentResponse({
  audience,
  prompt,
  conversation
}: CollaborativeInput): AIAssistantResponsePayload | null {
  const messages = [
    ...conversation,
    prompt
  ].filter(Boolean);

  const intent =
    analyseConversation(messages);

  if (!intent.active) {
    return null;
  }

  const understood =
    summaryBullets(intent);

  if (intent.missing.length) {
    const question =
      questionFor(intent);

    return {
      headline:
        'Let’s shape this together',
      summary:
        question ||
        'Tell me a little more about what you have in mind.',
      outputType:
        audience === 'customer'
          ? 'SHOPPING_PLAN'
          : 'OPERATIONS_BRIEF',
      confidence:
        0.72,
      metrics: [
        {
          label:
            'Details understood',
          value:
            String(understood.length),
          helper:
            'I will keep using these details as we continue.'
        },
        {
          label:
            'Still needed',
          value:
            String(intent.missing.length),
          tone:
            'warning'
        }
      ],
      products: [],
      productDraft: null,
      sections: [
        {
          title:
            'What I understand so far',
          bullets:
            understood.length
              ? understood
              : [
                  'You want help turning an unfinished idea into a clear plan.'
                ]
        },
        {
          title:
            'What I need from you next',
          description:
            'Answer naturally. You do not need to use a special format.',
          bullets: [
            question
          ]
        }
      ],
      draftFields: [],
      warnings: [],
      suggestedPrompts: [
        'Let me add more detail',
        'Help me choose a sensible budget',
        'Show me what you understand so far'
      ],
      actions: []
    };
  }

  return {
    headline:
      'Your idea is clear enough to plan',
    summary:
      'I have organised what you told me. Review it below, then ask me to build the recommendation or change any detail.',
    outputType:
      audience === 'customer'
        ? 'SHOPPING_PLAN'
        : 'OPERATIONS_BRIEF',
    confidence:
      0.9,
    metrics: [
      {
        label:
          'Goal',
        value:
          intent.goal ??
          'Ready'
      },
      {
        label:
          'Budget',
        value:
          intent.budget
            ? money(intent.budget)
            : 'Flexible'
      },
      {
        label:
          'People',
        value:
          intent.audienceSize
            ? String(intent.audienceSize)
            : 'Not required'
      }
    ],
    products: [],
    productDraft: null,
    sections: [
      {
        title:
          'What I understand',
        bullets:
          understood
      },
      {
        title:
          'What we can do next',
        bullets:
          audience === 'customer'
            ? [
                'Build a balanced recommendation from available products.',
                'Create a lower-cost or premium alternative.',
                'Turn the final selection into a Shopping List for your review.'
              ]
            : [
                'Prepare a reviewable operational plan.',
                'Identify the safest first action.',
                'Turn the approved result into an existing controlled workflow.'
              ]
      }
    ],
    draftFields: [],
    warnings: [
      'Nothing will be purchased, published or changed until you review and confirm an available action.'
    ],
    suggestedPrompts:
      audience === 'customer'
        ? [
            'Build the recommendation from this plan',
            'Show me a cheaper version',
            'Let me change one detail'
          ]
        : [
            'Prepare the next safe action',
            'Show me the highest-priority version',
            'Let me change one detail'
          ],
    actions: []
  };
}
