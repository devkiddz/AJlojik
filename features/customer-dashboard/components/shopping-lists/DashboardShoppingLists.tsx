'use client';

import { useShoppingLists } from '@/features/shopping-lists';

import { ShoppingListBanner } from './ShoppingListBanner';

export function DashboardShoppingLists() {
  const { lists, loading, error } = useShoppingLists();

  if (loading) {
    return (
      <section className="space-y-4">
        <div className="h-[34rem] animate-pulse rounded-3xl border bg-muted/50" />
      </section>
    );
  }

  return (
    <section className="space-y-4">
      {error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <ShoppingListBanner lists={lists} />
    </section>
  );
}
