import Link from 'next/link';

import {
  ArrowRight,
  PackageCheck
} from 'lucide-react';

import type {
  CommerceOrder
} from '../contracts/customerDashboardTypes';

import {
  DashboardOrderCard
} from './DashboardOrderCard';

type DashboardOrdersCardProps = {
  orders: CommerceOrder[];
};

export function DashboardOrdersCard({
  orders
}: DashboardOrdersCardProps) {
  const visibleOrders =
    orders;

  return (
    <article className="flex flex-col rounded-2xl border border-border/60 bg-card/90 p-4 shadow-sm sm:p-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-primary">
            Orders
          </p>

          <h3 className="mt-1 text-lg font-bold">
            Recent purchases
          </h3>

          <p className="mt-1 text-sm leading-5 text-muted-foreground">
            Payment, product and delivery details from your latest orders.
          </p>
        </div>

        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
          <PackageCheck className="size-4.5" />
        </span>
      </header>

      {visibleOrders.length > 0 ? (
        <div className="mt-4 grid gap-2">
          {visibleOrders.map(
            order => (
              <DashboardOrderCard
                key={order.id}
                order={order}
              />
            )
          )}
        </div>
      ) : (
        <div className="mt-4 grid place-items-center rounded-xl border border-dashed border-border/65 bg-muted/25 p-5 text-center">
          <div>
            <p className="text-sm font-semibold">
              No orders yet
            </p>

            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Your first completed purchase will appear here.
            </p>

            <Link
              href="/store"
              className="mt-3 inline-flex h-9 items-center gap-2 rounded-xl bg-foreground px-3.5 text-xs font-semibold text-background">
              Open store
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      )}

      {visibleOrders.length > 0 ? (
        <Link
          href="/orders"
          className="mt-4 inline-flex items-center justify-end gap-1 text-xs font-semibold transition hover:text-primary">
          View all orders
          <ArrowRight className="size-3.5" />
        </Link>
      ) : null}
    </article>
  );
}
