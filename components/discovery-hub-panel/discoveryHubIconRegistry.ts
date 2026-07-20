import type {
  ComponentType
} from 'react';

import {
  Award,
  BadgeCheck,
  BedDouble,
  BookOpenCheck,
  Boxes,
  Brain,
  CalendarCheck,
  CircleHelp,
  ClipboardCheck,
  Compass,
  CreditCard,
  Gift,
  Heart,
  House,
  Package,
  PackageCheck,
  ReceiptText,
  Repeat2,
  Search,
  Settings,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Store,
  Tags,
  TrendingUp,
  Truck,
  UserRound,
  UtensilsCrossed,
  Wrench
} from 'lucide-react';

import type {
  DiscoveryIconKey
} from './discoveryHubTypes';

export type DiscoveryIconComponent =
  ComponentType<{
    className?: string;
  }>;

const discoveryHubIconRegistry =
  new Map<
    DiscoveryIconKey,
    DiscoveryIconComponent
  >([
    [
      'home',
      House
    ],
    [
      'overview',
      Compass
    ],
    [
      'shopping',
      ShoppingBag
    ],
    [
      'cart',
      ShoppingCart
    ],
    [
      'orders',
      Package
    ],
    [
      'delivery',
      Truck
    ],
    [
      'tracking',
      PackageCheck
    ],
    [
      'rewards',
      Award
    ],
    [
      'membership',
      BadgeCheck
    ],
    [
      'ai',
      Sparkles
    ],
    [
      'intelligence',
      Brain
    ],
    [
      'settings',
      Settings
    ],
    [
      'account',
      UserRound
    ],
    [
      'wishlist',
      Heart
    ],
    [
      'recent',
      TrendingUp
    ],
    [
      'recommendation',
      Sparkles
    ],
    [
      'search',
      Search
    ],
    [
      'checkout',
      CreditCard
    ],
    [
      'receipt',
      ReceiptText
    ],
    [
      'support',
      CircleHelp
    ],
    [
      'store',
      Store
    ],
    [
      'categories',
      Tags
    ],
    [
      'inventory',
      Boxes
    ],
    [
      'booking',
      CalendarCheck
    ],
    [
      'rooms',
      BedDouble
    ],
    [
      'dining',
      UtensilsCrossed
    ],
    [
      'fashion',
      Shirt
    ],
    [
      'trade-in',
      Repeat2
    ],
    [
      'repairs',
      Wrench
    ],
    [
      'reservations',
      BookOpenCheck
    ],
    [
      'tasks',
      ClipboardCheck
    ],
    [
      'gifts',
      Gift
    ]
  ]);

export function registerDiscoveryHubIcon(
  key: DiscoveryIconKey,
  icon: DiscoveryIconComponent
): void {
  discoveryHubIconRegistry.set(
    key,
    icon
  );
}

export function resolveDiscoveryHubIcon(
  key: DiscoveryIconKey
): DiscoveryIconComponent {
  return (
    discoveryHubIconRegistry.get(
      key
    ) ??
    Compass
  );
}
