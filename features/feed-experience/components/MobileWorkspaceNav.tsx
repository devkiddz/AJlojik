'use client';

import { Compass, House, Package, ShoppingCart, UserRound } from 'lucide-react';

import { useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';

export type MobileWorkspaceId = 'feed' | 'hub';

type MobileWorkspaceNavProps = {
  activeWorkspace: MobileWorkspaceId;

  onWorkspaceChange: (workspace: MobileWorkspaceId) => void;
};

export function MobileWorkspaceNav({ activeWorkspace, onWorkspaceChange }: MobileWorkspaceNavProps) {
  const router = useRouter();

  const navigationItems = [
    {
      id: 'feed',
      label: 'Home',
      icon: House,

      action: () => onWorkspaceChange('feed')
    },

    {
      id: 'hub',
      label: 'Discover',
      icon: Compass,

      action: () => onWorkspaceChange('hub')
    },

    {
      id: 'orders',
      label: 'Orders',
      icon: Package,

      action: () => router.push('/orders')
    },

    {
      id: 'cart',
      label: 'Cart',
      icon: ShoppingCart,

      action: () => router.push('/cart')
    },

    {
      id: 'profile',
      label: 'Profile',
      icon: UserRound,

      action: () => router.push('/profile')
    }
  ] as const;

  return (
    <nav
      aria-label="Mobile workspace navigation"
      className="fixed inset-x-3 bottom-3 z-50 rounded-2xl border border-border/70 bg-background/90 p-1.5 shadow-2xl backdrop-blur-xl lg:hidden">
      <div className="grid grid-cols-5 gap-1">
        {navigationItems.map(item => {
          const Icon = item.icon;

          const active =
            item.id === 'feed'
              ? activeWorkspace === 'feed'
              : item.id === 'hub'
                ? activeWorkspace === 'hub'
                : false;

          return (
            <button
              key={item.id}
              type="button"
              onClick={item.action}
              className={cn(
                'flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-medium transition',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}>
              <Icon className="size-4" />

              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
