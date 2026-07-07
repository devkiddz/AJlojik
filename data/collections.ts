import tonightBanner from '@/public/assets/collections/tonights-pour-banner.png';
import { Wine, Martini, Candy } from 'lucide-react';

export type CollectionLayout =
  | 'featured'
  | 'carousel'
  | 'grid'
  | 'spotlight';

export type CollectionBanner = {
  eyebrow?: string;
  title: string;
  description?: string;
  image: string;
  ctaLabel?: string;
  href?: string;
};

export type CollectionTheme = {
  accent: string;
  gradient?: string;
};

export type CollectionBannerStyle = 'hero' | 'compact' | 'none';

export type CollectionType = {
  id: string;
  slug: string;

  title: string;
  subtitle?: string;

  icon?: string; // optional icon for the collection, can be a URL or an icon name

  layout: CollectionLayout;
  bannerStyle?: CollectionBannerStyle;

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

    layout: 'featured',
    bannerStyle: 'hero',
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

    productIds: [
      'prod_1',
      'prod_2',
      'prod_3',
      'prod_4',
      'prod_5'
    ],

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

    layout: 'featured',
    bannerStyle: 'none',
    banner: undefined,
    // bannerStyle: 'hero',

    // banner: {
    //   eyebrow: 'Weekend Indulgence',
    //   title: 'Sip, Savor & Unwind',
    //   description:
    //     'Premium wines and spirits carefully selected for relaxing evenings and unforgettable weekends.',
    //   image: '/assets/collections/weekend-indulgence-banner.png',
    //   ctaLabel: 'Explore Collection',
    //   href: '/collections/weekend-indulgence'
    // },

    featuredProductId: 'prod_8',

    productIds: [
      'prod_8',
      'prod_9',
      'prod_10',
      'prod_11',
      'prod_12'
    ],

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

    layout: 'featured',
       bannerStyle: 'none',
    banner: undefined,
    // bannerStyle: 'hero',
    // banner: {
    //   eyebrow: 'Sweet Moments',
    //   title: 'Life is Sweeter with Every Bite',
    //   description:
    //     'Premium chocolates, gourmet treats and elegant gift boxes for birthdays, celebrations and thoughtful gifting.',
    //   image: '/assets/collections/sweet-moments-banner.png',
    //   ctaLabel: 'Discover Treats',
    //   href: '/collections/sweet-moments'
    // },

    featuredProductId: 'prod_15',

    productIds: [
      'prod_15',
      'prod_16',
      'prod_17',
      'prod_18'
    ],

    active: true,
    priority: 3,

    theme: {
      accent: '#B57A4B',
      gradient: 'bg-gradient-premium'
    }
  }
];