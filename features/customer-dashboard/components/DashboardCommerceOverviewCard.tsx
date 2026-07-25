import Link from 'next/link';

import {
  ChevronRight,
  Heart,
  LayoutDashboard,
  ReceiptText,
  ShoppingBag,
  WalletCards
} from 'lucide-react';

import {
  cn
} from '@/lib/utils';

import type {
  DashboardSummaryIcon,
  DashboardSummaryItem
} from '../contracts/customerDashboardTypes';

const iconStyles = {
  navy:
    'bg-sky-500/10 text-sky-700 dark:text-sky-300',

  wine:
    'bg-rose-500/10 text-rose-700 dark:text-rose-300',

  gold:
    'bg-amber-500/10 text-amber-700 dark:text-amber-300',

  emerald:
    'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',

  violet:
    'bg-violet-500/10 text-violet-700 dark:text-violet-300',

  neutral:
    'bg-muted text-foreground'
} satisfies Record<
  DashboardSummaryItem['tone'],
  string
>;

function OverviewIcon({
  icon
}: {
  icon: DashboardSummaryIcon;
}) {
  switch (icon) {
    case 'orders':
      return <ReceiptText />;

    case 'spend':
      return <WalletCards />;

    case 'cart':
      return <ShoppingBag />;

    case 'saved':
      return <Heart />;
  }
}

type DashboardCommerceOverviewCardProps = {
  items: DashboardSummaryItem[];
};

export function DashboardCommerceOverviewCard({
  items
}: DashboardCommerceOverviewCardProps) {
  return (
    <article className="flex flex-col rounded-2xl border border-border/60 bg-card/90 p-4 shadow-sm sm:p-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-primary">
            Overview
          </p>

          <h3 className="mt-1 text-lg font-bold">
            Your commerce
          </h3>

          <p className="mt-1 text-sm leading-5 text-muted-foreground">
            A calm summary of what this workspace is holding.
          </p>
        </div>

        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <LayoutDashboard className="size-4.5" />
        </span>
      </header>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {items.map(item => (
          <Link
            key={item.id}
            href={item.href}
            className="group flex min-w-0 flex-col rounded-xl border border-border/55 bg-background/70 p-3 transition hover:border-primary/25 hover:bg-muted/45">
            <span
              className={cn(
                'grid size-8 place-items-center rounded-lg [&_svg]:size-3.5',
                iconStyles[
                  item.tone
                ]
              )}>
              <OverviewIcon
                icon={item.icon}
              />
            </span>

            <span className="mt-3 truncate text-xl font-bold">
              {item.value}
            </span>

            <span className="mt-0.5 text-xs font-semibold">
              {item.label}
            </span>

            <span className="mt-1 line-clamp-1 text-xs text-muted-foreground">
              {item.helper}
            </span>

            <ChevronRight className="mt-auto size-4 self-end text-muted-foreground transition group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </article>
  );
}
