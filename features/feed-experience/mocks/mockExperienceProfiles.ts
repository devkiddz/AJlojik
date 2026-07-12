import type {
  FeedActivityContext,
  FeedUserContext
} from '../contracts';

export type MockExperienceProfileId =
  | 'guest'
  | 'explorer'
  | 'shopper'
  | 'premium';

export type MockExperienceProfile = {
  id: MockExperienceProfileId;
  label: string;
  description: string;
  user: FeedUserContext;
  activity: FeedActivityContext;
};

export const mockExperienceProfiles: MockExperienceProfile[] = [
  {
    id: 'guest',
    label: 'Guest',
    description: 'A new visitor with no shopping history.',

    user: {
      sessionId: 'mock-guest-session',
      authenticated: false,
      tier: 'guest',
      wishlistProductIds: [],
      cartProductIds: [],
      recentProductIds: []
    },

    activity: {
      viewedProductIds: [],
      viewedCategorySlugs: [],
      searchedTerms: [],
      clickedCollectionIds: []
    }
  },

  {
    id: 'explorer',
    label: 'Explorer',
    description:
      'A visitor exploring champagne, wines and premium spirits.',

    user: {
      id: 'mock-user-explorer',
      sessionId: 'mock-explorer-session',
      authenticated: true,
      tier: 'returning',

      wishlistProductIds: [
        'prod_5',
        'prod_7'
      ],

      cartProductIds: [],

      recentProductIds: [
        'prod_7',
        'prod_12',
        'prod_5',
        'prod_14'
      ]
    },

    activity: {
      viewedProductIds: [
        'prod_7',
        'prod_12',
        'prod_5',
        'prod_14'
      ],

      viewedCategorySlugs: [
        'wines',
        'spirits'
      ],

      searchedTerms: [
        'champagne',
        'cognac',
        'premium wine'
      ],

      clickedCollectionIds: [
        'collection_1',
        'collection_2'
      ]
    }
  },

  {
    id: 'shopper',
    label: 'Shopper',
    description:
      'An active customer with products in the cart and wishlist.',

    user: {
      id: 'mock-user-shopper',
      sessionId: 'mock-shopper-session',
      authenticated: true,
      tier: 'member',

      wishlistProductIds: [
        'prod_2',
        'prod_6',
        'prod_17',
        'prod_24'
      ],

      cartProductIds: [
        'prod_1',
        'prod_4',
        'prod_10'
      ],

      recentProductIds: [
        'prod_1',
        'prod_4',
        'prod_10',
        'prod_24'
      ]
    },

    activity: {
      viewedProductIds: [
        'prod_1',
        'prod_4',
        'prod_10',
        'prod_24'
      ],

      viewedCategorySlugs: [
        'wines',
        'confectioneries',
        'party-plans'
      ],

      searchedTerms: [
        'birthday cake',
        'party package',
        'champagne'
      ],

      clickedCollectionIds: [
        'collection_1',
        'collection_3'
      ]
    }
  },

  {
    id: 'premium',
    label: 'Premium',
    description:
      'A premium member interested in luxury drinks and exclusive experiences.',

    user: {
      id: 'mock-user-premium',
      sessionId: 'mock-premium-session',
      authenticated: true,
      tier: 'premium',

      wishlistProductIds: [
        'prod_6',
        'prod_7',
        'prod_16',
        'prod_21',
        'prod_30'
      ],

      cartProductIds: [
        'prod_7',
        'prod_16',
        'prod_21'
      ],

      recentProductIds: [
        'prod_21',
        'prod_16',
        'prod_7',
        'prod_30',
        'prod_6'
      ]
    },

    activity: {
      viewedProductIds: [
        'prod_21',
        'prod_16',
        'prod_7',
        'prod_30',
        'prod_6'
      ],

      viewedCategorySlugs: [
        'spirits',
        'wines'
      ],

      searchedTerms: [
        'luxury cognac',
        'premium champagne',
        'VIP tequila',
        'single malt'
      ],

      clickedCollectionIds: [
        'collection_1',
        'collection_2'
      ]
    }
  }
];