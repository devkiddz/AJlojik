'use client';

import { Compass, House, ShoppingBag, ShoppingCart, UserRound } from 'lucide-react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

type MobileNavigationItem = {
  id: string;
  label: string;
  href: string;
  icon: typeof House;
  match: (pathname: string) => boolean;
};

const navigationItems: MobileNavigationItem[] = [
  {
    id: 'home',
    label: 'Home',
    href: '/',
    icon: House,
    match: pathname => pathname === '/'
  },

  {
    id: 'store',
    label: 'Store',
    href: '/store',
    icon: ShoppingBag,
    match: pathname => pathname === '/store' || pathname.startsWith('/store/')
  },

  {
    id: 'discover',
    label: 'Discover',
    href: '/discover',
    icon: Compass,
    match: pathname => pathname === '/discover' || pathname.startsWith('/discover/')
  },

  {
    id: 'cart',
    label: 'Cart',
    href: '/cart',
    icon: ShoppingCart,
    match: pathname => pathname === '/cart' || pathname.startsWith('/cart/')
  },

  {
    id: 'account',
    label: 'Account',
    href: '/account',
    icon: UserRound,
    match: pathname => pathname === '/account' || pathname.startsWith('/account/')
  }
];

export default function MobileBottomNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main mobile navigation"
      className="fixed inset-x-3 bottom-0 z-50 w-full bg-background/50 p-1.5 shadow-2xl backdrop-blur-xl lg:hidden">
      <div className="grid grid-cols-5 gap-1">
        {navigationItems.map(item => {
          const Icon = item.icon;
          const active = item.match(pathname);

          return (
            <Link
              key={item.id}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-full px-1 text-[10px] font-medium transition',
                active ? 'font-bold' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}>
              <Icon className="size-6" />

              <span>{item.label}</span>

              {active ? (
                <span className="absolute bottom-1 h-0.5 w-4 rounded-full bg-current opacity-70" />
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
