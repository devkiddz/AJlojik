import Link from 'next/link';

import {
  ArrowRight,
  Clock3,
  Heart,
  History,
  PackageCheck,
  Radio,
  ReceiptText,
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

const actionToneStyles = {
  navy:
    'border-sky-500/15 bg-sky-500/5 text-sky-700 dark:text-sky-300',

  wine:
    'border-rose-500/15 bg-rose-500/5 text-rose-700 dark:text-rose-300',

  gold:
    'border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-300',

  emerald:
    'border-emerald-500/15 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300',

  violet:
    'border-violet-500/15 bg-violet-500/5 text-violet-700 dark:text-violet-300',

  neutral:
    'border-border/60 bg-muted/35 text-foreground'
} satisfies Record<
  DashboardActionItem['tone'],
  string
>;

function ActionIcon({
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

type DashboardActionCardProps = {
  item: DashboardActionItem;
};

export function DashboardActionCard({
  item
}: DashboardActionCardProps) {
  return (
    <Link
      href={item.href}
      className={cn(
        'group flex min-w-0 items-start gap-3 rounded-xl border p-3.5 transition',
        'hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-sm',
        actionToneStyles[
          item.tone
        ]
      )}>
      <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-current/10 bg-background/75 [&_svg]:size-4.5">
        <ActionIcon
          icon={item.icon}
        />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-3">
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-foreground">
              {item.title}
            </span>

            <span className="mt-0.5 block text-xs font-medium text-current">
              {item.value}
            </span>
          </span>

          {item.badge ? (
            <span
              className={cn(
                'shrink-0 rounded-lg border border-current/10 bg-background/75 px-2 py-1 text-xs font-semibold',
                item.requiresAttention &&
                  'animate-pulse'
              )}>
              {item.badge}
            </span>
          ) : null}
        </span>

        <span className="mt-1.5 block line-clamp-2 text-xs leading-5 text-muted-foreground">
          {item.description}
        </span>

        <span className="mt-2 flex items-center justify-between gap-3">
          <span className="truncate text-xs text-muted-foreground">
            {item.helper}
          </span>

          <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-foreground">
            {item.actionLabel}
            <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" />
          </span>
        </span>
      </span>
    </Link>
  );
}
