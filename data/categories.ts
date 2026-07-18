import {
  Logs,
  Sparkles,
  BadgePercent,
  Wine,
  UtensilsCrossed,
  PartyPopper,
  CakeSlice,
} from 'lucide-react';

export const categories = [
  {
    id: 'all',
    slug: 'all',
    label: 'All Products',
    icon: Logs,
    accentColor: '#64748b', // slate

    image:
      '/assets/Image-1.png',

    coverImages: [
      '/assets/Image-2.png',
      '/assets/Image-3.png',
      '/assets/Image-4.jpg',
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
      '/assets/image-6.jpg',

    coverImages: [
      '/assets/image-8.jpg',
      '/assets/image-9.jpg',
      '/assets/image-10.jpg',
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
      '/assets/promos/weekend-discount.png',

    coverImages: [
      '/assets/promos/on-sale-now.png',
      '/assets/promos/hot-picks.png',
      '/assets/promos/best-sellers.png',
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
      '/assets/collections/tonights-pour-banner.png',

    coverImages: [
      '/products/moet-chandon-imperial_lg.jpg',
      '/products/hennessy_lg.jpg',
      '/products/martellblue_lg.jpg',
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
      '/products/Digital_Air_Fryer.jpg',

    coverImages: [
      '/products/KitchenAid_Artisan_Stand_Mixer.jpg',
      '/products/Nespresso_Vertuo_Coffee_Machine.jpg',
      '/assets/collections/weekend-indulgence-banner.png',
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
  id: 'confectioneries',
  slug: 'confectioneries',
  label: 'Confectioneries',
  icon: CakeSlice,
  accentColor: '#e11d48',

  image:
    '/products/Chocolate_Fudge_Cake.jpg',

  coverImages: [
    '/products/Chocolate_Fudge_Cake.jpg',
    '/products/red_velvet_celebration_cake.jpg',
    '/assets/collections/sweet-moments-banner.png',
  ],

  shortDescription:
    'Fresh cakes, desserts and celebration treats.',

  description:
    'Discover premium cakes, cupcakes, pastries and desserts prepared for birthdays, gatherings and everyday indulgence.',

  subcategories: [
    { label: 'Cakes', slug: 'cakes' },
    { label: 'Cupcakes', slug: 'cupcakes' },
    { label: 'Desserts', slug: 'desserts' },
  ],
},

  {
    id: 'party-plans',
    slug: 'party-plans',
    label: 'Party Plans',
    icon: PartyPopper,
    accentColor: '#ec4899', // pink

    image:
      '/products/Birthday_Party_Package.jpg',

    coverImages: [
      '/products/Birthday_Party_Package.jpg',
      '/products/Premium_Backyard_BBQ_Package.jpg',
      '/assets/collections/weekend-indulgence-banner.png',
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