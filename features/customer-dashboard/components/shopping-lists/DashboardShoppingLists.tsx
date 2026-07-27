'use client';

import Link from 'next/link';

import { ArrowRight, ListPlus, Plus } from 'lucide-react';

import { useShoppingLists } from '@/features/shopping-lists';

import { ShoppingListBanner } from './ShoppingListBanner';

import { ShoppingListPreviewCard } from './ShoppingListPreviewCard';

export function DashboardShoppingLists() {
  const { lists, loading, error } = useShoppingLists();

  const visibleLists = lists.slice(0, 4);

  if (loading) {
    return (
      <section className="space-y-4">
        <div className="h-64 animate-pulse rounded-3xl border bg-muted/50" />

        <div className="flex gap-4 overflow-hidden">
          {Array.from({
            length: 3
          }).map((_, index) => (
            <div key={index} className="h-72 min-w-[17rem] animate-pulse rounded-2xl border bg-muted/50" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <ShoppingListBanner lists={lists} />

      <div className="rounded-3xl border bg-card/60 p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Shopping lists
            </p>

            <h2 className="mt-1 text-xl font-semibold tracking-tight">Continue a plan</h2>
          </div>

          <Link
            href="/account/lists"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            View all
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="flex gap-4 overflow-x-auto pb-2">
          {visibleLists.map(list => (
            <ShoppingListPreviewCard key={list.id} list={list} />
          ))}

          <Link
            href="/account/lists?create=true"
            className="group flex min-h-72 min-w-[17rem] max-w-[20rem] flex-1 flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/20 p-6 text-center transition-colors hover:border-foreground/30 hover:bg-muted/40">
            <div className="flex size-12 items-center justify-center rounded-2xl border bg-background shadow-sm transition-transform group-hover:scale-105">
              {lists.length > 0 ? <Plus className="size-5" /> : <ListPlus className="size-5" />}
            </div>

            <h3 className="mt-4 font-semibold">Create a new list</h3>

            <p className="mt-2 max-w-48 text-sm leading-5 text-muted-foreground">
              Build a personal plan around an event, mood, budget or shopping purpose.
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
}
