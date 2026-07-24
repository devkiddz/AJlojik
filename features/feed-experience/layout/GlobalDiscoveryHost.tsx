'use client';

import { useEffect, useState } from 'react';

import { usePathname } from 'next/navigation';

import DesktopDiscoveryRail from '@/components/discovery-hub-panel/DesktopDiscoveryRail';

import MobileDiscoverySheetHost from '@/components/discovery-hub-panel/MobileDiscoverySheetHost';

import { discoveryRegistry } from '@/data/discoveryHubData';

import { GlobalExperienceRuntime } from '@/features/feed-experience/runtime';

import { cn } from '@/lib/utils';

import { useIdentity } from '@/providers/IdentityProvider';

const DESKTOP_DISCOVERY_QUERY = '(min-width: 1024px)';

function routeOwnsIntegratedDiscovery(pathname: string): boolean {
  return (
    pathname === '/store' ||
    pathname.startsWith('/store/') ||
    pathname === '/sign-in' ||
    pathname === '/sign-up' ||
    pathname === '/adminlogin/login' ||
    pathname === '/admin' ||
    pathname.startsWith('/admin/')
  );
}

export default function GlobalDiscoveryHost() {
  const pathname = usePathname();

  const { isAuthenticated } = useIdentity();

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

  /**
   * Account is the customer's full commerce workspace,
   * so its Hub opens by default.
   *
   * Other customer routes start compact and remain
   * available without dominating the primary surface.
   */
  useEffect(() => {
    setCollapsed(!pathname.startsWith('/account'));
  }, [pathname]);

  useEffect(() => {
    if (!isAuthenticated) {
      setDiscoveryEnabled(true);

      return;
    }

    let active = true;

    void fetch('/api/account/experience-settings')
      .then(response => (response.ok ? response.json() : null))
      .then(data => {
        if (active && data?.profile) {
          setDiscoveryEnabled(data.profile.discoveryEnabled !== false);
        }
      })
      .catch(() => {
        /**
         * A settings request failure must not remove the
         * customer's primary Discovery capability.
         */
        if (active) {
          setDiscoveryEnabled(true);
        }
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  const ownsIntegratedDiscovery = routeOwnsIntegratedDiscovery(pathname);

  if (pathname === '/' || ownsIntegratedDiscovery || !discoveryEnabled || desktopViewport === null) {
    return null;
  }

  if (!desktopViewport) {
    return (
      <GlobalExperienceRuntime>
        <MobileDiscoverySheetHost />
      </GlobalExperienceRuntime>
    );
  }

  return (
    <GlobalExperienceRuntime>
      <div
        className={cn(
          'fixed bottom-3 right-3 top-[5.75rem] z-40 overflow-hidden rounded-3xl border border-border/60 bg-background shadow-2xl',
          'transition-[width] duration-300',

          collapsed ? 'w-[5.5rem]' : 'w-[28rem] xl:w-[31rem]'
        )}>
        <DesktopDiscoveryRail
          registry={discoveryRegistry}
          collapsed={collapsed}
          onCollapsedChange={setCollapsed}
        />
      </div>
    </GlobalExperienceRuntime>
  );
}
