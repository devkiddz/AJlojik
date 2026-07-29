'use client';

import { useMemo } from 'react';

import { DashboardShoppingLists } from '../components/shopping-lists';
import { ExperienceJourneyRail } from '../components/journey/ExperienceJourneyRail';
import { DashboardProductExperiences } from '../components/products/DashboardProductExperiences';
import { DashboardWelcome } from '../components/welcome/DashboardWelcome';

import { useCustomerDashboard } from '../providers/CustomerDashboardProvider';
import { resolveCustomerDashboardView } from '../view/resolveCustomerDashboardView';

export default function CustomerDashboard() {
  const { dashboard } = useCustomerDashboard();

  const view = useMemo(() => resolveCustomerDashboardView(dashboard), [dashboard]);

  return (
    <main className="h-[calc(100dvh-5rem)] min-h-0 overflow-y-auto overscroll-contain bg-muted/20">
      <div className="mx-auto w-full max-w-[96rem] space-y-4 px-3 py-4 sm:px-5 sm:py-5 lg:px-6">
        <DashboardWelcome identity={view.identity} membership={view.membership} />

        <ExperienceJourneyRail
          recentProducts={view.recentProducts}
          wishlistProducts={view.wishlistProducts}
          history={view.history}
          orders={view.orders}
          activeDeliveries={view.activeDeliveries}
          cartItems={view.cartItems}
          cartQuantity={view.cartQuantity}
          cartSubtotal={view.cartSubtotal}
        />

        <DashboardShoppingLists />

        <DashboardProductExperiences view={view} />

        <div className="h-24 lg:h-12" />
      </div>
    </main>
  );
}
