'use client';

import { useState } from 'react';

import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import { useIdentity } from '@/providers/IdentityProvider';

import StoreExperienceSidebar from './StoreExperienceSidebar';

export default function GlobalDiscoveryHost() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useIdentity();
  const [collapsed, setCollapsed] = useState(true);

  // Home intentionally stays editorial. Store already owns its integrated hub.
  if (pathname === '/' || pathname === '/store') return null;

  return (
    <>
      <StoreExperienceSidebar
        tier={user?.tier ?? 'guest'}
        authenticated={isAuthenticated}
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        mobileOnly
      />

      <div className={cn(
        'fixed bottom-3 right-3 top-[5.75rem] z-40 hidden overflow-hidden rounded-3xl border border-border/60 bg-background shadow-2xl transition-[width] duration-300 lg:block',
        collapsed ? 'w-[5.5rem]' : 'w-[28rem] xl:w-[31rem]'
      )}>
        <StoreExperienceSidebar
          tier={user?.tier ?? 'guest'}
          authenticated={isAuthenticated}
          collapsed={collapsed}
          onCollapsedChange={setCollapsed}
        />
      </div>
    </>
  );
}
