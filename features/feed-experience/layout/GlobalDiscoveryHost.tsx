'use client';

import { useEffect, useState } from 'react';

import { usePathname } from 'next/navigation';

import DesktopDiscoveryRail from '@/components/discovery-hub-panel/DesktopDiscoveryRail';
import MobileDiscoverySheetHost from '@/components/discovery-hub-panel/MobileDiscoverySheetHost';

import { discoveryRegistry } from '@/data/discoveryHubData';

import { isCustomerExperienceRoute } from '@/features/customer-experience/customerExperienceRoutes';
import CustomerExperienceNavigationPortal from '@/features/experience-stack/CustomerExperienceNavigationPortal';
import { ExperienceStackProvider } from '@/features/experience-stack/ExperienceStackProvider';
import { useWorkspace } from '@/features/workspace';

import { GlobalExperienceRuntime } from '@/features/feed-experience/runtime';

import GlobalCustomerFeedPortal from './GlobalCustomerFeedPortal';

import { cn } from '@/lib/utils';

const DESKTOP_DISCOVERY_QUERY = '(min-width: 1024px)';

type DiscoverySurfaceProps = {
  pathname: string;
  workspaceId: string;
  desktopViewport: boolean;
};

function DiscoverySurface({ pathname, workspaceId, desktopViewport }: DiscoverySurfaceProps) {
  const [collapsed, setCollapsed] = useState(() => !pathname.startsWith('/account'));

  return (
    <GlobalExperienceRuntime>
      <ExperienceStackProvider workspaceId={workspaceId}>
        <CustomerExperienceNavigationPortal />
        <GlobalCustomerFeedPortal />

        {desktopViewport ? (
          <div
            className={cn(
              'sticky top-[calc(var(--app-navbar-height)+0.75rem)] z-40 hidden h-[calc(100dvh-var(--app-navbar-height)-1.5rem)] shrink-0 overflow-hidden py-3 pl-0 pr-3 transition-[width] duration-300 lg:block',
              collapsed ? 'w-20' : 'w-[28rem] xl:w-[31rem]'
            )}>
            <DesktopDiscoveryRail
              registry={discoveryRegistry}
              collapsed={collapsed}
              onCollapsedChange={setCollapsed}
            />
          </div>
        ) : (
          <MobileDiscoverySheetHost />
        )}
      </ExperienceStackProvider>
    </GlobalExperienceRuntime>
  );
}

export default function GlobalDiscoveryHost() {
  const pathname = usePathname();
  const { activeWorkspace } = useWorkspace();

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

  if (!isCustomerExperienceRoute(pathname) || desktopViewport === null) {
    return null;
  }

  return (
    <DiscoverySurface
      key={desktopViewport ? 'desktop' : 'mobile'}
      pathname={pathname}
      workspaceId={activeWorkspace?.id ?? 'guest-live'}
      desktopViewport={desktopViewport}
    />
  );
}
