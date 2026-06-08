import {
  Sparkles,
  BadgePercent,
  Wine,
  UtensilsCrossed,
  CakeSlice,
  Beef,
  PartyPopper,
  Coffee,
} from 'lucide-react';

export const categories = [
  {
    id: 'featured',
    slug: 'featured',
    label: 'Featured',
    icon: Sparkles,
    image: 'https://images.unsplash.com/photo-1660627254751-792e5dcf3e1c?q=80&w=1170&auto=format&fit=crop',
    subcategories: [
      { label: 'New Arrivals', slug: 'new-arrivals' },
      { label: 'Best Sellers', slug: 'best-sellers' },
      { label: 'Trending Now', slug: 'trending' }
    ]
  },
  {
    id: 'deals',
    slug: 'deals',
    label: 'Deals',
    icon: BadgePercent,
    image: 'https://plus.unsplash.com/premium_photo-1684923611429-11861669297f?q=80&w=1170&auto=format&fit=crop',
    subcategories: [
      { label: 'Flash Sales', slug: 'flash-sales' },
      { label: 'Clearance', slug: 'clearance' },
      { label: 'Buy 1 Get 1', slug: 'bogo' }
    ]
  },
  {
    id: 'wines',
    slug: 'wines',
    label: 'Wines & Liquors',
    icon: Wine,
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=1200&auto=format&fit=crop',
    subcategories: [
      { label: 'Red Wine', slug: 'red-wine' },
      { label: 'White Wine', slug: 'white-wine' },
      { label: 'Champagne', slug: 'champagne' },
      { label: 'Spirits & Whiskey', slug: 'spirits' }
    ]
  },
  {
    id: 'bbq',
    slug: 'bbq',
    label: 'BBQ Chicken',
    icon: Beef,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop',
    subcategories: [
      { label: 'Grilled Chicken', slug: 'grilled-chicken' },
      { label: 'BBQ Wings', slug: 'bbq-wings' },
      { label: 'Sides & Fries', slug: 'bbq-sides' }
    ]
  },
  {
    id: 'confectioneries',
    slug: 'confectioneries',
    label: 'Confectioneries',
    icon: CakeSlice,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1200&auto=format&fit=crop',
    subcategories: [
      { label: 'Cakes & Slices', slug: 'cakes' },
      { label: 'Pastries', slug: 'pastries' },
      { label: 'Donuts', slug: 'donuts' },
      { label: 'Chocolates', slug: 'chocolates' }
    ]
  },
  {
    id: 'kitchen',
    slug: 'kitchen',
    label: 'Kitchen & Meals',
    icon: UtensilsCrossed,
    image: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?q=80&w=1200&auto=format&fit=crop',
    subcategories: [
      { label: 'Hot Platters', slug: 'hot-platters' },
      { label: 'Finger Foods', slug: 'finger-foods' },
      { label: 'Salads', slug: 'salads' }
    ]
  },
  {
    id: 'party-plans',
    slug: 'party-plans',
    label: 'Party Plans',
    icon: PartyPopper,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=1200&auto=format&fit=crop',
    subcategories: [
      { label: 'Birthday Packs', slug: 'birthday-packs' },
      { label: 'Corporate Platters', slug: 'corporate' },
      { label: 'Custom Event Catering', slug: 'custom-catering' }
    ]
  },
  {
    id: 'drinks',
    slug: 'drinks',
    label: 'Soft Drinks',
    icon: Coffee,
    image: 'https://images.unsplash.com/photo-1510130387422-82bed34b37e9?q=80&w=1200&auto=format&fit=crop',
    subcategories: [
      { label: 'Sodas & Colas', slug: 'sodas' },
      { label: 'Fresh Juices', slug: 'juices' },
      { label: 'Energy Drinks', slug: 'energy-drinks' },
      { label: 'Bottled Water', slug: 'water' }
    ]
  }
];