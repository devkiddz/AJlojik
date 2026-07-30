'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, PackagePlus } from 'lucide-react';

import {
  ShoppingListPublicationToggle,
  type ShoppingList
} from '@/features/shopping-lists';

type ShoppingListPreviewCardProps = {
  list: ShoppingList;
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0
  }).format(value);
}

export function ShoppingListPreviewCard({ list }: ShoppingListPreviewCardProps) {
  const previewItems = list.items.slice(0, 4);

  return (
    <article className="group flex h-full w-[19rem] shrink-0 flex-col overflow-hidden rounded-2xl border bg-card transition duration-200 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-lg sm:w-[20rem]">
      <Link href={`/account/lists/${list.id}`} className="block" aria-label={`Open ${list.name}`}>
        <div className="grid h-40 grid-cols-2 gap-px overflow-hidden bg-border">
          {previewItems.length > 0 ? (
            previewItems.map((item, index) => (
              <div key={item.id} className="relative overflow-hidden bg-muted">
                <Image
                  src={item.variant?.image ?? item.product.variants[0]?.image ?? '/placeholder.svg'}
                  alt={item.product.name}
                  fill
                  sizes="160px"
                  className="object-cover transition duration-300 group-hover:scale-105"
                />

                {index === 3 && list.itemCount > 4 ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-sm font-semibold text-white">
                    +{list.itemCount - 3}
                  </div>
                ) : null}
              </div>
            ))
          ) : (
            <div className="col-span-2 flex items-center justify-center bg-muted p-6">
              <div className="text-center">
                <p className="text-sm font-medium">Empty list</p>
                <p className="mt-1 text-xs text-muted-foreground">Ready for your plans</p>
              </div>
            </div>
          )}

          {previewItems.length === 1 ? <div className="bg-muted/60" /> : null}
          {previewItems.length === 2 ? (
            <>
              <div className="bg-muted/60" />
              <div className="bg-muted/60" />
            </>
          ) : null}
          {previewItems.length === 3 ? <div className="bg-muted/60" /> : null}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <ShoppingListPublicationToggle list={list} compact />
            <Link href={`/account/lists/${list.id}`} className="mt-2 block">
              <h3 className="truncate text-base font-semibold tracking-tight">{list.name}</h3>
            </Link>
          </div>

          <Link
            href={`/account/lists/${list.id}`}
            className="grid size-8 shrink-0 place-items-center rounded-full border bg-background transition-colors group-hover:bg-foreground group-hover:text-background"
            aria-label={`Open ${list.name}`}>
            <ArrowUpRight className="size-4" />
          </Link>
        </div>

        <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">
          {list.description ?? 'A personal collection of products gathered for your next shopping moment.'}
        </p>

        <div className="mt-auto pt-4">
          <div className="flex items-end justify-between gap-3 border-t pt-3">
            <div>
              <p className="text-sm font-semibold">
                {list.itemCount} {list.itemCount === 1 ? 'product' : 'products'}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {list.totalQuantity} {list.totalQuantity === 1 ? 'planned item' : 'planned items'}
              </p>
            </div>

            {list.totalValue > 0 ? <p className="text-sm font-semibold">{formatCurrency(list.totalValue)}</p> : null}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link
              href={`/store?view=grid&shoppingList=${encodeURIComponent(list.id)}`}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border bg-background px-2 text-xs font-semibold transition hover:bg-muted">
              <PackagePlus className="size-3.5" />
              Add products
            </Link>
            <Link
              href={`/account/lists/${list.id}`}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-foreground px-2 text-xs font-semibold text-background transition hover:opacity-90">
              Open list
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
