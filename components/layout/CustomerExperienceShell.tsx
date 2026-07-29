'use client';

import { Suspense, type ReactNode } from 'react';

import { usePathname } from 'next/navigation';

import GlobalDiscoveryHost from '@/features/feed-experience/layout/GlobalDiscoveryHost';

import { isCustomerExperienceRoute } from '@/features/customer-experience/customerExperienceRoutes';

type CustomerExperienceShellProps = {
  children: ReactNode;
};

export default function CustomerExperienceShell({ children }: CustomerExperienceShellProps) {
  const pathname = usePathname();

  if (!isCustomerExperienceRoute(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="min-w-0 flex-1 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
      <div className="min-w-0">{children}</div>

      <Suspense fallback={null}>
        <GlobalDiscoveryHost />
      </Suspense>
    </div>
  );
}
