import {
  Logs,
  Sparkles,
  BadgePercent,
  Wine,
  UtensilsCrossed,
  PartyPopper,
} from 'lucide-react';

export const categories = [
  {
    id: 'all',
    slug: 'all',
    label: 'All Products',
    icon: Logs,
    accentColor: '#64748b', // slate

    image:
      'https://images.unsplash.com/photo-1577538928305-3807c3993047?q=80&w=1170&auto=format&fit=crop',

    coverImages: [
      'https://images.unsplash.com/photo-1556740749-887f6717d7e4?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1600&auto=format&fit=crop',
    ],

    shortDescription: 'Everything you need in one place.',

    description:
      'Browse our complete collection of products, from groceries and beverages to party supplies and premium selections.',

    subcategories: [
      { label: 'New Arrivals', slug: 'new-arrivals' },
      { label: 'Best Sellers', slug: 'best-sellers' },
      { label: 'Trending Now', slug: 'trending' },
    ],
  },

  {
    id: 'featured',
    slug: 'featured',
    label: 'Featured',
    icon: Sparkles,
    accentColor: '#f59e0b', // amber

    image:
      'https://images.unsplash.com/photo-1660627254751-792e5dcf3e1c?q=80&w=1170&auto=format&fit=crop',

    coverImages: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1600&auto=format&fit=crop',
    ],

    shortDescription: 'Handpicked products worth discovering.',

    description:
      'Explore trending, highly rated and editor-selected products curated for quality and customer satisfaction.',

    subcategories: [
      { label: 'New Arrivals', slug: 'new-arrivals' },
      { label: 'Best Sellers', slug: 'best-sellers' },
      { label: 'Trending Now', slug: 'trending' },
    ],
  },

  {
    id: 'deals',
    slug: 'deals',
    label: 'Deals',
    icon: BadgePercent,
    accentColor: '#ef4444', // red

    image:
      'https://plus.unsplash.com/premium_photo-1684923611429-11861669297f?q=80&w=1170&auto=format&fit=crop',

    coverImages: [
      'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1607083206968-13611e3d76db?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1600&auto=format&fit=crop',
    ],

    shortDescription: 'Save more on everyday purchases.',

    description:
      'Discover flash sales, exclusive discounts and limited-time offers across multiple categories.',

    subcategories: [
      { label: 'Flash Sales', slug: 'flash-sales' },
      { label: 'Clearance', slug: 'clearance' },
      { label: 'Buy 1 Get 1', slug: 'bogo' },
    ],
  },

  {
    id: 'wines',
    slug: 'wines',
    label: 'Wines & Liquors',
    icon: Wine,
    accentColor: '#7c3aed', // purple

    image:
      'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=1200&auto=format&fit=crop',

    coverImages: [
      'https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1474722883778-792e7990302f?q=80&w=1600&auto=format&fit=crop',
    ],

    shortDescription: 'Premium wines, spirits and celebratory drinks.',

    description:
      'Browse carefully selected wines, champagnes, whiskies and premium liquors for every occasion.',

    subcategories: [
      { label: 'Red Wine', slug: 'red-wine' },
      { label: 'White Wine', slug: 'white-wine' },
      { label: 'Champagne', slug: 'champagne' },
      { label: 'Spirits & Whiskey', slug: 'spirits' },
    ],
  },

  {
    id: 'kitchen',
    slug: 'kitchen',
    label: 'Kitchen & Meals',
    icon: UtensilsCrossed,
    accentColor: '#22c55e', // green

    image:
      'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?q=80&w=1200&auto=format&fit=crop',

    coverImages: [
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1551218808-94e220e084d2?q=80&w=1600&auto=format&fit=crop',
    ],

    shortDescription: 'Freshly prepared meals and kitchen delights.',

    description:
      'From platters and salads to ready-to-eat meals, enjoy delicious food crafted with quality ingredients.',

    subcategories: [
      { label: 'Hot Platters', slug: 'hot-platters' },
      { label: 'Finger Foods', slug: 'finger-foods' },
      { label: 'Salads', slug: 'salads' },
    ],
  },

  {
    id: 'party-plans',
    slug: 'party-plans',
    label: 'Party Plans',
    icon: PartyPopper,
    accentColor: '#ec4899', // pink

    image:
      'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=1200&auto=format&fit=crop',

    coverImages: [
      'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1600&auto=format&fit=crop',
    ],

    shortDescription:
      'Everything you need for unforgettable celebrations.',

    description:
      'Explore curated party packs, catering options and event essentials for birthdays, weddings and corporate events.',

    subcategories: [
      { label: 'Birthday Packs', slug: 'birthday-packs' },
      { label: 'Corporate Platters', slug: 'corporate' },
      { label: 'Custom Event Catering', slug: 'custom-catering' },
    ],
  },
];