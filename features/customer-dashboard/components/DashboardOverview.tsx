import {
  Heart,
  ReceiptText,
  ShoppingBag,
  Star,
  WalletCards
} from 'lucide-react';

import type {
  ReactNode
} from 'react';

import type {
  CommercePulseItem
} from '../contracts/customerDashboardTypes';

import {
  DashboardOverviewCard
} from './DashboardOverviewCard';

const compactCurrencyFormatter =
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    notation: 'compact',
    maximumFractionDigits: 1
  });

type DashboardOverviewProps = {
  items: CommercePulseItem[];
  totalSpent: number;
};

export function DashboardOverview({
  items,
  totalSpent
}: DashboardOverviewProps) {
  const icons: Record<
    CommercePulseItem['id'],
    ReactNode
  > = {
    purchases: <ReceiptText />,
    saved: <Heart />,
    cart: <ShoppingBag />,
    reviews: <Star />
  };

  return (
    <aside className="flex h-full min-h-72 flex-col rounded-2xl border border-border/60 bg-card/85 p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-primary">
            Overview
          </p>

          <h2 className="mt-1 text-xl font-bold">
            Your commerce at a glance
          </h2>

          <p className="mt-1 text-sm leading-5 text-muted-foreground">
            The essentials from your active workspace.
          </p>
        </div>

        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <WalletCards className="size-4.5" />
        </span>
      </div>

      <div className="mt-4 rounded-xl bg-slate-950 p-4 text-white shadow-sm">
        <p className="text-xs text-white/60">
          Recorded purchases
        </p>

        <p className="mt-1 text-2xl font-bold">
          {compactCurrencyFormatter.format(
            totalSpent
          )}
        </p>

        <p className="mt-1 text-xs leading-5 text-white/55">
          Paid orders recorded in this workspace.
        </p>
      </div>

      <div className="mt-3 grid flex-1 grid-cols-2 gap-2.5">
        {items.map(item => (
          <DashboardOverviewCard
            key={item.id}
            item={item}
            icon={icons[item.id]}
          />
        ))}
      </div>
    </aside>
  );
}
