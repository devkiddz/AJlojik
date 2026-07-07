export type CollectionIcon = {
  type: 'lucide' | 'image';
  value: 'wine' | 'martini' | 'candy' | string;
};

export type CollectionLayout = 'featured' | 'carousel' | 'grid' | 'spotlight';

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
  {
    id: 'collection_1',
    slug: 'tonights-pour',

    title: "Tonight's Pour",
    subtitle: 'Handpicked champagnes for unforgettable nights.',

    icon: {
      type: 'lucide',
      value: 'wine'
    },

    layout: 'featured',

    banner: {
      eyebrow: "Tonight's Pour",
      title: 'Raise a Glass to Unforgettable Nights',
      description:
        'Discover premium champagnes curated for celebrations, anniversaries and memorable evenings.',
      image: '/assets/collections/tonights-pour-banner.png',
      ctaLabel: 'Explore Collection',
      href: '/collections/tonights-pour'
    },

    featuredProductId: 'prod_1',
    productIds: ['prod_1', 'prod_2', 'prod_3', 'prod_4', 'prod_5'],

    active: true,
    priority: 1,

    theme: {
      accent: '#D4AF37',
      gradient: 'bg-gradient-brand'
    }
  },

  {
    id: 'collection_2',
    slug: 'weekend-indulgence',

    title: 'Weekend Indulgence',
    subtitle: 'Relax, unwind and celebrate the weekend.',

    icon: {
      type: 'lucide',
      value: 'martini'
    },

    layout: 'featured',

    featuredProductId: 'prod_8',
    productIds: ['prod_8', 'prod_9', 'prod_10', 'prod_11', 'prod_12', 'prod_13', 'prod_14'],

    active: true,
    priority: 2,

    theme: {
      accent: '#8B1E3F',
      gradient: 'bg-gradient-wine'
    }
  },

  {
    id: 'collection_3',
    slug: 'sweet-moments',

    title: 'Sweet Moments',
    subtitle: 'Luxury chocolates & confectioneries.',

    icon: {
      type: 'lucide',
      value: 'candy'
    },

    layout: 'featured',

    featuredProductId: 'prod_15',
    productIds: ['prod_15', 'prod_16', 'prod_17', 'prod_18'],

    active: true,
    priority: 3,

    theme: {
      accent: '#B57A4B',
      gradient: 'bg-gradient-premium'
    }
  }
];