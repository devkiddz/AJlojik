import type {
  DashboardQuickAction
} from '../contracts/customerDashboardTypes';

import {
  DashboardQuickActionCard
} from './DashboardQuickAction';

type DashboardQuickActionsProps = {
  items: DashboardQuickAction[];
};

export function DashboardQuickActions({
  items
}: DashboardQuickActionsProps) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card/70 p-4 shadow-sm sm:p-5">
      <div>
        <p className="text-sm font-semibold text-primary">
          Quick actions
        </p>

        <h2 className="mt-1 text-xl font-bold">
          Move without searching
        </h2>

        <p className="mt-1 text-sm leading-5 text-muted-foreground">
          Open the places you use most from one panel.
        </p>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
        {items.map(item => (
          <DashboardQuickActionCard
            key={item.id}
            item={item}
          />
        ))}
      </div>
    </section>
  );
}
