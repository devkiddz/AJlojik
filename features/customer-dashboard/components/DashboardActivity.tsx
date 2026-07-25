import Link from 'next/link';

import {
  ArrowRight,
  Clock3
} from 'lucide-react';

import type {
  DashboardActivityItem
} from '../contracts/customerDashboardTypes';

import {
  DashboardActivityRow
} from './DashboardActivityItem';

type DashboardActivityProps = {
  items: DashboardActivityItem[];
};

export function DashboardActivity({
  items
}: DashboardActivityProps) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card/70 p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-primary">
            Recent activity
          </p>

          <h2 className="mt-1 text-xl font-bold">
            What changed recently
          </h2>

          <p className="mt-1 text-sm leading-5 text-muted-foreground">
            Orders and restored experiences in time order.
          </p>
        </div>

        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <Clock3 className="size-4.5" />
        </span>
      </div>

      {items.length > 0 ? (
        <div className="mt-4 grid gap-2 lg:grid-cols-2">
          {items.map(item => (
            <DashboardActivityRow
              key={item.id}
              item={item}
            />
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-border/70 bg-muted/25 p-5 text-center">
          <p className="text-sm font-semibold">
            Activity will appear here
          </p>

          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Orders and meaningful shopping history will become part of this timeline.
          </p>

          <Link
            href="/store"
            className="mt-3 inline-flex h-9 items-center gap-2 rounded-xl bg-foreground px-3.5 text-xs font-semibold text-background">
            Open store
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      )}
    </section>
  );
}
