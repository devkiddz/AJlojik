'use client';

import { useEffect, useState } from 'react';

import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

import { useIdentity } from '@/providers/IdentityProvider';

import StoreExperienceSidebar from './StoreExperienceSidebar';

const DESKTOP_DISCOVERY_QUERY = '(min-width: 1024px)';

function routeUsesIntegratedDiscovery(pathname: string): boolean {
  return pathname === '/store' || pathname.startsWith('/store/');
}

function routeHidesDiscovery(pathname: string): boolean {
  return (
    pathname === '/' ||
    pathname === '/sign-in' ||
    pathname === '/sign-up' ||
    pathname.startsWith('/adminlogin')
  );
}

export default function GlobalDiscoveryHost() {
  const pathname = usePathname();

  const { user, isAuthenticated } = useIdentity();

  const [collapsed, setCollapsed] = useState(() => !pathname.startsWith('/account'));

  const [discoveryEnabled, setDiscoveryEnabled] = useState(true);

  const [desktopViewport, setDesktopViewport] = useState<boolean | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_DISCOVERY_QUERY);

    const synchronizeViewport = () => {
      setDesktopViewport(mediaQuery.matches);
    };

    synchronizeViewport();

    mediaQuery.addEventListener('change', synchronizeViewport);

    return () => {
      mediaQuery.removeEventListener('change', synchronizeViewport);
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let active = true;

    void fetch('/api/account/experience-settings')
      .then(response => (response.ok ? response.json() : null))
      .then(data => {
        if (active && data?.profile) {
          setDiscoveryEnabled(data.profile.discoveryEnabled !== false);
        }
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  const usesIntegratedDiscovery = routeUsesIntegratedDiscovery(pathname);

  const hidesDiscovery = routeHidesDiscovery(pathname);

  /*
   * Home and authentication surfaces do not
   * render a Discovery Hub.
   *
   * Store owns its richer Feed-connected Hub,
   * so the shared host must not mount there.
   */
  if (hidesDiscovery || usesIntegratedDiscovery || !discoveryEnabled || desktopViewport === null) {
    return null;
  }

  /*
   * Mobile does not reserve a visible column.
   * StoreExperienceSidebar mounts only the
   * portalled mobile sheet host.
   */
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

  /*
   * Desktop Hub now occupies a real grid
   * column. It is sticky, not fixed, so it
   * cannot cover Account, Cart, Checkout,
   * Tracking or Dashboard content.
   */
  return (
    <aside
      aria-label="Discovery Hub"
      className={cn(
        'sticky top-[5.75rem]',
        'mr-3 mt-3',
        'hidden shrink-0',
        'overflow-hidden',
        'rounded-3xl',
        'border border-border/60',
        'bg-background',
        'shadow-xl',
        'transition-[width] duration-300',
        'lg:block',
        'lg:h-[calc(100dvh-6.5rem)]',

        collapsed ? 'w-64' : 'w-[28rem] xl:w-[31rem]'
      )}>
      <StoreExperienceSidebar
        tier={user?.tier ?? 'guest'}
        authenticated={isAuthenticated}
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        desktopOnly
      />
    </aside>
  );
}
