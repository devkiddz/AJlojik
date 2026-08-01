import 'server-only';

import type {
  Prisma
} from '@/lib/generated/prisma/client';

import {
  prisma
} from '@/lib/prisma';

import type {
  AIAssistantAction,
  AIAssistantDraftField,
  AIAssistantMetric,
  AIAssistantOutputType,
  AIAssistantProduct,
  AIAssistantRecognizedProductDraft,
  AIAssistantResponsePayload,
  AIAssistantRuntimeContext,
  AIAssistantSection
} from '../contracts';

import type {
  AssistantAccess
} from './assistantAccess';

import {
  resolveCollaborativeIntentResponse
} from './collaborativeIntentBuilder';

const productInclude = {
  category: {
    select: {
      id: true,
      slug: true,
      label: true
    }
  },
  brand: {
    select: {
      id: true,
      slug: true,
      name: true
    }
  },
  images: {
    orderBy: [
      {
        primary: 'desc'
      },
      {
        position: 'asc'
      }
    ],
    take: 3
  },
  variants: {
    where: {
      active: true
    },
    orderBy: {
      position: 'asc'
    },
    include: {
      inventory: true
    },
    take: 8
  }
} satisfies Prisma.ProductInclude;

type ProductRecord =
  Prisma.ProductGetPayload<{
    include: typeof productInclude;
  }>;

type EngineInput = {
  access: AssistantAccess;
  prompt: string;
  context:
    AIAssistantRuntimeContext;
  conversation?:
    string[];
};

function normalize(
  value: string
) {
  return value
    .toLowerCase()
    .replace(
      /[^a-z0-9\s-]/g,
      ' '
    )
    .replace(
      /\s+/g,
      ' '
    )
    .trim();
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


function slugValue(
  value:
    string
) {
  return normalize(
    value
  )
    .replace(
      /\s+/g,
      '-'
    )
    .replace(
      /(^-|-$)/g,
      ''
    );
}

function readableName(
  value:
    string
) {
  const clean =
    value
      .replace(
        /^[\s"'`:-]+|[\s"'`.,;:-]+$/g,
        ''
      )
      .replace(
        /\s+/g,
        ' '
      )
      .trim();

  if (
    !clean
  ) {
    return '';
  }

  const hasUppercase =
    /[A-Z]/.test(
      clean
    );

  if (
    hasUppercase
  ) {
    return clean;
  }

  return clean.replace(
    /\b[a-z]/g,
    character =>
      character.toUpperCase()
  );
}

function isProductCreationPrompt(
  value:
    string
) {
  return includesAny(
    value,
    [
      'create product',
      'create a product',
      'create new product',
      'create a new product',
      'add product',
      'add a product',
      'add new product',
      'register product',
      'list product',
      'product draft',
      'new product called',
      'new product named'
    ]
  );
}

function extractProductName(
  prompt:
    string
) {
  const quoted =
    prompt.match(
      /["'`](.{2,120}?)["'`]/
    )?.[1];

  if (
    quoted
  ) {
    return readableName(
      quoted
    );
  }

  const patterns = [
    /(?:create|add|register|prepare|make|set up|list)\s+(?:a|an)?\s*(?:new\s+)?product(?:\s+draft)?(?:\s+(?:called|named))?\s*[:\-]?\s*(.+)$/i,
    /(?:new\s+)?product\s+(?:called|named)\s+(.+)$/i,
    /add\s+(.+?)\s+as\s+(?:a\s+)?(?:new\s+)?product/i
  ];

  const matched =
    patterns
      .map(
        pattern =>
          prompt.match(
            pattern
          )?.[1] ??
          ''
      )
      .find(
        Boolean
      ) ??
    '';

  if (
    !matched
  ) {
    return '';
  }

  const name =
    matched.split(
      /\s+(?:(?:under|inside|within)\s+(?:the\s+)?(?:(?:category|subcategory)\s+)?|in\s+(?:the\s+)?(?:category|subcategory)\s+|category\s*[:\-]|subcategory\s*[:\-]|brand\s*[:\-]|priced\s+(?:at\s+)?|price\s*[:\-]|costing\s+|with\s+(?:a\s+)?price\b|with\s+stock\b|stock\s*[:\-]|quantity\s*[:\-])/i
    )[0] ??
    matched;

  return readableName(
    name
  ).slice(
    0,
    160
  );
}

function promptTokens(
  value:
    string
) {
  return new Set(
    normalize(
      value
    )
      .split(
        ' '
      )
      .filter(
        token =>
          token.length >
          2
      )
  );
}

function overlapScore(
  source:
    Set<string>,
  candidate:
    string
) {
  return normalize(
    candidate
  )
    .split(
      ' '
    )
    .filter(
      token =>
        source.has(
          token
        )
    ).length;
}

type ProductDraftCategory = {
  id:
    string;
  slug:
    string;
  label:
    string;
  subcategories:
    Array<{
      id:
        string;
      slug:
        string;
      label:
        string;
    }>;
};

type ProductDraftBrand = {
  id:
    string;
  slug:
    string;
  name:
    string;
};

function categoryAliasScore(
  prompt:
    string,
  category:
    ProductDraftCategory
) {
  const categoryIdentity =
    normalize(
      `${category.slug} ${category.label}`
    );

  const groups = [
    {
      promptTerms: [
        'wine',
        'champagne',
        'whisky',
        'whiskey',
        'vodka',
        'gin',
        'beer',
        'spirit',
        'liqueur',
        'drink'
      ],
      categoryTerms: [
        'wine',
        'liq',
        'drink',
        'beverage',
        'spirit',
        'alcohol'
      ]
    },
    {
      promptTerms: [
        'cake',
        'chocolate',
        'candy',
        'sweet',
        'biscuit',
        'cookie',
        'confectionery',
        'dessert'
      ],
      categoryTerms: [
        'sweet',
        'confection',
        'dessert',
        'bakery',
        'kitchen',
        'food'
      ]
    },
    {
      promptTerms: [
        'rice',
        'pasta',
        'oil',
        'food',
        'meal',
        'grocery',
        'kitchen',
        'sauce',
        'spice'
      ],
      categoryTerms: [
        'food',
        'kitchen',
        'grocery',
        'meal'
      ]
    },
    {
      promptTerms: [
        'party',
        'event',
        'celebration',
        'gift',
        'hamper'
      ],
      categoryTerms: [
        'party',
        'event',
        'gift',
        'plan'
      ]
    }
  ];

  return groups.reduce(
    (
      score,
      group
    ) => {
      const promptMatch =
        group.promptTerms.some(
          term =>
            prompt.includes(
              term
            )
        );

      const categoryMatch =
        group.categoryTerms.some(
          term =>
            categoryIdentity.includes(
              term
            )
        );

      return score +
        (
          promptMatch &&
          categoryMatch
            ? 30
            : 0
        );
    },
    0
  );
}

function matchProductCategory(
  prompt:
    string,
  name:
    string,
  categories:
    ProductDraftCategory[]
) {
  const normalizedPrompt =
    normalize(
      prompt
    );

  const tokens =
    promptTokens(
      `${prompt} ${name}`
    );

  const candidates =
    categories
      .filter(
        category =>
          ![
            'all',
            'featured',
            'deals'
          ].includes(
            category.slug
          )
      )
      .map(
        category => {
          const categoryLabel =
            normalize(
              category.label
            );

          const categorySlug =
            normalize(
              category.slug
            );

          const exactCategory =
            normalizedPrompt.includes(
              categoryLabel
            ) ||
            normalizedPrompt.includes(
              categorySlug
            );

          const matchedSubcategory =
            category.subcategories
              .map(
                subcategory => ({
                  subcategory,
                  score:
                    (
                      normalizedPrompt.includes(
                        normalize(
                          subcategory.label
                        )
                      ) ||
                      normalizedPrompt.includes(
                        normalize(
                          subcategory.slug
                        )
                      )
                        ? 80
                        : 0
                    ) +
                    overlapScore(
                      tokens,
                      `${subcategory.label} ${subcategory.slug}`
                    ) *
                      8
                })
              )
              .sort(
                (
                  left,
                  right
                ) =>
                  right.score -
                  left.score
              )[0] ??
            null;

          const score =
            (
              exactCategory
                ? 100
                : 0
            ) +
            overlapScore(
              tokens,
              `${category.label} ${category.slug}`
            ) *
              12 +
            categoryAliasScore(
              normalizedPrompt,
              category
            ) +
            (
              matchedSubcategory
                ?.score ??
              0
            );

          return {
            category,
            subcategory:
              matchedSubcategory &&
              matchedSubcategory.score >
                0
                ? matchedSubcategory.subcategory
                : null,
            score,
            exactCategory
          };
        }
      )
      .sort(
        (
          left,
          right
        ) =>
          right.score -
          left.score
      );

  const winner =
    candidates[0] ??
    null;

  if (
    !winner ||
    winner.score <
      20
  ) {
    return null;
  }

  return winner;
}

function matchProductBrand(
  prompt:
    string,
  name:
    string,
  brands:
    ProductDraftBrand[]
) {
  const source =
    normalize(
      `${prompt} ${name}`
    );

  return brands
    .map(
      brand => {
        const identity =
          normalize(
            `${brand.name} ${brand.slug}`
          );

        return {
          brand,
          score:
            (
              source.includes(
                normalize(
                  brand.name
                )
              )
                ? 100
                : 0
            ) +
            overlapScore(
              promptTokens(
                source
              ),
              identity
            ) *
              10
        };
      }
    )
    .filter(
      item =>
        item.score >
        0
    )
    .sort(
      (
        left,
        right
      ) =>
        right.score -
        left.score
    )[0]?.brand ??
    null;
}

function estimatedDeliveryFromPrompt(
  prompt:
    string
) {
  return prompt.match(
    /(\d+\s*(?:-|–|to)\s*\d+\s*(?:business\s+)?days?)/i
  )?.[1] ??
    null;
}

async function recognizeProductDraft(
  prompt:
    string
): Promise<{
  draft:
    AIAssistantRecognizedProductDraft |
    null;
  missing:
    string[];
}> {
  const [
    categories,
    brands
  ] =
    await Promise.all([
      prisma.category.findMany({
        where: {
          active:
            true
        },
        orderBy: {
          position:
            'asc'
        },
        select: {
          id:
            true,
          slug:
            true,
          label:
            true,
          subcategories: {
            where: {
              active:
                true
            },
            orderBy: {
              position:
                'asc'
            },
            select: {
              id:
                true,
              slug:
                true,
              label:
                true
            }
          }
        }
      }),
      prisma.brand.findMany({
        where: {
          active:
            true
        },
        orderBy: {
          name:
            'asc'
        },
        select: {
          id:
            true,
          slug:
            true,
          name:
            true
        }
      })
    ]);

  const name =
    extractProductName(
      prompt
    );

  const categoryMatch =
    name
      ? matchProductCategory(
          prompt,
          name,
          categories
        )
      : null;

  const missing:
    string[] = [];

  if (!name) {
    missing.push(
      'product name'
    );
  }

  if (!categoryMatch) {
    missing.push(
      'matching category'
    );
  }

  if (
    !name ||
    !categoryMatch
  ) {
    return {
      draft:
        null,
      missing
    };
  }

  const brand =
    matchProductBrand(
      prompt,
      name,
      brands
    );

  const category =
    categoryMatch.category;

  const subcategory =
    categoryMatch.subcategory;

  const tokens =
    [
      ...new Set(
        [
          ...normalize(
            name
          )
            .split(
              ' '
            )
            .filter(
              token =>
                token.length >
                2
            ),
          category.slug,
          subcategory?.slug ??
            null,
          brand?.slug ??
            null
        ].filter(
          (
            value
          ): value is string =>
            Boolean(
              value
            )
        )
      )
    ].slice(
      0,
      14
    );

  const assumptions = [
    `Matched category: ${category.label}.`,
    subcategory
      ? `Matched subcategory: ${subcategory.label}.`
      : 'No subcategory was confidently identified.',
    brand
      ? `Matched brand: ${brand.name}.`
      : 'No existing brand was confidently identified.',
    'The Product will be created as an inactive Draft with no price, stock, variant or media until Product Studio is completed.'
  ];

  const confidence =
    Math.min(
      0.96,
      0.58 +
      (
        categoryMatch.exactCategory
          ? 0.2
          : 0.08
      ) +
      (
        brand
          ? 0.08
          : 0
      ) +
      (
        subcategory
          ? 0.06
          : 0
      )
    );

  return {
    missing,
    draft: {
      name,
      slug:
        slugValue(
          name
        ),
      categoryId:
        category.id,
      categoryLabel:
        category.label,
      subcategoryId:
        subcategory?.id ??
        null,
      subcategoryLabel:
        subcategory?.label ??
        null,
      brandId:
        brand?.id ??
        null,
      brandName:
        brand?.name ??
        null,
      shortDescription:
        `${name} is a ${category.label.toLowerCase()} selection prepared as an AJ Logik Product Studio draft.`,
      longDescription:
        `${name} has been recognised as a ${category.label.toLowerCase()} product${brand ? ` from ${brand.name}` : ''}. Complete its media, variants, price, stock and final customer-facing description in Product Studio before submission or publication.`,
      estimatedDelivery:
        estimatedDeliveryFromPrompt(
          prompt
        ),
      tags:
        tokens,
      recognitionConfidence:
        confidence,
      assumptions
    }
  };
}

async function productCreationResponse({
  access,
  prompt
}: EngineInput) {
  const {
    draft,
    missing
  } =
    await recognizeProductDraft(
      prompt
    );

  const productStudioHref =
    access.audience ===
    'admin'
      ? '/admin/products/new'
      : '/vendor/products/new';

  if (!draft) {
    return response({
      headline:
        'Tell me a little more about the Product',
      summary:
        `I recognised that you want to create a Product, but I still need ${missing.join(' and ')} before I can prepare a safe draft.`,
      outputType:
        'CATALOG_DRAFT',
      confidence:
        0.42,
      sections: [
        {
          title:
            'Use a clear request',
          bullets: [
            'Include the exact Product name.',
            'Mention an existing category or subcategory.',
            'Mention the brand when it already exists in AJ Logik.',
            'Price, stock, variants and media can be completed later in Product Studio.'
          ]
        }
      ],
      warnings: [
        'No Product record has been created.'
      ],
      suggestedPrompts: [
        'Create a new product called Moët Nectar Impérial under Wines',
        'Add Golden Penny Spaghetti as a product in Kitchen',
        'Create a product draft called Celebration Chocolate Box in Confectionery'
      ],
      actions: [
        {
          label:
            'Open Product Studio',
          href:
            productStudioHref,
          kind:
            'primary'
        }
      ]
    });
  }

  return response({
    headline:
      `Product draft ready: ${draft.name}`,
    summary:
      `I matched this Product to ${draft.categoryLabel}${draft.brandName ? ` and ${draft.brandName}` : ''}. Review the recognised details below before creating the inactive Product Studio draft.`,
    outputType:
      'CATALOG_DRAFT',
    confidence:
      draft.recognitionConfidence,
    productDraft:
      draft,
    metrics: [
      {
        label:
          'Category',
        value:
          draft.categoryLabel
      },
      {
        label:
          'Brand',
        value:
          draft.brandName ??
          'Not matched'
      },
      {
        label:
          'Status',
        value:
          'Draft'
      }
    ],
    draftFields: [
      {
        label:
          'Product name',
        value:
          draft.name
      },
      {
        label:
          'Category',
        value:
          draft.categoryLabel
      },
      {
        label:
          'Subcategory',
        value:
          draft.subcategoryLabel ??
          'None matched'
      },
      {
        label:
          'Brand',
        value:
          draft.brandName ??
          'None matched'
      },
      {
        label:
          'Short description',
        value:
          draft.shortDescription
      },
      {
        label:
          'Long description',
        value:
          draft.longDescription
      },
      {
        label:
          'Tags',
        value:
          draft.tags.join(
            ', '
          )
      }
    ],
    sections: [
      {
        title:
          'Recognition notes',
        bullets:
          draft.assumptions
      },
      {
        title:
          'What happens after creation',
        bullets: [
          'The Product is created as an inactive Draft.',
          'No price, stock, media or active variant is invented.',
          'Product Studio remains responsible for completion.',
          'Publication still follows the normal approval boundary.'
        ]
      }
    ],
    suggestedPrompts: [
      `Create another Product in ${draft.categoryLabel}`,
      'Help me write the final Product description',
      'Explain what Product details are still missing'
    ],
    actions: [
      {
        label:
          'Open Product Studio',
        href:
          productStudioHref,
        kind:
          'primary'
      }
    ]
  });
}

function availableQuantity(
  product:
    ProductRecord
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

function productCard(
  product:
    ProductRecord,
  reason:
    string
): AIAssistantProduct {
  const variant =
    product.variants.find(
      item =>
        (
          item.inventory
            ?.quantity ??
          0
        ) -
          (
            item.inventory
              ?.reserved ??
            0
          ) >
        0
    ) ??
    product.variants[0] ??
    null;

  const image =
    product.images[0]
      ?.url ??
    variant?.image ??
    null;

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    image,
    category:
      product.category.label,
    brand:
      product.brand?.name ??
      null,
    variantId:
      variant?.id ??
      null,
    variantLabel:
      variant?.label ??
      null,
    price:
      variant
        ? Number(
            variant.price
          )
        : null,
    available:
      availableQuantity(
        product
      ),
    rating:
      product.rating,
    reason,
    href:
      `/store?product=${encodeURIComponent(
        product.slug
      )}`
  };
}

function promptTitle(
  prompt: string
) {
  const clean =
    prompt
      .replace(
        /\s+/g,
        ' '
      )
      .trim();

  if (
    clean.length <=
    68
  ) {
    return clean;
  }

  return `${clean.slice(
    0,
    65
  )}…`;
}

function response(
  input: {
    headline:
      string;
    summary:
      string;
    outputType:
      AIAssistantOutputType;
    confidence?:
      number;
    metrics?:
      AIAssistantMetric[];
    products?:
      AIAssistantProduct[];
    productDraft?:
      AIAssistantRecognizedProductDraft |
      null;
    sections?:
      AIAssistantSection[];
    draftFields?:
      AIAssistantDraftField[];
    warnings?:
      string[];
    suggestedPrompts?:
      string[];
    actions?:
      AIAssistantAction[];
  }
): AIAssistantResponsePayload {
  return {
    headline:
      input.headline,
    summary:
      input.summary,
    outputType:
      input.outputType,
    confidence:
      input.confidence ??
      0.74,
    metrics:
      input.metrics ??
      [],
    products:
      input.products ??
      [],
    productDraft:
      input.productDraft ??
      null,
    sections:
      input.sections ??
      [],
    draftFields:
      input.draftFields ??
      [],
    warnings:
      input.warnings ??
      [],
    suggestedPrompts:
      input.suggestedPrompts ??
      [],
    actions:
      input.actions ??
      []
  };
}

function classifyCustomer(
  prompt: string
): AIAssistantOutputType {
  if (
    includesAny(
      prompt,
      [
        'compare',
        'difference',
        'better between',
        'versus',
        ' vs '
      ]
    )
  ) {
    return 'COMPARISON';
  }

  if (
    includesAny(
      prompt,
      [
        'pair',
        'dinner',
        'gift',
        'occasion',
        'celebration',
        'basket',
        'party'
      ]
    )
  ) {
    return 'PAIRING';
  }

  if (
    includesAny(
      prompt,
      [
        'shopping list',
        'plan',
        'quantities',
        'essentials',
        'checklist'
      ]
    )
  ) {
    return 'SHOPPING_PLAN';
  }

  return 'RECOMMENDATION';
}

function classifyAdmin(
  prompt: string
): AIAssistantOutputType {
  if (
    includesAny(
      prompt,
      [
        'catalog',
        'listing',
        'description',
        'tags',
        'missing product',
        'product quality'
      ]
    )
  ) {
    return 'CATALOG_DRAFT';
  }

  if (
    includesAny(
      prompt,
      [
        'campaign',
        'promotion',
        'collection',
        'story',
        'reel',
        'banner',
        'merchandising'
      ]
    )
  ) {
    return 'CAMPAIGN_DRAFT';
  }

  if (
    includesAny(
      prompt,
      [
        'permission',
        'approve',
        'governance',
        'authority',
        'policy'
      ]
    )
  ) {
    return 'GOVERNANCE_EXPLANATION';
  }

  return 'OPERATIONS_BRIEF';
}

function classifyVendor(
  prompt: string
): AIAssistantOutputType {
  if (
    includesAny(
      prompt,
      [
        'campaign',
        'promotion',
        'collection',
        'story',
        'reel',
        'bundle'
      ]
    )
  ) {
    return 'CAMPAIGN_DRAFT';
  }

  if (
    includesAny(
      prompt,
      [
        'approval',
        'ready',
        'submission',
        'blocker',
        'policy'
      ]
    )
  ) {
    return 'GOVERNANCE_EXPLANATION';
  }

  return 'CATALOG_DRAFT';
}

function qualityIssues(
  product:
    ProductRecord
) {
  const issues:
    string[] = [];

  if (
    !product.shortDescription?.trim()
  ) {
    issues.push(
      'short description'
    );
  }

  if (
    !product.longDescription?.trim()
  ) {
    issues.push(
      'long description'
    );
  }

  if (
    product.tags.length <
    3
  ) {
    issues.push(
      'search tags'
    );
  }

  if (
    !product.images.length
  ) {
    issues.push(
      'product media'
    );
  }

  if (
    !product.variants.length
  ) {
    issues.push(
      'active variants'
    );
  }

  if (
    product.variants.some(
      variant =>
        !variant.inventory
    )
  ) {
    issues.push(
      'inventory connection'
    );
  }

  return issues;
}

function productScore(
  product:
    ProductRecord,
  signals: {
    preferredCategories:
      Set<string>;
    preferredBrands:
      Set<string>;
    recentCategories:
      Set<string>;
    wishlistProductIds:
      Set<string>;
    contextCategory:
      string |
      null;
    contextProductId:
      string |
      null;
  }
) {
  let score =
    product.rating *
      10 +
    Math.min(
      product.soldCount,
      100
    ) *
      0.12 +
    (
      product.featured
        ? 16
        : 0
    ) +
    (
      product.isNew
        ? 8
        : 0
    ) +
    (
      availableQuantity(
        product
      ) >
      0
        ? 24
        : -30
    );

  if (
    signals.preferredCategories.has(
      product.category.slug
    )
  ) {
    score +=
      28;
  }

  if (
    product.brand &&
    signals.preferredBrands.has(
      product.brand.slug
    )
  ) {
    score +=
      20;
  }

  if (
    signals.recentCategories.has(
      product.category.id
    )
  ) {
    score +=
      14;
  }

  if (
    signals.wishlistProductIds.has(
      product.id
    )
  ) {
    score +=
      8;
  }

  if (
    signals.contextCategory &&
    (
      product.category.slug ===
        signals.contextCategory ||
      product.category.id ===
        signals.contextCategory
    )
  ) {
    score +=
      32;
  }

  if (
    signals.contextProductId ===
    product.id
  ) {
    score -=
      18;
  }

  return score;
}

async function customerResponse({
  access,
  prompt,
  context
}: EngineInput) {
  const normalizedPrompt =
    normalize(
      prompt
    );

  const [
    products,
    profile,
    recent,
    wishlist
  ] =
    await Promise.all([
      prisma.product.findMany({
        where: {
          workspaceId:
            access.workspaceId,
          active:
            true,
          status:
            'PUBLISHED'
        },
        include:
          productInclude,
        orderBy: [
          {
            featured:
              'desc'
          },
          {
            rating:
              'desc'
          },
          {
            soldCount:
              'desc'
          }
        ],
        take:
          100
      }),
      prisma.experienceProfile.findUnique({
        where: {
          userId:
            access.userId
        }
      }),
      prisma.recentlyViewed.findMany({
        where: {
          userId:
            access.userId,
          product: {
            workspaceId:
              access.workspaceId
          }
        },
        include: {
          product: {
            select: {
              id:
                true,
              categoryId:
                true,
              brandId:
                true
            }
          }
        },
        orderBy: {
          viewedAt:
            'desc'
        },
        take:
          20
      }),
      prisma.wishlist.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId:
              access.workspaceId,
            userId:
              access.userId
          }
        },
        include: {
          items: {
            select: {
              productId:
                true
            }
          }
        }
      })
    ]);

  const personalizationEnabled =
    profile?.personalizationEnabled ??
    true;

  const signals = {
    preferredCategories:
      new Set<string>(
        personalizationEnabled
          ? profile?.preferredCategorySlugs ??
              []
          : []
      ),
    preferredBrands:
      new Set<string>(
        personalizationEnabled
          ? profile?.preferredBrandSlugs ??
              []
          : []
      ),
    recentCategories:
      new Set<string>(
        personalizationEnabled
          ? recent.map(
              item =>
                item.product.categoryId
            )
          : []
      ),
    wishlistProductIds:
      new Set<string>(
        personalizationEnabled
          ? wishlist?.items.map(
              item =>
                item.productId
            ) ??
              []
          : []
      ),
    contextCategory:
      context.category ??
      null,
    contextProductId:
      context.productId ??
      null
  };

  const ranked =
    products
      .map(
        product => ({
          product,
          score:
            productScore(
              product,
              signals
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
      );

  const outputType =
    classifyCustomer(
      normalizedPrompt
    );

  if (
    outputType ===
    'COMPARISON'
  ) {
    const directlyMentioned =
      ranked.filter(
        item => {
          const name =
            normalize(
              item.product.name
            );

          const slug =
            normalize(
              item.product.slug
            );

          return (
            normalizedPrompt.includes(
              name
            ) ||
            normalizedPrompt.includes(
              slug
            ) ||
            item.product.id ===
              context.productId
          );
        }
      );

    const selected =
      (
        directlyMentioned.length >=
        2
          ? directlyMentioned
          : ranked
      )
        .slice(
          0,
          3
        )
        .map(
          (
            item,
            index
          ) =>
            productCard(
              item.product,
              index ===
                0
                ? 'Best combined availability, rating and preference match.'
                : 'Useful alternative for price, category or style comparison.'
            )
        );

    const sections:
      AIAssistantSection[] = [
      {
        title:
          'Meaningful differences',
        bullets:
          selected.map(
            product =>
              `${product.name}: ${product.category}${product.brand ? ` by ${product.brand}` : ''}, ${product.available} available, rating ${product.rating.toFixed(1)}.`
          )
      },
      {
        title:
          'Decision guidance',
        bullets: [
          selected[0]
            ? `${selected[0].name} is the strongest balanced choice from the current live catalog.`
            : 'There is not enough live catalog information for a confident comparison.',
          'Confirm the preferred variant and current quantity before adding anything to Cart or a Shopping List.'
        ]
      }
    ];

    return response({
      headline:
        'Live product comparison',
      summary:
        `I compared ${selected.length} available products using current price, stock, rating and your permitted personalization signals.`,
      outputType,
      confidence:
        selected.length >=
        2
          ? 0.81
          : 0.58,
      products:
        selected,
      sections,
      warnings:
        selected.length <
        2
          ? [
              'Only one strong product match was found. Name two products for a more precise comparison.'
            ]
          : [],
      suggestedPrompts: [
        'Compare the two cheapest available options',
        'Which one is better for a gift?',
        'Show me a similar product with more stock'
      ],
      actions: [
        {
          label:
            'Explore live Store',
          href:
            '/store',
          kind:
            'primary'
        },
        {
          label:
            'Open Wishlist',
          href:
            '/wishlist'
        }
      ]
    });
  }

  if (
    outputType ===
    'PAIRING'
  ) {
    const chosen:
      ProductRecord[] = [];

    const categories =
      new Set<string>();

    for (
      const item of
      ranked
    ) {
      if (
        chosen.length >=
        6
      ) {
        break;
      }

      if (
        availableQuantity(
          item.product
        ) <=
        0
      ) {
        continue;
      }

      if (
        !categories.has(
          item.product.category.slug
        ) ||
        chosen.length <
          3
      ) {
        chosen.push(
          item.product
        );

        categories.add(
          item.product.category.slug
        );
      }
    }

    const productsForPairing =
      chosen.map(
        (
          product,
          index
        ) =>
          productCard(
            product,
            index ===
              0
              ? 'Anchor product for the occasion.'
              : 'Adds variety, balance or a complementary serving option.'
          )
      );

    const total =
      productsForPairing.reduce(
        (
          sum,
          product
        ) =>
          sum +
          (
            product.price ??
            0
          ),
        0
      );

    return response({
      headline:
        'Occasion pairing draft',
      summary:
        'A balanced combination prepared only from products currently published in this workspace.',
      outputType,
      confidence:
        productsForPairing.length >=
        4
          ? 0.79
          : 0.62,
      metrics: [
        {
          label:
            'Products',
          value:
            String(
              productsForPairing.length
            )
        },
        {
          label:
            'Estimated basket',
          value:
            new Intl.NumberFormat(
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
              total
            ),
          helper:
            'One unit per selected variant'
        },
        {
          label:
            'Available now',
          value:
            String(
              productsForPairing.filter(
                product =>
                  product.available >
                  0
              ).length
            ),
          tone:
            'positive'
        }
      ],
      products:
        productsForPairing,
      sections: [
        {
          title:
            'Serving flow',
          bullets: [
            'Begin with the lightest or most approachable option.',
            'Keep one richer product for the centre of the occasion.',
            'Use the remaining selections as alternatives for different preferences.'
          ]
        },
        {
          title:
            'Before checkout',
          bullets: [
            'Confirm guest count and preferred quantities.',
            'Review current variant prices because this draft does not reserve stock.',
            'Save the final combination to a Shopping List for preparation.'
          ]
        }
      ],
      suggestedPrompts: [
        'Turn this into a party Shopping List',
        'Make the pairing more affordable',
        'Create a premium gift basket'
      ],
      actions: [
        {
          label:
            'Open Shopping Lists',
          href:
            '/account/lists',
          kind:
            'primary'
        },
        {
          label:
            'Browse Store',
          href:
            '/store'
        }
      ]
    });
  }

  if (
    outputType ===
    'SHOPPING_PLAN'
  ) {
    const selected =
      ranked
        .filter(
          item =>
            availableQuantity(
              item.product
            ) >
            0
        )
        .slice(
          0,
          8
        )
        .map(
          (
            item,
            index
          ) =>
            productCard(
              item.product,
              index <
                3
                ? 'Core item for the plan.'
                : 'Optional supporting item.'
            )
        );

    return response({
      headline:
        'Shopping plan draft',
      summary:
        'A reusable starting plan based on the live catalog. Quantities remain for you to confirm.',
      outputType,
      confidence:
        selected.length >=
        5
          ? 0.78
          : 0.6,
      products:
        selected,
      sections: [
        {
          title:
            'Core quantities',
          bullets:
            selected
              .slice(
                0,
                4
              )
              .map(
                product =>
                  `Start with 1 × ${product.name}; increase only after confirming guest count or household need.`
              )
        },
        {
          title:
            'Optional additions',
          bullets:
            selected
              .slice(
                4
              )
              .map(
                product =>
                  `${product.name} can be added as an alternative or extra serving option.`
              )
        }
      ],
      warnings: [
        'This draft does not reserve inventory or create a Shopping List automatically.'
      ],
      suggestedPrompts: [
        'Make this plan suitable for ten guests',
        'Remove premium products and reduce cost',
        'Suggest notes for each Shopping List item'
      ],
      actions: [
        {
          label:
            'Create Shopping List',
          href:
            '/account/lists',
          kind:
            'primary'
        }
      ]
    });
  }

  const recommendations =
    ranked
      .filter(
        item =>
          availableQuantity(
            item.product
          ) >
          0
      )
      .slice(
        0,
        8
      )
      .map(
        (
          item,
          index
        ) =>
          productCard(
            item.product,
            index ===
              0
              ? 'Strongest live match across availability, rating and current context.'
              : personalizationEnabled
                ? 'Matches your permitted browsing, Wishlist or preference signals.'
                : 'Selected from live catalog quality and availability.'
          )
      );

  return response({
    headline:
      'Smart picks from the live Store',
    summary:
      personalizationEnabled
        ? 'These suggestions combine live availability with your permitted customer experience signals.'
        : 'Personalization is disabled, so these suggestions use only live catalog quality and availability.',
    outputType,
    confidence:
      recommendations.length >=
      5
        ? 0.82
        : 0.63,
    metrics: [
      {
        label:
          'Live matches',
        value:
          String(
            recommendations.length
          )
      },
      {
        label:
          'Personalization',
        value:
          personalizationEnabled
            ? 'Enabled'
            : 'Disabled'
      },
      {
        label:
          'In-stock picks',
        value:
          String(
            recommendations.filter(
              product =>
                product.available >
                0
            ).length
          ),
        tone:
          'positive'
      }
    ],
    products:
      recommendations,
    sections: [
      {
        title:
          'Why these appeared',
        bullets: [
          context.category
            ? `Current category context: ${context.category}.`
            : 'No category was forced, so the engine considered the wider live catalog.',
          personalizationEnabled
            ? 'Recent views, preferred categories, preferred brands and Wishlist signals were considered.'
            : 'Private customer activity was not used.',
          'Unavailable products were removed from the leading recommendations.'
        ]
      }
    ],
    suggestedPrompts: [
      'Compare the top three products',
      'Build a dinner pairing from these picks',
      'Create a lower-cost Shopping List'
    ],
    actions: [
      {
        label:
          'Explore Store',
        href:
          '/store',
        kind:
          'primary'
      },
      {
        label:
          'Open Wishlist',
        href:
          '/wishlist'
      }
    ]
  });
}

async function adminResponse({
  access,
  prompt
}: EngineInput) {
  const normalizedPrompt =
    normalize(
      prompt
    );

  if (
    isProductCreationPrompt(
      normalizedPrompt
    )
  ) {
    return productCreationResponse({
      access,
      prompt,
      context: {
        workspaceId:
          access.workspaceId,
        vendorProfileId:
          access.vendorProfileId
      }
    });
  }

  const outputType =
    classifyAdmin(
      normalizedPrompt
    );

  const since =
    new Date(
      Date.now() -
      30 *
        24 *
        60 *
        60 *
        1000
    );

  const [
    products,
    approvalCount,
    activeTodos,
    failedDeliveries,
    recentEvents
  ] =
    await Promise.all([
      prisma.product.findMany({
        where: {
          workspaceId:
            access.workspaceId,
          status: {
            not:
              'ARCHIVED'
          }
        },
        include:
          productInclude,
        orderBy: {
          updatedAt:
            'desc'
        },
        take:
          120
      }),
      prisma.adminApprovalRequest.count({
        where: {
          workspaceId:
            access.workspaceId,
          status: {
            in: [
              'PENDING',
              'IN_INSPECTION',
              'ON_HOLD',
              'CHANGES_REQUESTED'
            ]
          }
        }
      }),
      prisma.adminTodo.findMany({
        where: {
          workspaceId:
            access.workspaceId,
          status: {
            in: [
              'OPEN',
              'IN_PROGRESS',
              'BLOCKED'
            ]
          }
        },
        orderBy: [
          {
            priority:
              'desc'
          },
          {
            dueAt:
              'asc'
          }
        ],
        take:
          20
      }),
      prisma.delivery.count({
        where: {
          workspaceId:
            access.workspaceId,
          status:
            'FAILED'
        }
      }),
      prisma.experienceEvent.findMany({
        where: {
          workspaceId:
            access.workspaceId,
          createdAt: {
            gte:
              since
          }
        },
        select: {
          type:
            true,
          productId:
            true
        },
        take:
          5000
      })
    ]);

  const productsWithIssues =
    products
      .map(
        product => ({
          product,
          issues:
            qualityIssues(
              product
            )
        })
      )
      .filter(
        item =>
          item.issues.length >
          0
      )
      .sort(
        (
          left,
          right
        ) =>
          right.issues.length -
          left.issues.length
      );

  const lowStock =
    products.flatMap(
      product =>
        product.variants
          .filter(
            variant => {
              if (
                !variant.inventory
              ) {
                return false;
              }

              const available =
                variant.inventory
                  .quantity -
                variant.inventory
                  .reserved;

              return (
                available <=
                variant.inventory
                  .reorderLevel
              );
            }
          )
          .map(
            variant => ({
              product,
              variant,
              available:
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
            })
          )
    );

  const productViews =
    recentEvents.filter(
      event =>
        event.type ===
        'PRODUCT_VIEW'
    ).length;

  if (
    outputType ===
    'CATALOG_DRAFT'
  ) {
    const selected =
      productsWithIssues
        .slice(
          0,
          8
        )
        .map(
          item =>
            productCard(
              item.product,
              `Needs ${item.issues.join(', ')}.`
            )
        );

    return response({
      headline:
        'Catalog quality draft',
      summary:
        `${productsWithIssues.length} product records have at least one quality gap. The list below starts with the most incomplete records.`,
      outputType,
      confidence:
        0.9,
      metrics: [
        {
          label:
            'Products checked',
          value:
            String(
              products.length
            )
        },
        {
          label:
            'Needs attention',
          value:
            String(
              productsWithIssues.length
            ),
          tone:
            productsWithIssues.length
              ? 'warning'
              : 'positive'
        },
        {
          label:
            'Low-stock variants',
          value:
            String(
              lowStock.length
            ),
          tone:
            lowStock.length
              ? 'warning'
              : 'positive'
        }
      ],
      products:
        selected,
      sections: [
        {
          title:
            'Highest-impact fixes',
          bullets:
            productsWithIssues
              .slice(
                0,
                6
              )
              .map(
                item =>
                  `${item.product.name}: add or improve ${item.issues.join(', ')}.`
              )
        },
        {
          title:
            'Governed application',
          bullets: [
            'Use this response as a draft; no Product record has been edited.',
            'Price, stock, status and public presentation remain under existing Product Studio and approval authorities.'
          ]
        }
      ],
      suggestedPrompts: [
        'Draft descriptions for the most incomplete products',
        'Find products missing media',
        'Prepare a catalog-quality Todo list'
      ],
      actions: [
        {
          label:
            'Open Product Studio',
          href:
            '/admin/products',
          kind:
            'primary'
        },
        {
          label:
            'Open Inventory',
          href:
            '/admin/inventory'
        }
      ]
    });
  }

  if (
    outputType ===
    'CAMPAIGN_DRAFT'
  ) {
    const candidates =
      products
        .filter(
          product =>
            product.status ===
              'PUBLISHED' &&
            product.active &&
            availableQuantity(
              product
            ) >
              0
        )
        .sort(
          (
            left,
            right
          ) =>
            (
              right.rating *
                10 +
              right.soldCount
            ) -
            (
              left.rating *
                10 +
              left.soldCount
            )
        )
        .slice(
          0,
          6
        );

    const campaignProducts =
      candidates.map(
        product =>
          productCard(
            product,
            'Strong published candidate based on availability, rating and sales signal.'
          )
      );

    const campaignTitle =
      contextTitleFromProducts(
        candidates,
        'AJ Logik Live Picks'
      );

    return response({
      headline:
        'Store campaign draft',
      summary:
        'A reviewable merchandising concept assembled from currently published and available products.',
      outputType,
      confidence:
        campaignProducts.length >=
        4
          ? 0.82
          : 0.64,
      products:
        campaignProducts,
      draftFields: [
        {
          label:
            'Campaign title',
          value:
            campaignTitle
        },
        {
          label:
            'Eyebrow',
          value:
            'Live Store intelligence'
        },
        {
          label:
            'Description',
          value:
            'A focused discovery campaign built from well-rated products with current availability.'
        },
        {
          label:
            'Recommended layout',
          value:
            campaignProducts.length >=
            5
              ? 'Featured hero with carousel destination'
              : 'Compact spotlight grid'
        }
      ],
      sections: [
        {
          title:
            'Execution checklist',
          bullets: [
            'Confirm media quality and mobile crops.',
            'Check price and stock immediately before scheduling.',
            'Review vendor ownership and approval requirements for each selected product.',
            'Publish only through Store Studio after authorised review.'
          ]
        }
      ],
      suggestedPrompts: [
        'Create a lower-cost campaign',
        'Build a weekend Collection from these products',
        'Draft Story and Reel copy for this campaign'
      ],
      actions: [
        {
          label:
            'Open Store Studio',
          href:
            '/admin/store-studio',
          kind:
            'primary'
        },
        {
          label:
            'Review Approvals',
          href:
            '/admin/approvals'
        }
      ]
    });
  }

  if (
    outputType ===
    'GOVERNANCE_EXPLANATION'
  ) {
    return response({
      headline:
        'Workspace governance explanation',
      summary:
        'AJ Intelligence can prepare drafts and explain likely impact, but existing server actions, permissions, approvals and audit events remain authoritative.',
      outputType,
      confidence:
        0.97,
      metrics: [
        {
          label:
            'Open approvals',
          value:
            String(
              approvalCount
            )
        },
        {
          label:
            'Active Todos',
          value:
            String(
              activeTodos.length
            )
        }
      ],
      sections: [
        {
          title:
            'Assistant boundary',
          bullets: [
            'The assistant cannot approve its own recommendations.',
            'The assistant does not publish, delete, change price or alter inventory autonomously.',
            'Every accepted operation must continue through the operator’s permission and approval boundary.',
            'Vendor and customer-private data remain scoped to their authorised contexts.'
          ]
        },
        {
          title:
            'Current review attention',
          bullets: [
            `${approvalCount} approval requests are currently active.`,
            `${activeTodos.length} operational Todos are active in this workspace.`,
            `${failedDeliveries} Delivery records currently require failure resolution.`
          ]
        }
      ],
      suggestedPrompts: [
        'Summarise pending approvals',
        'Explain today’s highest-risk Todos',
        'Prepare an approval-ready campaign draft'
      ],
      actions: [
        {
          label:
            'Open Approval Studio',
          href:
            '/admin/approvals',
          kind:
            'primary'
        },
        {
          label:
            'Open Todo Studio',
          href:
            '/admin/todos'
        }
      ]
    });
  }

  const urgentTodos =
    activeTodos.filter(
      todo =>
        todo.priority ===
        'URGENT' ||
        todo.priority ===
        'HIGH'
    );

  return response({
    headline:
      'Workspace operations brief',
    summary:
      'A live operational summary grounded in approvals, Todos, Delivery exceptions, catalog quality and recent customer activity.',
    outputType:
      'OPERATIONS_BRIEF',
    confidence:
      0.91,
    metrics: [
      {
        label:
          'Open approvals',
        value:
          String(
            approvalCount
          ),
        tone:
          approvalCount
            ? 'warning'
            : 'positive'
      },
      {
        label:
          'Active Todos',
        value:
          String(
            activeTodos.length
          )
      },
      {
        label:
          'High/Urgent',
        value:
          String(
            urgentTodos.length
          ),
        tone:
          urgentTodos.length
            ? 'critical'
            : 'positive'
      },
      {
        label:
          'Failed Delivery',
        value:
          String(
            failedDeliveries
          ),
        tone:
          failedDeliveries
            ? 'critical'
            : 'positive'
      },
      {
        label:
          'Catalog gaps',
        value:
          String(
            productsWithIssues.length
          ),
        tone:
          productsWithIssues.length
            ? 'warning'
            : 'positive'
      },
      {
        label:
          '30-day views',
        value:
          String(
            productViews
          )
      }
    ],
    sections: [
      {
        title:
          'Priority now',
        bullets:
          urgentTodos.length
            ? urgentTodos
                .slice(
                  0,
                  6
                )
                .map(
                  todo =>
                    `${todo.priority}: ${todo.title}${todo.dueAt ? ` · due ${todo.dueAt.toLocaleString('en-NG')}` : ''}`
                )
            : [
                'No High or Urgent Todo currently requires immediate escalation.'
              ]
      },
      {
        title:
          'Commerce attention',
        bullets: [
          `${lowStock.length} variants are at or below their reorder level.`,
          `${productsWithIssues.length} product records have listing-quality gaps.`,
          `${approvalCount} requests are waiting somewhere in the approval lifecycle.`
        ]
      }
    ],
    suggestedPrompts: [
      'Show the catalog records with the most missing information',
      'Draft a campaign from currently available products',
      'Explain the approval and Todo risks'
    ],
    actions: [
      {
        label:
          'Open Todo Studio',
        href:
          '/admin/todos',
        kind:
          'primary'
      },
      {
        label:
          'Open Approvals',
        href:
          '/admin/approvals'
      },
      {
        label:
          'Open Deliveries',
        href:
          '/admin/deliveries'
      }
    ]
  });
}

function contextTitleFromProducts(
  products:
    ProductRecord[],
  fallback:
    string
) {
  const categoryCounts =
    new Map<
      string,
      number
    >();

  for (
    const product of
    products
  ) {
    categoryCounts.set(
      product.category.label,
      (
        categoryCounts.get(
          product.category.label
        ) ??
        0
      ) +
        1
    );
  }

  const leading =
    [
      ...categoryCounts.entries()
    ].sort(
      (
        left,
        right
      ) =>
        right[1] -
        left[1]
    )[0]?.[0];

  return leading
    ? `${leading} Discovery Edit`
    : fallback;
}

async function vendorResponse({
  access,
  prompt
}: EngineInput) {
  if (
    !access.vendorProfileId
  ) {
    throw new Error(
      'Vendor context is required.'
    );
  }

  const normalizedPrompt =
    normalize(
      prompt
    );

  if (
    isProductCreationPrompt(
      normalizedPrompt
    )
  ) {
    return productCreationResponse({
      access,
      prompt,
      context: {
        workspaceId:
          access.workspaceId,
        vendorProfileId:
          access.vendorProfileId
      }
    });
  }

  const outputType =
    classifyVendor(
      normalizedPrompt
    );

  const since =
    new Date(
      Date.now() -
      30 *
        24 *
        60 *
        60 *
        1000
    );

  const [
    products,
    campaignCount,
    collectionCount,
    promotionCount,
    approvalCount
  ] =
    await Promise.all([
      prisma.product.findMany({
        where: {
          workspaceId:
            access.workspaceId,
          vendorProfileId:
            access.vendorProfileId,
          status: {
            not:
              'ARCHIVED'
          }
        },
        include:
          productInclude,
        orderBy: {
          updatedAt:
            'desc'
        },
        take:
          120
      }),
      prisma.storeStudioCampaign.count({
        where: {
          workspaceId:
            access.workspaceId,
          vendorProfileId:
            access.vendorProfileId,
          status: {
            not:
              'EXPIRED'
          }
        }
      }),
      prisma.storeCollection.count({
        where: {
          workspaceId:
            access.workspaceId,
          vendorProfileId:
            access.vendorProfileId,
          status: {
            not:
              'ARCHIVED'
          }
        }
      }),
      prisma.promotion.count({
        where: {
          workspaceId:
            access.workspaceId,
          vendorProfileId:
            access.vendorProfileId,
          status: {
            not:
              'ARCHIVED'
          }
        }
      }),
      prisma.adminApprovalRequest.count({
        where: {
          workspaceId:
            access.workspaceId,
          requestedById:
            access.userId,
          status: {
            in: [
              'PENDING',
              'IN_INSPECTION',
              'ON_HOLD',
              'CHANGES_REQUESTED'
            ]
          }
        }
      })
    ]);

  const productIds =
    products.map(
      product =>
        product.id
    );

  const events =
    productIds.length
      ? await prisma.experienceEvent.findMany({
          where: {
            workspaceId:
              access.workspaceId,
            createdAt: {
              gte:
                since
            },
            productId: {
              in:
                productIds
            }
          },
          select: {
            productId:
              true,
            type:
              true
          },
          take:
            5000
        })
      : [];

  const viewCounts =
    new Map<
      string,
      number
    >();

  for (
    const event of
    events
  ) {
    if (
      event.type !==
        'PRODUCT_VIEW' ||
      !event.productId
    ) {
      continue;
    }

    viewCounts.set(
      event.productId,
      (
        viewCounts.get(
          event.productId
        ) ??
        0
      ) +
        1
    );
  }

  const quality =
    products
      .map(
        product => ({
          product,
          issues:
            qualityIssues(
              product
            ),
          views:
            viewCounts.get(
              product.id
            ) ??
            0
        })
      )
      .sort(
        (
          left,
          right
        ) =>
          (
            right.issues
              .length *
              10 +
            right.views
          ) -
          (
            left.issues
              .length *
              10 +
            left.views
          )
      );

  if (
    outputType ===
    'CAMPAIGN_DRAFT'
  ) {
    const candidates =
      quality
        .filter(
          item =>
            item.product.status ===
              'PUBLISHED' &&
            item.product.active &&
            availableQuantity(
              item.product
            ) >
              0
        )
        .sort(
          (
            left,
            right
          ) =>
            (
              right.views +
              right.product
                .rating *
                10 +
              right.product
                .soldCount
            ) -
            (
              left.views +
              left.product
                .rating *
                10 +
              left.product
                .soldCount
            )
        )
        .slice(
          0,
          6
        );

    const selected =
      candidates.map(
        item =>
          productCard(
            item.product,
            `${item.views} recent product views with live published availability.`
          )
      );

    return response({
      headline:
        'Vendor campaign draft',
      summary:
        'A draft built only from this vendor’s published products and workspace-scoped activity.',
      outputType,
      confidence:
        selected.length >=
        4
          ? 0.84
          : 0.64,
      metrics: [
        {
          label:
            'Campaign records',
          value:
            String(
              campaignCount
            )
        },
        {
          label:
            'Collections',
          value:
            String(
              collectionCount
            )
        },
        {
          label:
            'Promotions',
          value:
            String(
              promotionCount
            )
        },
        {
          label:
            'Open approvals',
          value:
            String(
              approvalCount
            ),
          tone:
            approvalCount
              ? 'warning'
              : 'positive'
        }
      ],
      products:
        selected,
      draftFields: [
        {
          label:
            'Campaign title',
          value:
            contextTitleFromProducts(
              candidates.map(
                item =>
                  item.product
              ),
              'Vendor Live Selection'
            )
        },
        {
          label:
            'Description',
          value:
            'A focused presentation of available products currently attracting customer interest.'
        },
        {
          label:
            'Suggested format',
          value:
            selected.length >=
            4
              ? 'Story sequence with Reel companion'
              : 'Compact Collection spotlight'
        },
        {
          label:
            'Submission state',
          value:
            'Draft only · Workspace approval required'
        }
      ],
      sections: [
        {
          title:
            'Submission checklist',
          bullets: [
            'Confirm that every selected product is still published and available.',
            'Use only vendor-owned media assets.',
            'Review mobile crops and action destinations.',
            'Submit through the existing Vendor Studio approval boundary.'
          ]
        }
      ],
      suggestedPrompts: [
        'Draft Story copy for this selection',
        'Create a promotion bundle from the same products',
        'Check the campaign for approval blockers'
      ],
      actions: [
        {
          label:
            'Open Stories',
          href:
            '/vendor/stories',
          kind:
            'primary'
        },
        {
          label:
            'Open Reels',
          href:
            '/vendor/reels'
        },
        {
          label:
            'Review Submissions',
          href:
            '/vendor/submissions'
        }
      ]
    });
  }

  if (
    outputType ===
    'GOVERNANCE_EXPLANATION'
  ) {
    const blocked =
      quality.filter(
        item =>
          item.issues.length >
          0
      );

    return response({
      headline:
        'Vendor submission readiness',
      summary:
        'Readiness is evaluated only against this vendor’s records. Workspace approval remains authoritative.',
      outputType,
      confidence:
        0.9,
      metrics: [
        {
          label:
            'Products',
          value:
            String(
              products.length
            )
        },
        {
          label:
            'Listing gaps',
          value:
            String(
              blocked.length
            ),
          tone:
            blocked.length
              ? 'warning'
              : 'positive'
        },
        {
          label:
            'Open approvals',
          value:
            String(
              approvalCount
            ),
          tone:
            approvalCount
              ? 'warning'
              : 'positive'
        }
      ],
      sections: [
        {
          title:
            'Likely blockers',
          bullets:
            blocked.length
              ? blocked
                  .slice(
                    0,
                    8
                  )
                  .map(
                    item =>
                      `${item.product.name}: ${item.issues.join(', ')}.`
                  )
              : [
                  'No common listing-quality blocker was found in the current vendor catalog.'
                ]
        },
        {
          title:
            'Authority boundary',
          bullets: [
            'AI drafts cannot publish or submit themselves.',
            'Vendor ownership remains enforced for Products, media, Collections, promotions and campaigns.',
            'Controlled public changes continue through workspace approval.',
            'Another vendor’s data is never included in this analysis.'
          ]
        }
      ],
      suggestedPrompts: [
        'Show the products with the most listing gaps',
        'Draft cleaner descriptions for incomplete products',
        'Prepare a campaign that is ready for approval'
      ],
      actions: [
        {
          label:
            'Open Product Studio',
          href:
            '/vendor/products',
          kind:
            'primary'
        },
        {
          label:
            'Review Submissions',
          href:
            '/vendor/submissions'
        }
      ]
    });
  }

  const issueProducts =
    quality
      .filter(
        item =>
          item.issues.length >
          0
      )
      .slice(
        0,
        8
      );

  return response({
    headline:
      'Vendor listing quality draft',
    summary:
      `${issueProducts.length} leading records are shown with the most important improvements first.`,
    outputType:
      'CATALOG_DRAFT',
    confidence:
      0.88,
    metrics: [
      {
        label:
          'Products checked',
        value:
          String(
            products.length
          )
      },
      {
        label:
          'Needs attention',
        value:
          String(
            quality.filter(
              item =>
                item.issues.length >
                0
            ).length
          ),
        tone:
          issueProducts.length
            ? 'warning'
            : 'positive'
      },
      {
        label:
          '30-day views',
        value:
          String(
            events.filter(
              event =>
                event.type ===
                'PRODUCT_VIEW'
            ).length
          )
      },
      {
        label:
          'Open approvals',
        value:
          String(
            approvalCount
          )
      }
    ],
    products:
      issueProducts.map(
        item =>
          productCard(
            item.product,
            `Improve ${item.issues.join(', ')}.`
          )
      ),
    sections: [
      {
        title:
          'Recommended editing order',
        bullets:
          issueProducts.length
            ? issueProducts.map(
                item =>
                  `${item.product.name}: ${item.issues.join(', ')}.`
              )
            : [
                'The current vendor catalog has no common structural listing gap.'
              ]
      },
      {
        title:
          'Draft-only reminder',
        bullets: [
          'No Product field has been edited.',
          'Review titles, descriptions, tags, variants and media inside Product Studio.',
          'Submit controlled changes through the existing approval flow.'
        ]
      }
    ],
    suggestedPrompts: [
      'Draft a better description for the first product',
      'Prepare a submission checklist',
      'Build a campaign from the strongest available products'
    ],
    actions: [
      {
        label:
          'Open Product Studio',
        href:
          '/vendor/products',
        kind:
          'primary'
      },
      {
        label:
          'Open Media Studio',
        href:
          '/vendor/media'
      }
    ]
  });
}

export async function runLocalAssistant(
  input:
    EngineInput
): Promise<AIAssistantResponsePayload> {
  const collaborativeResponse =
    resolveCollaborativeIntentResponse({
      audience:
        input.access.audience,
      prompt:
        input.prompt,
      conversation:
        input.conversation ?? []
    });

  if (collaborativeResponse) {
    return collaborativeResponse;
  }

  if (
    input.access.audience ===
    'customer'
  ) {
    return customerResponse(
      input
    );
  }

  if (
    input.access.audience ===
    'admin'
  ) {
    return adminResponse(
      input
    );
  }

  return vendorResponse(
    input
  );
}

export function assistantSessionTitle(
  prompt:
    string
) {
  return promptTitle(
    prompt
  );
}
