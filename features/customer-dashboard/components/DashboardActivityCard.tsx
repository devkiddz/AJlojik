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

type DashboardActivityCardProps = {
  items: DashboardActivityItem[];
};

export function DashboardActivityCard({
  items
}: DashboardActivityCardProps) {
  return (
    <article className="flex flex-col rounded-2xl border border-border/60 bg-card/90 p-4 shadow-sm sm:p-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-primary">
            Activity
          </p>

          <h3 className="mt-1 text-lg font-bold">
            Recently changed
          </h3>

          <p className="mt-1 text-sm leading-5 text-muted-foreground">
            Orders and restored shopping moments in time order.
          </p>
        </div>

        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-violet-500/10 text-violet-700 dark:text-violet-300">
          <Clock3 className="size-4.5" />
        </span>
      </header>

      {items.length > 0 ? (
        <div className="mt-4 grid gap-2">
          {items.slice(0, 4).map(
            item => (
              <DashboardActivityRow
                key={item.id}
                item={item}
              />
            )
          )}
        </div>
      ) : (
        <div className="mt-4 grid place-items-center rounded-xl border border-dashed border-border/65 bg-muted/25 p-5 text-center">
          <div>
            <p className="text-sm font-semibold">
              Activity will appear here
            </p>

            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Meaningful commerce moments will become part of this timeline.
            </p>
          </div>
        </div>
      )}

      <Link
        href="/orders"
        className="mt-4 inline-flex items-center justify-end gap-1 text-xs font-semibold transition hover:text-primary">
        View order history
        <ArrowRight className="size-3.5" />
      </Link>
    </article>
  );
}
