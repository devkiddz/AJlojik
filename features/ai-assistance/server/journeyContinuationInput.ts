import 'server-only';

/* AJ_MS12_TYPED_JOURNEY_CONTINUATION */
/* AJ_MS12_COMMA_SAFE_BUDGET_INPUT */

export type JourneyMissingContext =
  | 'goal'
  | 'audienceSize'
  | 'occasion'
  | 'budget'
  | 'preferences';

const wordNumbers:
  Record<
    string,
    number
  > = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
    eleven: 11,
    twelve: 12,
    thirteen: 13,
    fourteen: 14,
    fifteen: 15,
    sixteen: 16,
    seventeen: 17,
    eighteen: 18,
    nineteen: 19,
    twenty: 20,
    thirty: 30,
    forty: 40,
    fifty: 50,
    dozen: 12
  };

function normalize(
  value:
    string
) {
  return value
    .toLowerCase()
    .replace(
      /[,]/g,
      ''
    )
    .replace(
      /[’]/g,
      "'"
    )
    .replace(
      /\s+/g,
      ' '
    )
    .trim();
}

function numericWord(
  value:
    string
) {
  const normalized =
    normalize(
      value
    );

  if (
    normalized ===
    'half a dozen'
  ) {
    return 6;
  }

  if (
    normalized ===
      'a dozen' ||
    normalized ===
      'one dozen'
  ) {
    return 12;
  }

  const direct =
    wordNumbers[
      normalized
    ];

  if (direct) {
    return direct;
  }

  const parts =
    normalized.split(
      /[\s-]+/
    );

  if (
    parts.length ===
    2 &&
    wordNumbers[
      parts[0]
    ] &&
    wordNumbers[
      parts[1]
    ]
  ) {
    return (
      wordNumbers[
        parts[0]
      ] +
      wordNumbers[
        parts[1]
      ]
    );
  }

  return null;
}

function compactAudienceAnswer(
  value:
    string
) {
  const normalized =
    normalize(
      value
    );

  const digitPatterns = [
    /^(?:we(?:'re| are)?\s+)?([0-9]{1,4})(?:\s+(?:people|persons|guests|attendees|of us))?$/,
    /^([0-9]{1,4})\s+of\s+us$/,
    /^(?:it(?:'s| is)\s+)?(?:for\s+)?([0-9]{1,4})$/
  ];

  for (
    const pattern of
    digitPatterns
  ) {
    const match =
      normalized.match(
        pattern
      );

    const count =
      Number(
        match?.[1]
      );

    if (
      Number.isInteger(
        count
      ) &&
      count >
        0 &&
      count <=
        5000
    ) {
      return count;
    }
  }

  const wordPattern =
    normalized.match(
      /^(?:we(?:'re| are)?\s+|it(?:'s| is)\s+(?:for\s+)?|for\s+)?([a-z]+(?:[\s-][a-z]+)?)(?:\s+(?:people|persons|guests|attendees|of us))?$/
    )?.[1];

  return wordPattern
    ? numericWord(
        wordPattern
      )
    : null;
}

function hasPlanningContext(
  value:
    string
) {
  const normalized =
    normalize(
      value
    );

  return /\b(?:plan|planning|prepare|party|birthday|wedding|anniversary|dinner|event|gathering|celebration|meeting|visit|visitors|guests|people|attendees|occasion)\b/.test(
    normalized
  );
}

function hasKnownAudience(
  value:
    string
) {
  return /\b(?:for|about|around|expecting|hosting)\s+[0-9]{1,4}\s+(?:people|persons|guests|visitors|friends|customers|attendees)\b|\b[0-9]{1,4}\s+(?:people|persons|guests|visitors|friends|customers|attendees|of us)\b/i.test(
    value
  );
}

function hasKnownBudget(
  value:
    string
) {
  return /(?:₦|ngn|n)\s*[0-9]+(?:\.[0-9]+)?\s*(?:k|m|thousand|million)?\b|(?:budget|spend|under|below|within|around|about|max(?:imum)?)\s*(?:is|of|:)?\s*(?:₦|ngn|n)?\s*[0-9]+(?:\.[0-9]+)?\s*(?:k|m|thousand|million)?\b/i.test(
    value
  ) ||
  hasFlexibleJourneyBudget(
    value
  );
}

function compactBudgetAnswer(
  value:
    string
) {
  const normalized =
    normalize(
      value
    );

  if (
    hasFlexibleJourneyBudget(
      normalized
    )
  ) {
    return 'My budget is flexible';
  }

  if (
    /^(?:₦|ngn|n)?\s*[0-9]+(?:\.[0-9]+)?\s*(?:k|m|thousand|million)?$/.test(
      normalized
    )
  ) {
    return `My budget is ${normalized}`;
  }

  return null;
}

export function hasFlexibleJourneyBudget(
  value:
    string
) {
  const normalized =
    normalize(
      value
    );

  return [
    'budget is flexible',
    'the budget is flexible',
    'my budget is flexible',
    'flexible budget',
    'no fixed budget',
    'i do not have a fixed budget',
    "i don't have a fixed budget",
    'any sensible budget',
    'work with a sensible budget',
    'you can choose the budget',
    'suggest a budget',
    'help me choose a budget'
  ].some(
    phrase =>
      normalized.includes(
        phrase
      )
  );
}

export function canonicalizeJourneyConversation(
  messages:
    string[]
) {
  const deduped:
    string[] = [];

  for (
    const rawMessage of
    messages
  ) {
    const message =
      rawMessage
        .replace(
          /\s+/g,
          ' '
        )
        .trim();

    if (!message) {
      continue;
    }

    const previous =
      deduped[
        deduped.length -
        1
      ];

    if (
      previous &&
      normalize(
        previous
      ) ===
        normalize(
          message
        )
    ) {
      continue;
    }

    const priorContext =
      deduped.join(
        ' '
      );

    let canonical =
      message;

    if (
      hasPlanningContext(
        priorContext
      ) &&
      !hasKnownAudience(
        priorContext
      )
    ) {
      const audience =
        compactAudienceAnswer(
          message
        );

      if (audience) {
        canonical =
          `${audience} people`;
      }
    } else if (
      !hasKnownBudget(
        priorContext
      )
    ) {
      canonical =
        compactBudgetAnswer(
          message
        ) ??
        message;
    }

    deduped.push(
      canonical
    );
  }

  return deduped;
}

export function journeySuggestedReplies(
  missing:
    JourneyMissingContext |
    null
) {
  switch (
    missing
  ) {
    case 'audienceSize':
      return [
        'We are 5 people',
        'We are 10 people',
        'We are 20 people'
      ];

    case 'occasion':
      return [
        'It is for a birthday',
        'It is a relaxed dinner',
        'It is a small celebration'
      ];

    case 'budget':
      return [
        'Keep it under ₦50,000',
        'Work within ₦100,000',
        'My budget is flexible'
      ];

    case 'preferences':
      return [
        'Keep it balanced',
        'Make it premium',
        'I prefer affordable options'
      ];

    case 'goal':
      return [
        'Help me plan an occasion',
        'Help me choose what to buy',
        'Help me build a Shopping List'
      ];

    default:
      return [
        'Build the recommendation',
        'Show me a cheaper version',
        'Let me change one detail'
      ];
  }
}
