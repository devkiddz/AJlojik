'use client';

import { useEffect, useState } from 'react';

import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import { useIdentity } from '@/providers/IdentityProvider';

import StoreExperienceSidebar from './StoreExperienceSidebar';

const DESKTOP_DISCOVERY_QUERY = '(min-width: 1024px)';

export default function GlobalDiscoveryHost() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useIdentity();
  const [collapsed, setCollapsed] = useState(() => !pathname.startsWith('/account'));
  const [discoveryEnabled, setDiscoveryEnabled] = useState(true);
  const [desktopViewport, setDesktopViewport] = useState<boolean | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_DISCOVERY_QUERY);
    const synchronizeViewport = () => setDesktopViewport(mediaQuery.matches);

    synchronizeViewport();
    mediaQuery.addEventListener('change', synchronizeViewport);

    return () => mediaQuery.removeEventListener('change', synchronizeViewport);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    void fetch('/api/account/experience-settings')
      .then(response => response.ok ? response.json() : null)
      .then(data => {
        if (active && data?.profile) setDiscoveryEnabled(data.profile.discoveryEnabled !== false);
      });
    return () => { active = false; };
  }, [isAuthenticated]);

  const ownsIntegratedDiscovery = pathname === '/store' || pathname === '/sign-in' || pathname === '/sign-up' || pathname === '/adminlogin/login';

  // These routes render their own integrated Discovery Hub. Mounting the
  // global host as well creates two desktop rails sharing the same edge.
  if (pathname === '/' || ownsIntegratedDiscovery || !discoveryEnabled || desktopViewport === null) return null;

  if (!desktopViewport) {
    return (
      <StoreExperienceSidebar
        tier={user?.tier ?? 'guest'}
        authenticated={isAuthenticated}
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        mobileOnly
      />
    );
  }

  return (
    <div className={cn(
      'fixed bottom-3 right-3 top-[5.75rem] z-40 overflow-hidden rounded-3xl border border-border/60 bg-background shadow-2xl transition-[width] duration-300',
      collapsed ? 'w-[5.5rem]' : 'w-[28rem] xl:w-[31rem]'
    )}>
      <StoreExperienceSidebar
        tier={user?.tier ?? 'guest'}
        authenticated={isAuthenticated}
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        desktopOnly
      />
    </div>
  );
}
