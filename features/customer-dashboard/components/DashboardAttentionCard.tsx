import Link from 'next/link';

import {
  ArrowRight,
  Heart,
  History,
  PackageCheck,
  ShoppingBag,
  Star,
  Store,
  Truck,
  WalletCards
} from 'lucide-react';

import {
  cn
} from '@/lib/utils';

import type {
  DashboardActionIcon,
  DashboardActionItem
} from '../contracts/customerDashboardTypes';

const toneStyles = {
  navy:
    'from-sky-500/12 via-card to-card text-sky-700 dark:text-sky-300',

  wine:
    'from-rose-500/12 via-card to-card text-rose-700 dark:text-rose-300',

  gold:
    'from-amber-500/14 via-card to-card text-amber-700 dark:text-amber-300',

  emerald:
    'from-emerald-500/12 via-card to-card text-emerald-700 dark:text-emerald-300',

  violet:
    'from-violet-500/12 via-card to-card text-violet-700 dark:text-violet-300',

  neutral:
    'from-muted/70 via-card to-card text-foreground'
} satisfies Record<
  DashboardActionItem['tone'],
  string
>;

function AttentionIcon({
  icon
}: {
  icon: DashboardActionIcon;
}) {
  switch (icon) {
    case 'wallet':
      return <WalletCards />;

    case 'truck':
      return <Truck />;

    case 'package':
      return <PackageCheck />;

    case 'cart':
      return <ShoppingBag />;

    case 'review':
      return <Star />;

    case 'wishlist':
      return <Heart />;

    case 'history':
      return <History />;

    case 'store':
      return <Store />;
  }
}

type DashboardAttentionCardProps = {
  item: DashboardActionItem;
};

export function DashboardAttentionCard({
  item
}: DashboardAttentionCardProps) {
  return (
    <Link
      href={item.href}
      className={cn(
        'group flex flex-col rounded-2xl border border-border/60 bg-gradient-to-br p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md sm:p-5',
        toneStyles[
          item.tone
        ]
      )}>
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-10 place-items-center rounded-xl border border-current/10 bg-background/75 [&_svg]:size-4.5">
          <AttentionIcon
            icon={item.icon}
          />
        </span>

        {item.badge ? (
          <span className="rounded-lg border border-current/10 bg-background/75 px-2.5 py-1 text-xs font-semibold">
            {item.badge}
          </span>
        ) : null}
      </div>

      <div className="mt-5">
        <p className="text-2xl font-bold text-foreground">
          {item.value}
        </p>

        <h3 className="mt-1.5 text-base font-semibold text-foreground">
          {item.title}
        </h3>

        <p className="mt-1.5 line-clamp-2 text-sm leading-5 text-muted-foreground">
          {item.description}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/55 pt-3">
        <span className="truncate text-xs text-muted-foreground">
          {item.helper}
        </span>

        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-foreground">
          {item.actionLabel}
          <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
