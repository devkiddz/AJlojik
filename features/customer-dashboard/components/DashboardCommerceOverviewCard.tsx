import Link from 'next/link';

import { ChevronRight, Heart, LayoutDashboard, ReceiptText, ShoppingBag, WalletCards } from 'lucide-react';

import { cn } from '@/lib/utils';

import type { DashboardSummaryIcon, DashboardSummaryItem } from '../contracts/customerDashboardTypes';

const iconStyles = {
  navy: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',

  wine: 'bg-rose-500/10 text-rose-700 dark:text-rose-300',

  gold: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',

  emerald: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',

  violet: 'bg-violet-500/10 text-violet-700 dark:text-violet-300',

  neutral: 'bg-muted text-foreground'
} satisfies Record<DashboardSummaryItem['tone'], string>;

function OverviewIcon({ icon }: { icon: DashboardSummaryIcon }) {
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

export function DashboardCommerceOverviewCard({ items }: DashboardCommerceOverviewCardProps) {
  return (
    <article className="flex flex-col rounded-2xl border border-border/60 bg-card/90 p-4 shadow-sm sm:p-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-primary">Overview</p>

          <h3 className="mt-1 text-lg font-bold">Your commerce</h3>

          <p className="mt-1 text-sm leading-5 text-muted-foreground">
            A calm summary of what this workspace is holding.
          </p>
        </div>

        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <LayoutDashboard className="size-4.5" />
        </span>
      </header>

      <div
        className="
          group flex
          min-h-44
          w-80 min-w-80 max-w-80
          flex-none
          snap-start
          flex-col
          rounded-xl
          border border-border/55
          bg-background/70
          p-4
          transition

          hover:border-primary/25
          hover:bg-muted/45

          md:min-h-0
          md:w-auto
          md:min-w-0
          md:max-w-none
          md:flex-auto
          md:snap-none
          md:p-3
        ">
        {items.map(item => (
          <Link
            key={item.id}
            href={item.href}
            className="
        group flex
        min-h-40
        w-[76vw]
        max-w-72
        shrink-0
        snap-start
        flex-col
        rounded-xl
        border border-border/55
        bg-background/70
        p-4
        transition

        hover:border-primary/25
        hover:bg-muted/45

        sm:min-h-0
        sm:w-auto
        sm:max-w-none
        sm:min-w-0
        sm:shrink
        sm:snap-none
        sm:p-3
      ">
            <span
              className={cn(
                `
            grid size-10
            place-items-center
            rounded-xl
            [&_svg]:size-4

            sm:size-8
            sm:rounded-lg
            sm:[&_svg]:size-3.5
          `,
                iconStyles[item.tone]
              )}>
              <OverviewIcon icon={item.icon} />
            </span>

            <span className="mt-4 truncate text-2xl font-bold sm:mt-3 sm:text-xl">{item.value}</span>

            <span className="mt-1 text-sm font-semibold sm:mt-0.5 sm:text-xs">{item.label}</span>

            <span className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground sm:line-clamp-1 sm:leading-normal">
              {item.helper}
            </span>

            <ChevronRight className="mt-auto size-5 self-end text-muted-foreground transition group-hover:translate-x-0.5 sm:size-4" />
          </Link>
        ))}
      </div>
    </article>
  );
}
