'use client';

import { Compass, House, ShoppingBag, ShoppingCart, UserRound, type LucideIcon } from 'lucide-react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

type RouteNavigationItem = {
  type: 'route';
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
};

type ActionNavigationItem = {
  type: 'action';
  id: string;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
};

type MobileNavigationItem = RouteNavigationItem | ActionNavigationItem;

type MobileBottomNavigationProps = {
  onOpenDiscovery: () => void;
};

export default function MobileBottomNavigation({ onOpenDiscovery }: MobileBottomNavigationProps) {
  const pathname = usePathname();

  const navigationItems: MobileNavigationItem[] = [
    {
      type: 'route',
      id: 'home',
      label: 'Home',
      href: '/',
      icon: House
    },
    {
      type: 'route',
      id: 'store',
      label: 'Store',
      href: '/store',
      icon: ShoppingBag
    },
    {
      type: 'action',
      id: 'discover',
      label: 'Discover',
      icon: Compass,
      onClick: onOpenDiscovery
    },
    {
      type: 'route',
      id: 'cart',
      label: 'Cart',
      href: '/cart',
      icon: ShoppingCart
    },
    {
      type: 'route',
      id: 'account',
      label: 'Account',
      href: '/account',
      icon: UserRound
    }
  ];

  return (
    <nav
      aria-label="Main mobile navigation"
      className="fixed w-full inset-x-3 bottom-0 z-[60] lg:hidden bg-background/30 dark:bg-black/[0.15] backdrop-blur-xl border border-white/[0.08] dark:border-white/[0.04] shadow-[0_8px_32px_0_rgba(0,0,0,0.12)] saturate-[180%] backdrop-saturate-[180%]">
      <div className="grid grid-cols-5 gap-1">
        {navigationItems.map(item => {
          const Icon = item.icon;

          if (item.type === 'action') {
            return (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-muted-foreground transition hover:text-foreground">
                <Icon className="size-5" />
                <span className="text-[10px]">{item.label}</span>
              </button>
            );
          }

          const active =
            item.href === '/'
              ? pathname === '/'
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.id}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-muted-foreground transition',
                active && 'font-bold text-primary'
              )}>
              <Icon className={cn('size-5 transition-all', active && 'size-6 stroke-[2.5]')} />

              <span className={cn('text-[10px]', active && 'font-bold')}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
