import Link from 'next/link';

import {
  ChevronRight
} from 'lucide-react';

import type {
  ReactNode
} from 'react';

import type {
  CommercePulseItem
} from '../contracts/customerDashboardTypes';

type DashboardOverviewCardProps = {
  item: CommercePulseItem;
  icon: ReactNode;
};

export function DashboardOverviewCard({
  item,
  icon
}: DashboardOverviewCardProps) {
  return (
    <Link
      href={item.href}
      className="group flex min-h-28 flex-col justify-between rounded-xl border border-border/60 bg-background/70 p-3.5 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-sm">
      <div className="flex items-center justify-between">
        <span className="grid size-9 place-items-center rounded-xl bg-muted text-primary [&_svg]:size-4">
          {icon}
        </span>

        <ChevronRight className="size-4 text-muted-foreground transition group-hover:translate-x-0.5" />
      </div>

      <div className="mt-4">
        <p className="text-2xl font-bold leading-none">
          {item.value}
        </p>

        <p className="mt-2 text-sm font-semibold">
          {item.label}
        </p>

        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
          {item.helper}
        </p>
      </div>
    </Link>
  );
}
