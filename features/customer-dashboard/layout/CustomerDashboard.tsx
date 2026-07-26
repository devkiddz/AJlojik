'use client';

import { useMemo, useState } from 'react';

import { DashboardAIControl } from '../components/ai/DashboardAIControl';
import {
  DashboardActivityHub,
  DashboardActivityHubSheet,
  DashboardActivityHubTrigger
} from '../components/hub';
import { ExperienceJourneyRail } from '../components/journey/ExperienceJourneyRail';
import { DashboardProductExperiences } from '../components/products/DashboardProductExperiences';
import { DashboardWelcome } from '../components/welcome/DashboardWelcome';
import { useCustomerDashboard } from '../providers/CustomerDashboardProvider';
import { resolveCustomerDashboardView } from '../view/resolveCustomerDashboardView';

export default function CustomerDashboard() {
  const { dashboard } = useCustomerDashboard();
  const [hubOpen, setHubOpen] = useState(false);

  const view = useMemo(
    () => resolveCustomerDashboardView(dashboard),
    [dashboard]
  );

  return (
    <main className="h-[calc(100dvh-5rem)] min-h-0 overflow-y-auto overscroll-contain bg-muted/20">
      <div className="mx-auto grid w-full max-w-[96rem] gap-4 px-3 py-4 sm:px-5 sm:py-5 lg:px-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-4">
          <DashboardWelcome
            identity={view.identity}
            membership={view.membership}
            onOpenHub={() => setHubOpen(true)}
          />

          <ExperienceJourneyRail
            recentProducts={view.recentProducts}
            history={view.history}
            orders={view.orders}
            activeDeliveries={view.activeDeliveries}
            cartItems={view.cartItems}
            cartQuantity={view.cartQuantity}
            cartSubtotal={view.cartSubtotal}
          />

          <DashboardProductExperiences
            suggestedProducts={view.suggestedProducts}
            suggestedHref={view.suggestedHref}
            pickedProducts={view.pickedProducts}
            pickedHref={view.pickedHref}
          />

          <div className="xl:hidden">
            <DashboardAIControl compact />
          </div>

          <div className="h-24 lg:h-12" />
        </div>

        <aside className="hidden xl:block">
          <div className="sticky top-4 space-y-4">
            <DashboardActivityHub view={view} />
            <DashboardAIControl />
          </div>
        </aside>
      </div>

      <DashboardActivityHubTrigger
        onClick={() => setHubOpen(true)}
      />

      <DashboardActivityHubSheet
        open={hubOpen}
        onOpenChange={setHubOpen}
        view={view}
      />
    </main>
  );
}
