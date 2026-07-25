import Link from 'next/link';

import {
  ChevronRight,
  Heart,
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

const summaryToneStyles = {
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

function SummaryIcon({
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

type DashboardSummaryCardProps = {
  item: DashboardSummaryItem;
};

export function DashboardSummaryCard({
  item
}: DashboardSummaryCardProps) {
  return (
    <Link
      href={item.href}
      className="group flex min-w-0 items-center gap-3 rounded-xl border border-border/60 bg-background/70 p-3.5 transition hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-sm">
      <span
        className={cn(
          'grid size-10 shrink-0 place-items-center rounded-xl [&_svg]:size-4.5',
          summaryToneStyles[
            item.tone
          ]
        )}>
        <SummaryIcon
          icon={item.icon}
        />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-xs text-muted-foreground">
          {item.label}
        </span>

        <span className="mt-0.5 block truncate text-xl font-bold">
          {item.value}
        </span>

        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
          {item.helper}
        </span>
      </span>

      <ChevronRight className="size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5" />
    </Link>
  );
}
