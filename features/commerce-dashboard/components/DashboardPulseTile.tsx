'use client';

import Link from 'next/link';

import { ChevronRight } from 'lucide-react';

import type { ReactNode } from 'react';

import type {
  CommercePulseItem
} from '../contracts/commerceDashboardTypes';

type DashboardPulseTileProps = {
  item: CommercePulseItem;
  icon: ReactNode;
};

export function DashboardPulseTile({
  item,
  icon
}: DashboardPulseTileProps) {
  return (
    <Link
      href={item.href}
      className="group min-h-24 rounded-xl border border-border/60 bg-background/70 p-3 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-sm">
      <div className="flex items-center justify-between">
        <span className="grid size-8 place-items-center rounded-lg bg-muted text-primary [&_svg]:size-3.5">
          {icon}
        </span>

        <ChevronRight className="size-3.5 text-muted-foreground transition group-hover:translate-x-0.5" />
      </div>

      <div className="mt-3 flex items-end justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xl font-black leading-none">
            {item.value}
          </p>

          <p className="mt-1.5 truncate text-[11px] font-bold">
            {item.label}
          </p>
        </div>
      </div>

      <p className="mt-1 truncate text-[9px] text-muted-foreground">
        {item.helper}
      </p>
    </Link>
  );
}
