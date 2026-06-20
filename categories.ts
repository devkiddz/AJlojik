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
    image: 'https://images.unsplash.com/photo-1577538928305-3807c3993047?q=80&w=1170&auto=format&fit=crop',
    subcategories: [
      { label: 'New Arrivals', slug: 'new-arrivals' },
      { label: 'Best Sellers', slug: 'best-sellers' },
      { label: 'Trending Now', slug: 'trending' }
    ]
  },
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
];