import type {
  AIAssistantAudience,
  AIAssistantProfile
} from './contracts';

const profiles: Record<AIAssistantAudience, AIAssistantProfile> = {
  admin: {
    audience: 'admin',
    eyebrow: 'AJ intelligence · Admin control plane',
    title: 'AJ Studio Manager',
    description:
      'Workspace intelligence for catalog quality, merchandising, governance and operational attention.',
    contextDescription:
      'The assistant will be grounded in the active workspace, the operator’s permissions, catalog records, inventory, approvals, campaigns, analytics and audit history.',
    capabilities: [
      {
        id: 'admin-catalog',
        title: 'Catalog quality drafts',
        description:
          'Prepare product copy, tags, category and brand placement, missing-data checks and listing improvements.',
        examples: [
          'Draft a stronger product description',
          'Flag products missing media or variants',
          'Suggest category and brand placement'
        ]
      },
      {
        id: 'admin-store',
        title: 'Store planning',
        description:
          'Propose collections, promotions, Stories, Reels, banners and discovery arrangements from current commerce signals.',
        examples: [
          'Draft a weekend campaign',
          'Suggest products for a collection',
          'Prepare Story and Reel copy'
        ]
      },
      {
        id: 'admin-operations',
        title: 'Operational attention',
        description:
          'Summarise approvals, low stock, delayed deliveries, customer activity and the most important work to do next.',
        examples: [
          'Prioritise today’s management queue',
          'Explain a stock or delivery warning',
          'Summarise pending approvals'
        ]
      },
      {
        id: 'admin-governance',
        title: 'Governed recommendations',
        description:
          'Explain permissions, review requirements and the effects of a proposed action before an administrator accepts it.',
        examples: [
          'Explain who can approve this',
          'Prepare an approval-ready draft',
          'Describe the expected Store impact'
        ]
      }
    ],
    authorityRules: [
      'Every output remains a reviewable draft until an authorised administrator explicitly accepts it.',
      'The assistant cannot approve its own work, publish content, delete records, change prices or alter stock autonomously.',
      'Recommendations must remain inside the active workspace and the operator’s permission boundary.',
      'Accepted actions must continue through existing server actions, approvals and audit logging.'
    ],
    preparationSteps: [
      'Workspace and permission context resolver',
      'Read-only commerce and operational signal projection',
      'Structured suggestion and draft contract',
      'Human acceptance and approval gate',
      'Audit event and outcome feedback loop'
    ]
  },
  vendor: {
    audience: 'vendor',
    eyebrow: 'AJ intelligence · Vendor Studio',
    title: 'Vendor Studio Manager',
    description:
      'A vendor-scoped assistant for listing quality, campaign preparation, submission readiness and performance guidance.',
    contextDescription:
      'The assistant will see only the active vendor’s products, media, collections, promotions, campaigns, submissions and analytics inside the current workspace.',
    capabilities: [
      {
        id: 'vendor-listings',
        title: 'Listing assistance',
        description:
          'Draft product titles, descriptions, tags, variants and media recommendations using vendor-owned records.',
        examples: [
          'Improve this product listing',
          'Suggest missing product details',
          'Prepare a submission checklist'
        ]
      },
      {
        id: 'vendor-campaigns',
        title: 'Campaign drafts',
        description:
          'Prepare promotion, collection, Story and Reel concepts from the vendor’s approved catalog and media.',
        examples: [
          'Draft a product Story',
          'Build a Reel concept',
          'Suggest a promotion bundle'
        ]
      },
      {
        id: 'vendor-readiness',
        title: 'Submission readiness',
        description:
          'Identify missing fields, policy conflicts and likely approval blockers before content is submitted.',
        examples: [
          'Check whether this is ready',
          'Explain the approval blocker',
          'Prepare a cleaner revision'
        ]
      },
      {
        id: 'vendor-insights',
        title: 'Performance guidance',
        description:
          'Translate vendor analytics into practical recommendations without exposing another vendor’s data.',
        examples: [
          'Summarise product interest',
          'Suggest what to promote next',
          'Explain campaign performance'
        ]
      }
    ],
    authorityRules: [
      'The assistant can access only records owned by the active vendor within the current workspace.',
      'Drafts cannot be submitted or published until a vendor member explicitly accepts them.',
      'Workspace approval remains mandatory for every controlled public change.',
      'The assistant cannot expose competitor, customer-private or other vendor information.'
    ],
    preparationSteps: [
      'Vendor ownership and permission context resolver',
      'Vendor-scoped catalog, media and analytics projection',
      'Structured listing and campaign draft contract',
      'Vendor acceptance and workspace submission gate',
      'Approval-result learning signal'
    ]
  },
  customer: {
    audience: 'customer',
    eyebrow: 'AJ intelligence · Customer experience',
    title: 'AJ AI Suggestions',
    description:
      'Contextual shopping guidance for discovery, comparison, pairing, occasions and reusable shopping plans.',
    contextDescription:
      'Suggestions will use the active workspace, available catalog, current product or search intent, wishlist, recent views, shopping lists and the customer’s personalization settings.',
    capabilities: [
      {
        id: 'customer-picks',
        title: 'Smart product suggestions',
        description:
          'Recommend relevant products from the live workspace using current intent and customer preference signals.',
        examples: [
          'Show similar products',
          'Suggest something new',
          'Continue from recent views'
        ]
      },
      {
        id: 'customer-compare',
        title: 'Comparison guidance',
        description:
          'Explain meaningful differences between products, variants, availability and intended use.',
        examples: [
          'Compare these products',
          'Explain the best variant',
          'Find an available alternative'
        ]
      },
      {
        id: 'customer-pairing',
        title: 'Pairings and occasions',
        description:
          'Build drink, food, confectionery and occasion combinations from available products.',
        examples: [
          'Create a dinner pairing',
          'Plan a celebration basket',
          'Suggest a gift combination'
        ]
      },
      {
        id: 'customer-plans',
        title: 'Shopping-list assistance',
        description:
          'Help organise products, quantities and notes into reusable plans while the customer remains in control.',
        examples: [
          'Build a party shopping list',
          'Complete this existing list',
          'Suggest missing essentials'
        ]
      }
    ],
    authorityRules: [
      'Suggestions must use products currently available in the active workspace.',
      'Personalization settings and customer privacy choices must be respected.',
      'The assistant may prepare cart or shopping-list actions but cannot place orders or make payments without explicit customer action.',
      'Recommendations must explain uncertainty when product, stock or preference information is incomplete.'
    ],
    preparationSteps: [
      'Customer intent and personalization context resolver',
      'Live catalog and availability grounding',
      'Structured recommendation and comparison response contract',
      'Cart and shopping-list action proposals',
      'Customer feedback and outcome signals'
    ]
  }
};

export function getAssistantProfile(
  audience: AIAssistantAudience
): AIAssistantProfile {
  return profiles[audience];
}
