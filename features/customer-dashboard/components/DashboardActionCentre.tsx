import {
  CircleDot
} from 'lucide-react';

import type {
  DashboardActionItem
} from '../contracts/customerDashboardTypes';

import {
  DashboardActionCard
} from './DashboardActionCard';

type DashboardActionCentreProps = {
  items: DashboardActionItem[];
};

export function DashboardActionCentre({
  items
}: DashboardActionCentreProps) {
  const attentionCount =
    items.filter(
      item =>
        item.requiresAttention
    ).length;

  return (
    <aside className="flex h-full min-h-72 flex-col rounded-2xl border border-border/60 bg-card/85 p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-primary">
            Action centre
          </p>

          <h2 className="mt-1 text-xl font-bold">
            What needs you now
          </h2>

          <p className="mt-1 text-sm leading-5 text-muted-foreground">
            The next useful actions from this workspace.
          </p>
        </div>

        <span className="flex h-10 shrink-0 items-center gap-2 rounded-xl border border-border/60 bg-background/70 px-3 text-xs font-semibold">
          <CircleDot className="size-4 text-emerald-500" />

          {attentionCount > 0
            ? `${attentionCount} attention`
            : 'Up to date'}
        </span>
      </div>

      <div className="mt-4 grid flex-1 gap-2.5">
        {items.map(item => (
          <DashboardActionCard
            key={item.id}
            item={item}
          />
        ))}
      </div>
    </aside>
  );
}
