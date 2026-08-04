import 'server-only';

/* AJ_MS12_4_MARKETPLACE_PRODUCT_RESOLUTION_V1 */

import type {
  AIAssistantSection
} from '../contracts';

type MarketplaceInventorySource = {
  quantity:
    number;
  reserved:
    number;
} | null;

type MarketplaceVariantSource = {
  id:
    string;
  label:
    string;
  sku?:
    string |
    null;
  price:
    unknown;
  compareAtPrice?:
    unknown;
  inventory?:
    MarketplaceInventorySource;
};

export type MarketplaceProductSource = {
  id:
    string;
  slug:
    string;
  name:
    string;
  shortDescription?:
    string |
    null;
  longDescription?:
    string |
    null;
  tags?:
    string[];
  category: {
    id:
      string;
    slug:
      string;
    label:
      string;
  };
  subcategory?: {
    id:
      string;
    slug:
      string;
    label:
      string;
  } | null;
  brand?: {
    id:
      string;
    slug:
      string;
    name:
      string;
  } | null;
  variants:
    MarketplaceVariantSource[];
};

export type MarketplaceDirection =
  | 'INCREASE'
  | 'PREFER'
  | 'DECREASE'
  | 'EXCLUDE';

export type MarketplaceMatchType =
  | 'EXACT_MATCH'
  | 'CONTEXTUAL_MATCH'
  | 'ALTERNATIVE_FOUND'
  | 'UNAVAILABLE'
  | 'NONE';

export type MarketplaceProductSignal = {
  productId:
    string;
  score:
    number;
  matchType:
    MarketplaceMatchType;
  matchedFields:
    string[];
  matchedConcepts:
    string[];
  preferred:
    boolean;
  deprioritized:
    boolean;
  excluded:
    boolean;
  exactRequested:
    boolean;
  alternativeFor:
    string |
    null;
  reason:
    string |
    null;
};

type MarketplaceCorrection = {
  source:
    string;
  resolved:
    string;
};

type MarketplaceConceptDirection = {
  concept:
    string;
  direction:
    MarketplaceDirection;
  source:
    string;
};

type MarketplaceUnavailableRequest = {
  requested:
    string;
  exactProduct:
    string |
    null;
  alternatives:
    string[];
};

export type MarketplaceRequestResolution = {
  originalPrompt:
    string;
  correctedPrompt:
    string;
  corrections:
    MarketplaceCorrection[];
  directions:
    MarketplaceConceptDirection[];
  requestedConcepts:
    string[];
  productSignals:
    MarketplaceProductSignal[];
  unavailable:
    MarketplaceUnavailableRequest[];
  assumptions:
    string[];
  reconciliations:
    string[];
  warnings:
    string[];
};

type ConceptDefinition = {
  canonical:
    string;
  aliases:
    string[];
};

const directTokenAliases:
  Record<string, string> = {
  confessionery:
    'confectionery',
  confessioneries:
    'confectionery',
  confectonery:
    'confectionery',
  confectoneries:
    'confectionery',
  confectionary:
    'confectionery',
  confectionaries:
    'confectionery',
  confectioneries:
    'confectionery',
  whiskies:
    'whisky',
  whiskey:
    'whisky',
  whiskeys:
    'whisky',
  champagnes:
    'champagne',
  wines:
    'wine',
  cakes:
    'cake',
  cupcakes:
    'cupcake',
  chocolates:
    'chocolate',
  deserts:
    'dessert',
  groceries:
    'grocery',
  beverages:
    'beverage',
  snacks:
    'snack'
};

const visibleDirectCorrections =
  new Set([
    'confessionery',
    'confessioneries',
    'confectonery',
    'confectoneries'
  ]);

const stopWords =
  new Set([
    'about',
    'after',
    'again',
    'also',
    'another',
    'because',
    'before',
    'budget',
    'build',
    'could',
    'current',
    'different',
    'enough',
    'explain',
    'fewer',
    'guest',
    'guests',
    'include',
    'journey',
    'least',
    'looks',
    'make',
    'minimum',
    'more',
    'need',
    'people',
    'plan',
    'please',
    'product',
    'products',
    'reduce',
    'same',
    'should',
    'show',
    'something',
    'than',
    'that',
    'these',
    'this',
    'those',
    'through',
    'under',
    'within',
    'would'
  ]);

const genericConcepts:
  ConceptDefinition[] = [
  {
    canonical:
      'wine',
    aliases: [
      'wine',
      'red wine',
      'white wine',
      'rose wine',
      'sparkling wine',
      'merlot',
      'cabernet',
      'champagne'
    ]
  },
  {
    canonical:
      'confectionery',
    aliases: [
      'confectionery',
      'cake',
      'cupcake',
      'chocolate',
      'dessert',
      'candy',
      'pastry'
    ]
  },
  {
    canonical:
      'non-alcoholic',
    aliases: [
      'non alcoholic',
      'alcohol free',
      'soft drink',
      'juice',
      'malt',
      'water',
      'mocktail'
    ]
  },
  {
    canonical:
      'spirits',
    aliases: [
      'spirit',
      'whisky',
      'cognac',
      'vodka',
      'gin',
      'rum',
      'tequila',
      'liqueur'
    ]
  },
  {
    canonical:
      'meal',
    aliases: [
      'meal',
      'food',
      'kitchen',
      'dinner',
      'lunch'
    ]
  },
  {
    canonical:
      'grocery',
    aliases: [
      'grocery',
      'rice',
      'pasta',
      'oil',
      'sauce',
      'spice'
    ]
  },
  {
    canonical:
      'snack',
    aliases: [
      'snack',
      'biscuit',
      'cookie',
      'crisps',
      'nuts'
    ]
  }
];

function unique(
  values:
    string[]
) {
  return [
    ...new Set(
      values
        .map(
          value =>
            value.trim()
        )
        .filter(
          Boolean
        )
    )
  ];
}

function escapeRegExp(
  value:
    string
) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&'
  );
}

export function normalizeMarketplaceText(
  value:
    string
) {
  return value
    .toLowerCase()
    .normalize(
      'NFD'
    )
    .replace(
      /[\u0300-\u036f]/g,
      ''
    )
    .replace(
      /&/g,
      ' and '
    )
    .replace(
      /[^a-z0-9\s-]/g,
      ' '
    )
    .replace(
      /[-_]+/g,
      ' '
    )
    .replace(
      /\s+/g,
      ' '
    )
    .trim();
}

function containsPhrase(
  value:
    string,
  phrase:
    string
) {
  const normalizedPhrase =
    normalizeMarketplaceText(
      phrase
    );

  if (
    !normalizedPhrase
  ) {
    return false;
  }

  return new RegExp(
    `(?:^|\\s)${escapeRegExp(
      normalizedPhrase
    ).replaceAll(
      '\\ ',
      '\\s+'
    )}(?:$|\\s)`,
    'i'
  ).test(
    ` ${value} `
  );
}

function levenshtein(
  left:
    string,
  right:
    string
) {
  if (
    left ===
    right
  ) {
    return 0;
  }

  if (
    !left.length
  ) {
    return right.length;
  }

  if (
    !right.length
  ) {
    return left.length;
  }

  const row =
    Array.from(
      {
        length:
          right.length +
          1
      },
      (
        _,
        index
      ) =>
        index
    );

  for (
    let leftIndex =
      1;
    leftIndex <=
    left.length;
    leftIndex +=
      1
  ) {
    let previous =
      row[0];

    row[0] =
      leftIndex;

    for (
      let rightIndex =
        1;
      rightIndex <=
      right.length;
      rightIndex +=
        1
    ) {
      const current =
        row[
          rightIndex
        ];

      row[
        rightIndex
      ] =
        Math.min(
          row[
            rightIndex
          ] +
            1,
          row[
            rightIndex -
              1
          ] +
            1,
          previous +
            (
              left[
                leftIndex -
                  1
              ] ===
              right[
                rightIndex -
                  1
              ]
                ? 0
                : 1
            )
        );

      previous =
        current;
    }
  }

  return row[
    right.length
  ];
}

function tokenWords(
  value:
    string
) {
  return normalizeMarketplaceText(
    value
  )
    .split(
      ' '
    )
    .filter(
      token =>
        token.length >
          1 &&
        !stopWords.has(
          token
        )
    );
}

function productAvailability(
  product:
    MarketplaceProductSource
) {
  return product.variants.reduce(
    (
      total,
      variant
    ) =>
      total +
      Math.max(
        0,
        (
          variant.inventory
            ?.quantity ??
          0
        ) -
          (
            variant.inventory
              ?.reserved ??
            0
          )
      ),
    0
  );
}

function availableVariant(
  product:
    MarketplaceProductSource
) {
  return (
    product.variants.find(
      variant =>
        (
          variant.inventory
            ?.quantity ??
          0
        ) -
          (
            variant.inventory
              ?.reserved ??
            0
          ) >
        0
    ) ??
    product.variants[0] ??
    null
  );
}

function productPrimaryText(
  product:
    MarketplaceProductSource
) {
  return normalizeMarketplaceText(
    [
      product.name,
      product.slug,
      product.category.label,
      product.category.slug,
      product.subcategory
        ?.label ??
        '',
      product.subcategory
        ?.slug ??
        '',
      product.brand?.name ??
        '',
      product.brand?.slug ??
        '',
      ...(
        product.tags ??
        []
      ),
      ...product.variants.map(
        variant =>
          `${variant.label} ${variant.sku ?? ''}`
      )
    ].join(
      ' '
    )
  );
}

function productDescriptionText(
  product:
    MarketplaceProductSource
) {
  return normalizeMarketplaceText(
    [
      product.shortDescription ??
        '',
      product.longDescription ??
        ''
    ].join(
      ' '
    )
  );
}

function vocabularyFromProducts(
  products:
    MarketplaceProductSource[]
) {
  const values =
    new Set<string>();

  for (
    const product of
    products
  ) {
    const identity = [
      product.category.label,
      product.category.slug,
      product.subcategory
        ?.label ??
        '',
      product.subcategory
        ?.slug ??
        '',
      product.brand?.name ??
        '',
      product.brand?.slug ??
        '',
      ...(
        product.tags ??
        []
      )
    ];

    for (
      const token of
      identity.flatMap(
        tokenWords
      )
    ) {
      if (
        token.length >=
        5
      ) {
        values.add(
          token
        );
      }
    }
  }

  return [
    ...values
  ];
}

function correctMarketplaceLanguage(
  prompt:
    string,
  products:
    MarketplaceProductSource[]
) {
  const normalized =
    normalizeMarketplaceText(
      prompt
    );

  const vocabulary =
    vocabularyFromProducts(
      products
    );

  const corrections:
    MarketplaceCorrection[] = [];

  const correctedTokens =
    normalized
      .split(
        ' '
      )
      .map(
        token => {
          const direct =
            directTokenAliases[
              token
            ];

          if (
            direct &&
            direct !==
              token
          ) {
            if (
              visibleDirectCorrections.has(
                token
              )
            ) {
              corrections.push({
                source:
                  token,
                resolved:
                  direct
              });
            }

            return direct;
          }

          if (
            token.length <
              7 ||
            stopWords.has(
              token
            ) ||
            vocabulary.includes(
              token
            )
          ) {
            return token;
          }

          const threshold =
            token.length >=
            10
              ? 2
              : 1;

          const matches =
            vocabulary
              .filter(
                candidate =>
                  candidate[0] ===
                    token[0] &&
                  Math.abs(
                    candidate.length -
                      token.length
                  ) <=
                    threshold
              )
              .map(
                candidate => ({
                  candidate,
                  distance:
                    levenshtein(
                      token,
                      candidate
                    )
                })
              )
              .filter(
                item =>
                  item.distance <=
                  threshold
              )
              .sort(
                (
                  left,
                  right
                ) =>
                  left.distance -
                    right.distance ||
                  left.candidate
                    .localeCompare(
                      right.candidate
                    )
              );

          const winner =
            matches[0];

          if (
            !winner ||
            (
              matches[1] &&
              matches[1]
                .distance ===
                winner.distance
            )
          ) {
            return token;
          }

          corrections.push({
            source:
              token,
            resolved:
              winner.candidate
          });

          return winner.candidate;
        }
      );

  return {
    correctedPrompt:
      correctedTokens.join(
        ' '
      ),
    corrections:
      corrections.filter(
        (
          correction,
          index,
          values
        ) =>
          values.findIndex(
            candidate =>
              candidate.source ===
                correction.source &&
              candidate.resolved ===
                correction.resolved
          ) ===
          index
      )
  };
}

function conceptDefinitions(
  products:
    MarketplaceProductSource[]
) {
  const byCanonical =
    new Map<
      string,
      Set<string>
    >();

  function register(
    canonical:
      string,
    aliases:
      string[]
  ) {
    const key =
      normalizeMarketplaceText(
        canonical
      );

    if (
      !key
    ) {
      return;
    }

    const values =
      byCanonical.get(
        key
      ) ??
      new Set<string>();

    values.add(
      key
    );

    for (
      const alias of
      aliases
    ) {
      const normalizedAlias =
        normalizeMarketplaceText(
          alias
        );

      if (
        normalizedAlias
      ) {
        values.add(
          normalizedAlias
        );
      }
    }

    byCanonical.set(
      key,
      values
    );
  }

  for (
    const concept of
    genericConcepts
  ) {
    register(
      concept.canonical,
      concept.aliases
    );
  }

  for (
    const product of
    products
  ) {
    register(
      product.category.label,
      [
        product.category.slug
      ]
    );

    if (
      product.subcategory
    ) {
      register(
        product.subcategory
          .label,
        [
          product.subcategory
            .slug
        ]
      );
    }

    if (
      product.brand
    ) {
      register(
        product.brand.name,
        [
          product.brand.slug
        ]
      );
    }

    for (
      const tag of
      product.tags ??
      []
    ) {
      if (
        normalizeMarketplaceText(
          tag
        ).length >=
        4
      ) {
        register(
          tag,
          [
            tag
          ]
        );
      }
    }
  }

  return [
    ...byCanonical.entries()
  ].map(
    (
      [
        canonical,
        aliases
      ]
    ) => ({
      canonical,
      aliases:
        [
          ...aliases
        ].sort(
          (
            left,
            right
          ) =>
            right.length -
            left.length
        )
    })
  );
}

function directionForAlias(
  value:
    string,
  alias:
    string
): MarketplaceDirection |
null {
  const phrase =
    escapeRegExp(
      alias
    ).replaceAll(
      '\\ ',
      '\\s+'
    );

  const checks:
    Array<{
      direction:
        MarketplaceDirection;
      pattern:
        RegExp;
    }> = [
    {
      direction:
        'EXCLUDE',
      pattern:
        new RegExp(
          `(?:\\bno\\b|\\bwithout\\b|\\bexclude\\b|\\bavoid\\b|\\bremove\\b)\\s+(?:any\\s+|the\\s+)?${phrase}(?:\\b|$)`,
          'i'
        )
    },
    {
      direction:
        'DECREASE',
      pattern:
        new RegExp(
          `(?:\\bless\\b|\\bfewer\\b|\\breduce\\b|\\bdecrease\\b|\\blimit\\b|\\bminimi[sz]e\\b|\\bcut\\s+back\\s+on\\b)\\s+(?:the\\s+)?${phrase}(?:\\b|$)`,
          'i'
        )
    },
    {
      direction:
        'PREFER',
      pattern:
        new RegExp(
          `(?:\\bmostly\\b|\\bmainly\\b|\\bprefer\\b|\\bpriority\\b|\\bprioriti[sz]e\\b|\\bfocus\\s+on\\b|\\blean\\s+into\\b)\\s+(?:the\\s+)?${phrase}(?:\\b|$)`,
          'i'
        )
    },
    {
      direction:
        'INCREASE',
      pattern:
        new RegExp(
          `(?:\\bmore\\b|\\bincrease\\b|\\badd\\b|\\bextra\\b)\\s+(?:the\\s+)?${phrase}(?:\\b|$)`,
          'i'
        )
    }
  ];

  return checks.find(
    check =>
      check.pattern.test(
        value
      )
  )?.direction ??
    null;
}

function directionsFromSource(
  source:
    string,
  concepts:
    ConceptDefinition[]
) {
  const resolved:
    MarketplaceConceptDirection[] =
    [];

  for (
    const concept of
    concepts
  ) {
    for (
      const alias of
      concept.aliases
    ) {
      if (
        !containsPhrase(
          source,
          alias
        )
      ) {
        continue;
      }

      const direction =
        directionForAlias(
          source,
          alias
        );

      if (
        direction
      ) {
        resolved.push({
          concept:
            concept.canonical,
          direction,
          source:
            alias
        });

        break;
      }
    }
  }

  return resolved;
}

function resolveConceptDirections(
  latest:
    string,
  journey:
    string,
  concepts:
    ConceptDefinition[]
) {
  const journeyDirections =
    directionsFromSource(
      journey,
      concepts
    );

  const latestDirections =
    directionsFromSource(
      latest,
      concepts
    );

  return [
    ...new Map(
      [
        ...journeyDirections,
        ...latestDirections
      ].map(
        item => [
          item.concept,
          item
        ]
      )
    ).values()
  ];
}

function requestedConcepts(
  latest:
    string,
  concepts:
    ConceptDefinition[],
  directions:
    MarketplaceConceptDirection[]
) {
  const values =
    directions.map(
      direction =>
        direction.concept
    );

  for (
    const concept of
    concepts
  ) {
    if (
      concept.aliases.some(
        alias =>
          containsPhrase(
            latest,
            alias
          )
      )
    ) {
      values.push(
        concept.canonical
      );
    }
  }

  return unique(
    values
  );
}

function productMatchesConcept(
  product:
    MarketplaceProductSource,
  concept:
    ConceptDefinition
) {
  const primary =
    productPrimaryText(
      product
    );

  return concept.aliases.some(
    alias =>
      containsPhrase(
        primary,
        alias
      )
  );
}

function exactProductRequested(
  product:
    MarketplaceProductSource,
  latest:
    string
) {
  const name =
    normalizeMarketplaceText(
      product.name
    );

  const slug =
    normalizeMarketplaceText(
      product.slug
    );

  if (
    containsPhrase(
      latest,
      name
    ) ||
    containsPhrase(
      latest,
      slug
    )
  ) {
    return true;
  }

  const nameTokens =
    tokenWords(
      name
    );

  if (
    nameTokens.length <
    2
  ) {
    return false;
  }

  const latestTokens =
    tokenWords(
      latest
    );

  const matched =
    nameTokens.filter(
      token =>
        latestTokens.some(
          candidate =>
            candidate ===
              token ||
            (
              token.length >=
                5 &&
              candidate.length >=
                5 &&
              levenshtein(
                token,
                candidate
              ) <=
                1
            )
        )
    ).length;

  return matched >=
    Math.max(
      2,
      Math.ceil(
        nameTokens.length *
          0.8
      )
    );
}

function fieldOverlap(
  sourceTokens:
    string[],
  field:
    string,
  weight:
    number
) {
  const fieldTokens =
    tokenWords(
      field
    );

  return sourceTokens.reduce(
    (
      score,
      token
    ) =>
      score +
      (
        fieldTokens.includes(
          token
        )
          ? weight
          : fieldTokens.some(
              candidate =>
                token.length >=
                  5 &&
                candidate.length >=
                  5 &&
                levenshtein(
                  token,
                  candidate
                ) <=
                  1
            )
            ? Math.round(
                weight *
                  0.6
              )
            : 0
      ),
    0
  );
}

function productSignal(
  product:
    MarketplaceProductSource,
  latest:
    string,
  concepts:
    ConceptDefinition[],
  requested:
    string[],
  directions:
    MarketplaceConceptDirection[]
): MarketplaceProductSignal {
  const sourceTokens =
    tokenWords(
      latest
    );

  const exactRequested =
    exactProductRequested(
      product,
      latest
    );

  const matchedFields:
    string[] = [];

  let score =
    exactRequested
      ? 240
      : 0;

  const weightedFields = [
    {
      label:
        'title',
      value:
        `${product.name} ${product.slug}`,
      weight:
        24
    },
    {
      label:
        'category',
      value:
        `${product.category.label} ${product.category.slug}`,
      weight:
        20
    },
    {
      label:
        'subcategory',
      value:
        `${product.subcategory?.label ?? ''} ${product.subcategory?.slug ?? ''}`,
      weight:
        18
    },
    {
      label:
        'brand',
      value:
        `${product.brand?.name ?? ''} ${product.brand?.slug ?? ''}`,
      weight:
        16
    },
    {
      label:
        'tags',
      value:
        (
          product.tags ??
          []
        ).join(
          ' '
        ),
      weight:
        14
    },
    {
      label:
        'variant',
      value:
        product.variants
          .map(
            variant =>
              `${variant.label} ${variant.sku ?? ''}`
          )
          .join(
            ' '
          ),
      weight:
        10
    },
    {
      label:
        'description',
      value:
        productDescriptionText(
          product
        ),
      weight:
        4
    }
  ];

  for (
    const field of
    weightedFields
  ) {
    const fieldScore =
      fieldOverlap(
        sourceTokens,
        field.value,
        field.weight
      );

    if (
      fieldScore >
      0
    ) {
      score +=
        fieldScore;

      matchedFields.push(
        field.label
      );
    }
  }

  const matchedConcepts =
    concepts
      .filter(
        concept =>
          requested.includes(
            concept.canonical
          ) &&
          productMatchesConcept(
            product,
            concept
          )
      )
      .map(
        concept =>
          concept.canonical
      );

  score +=
    matchedConcepts.length *
      50;

  let preferred =
    false;

  let deprioritized =
    false;

  let excluded =
    false;

  for (
    const direction of
    directions
  ) {
    if (
      !matchedConcepts.includes(
        direction.concept
      )
    ) {
      continue;
    }

    if (
      direction.direction ===
      'EXCLUDE'
    ) {
      excluded =
        true;
      score -=
        1_000;
    }

    if (
      direction.direction ===
      'DECREASE'
    ) {
      deprioritized =
        true;
      score -=
        140;
    }

    if (
      direction.direction ===
      'PREFER'
    ) {
      preferred =
        true;
      score +=
        180;
    }

    if (
      direction.direction ===
      'INCREASE'
    ) {
      preferred =
        true;
      score +=
        145;
    }
  }

  const available =
    productAvailability(
      product
    );

  const matchType:
    MarketplaceMatchType =
    exactRequested
      ? available >
        0
        ? 'EXACT_MATCH'
        : 'UNAVAILABLE'
      : score >=
          60
        ? 'CONTEXTUAL_MATCH'
        : 'NONE';

  return {
    productId:
      product.id,
    score,
    matchType,
    matchedFields:
      unique(
        matchedFields
      ),
    matchedConcepts:
      unique(
        matchedConcepts
      ),
    preferred,
    deprioritized,
    excluded,
    exactRequested,
    alternativeFor:
      null,
    reason:
      null
  };
}

function alternativeSimilarity(
  requested:
    MarketplaceProductSource,
  candidate:
    MarketplaceProductSource
) {
  let score =
    0;

  if (
    requested.category.id ===
    candidate.category.id
  ) {
    score +=
      100;
  }

  if (
    requested.subcategory?.id &&
    requested.subcategory.id ===
      candidate.subcategory?.id
  ) {
    score +=
      80;
  }

  if (
    requested.brand?.id &&
    requested.brand.id ===
      candidate.brand?.id
  ) {
    score +=
      35;
  }

  const requestedTags =
    new Set(
      (
        requested.tags ??
        []
      ).map(
        normalizeMarketplaceText
      )
    );

  score +=
    (
      candidate.tags ??
      []
    ).filter(
      tag =>
        requestedTags.has(
          normalizeMarketplaceText(
            tag
          )
        )
    ).length *
      12;

  const requestedPrice =
    Number(
      availableVariant(
        requested
      )?.price ??
        0
    );

  const candidatePrice =
    Number(
      availableVariant(
        candidate
      )?.price ??
        0
    );

  if (
    requestedPrice >
      0 &&
    candidatePrice >
      0
  ) {
    score -=
      Math.min(
        40,
        Math.abs(
          candidatePrice -
            requestedPrice
        ) /
          Math.max(
            requestedPrice,
            1
          ) *
          40
      );
  }

  return score;
}

function attachAlternatives(
  products:
    MarketplaceProductSource[],
  signals:
    MarketplaceProductSignal[]
) {
  const unavailable:
    MarketplaceUnavailableRequest[] =
    [];

  const signalById =
    new Map(
      signals.map(
        signal => [
          signal.productId,
          signal
        ]
      )
    );

  for (
    const requestedProduct of
    products.filter(
      product =>
        signalById.get(
          product.id
        )?.matchType ===
        'UNAVAILABLE'
    )
  ) {
    const alternatives =
      products
        .filter(
          candidate =>
            candidate.id !==
              requestedProduct.id &&
            productAvailability(
              candidate
            ) >
              0 &&
            candidate.category.id ===
              requestedProduct.category.id
        )
        .map(
          candidate => ({
            candidate,
            score:
              alternativeSimilarity(
                requestedProduct,
                candidate
              )
          })
        )
        .sort(
          (
            left,
            right
          ) =>
            right.score -
            left.score
        )
        .slice(
          0,
          3
        );

    for (
      const alternative of
      alternatives
    ) {
      const signal =
        signalById.get(
          alternative.candidate
            .id
        );

      if (
        !signal
      ) {
        continue;
      }

      signal.score +=
        120;
      signal.matchType =
        'ALTERNATIVE_FOUND';
      signal.alternativeFor =
        requestedProduct.name;
      signal.reason =
        `Available alternative to ${requestedProduct.name} from the same marketplace category.`;
    }

    unavailable.push({
      requested:
        requestedProduct.name,
      exactProduct:
        requestedProduct.name,
      alternatives:
        alternatives.map(
          item =>
            item.candidate.name
        )
    });
  }

  return unavailable;
}

function unavailableConcepts(
  products:
    MarketplaceProductSource[],
  concepts:
    ConceptDefinition[],
  requested:
    string[],
  signals:
    MarketplaceProductSignal[]
) {
  const signalById =
    new Map(
      signals.map(
        signal => [
          signal.productId,
          signal
        ]
      )
    );

  const unavailable:
    MarketplaceUnavailableRequest[] =
    [];

  for (
    const requestedConcept of
    requested
  ) {
    const concept =
      concepts.find(
        item =>
          item.canonical ===
          requestedConcept
      );

    if (
      !concept
    ) {
      continue;
    }

    const matches =
      products.filter(
        product =>
          productMatchesConcept(
            product,
            concept
          )
      );

    if (
      !matches.length ||
      matches.some(
        product =>
          productAvailability(
            product
          ) >
          0
      )
    ) {
      continue;
    }

    if (
      matches.some(
        product =>
          signalById.get(
            product.id
          )?.exactRequested
      )
    ) {
      continue;
    }

    unavailable.push({
      requested:
        requestedConcept,
      exactProduct:
        null,
      alternatives:
        []
    });
  }

  return unavailable;
}

function directionLabel(
  direction:
    MarketplaceDirection
) {
  if (
    direction ===
    'INCREASE'
  ) {
    return 'more';
  }

  if (
    direction ===
    'PREFER'
  ) {
    return 'prioritise';
  }

  if (
    direction ===
    'DECREASE'
  ) {
    return 'fewer';
  }

  return 'exclude';
}

export function resolveMarketplaceRequest(
  input: {
    prompt:
      string;
    journeyText:
      string;
    products:
      MarketplaceProductSource[];
    budget?:
      number |
      null;
  }
): MarketplaceRequestResolution {
  const latestCorrection =
    correctMarketplaceLanguage(
      input.prompt,
      input.products
    );

  const journeyCorrection =
    correctMarketplaceLanguage(
      input.journeyText,
      input.products
    );

  const concepts =
    conceptDefinitions(
      input.products
    );

  const directions =
    resolveConceptDirections(
      latestCorrection
        .correctedPrompt,
      journeyCorrection
        .correctedPrompt,
      concepts
    );

  const requested =
    requestedConcepts(
      latestCorrection
        .correctedPrompt,
      concepts,
      directions
    );

  const signals =
    input.products.map(
      product =>
        productSignal(
          product,
          latestCorrection
            .correctedPrompt,
          concepts,
          requested,
          directions
        )
    );

  const exactUnavailable =
    attachAlternatives(
      input.products,
      signals
    );

  const conceptUnavailable =
    unavailableConcepts(
      input.products,
      concepts,
      requested,
      signals
    );

  const corrections =
    [
      ...latestCorrection
        .corrections,
      ...journeyCorrection
        .corrections
    ].filter(
      (
        correction,
        index,
        values
      ) =>
        values.findIndex(
          candidate =>
            candidate.source ===
              correction.source &&
            candidate.resolved ===
              correction.resolved
        ) ===
        index
    );

  const assumptions:
    string[] = [];

  for (
    const correction of
    corrections
  ) {
    assumptions.push(
      `I interpreted “${correction.source}” as “${correction.resolved}” from the marketplace vocabulary.`
    );
  }

  for (
    const direction of
    directions
  ) {
    if (
      direction.direction ===
      'INCREASE' ||
      direction.direction ===
      'PREFER'
    ) {
      assumptions.push(
        `I treated “${directionLabel(
          direction.direction
        )} ${direction.concept}” as a request to increase its share of the selected products, not the quantity of every item.`
      );
    }

    if (
      direction.direction ===
      'DECREASE'
    ) {
      assumptions.push(
        `I treated “fewer ${direction.concept}” as reducing its share, not excluding it completely.`
      );
    }
  }

  const reconciliations:
    string[] = [];

  for (
    const item of
    exactUnavailable
  ) {
    reconciliations.push(
      item.alternatives.length
        ? `${item.requested} is not currently available. I considered ${item.alternatives.join(
            ', '
          )} as ${item.alternatives.length === 1 ? 'a clearly labelled alternative' : 'clearly labelled alternatives'}.`
        : `${item.requested} is not currently available and I did not find a responsible same-category alternative.`
    );
  }

  if (
    input.budget
  ) {
    reconciliations.push(
      `Marketplace matches still have to fit the active ${new Intl.NumberFormat(
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
        input.budget
      )} budget, so a strong text match may be omitted when its current variant price is too high.`
    );
  }

  const unavailable = [
    ...exactUnavailable,
    ...conceptUnavailable
  ];

  const warnings =
    unavailable
      .filter(
        item =>
          !item.alternatives
            .length
      )
      .map(
        item =>
          `I could not find a currently available marketplace match for ${item.requested}.`
      );

  return {
    originalPrompt:
      input.prompt,
    correctedPrompt:
      latestCorrection
        .correctedPrompt,
    corrections,
    directions,
    requestedConcepts:
      requested,
    productSignals:
      signals,
    unavailable,
    assumptions:
      unique(
        assumptions
      ),
    reconciliations:
      unique(
        reconciliations
      ),
    warnings:
      unique(
        warnings
      )
  };
}

export function marketplaceProductSignal(
  resolution:
    MarketplaceRequestResolution,
  productId:
    string
): MarketplaceProductSignal {
  return (
    resolution.productSignals.find(
      signal =>
        signal.productId ===
        productId
    ) ?? {
      productId,
      score:
        0,
      matchType:
        'NONE',
      matchedFields: [],
      matchedConcepts: [],
      preferred:
        false,
      deprioritized:
        false,
      excluded:
        false,
      exactRequested:
        false,
      alternativeFor:
        null,
      reason:
        null
    }
  );
}

export function marketplaceReason(
  signal:
    MarketplaceProductSignal,
  fallback:
    string
) {
  if (
    signal.reason
  ) {
    return signal.reason;
  }

  if (
    signal.matchType ===
    'EXACT_MATCH'
  ) {
    return 'Exact marketplace title match with a currently available variant.';
  }

  if (
    signal.preferred &&
    signal.matchedConcepts.length
  ) {
    return `Prioritised because the latest Journey direction asks for more ${signal.matchedConcepts.join(
      ' and '
    )}.`;
  }

  if (
    signal.deprioritized &&
    signal.matchedConcepts.length
  ) {
    return `Retained sparingly because the Journey asks for fewer ${signal.matchedConcepts.join(
      ' and '
    )}.`;
  }

  if (
    signal.matchType ===
    'CONTEXTUAL_MATCH' &&
    signal.matchedFields.length
  ) {
    return `Matched through ${signal.matchedFields.join(
      ', '
    )} together with the active Journey constraints.`;
  }

  return fallback;
}

export function marketplaceAcknowledgement(
  resolution:
    MarketplaceRequestResolution
) {
  const parts:
    string[] = [];

  if (
    resolution.corrections.length
  ) {
    parts.push(
      resolution.corrections
        .slice(
          0,
          2
        )
        .map(
          correction =>
            `“${correction.source}” as “${correction.resolved}”`
        )
        .join(
          ' and '
        )
    );
  }

  if (
    resolution.directions.length
  ) {
    parts.push(
      resolution.directions
        .slice(
          0,
          3
        )
        .map(
          direction =>
            `${directionLabel(
              direction.direction
            )} ${direction.concept}`
        )
        .join(
          ', '
        )
    );
  }

  if (
    !parts.length
  ) {
    return '';
  }

  return `I understood ${parts.join(
    '; '
  )}.`;
}

export function marketplaceResolutionSections(
  resolution:
    MarketplaceRequestResolution
): AIAssistantSection[] {
  const sections:
    AIAssistantSection[] =
    [];

  const understood = [
    ...resolution.assumptions,
    ...resolution.directions.map(
      direction =>
        `Latest direction: ${directionLabel(
          direction.direction
        )} ${direction.concept}.`
    )
  ];

  if (
    understood.length
  ) {
    sections.push({
      title:
        'What I understood from your wording',
      bullets:
        unique(
          understood
        ).slice(
          0,
          6
        )
    });
  }

  const availability = [
    ...resolution.reconciliations,
    ...resolution.unavailable
      .filter(
        item =>
          !resolution.reconciliations.some(
            note =>
              note.includes(
                item.requested
              )
          )
      )
      .map(
        item =>
          item.alternatives.length
            ? `${item.requested}: exact availability was not found; alternatives considered were ${item.alternatives.join(
                ', '
              )}.`
            : `${item.requested}: no currently available responsible match was found.`
      )
  ];

  if (
    availability.length
  ) {
    sections.push({
      title:
        'Availability and reconciliation',
      bullets:
        unique(
          availability
        ).slice(
          0,
          6
        )
    });
  }

  return sections;
}

type ParsedUnit = {
  dimension:
    'volume' |
    'mass' |
    'count';
  quantity:
    number;
  label:
    string;
};

function parsedUnit(
  label:
    string
): ParsedUnit |
null {
  const normalized =
    normalizeMarketplaceText(
      label
    );

  const multipack =
    normalized.match(
      /(\d+)\s*x\s*(\d+(?:\.\d+)?)\s*(ml|cl|l|g|kg)\b/
    );

  if (
    multipack
  ) {
    const count =
      Number(
        multipack[1]
      );

    const amount =
      Number(
        multipack[2]
      );

    const unit =
      multipack[3];

    const base =
      unit ===
      'l'
        ? amount *
          1_000
        : unit ===
            'cl'
          ? amount *
            10
          : unit ===
              'kg'
            ? amount *
              1_000
            : amount;

    return {
      dimension:
        [
          'ml',
          'cl',
          'l'
        ].includes(
          unit
        )
          ? 'volume'
          : 'mass',
      quantity:
        count *
        base,
      label:
        unit
    };
  }

  const single =
    normalized.match(
      /(\d+(?:\.\d+)?)\s*(ml|cl|l|g|kg|pcs?|pieces?|pack)\b/
    );

  if (
    !single
  ) {
    return null;
  }

  const amount =
    Number(
      single[1]
    );

  const unit =
    single[2];

  if (
    [
      'pc',
      'pcs',
      'piece',
      'pieces',
      'pack'
    ].includes(
      unit
    )
  ) {
    return {
      dimension:
        'count',
      quantity:
        amount,
      label:
        'item'
    };
  }

  return {
    dimension:
      [
        'ml',
        'cl',
        'l'
      ].includes(
        unit
      )
        ? 'volume'
        : 'mass',
    quantity:
      unit ===
      'l'
        ? amount *
          1_000
        : unit ===
            'cl'
          ? amount *
            10
          : unit ===
              'kg'
            ? amount *
              1_000
            : amount,
    label:
      unit
  };
}

function currency(
  value:
    number
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

export function marketplacePriceComparison(
  products:
    MarketplaceProductSource[]
) {
  const priced =
    products
      .map(
        product => {
          const variant =
            availableVariant(
              product
            );

          const price =
            Number(
              variant?.price ??
              0
            );

          return {
            product,
            variant,
            price,
            unit:
              parsedUnit(
                variant?.label ??
                product.name
              )
          };
        }
      )
      .filter(
        item =>
          item.price >
          0
      )
      .sort(
        (
          left,
          right
        ) =>
          left.price -
          right.price
      );

  if (
    !priced.length
  ) {
    return [
      'Current variant prices were not available for a responsible comparison.'
    ];
  }

  const bullets = [
    `${priced[0].product.name} has the lowest immediate checkout price at ${currency(
      priced[0].price
    )}.`
  ];

  const comparableGroups =
    new Map<
      string,
      typeof priced
    >();

  for (
    const item of
    priced
  ) {
    if (
      !item.unit
    ) {
      continue;
    }

    const current =
      comparableGroups.get(
        item.unit.dimension
      ) ??
      [];

    current.push(
      item
    );

    comparableGroups.set(
      item.unit.dimension,
      current
    );
  }

  const comparable =
    [
      ...comparableGroups.values()
    ].find(
      group =>
        group.length >=
        2
    );

  if (
    comparable
  ) {
    const bestValue =
      comparable
        .map(
          item => ({
            ...item,
            unitPrice:
              item.price /
              Math.max(
                item.unit
                  ?.quantity ??
                  1,
                1
              )
          })
        )
        .sort(
          (
            left,
            right
          ) =>
            left.unitPrice -
            right.unitPrice
        )[0];

    const unitLabel =
      bestValue.unit
        ?.dimension ===
        'volume'
          ? 'litre'
          : bestValue.unit
                ?.dimension ===
              'mass'
            ? 'kilogram'
            : 'item';

    const multiplier =
      bestValue.unit
        ?.dimension ===
        'count'
          ? 1
          : 1_000;

    bullets.push(
      `${bestValue.product.name} offers the lowest comparable unit cost at about ${currency(
        bestValue.unitPrice *
          multiplier
      )} per ${unitLabel}; this can differ from the lowest checkout price.`
    );
  } else if (
    priced.length >=
    2
  ) {
    bullets.push(
      'The visible variants do not expose directly comparable pack sizes, so AJ is comparing checkout prices without claiming a unit-value winner.'
    );
  }

  for (
    const item of
    priced
      .slice(
        1,
        3
      )
  ) {
    bullets.push(
      `${item.product.name} costs ${currency(
        item.price -
          priced[0].price
      )} more than ${priced[0].product.name}; it remains useful only when its category, style, availability or pack size better fits the Journey.`
    );
  }

  return unique(
    bullets
  );
}
