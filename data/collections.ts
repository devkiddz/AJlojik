export type CollectionIcon = {
  type: 'lucide' | 'image';

  value:
    | 'wine'
    | 'martini'
    | 'candy'
    | 'utensils'
    | 'party-popper'
    | string;
};

export type CollectionLayout =
  | 'featured'
  | 'carousel'
  | 'grid'
  | 'spotlight';

export type CollectionBanner = {
  eyebrow?: string;
  title: string;
  description?: string;
  image?: string;
  ctaLabel?: string;
  href?: string;
};

export type CollectionTheme = {
  accent: string;
  gradient?: string;
};

export type CollectionType = {
  id: string;
  slug: string;

  title: string;
  subtitle?: string;

  icon?: CollectionIcon;

  layout: CollectionLayout;

  banner?: CollectionBanner;

  featuredProductId?: string;
  productIds: string[];

  active: boolean;
  priority: number;

  theme?: CollectionTheme;
};

export const collections: CollectionType[] = [
  // ============================================================
  // TONIGHT'S POUR
  // ============================================================

  {
    id: 'collection_1',
    slug: 'tonights-pour',

    title: "Tonight's Pour",

    subtitle:
      'Handpicked champagnes and wines for unforgettable nights.',

    icon: {
      type: 'lucide',
      value: 'wine'
    },

    layout: 'featured',

    banner: {
      eyebrow: "Tonight's Pour",

      title:
        'Raise a Glass to Unforgettable Nights',

      description:
        'Discover premium champagnes curated for celebrations, anniversaries and memorable evenings.',

      image:
        '/assets/collections/tonights-pour-banner.png',

      ctaLabel:
        'Explore Collection',

      href:
        '/collections/tonights-pour'
    },

    featuredProductId:
      'prod_1',

    productIds: [
      'prod_1',
      'prod_5',
      'prod_7',
      'prod_12',
      'prod_18',
      'prod_19',
      'prod_29',
      'prod_41'
    ],

    active: true,

    priority: 1,

    theme: {
      accent:
        '#D4AF37',

      gradient:
        'bg-gradient-brand'
    }
  },

  // ============================================================
  // WEEKEND INDULGENCE
  // ============================================================

  {
    id: 'collection_2',
    slug: 'weekend-indulgence',

    title:
      'Weekend Indulgence',

    subtitle:
      'Relax, unwind and celebrate the weekend with premium spirits.',

    icon: {
      type: 'lucide',
      value: 'martini'
    },

    layout: 'featured',

    featuredProductId:
      'prod_8',

    productIds: [
      'prod_8',
      'prod_13',
      'prod_14',
      'prod_15',
      'prod_16',
      'prod_17',
      'prod_20',
      'prod_21',
      'prod_22',
      'prod_30'
    ],

    active: true,

    priority: 2,

    theme: {
      accent:
        '#8B1E3F',

      gradient:
        'bg-gradient-wine'
    }
  },

  // ============================================================
  // AJ KITCHEN EXPERIENCE
  // ============================================================

  {
    id: 'collection_3',
    slug: 'aj-kitchen-experience',

    title:
      'The AJ Kitchen Experience',

    subtitle:
      'Premium appliances and thoughtful kitchen essentials for inspired everyday living.',

    icon: {
      type: 'lucide',
      value: 'utensils'
    },

    layout: 'featured',

    featuredProductId:
      'prod_37',

    productIds: [
      'prod_37',
      'prod_11',
      'prod_27',
      'prod_28',
      'prod_40'
    ],

    active: true,

    priority: 3,

    theme: {
      accent:
        '#D97706',

      gradient:
        'bg-gradient-to-br from-orange-950 via-amber-950 to-stone-950'
    }
  },

  // ============================================================
  // PARTY EXPERIENCE
  // ============================================================

  {
    id: 'collection_4',
    slug: 'celebration-experience',

    title:
      'Make It a Celebration',

    subtitle:
      'Curated party plans and complete experiences for effortless, unforgettable gatherings.',

    icon: {
      type: 'lucide',
      value: 'party-popper'
    },

    layout: 'featured',

    featuredProductId:
      'prod_10',

    productIds: [
      'prod_10',
      'prod_26',
      'prod_39',
      'prod_25'
    ],

    active: true,

    priority: 4,

    theme: {
      accent:
        '#C026D3',

      gradient:
        'bg-gradient-to-br from-fuchsia-950 via-purple-950 to-slate-950'
    }
  },

  // ============================================================
  // SWEET MOMENTS
  // ============================================================

  {
    id: 'collection_5',
    slug: 'sweet-moments',

    title:
      'Sweet Moments',

    subtitle:
      'Luxury cakes, cupcakes and confectioneries for every special moment.',

    icon: {
      type: 'lucide',
      value: 'candy'
    },

    layout: 'featured',

    featuredProductId:
      'prod_24',

    productIds: [
      'prod_24',
      'prod_4',
      'prod_9',
      'prod_23',
      'prod_38',
      'prod_42'
    ],

    active: true,

    priority: 5,

    theme: {
      accent:
        '#B57A4B',

      gradient:
        'bg-gradient-premium'
    }
  }
];