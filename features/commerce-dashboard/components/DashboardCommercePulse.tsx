'use client';

import { Heart, ReceiptText, ShoppingBag, Star, WalletCards } from 'lucide-react';

import type { ReactNode } from 'react';

import type { CommercePulseItem } from '../contracts/commerceDashboardTypes';

import { DashboardPulseTile } from './DashboardPulseTile';

const compactCurrencyFormatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  notation: 'compact',
  maximumFractionDigits: 1
});

type DashboardCommercePulseProps = {
  items: CommercePulseItem[];
  totalSpent: number;
};

export function DashboardCommercePulse({ items, totalSpent }: DashboardCommercePulseProps) {
  const icons: Record<CommercePulseItem['id'], ReactNode> = {
    purchases: <ReceiptText />,
    saved: <Heart />,
    cart: <ShoppingBag />,
    reviews: <Star />
  };

  return (
    <aside className="premium-card flex h-full min-h-72 flex-col rounded-2xl border border-border/60 p-3.5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-primary">Commerce pulse</p>

          <h2 className="mt-0.5">Your world at a glance</h2>
        </div>

        <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
          <WalletCards className="size-3.5" />
        </span>
      </div>

      <div className="mt-3 rounded-xl bg-foreground p-3 text-background shadow-sm">
        <p className="text-[8px] uppercase tracking-[0.16em] text-background/55">Recorded purchases</p>

        <p className="mt-1 text-xl font-black tracking-tight">
          {compactCurrencyFormatter.format(totalSpent)}
        </p>

        <p className="mt-0.5 text-[9px] leading-4 text-background/55">
          Paid commerce inside the active workspace.
        </p>
      </div>

      <div className="mt-2.5 grid flex-1 grid-cols-2 gap-2">
        {items.map(item => (
          <DashboardPulseTile key={item.id} item={item} icon={icons[item.id]} />
        ))}
      </div>
    </aside>
  );
}
