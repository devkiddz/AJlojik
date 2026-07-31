// data/promos.ts

export type PromoType = 'discount' | 'sale' | 'hot' | 'best-selling';

export type PromoLayout = 'banner' | 'card' | 'shelf';

export type Promo = {
  
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;

  type: PromoType;
  layout: PromoLayout;

  badge: string;
  discountPercent?: number;

  startsAt?: string;
  endsAt?: string;

  terms?: string[];

  productIds: string[];
  image?: string;
  href?: string;

  active: boolean;
  priority: number;

  theme?: {
    accent: string;
    gradient?: string;
  };
};


export const promos: Promo[] = [
  {
    id: 'promo_1',
    slug: 'weekend-discount',

    title: 'Weekend Discount',
    subtitle: 'Save more on selected premium drinks.',
    description: 'Special weekend offers on wines, spirits and party essentials.',

    type: 'discount',
    layout: 'card',

    badge: '20% OFF',
    discountPercent: 20,

    productIds: ['prod_1', 'prod_2', 'prod_8', 'prod_9'],

    image: '/assets/promos/weekend-discount.png',
    href: '/promos/weekend-discount',

    active: true,
    priority: 1,

    theme: {
      accent: '#D4AF37',
      gradient: 'bg-gradient-brand'
    },

    startsAt: '2026-07-01T00:00:00',
    endsAt: '2026-07-31T23:59:59',
    terms: [
      'Valid while stock lasts.',
      'Discount applies to selected products only.',
      'Promo may end earlier without notice.'
    ]
  },

  {
    id: 'promo_2',
    slug: 'on-sale-now',

    title: 'On Sale Now',
    subtitle: 'Limited-time offers you should not miss.',

    type: 'sale',
    layout: 'card',

    badge: 'ON SALE',

    productIds: ['prod_3', 'prod_4', 'prod_10', 'prod_11'],

    image: '/assets/promos/on-sale-now.png',
    href: '/promos/on-sale-now',

    active: true,
    priority: 2,

    theme: {
      accent: '#E11D48',
      gradient: 'bg-gradient-wine'
    },

    startsAt: '2026-07-01T00:00:00',
    endsAt: '2026-07-31T23:59:59',
    terms: [
    'Valid while stock lasts.',
    'Discount applies to selected products only.',
    'Promo may end earlier without notice.'
    ]
  },

  {
    id: 'promo_3',
    slug: 'hot-picks',

    title: 'Hot Picks',
    subtitle: 'Trending products customers are checking out.',

    type: 'hot',
    layout: 'card',

    badge: 'HOT',

    productIds: ['prod_5', 'prod_8', 'prod_12', 'prod_15'],

    image: '/assets/promos/hot-picks.png',
    href: '/promos/hot-picks',

    active: true,
    priority: 3,

    theme: {
      accent: '#F97316',
      gradient: 'bg-gradient-premium'
    },

    startsAt: '2026-07-01T00:00:00',
    endsAt: '2026-07-31T23:59:59',
    terms: [
      'Valid while stock lasts.',
      'Discount applies to selected products only.',
      'Promo may end earlier without notice.'
]
  },

  {
    id: 'promo_4',
    slug: 'best-sellers',

    title: 'Best Sellers',
    subtitle: 'Products people love buying again and again.',

    type: 'best-selling',
    layout: 'card',

    badge: 'BEST SELLER',

    productIds: ['prod_1', 'prod_8', 'prod_15', 'prod_16'],

    image: '/assets/promos/best-sellers.png',
    href: '/promos/best-sellers',

    active: true,
    priority: 4,

    theme: {
      accent: '#22C55E',
      gradient: 'bg-gradient-brand'
    },

    startsAt: '2026-07-01T00:00:00',
    endsAt: '2026-07-31T23:59:59',
    terms: [
      'Valid while stock lasts.',
      'Best-selling products may vary by demand.',
      'Promo may end earlier without notice.'
    ]
  }
];