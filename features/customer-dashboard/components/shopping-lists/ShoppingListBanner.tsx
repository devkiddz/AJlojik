import Link from 'next/link';

import { ArrowRight, ListChecks, Plus } from 'lucide-react';

import type { ShoppingList } from '@/features/shopping-lists';

type ShoppingListBannerProps = {
  lists: ShoppingList[];
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0
  }).format(value);
}

export function ShoppingListBanner({ lists }: ShoppingListBannerProps) {
  const totalItems = lists.reduce((total, list) => total + list.itemCount, 0);

  const totalQuantity = lists.reduce((total, list) => total + list.totalQuantity, 0);

  const totalValue = lists.reduce((total, list) => total + list.totalValue, 0);

  return (
    <section className="relative overflow-hidden rounded-3xl border bg-card">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-muted/60" />

      <div className="relative grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="max-w-2xl">
          <div className="mb-4 flex size-11 items-center justify-center rounded-2xl border bg-background/80 shadow-sm backdrop-blur">
            <ListChecks className="size-5" />
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Personal planning
          </p>

          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Your shopping plans, preserved.
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
            Create named lists, gather products around a purpose and return whenever you are ready to
            continue.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <div className="rounded-full border bg-background/70 px-3 py-1.5 text-xs font-medium backdrop-blur">
              {lists.length} {lists.length === 1 ? 'list' : 'lists'}
            </div>

            <div className="rounded-full border bg-background/70 px-3 py-1.5 text-xs font-medium backdrop-blur">
              {totalItems} {totalItems === 1 ? 'product' : 'products'}
            </div>

            <div className="rounded-full border bg-background/70 px-3 py-1.5 text-xs font-medium backdrop-blur">
              {totalQuantity} {totalQuantity === 1 ? 'planned item' : 'planned items'}
            </div>

            {totalValue > 0 && (
              <div className="rounded-full border bg-background/70 px-3 py-1.5 text-xs font-medium backdrop-blur">
                {formatCurrency(totalValue)}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 lg:justify-end">
          <Link
            href="/account/lists"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border bg-background px-4 text-sm font-medium shadow-sm transition-colors hover:bg-muted">
            View all
            <ArrowRight className="size-4" />
          </Link>

          <Link
            href="/account/lists?create=true"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90">
            <Plus className="size-4" />
            Create list
          </Link>
        </div>
      </div>
    </section>
  );
}
