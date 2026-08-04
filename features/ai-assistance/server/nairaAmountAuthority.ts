import 'server-only';

/* AJ_MS12_4_CONTEXTUAL_NAIRA_INPUT_V1 */

type ParseNairaAmountOptions = {
  allowBare?:
    boolean;
};

type JourneyBudgetContext = {
  unresolvedQuestions?:
    string[] |
    null;
} | null | undefined;

function normalizedAmount(
  raw:
    string,
  suffix:
    string
) {
  const numeric =
    Number(
      raw
        .replace(
          /[\s,]/g,
          ''
        )
    );

  if (
    !Number.isFinite(
      numeric
    ) ||
    numeric <=
      0
  ) {
    return null;
  }

  const normalizedSuffix =
    suffix
      .toLowerCase()
      .trim();

  const multiplier =
    normalizedSuffix ===
      'm' ||
    normalizedSuffix ===
      'million'
      ? 1_000_000
      : normalizedSuffix ===
          'k' ||
        normalizedSuffix ===
          'thousand'
        ? 1_000
        : 1;

  const resolved =
    Math.round(
      numeric *
        multiplier
    );

  return resolved >
    0
    ? resolved
    : null;
}

function latestMatch(
  value:
    string,
  pattern:
    RegExp
) {
  const matches =
    [
      ...value.matchAll(
        pattern
      )
    ];

  const match =
    matches.at(
      -1
    );

  if (
    !match
  ) {
    return null;
  }

  return normalizedAmount(
    match[1] ??
      '',
    match[2] ??
      ''
  );
}

export function parseNairaAmount(
  value:
    string,
  options:
    ParseNairaAmountOptions = {}
) {
  const source =
    value
      .replace(
        /\s*,\s*/g,
        ','
      )
      .replace(
        /\s+/g,
        ' '
      )
      .trim();

  if (
    !source ||
    /^\s*[$£€]/.test(
      source
    )
  ) {
    return null;
  }

  const currencyAmount =
    latestMatch(
      source,
      /(?:₦|ngn\b|\bn(?=\s*[0-9]))\s*([0-9][0-9,\s]*(?:\.[0-9]+)?)\s*(k|m|thousand|million)?\b/gi
    );

  if (
    currencyAmount
  ) {
    return currencyAmount;
  }

  const contextualAmount =
    latestMatch(
      source,
      /(?:budget(?:\s+(?:is|of|to|at))?|spend(?:ing)?(?:\s+limit)?|within|under|below|around|about|max(?:imum)?|ceiling|limit|cost|increase(?:\s+(?:it|the\s+budget|budget))?(?:\s+to)?|raise(?:\s+(?:it|the\s+budget|budget))?(?:\s+to)?|make\s+it|set\s+it\s+to|use)\s*[:=]?\s*(?:₦|ngn\b|\bn(?=\s*[0-9]))?\s*([0-9][0-9,\s]*(?:\.[0-9]+)?)\s*(k|m|thousand|million)?\b/gi
    );

  if (
    contextualAmount
  ) {
    return contextualAmount;
  }

  const abbreviatedAmount =
    latestMatch(
      source,
      /\b([0-9][0-9,\s]*(?:\.[0-9]+)?)\s*(k|m|thousand|million)\b/gi
    );

  if (
    abbreviatedAmount
  ) {
    return abbreviatedAmount;
  }

  if (
    !options.allowBare
  ) {
    return null;
  }

  const bare =
    source.match(
      /^(?:make\s+it|set\s+it\s+to|use|work\s+with)?\s*(?:₦|ngn\b|\bn(?=\s*[0-9]))?\s*([0-9][0-9,\s]*(?:\.[0-9]+)?)\s*(k|m|thousand|million)?\s*$/i
    );

  if (
    !bare
  ) {
    return null;
  }

  return normalizedAmount(
    bare[1] ??
      '',
    bare[2] ??
      ''
  );
}

export function isBudgetClarificationQuestion(
  value:
    string
) {
  return /\b(?:budget|spend|spending|ceiling|limit|cost|price)\b/i.test(
    value
  );
}

export function hasPendingBudgetClarification(
  state:
    JourneyBudgetContext
) {
  return (
    state
      ?.unresolvedQuestions ??
    []
  ).some(
    isBudgetClarificationQuestion
  );
}
