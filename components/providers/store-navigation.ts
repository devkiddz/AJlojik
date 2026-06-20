// store-navigation.ts

import {
  Home,
  ShoppingBag,
  Heart,
  MapPin,
  Receipt
} from 'lucide-react';

export const accountLinks = [
  {
    label: 'Orders',
    icon: Receipt,
    href: '/account/orders'
  },
  {
    label: 'Wishlist',
    icon: Heart,
    href: '/account/wishlist'
  },
  {
    label: 'Addresses',
    icon: MapPin,
    href: '/account/addresses'
  }
];

export const storeLinks = [
  {
    label: 'Store Home',
    icon: Home,
    href: '/store'
  },
  {
    label: 'All Products',
    icon: ShoppingBag,
    href: '/store'
  }
];