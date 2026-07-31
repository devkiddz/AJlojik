'use client';

import { Check, PackageSearch, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

import { StudioProductSummary } from './StudioProductSummary';
import type { StudioProductOption } from './studioTypes';

export function StudioProductPicker({
  name = 'productIds',
  products,
  initialIds = [],
  maxSelections,
  label = 'Choose products',
  description = 'Search the current workspace catalog and choose the products that belong in this experience.',
  disabled
}: {
  name?: string;
  products: StudioProductOption[];
  initialIds?: string[];
  maxSelections?: number;
  label?: string;
  description?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState(() => new Set(initialIds));

  const selected = useMemo(
    () => products.filter(product => selectedIds.has(product.id)),
    [products, selectedIds]
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) return products;

    return products.filter(product =>
      [
        product.name,
        product.category,
        product.vendor,
        product.status
      ]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(normalized))
    );
  }, [products, query]);

  const toggle = (productId: string) => {
    setSelectedIds(current => {
      const next = new Set(current);

      if (next.has(productId)) {
        next.delete(productId);
        return next;
      }

      if (maxSelections && next.size >= maxSelections) {
        return next;
      }

      next.add(productId);
      return next;
    });
  };

  return (
    <div className="space-y-3">
      {[...selectedIds].map(productId => (
        <input
          key={productId}
          type="hidden"
          name={name}
          value={productId}
        />
      ))}

      <StudioProductSummary products={selected} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          disabled={disabled}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border/70 bg-background px-4 text-xs font-bold transition hover:bg-muted disabled:opacity-45"
        >
          <PackageSearch className="size-4" />
          {label}
        </DialogTrigger>

        <DialogContent className="flex max-h-[88dvh] max-w-4xl flex-col gap-0 overflow-hidden p-0">
          <DialogHeader className="border-b border-border/60 p-5 pr-14">
            <DialogTitle>Product selection</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <div className="border-b border-border/60 p-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="Search products, categories or vendors"
                className="h-11 w-full rounded-2xl border border-border/70 bg-background pl-10 pr-10 text-sm outline-none focus:border-primary"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  aria-label="Clear search"
                >
                  <X className="size-4" />
                </button>
              ) : null}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {filtered.map(product => {
                const selectedProduct = selectedIds.has(product.id);
                const unavailable =
                  product.status !== 'PUBLISHED' ||
                  !product.active ||
                  product.available <= 0;

                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => toggle(product.id)}
                    className={cn(
                      'flex min-w-0 items-center gap-3 rounded-2xl border p-3 text-left transition',
                      selectedProduct
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/10'
                        : 'border-border/60 hover:bg-muted/40',
                      unavailable && 'opacity-70'
                    )}
                  >
                    <span className="grid size-14 shrink-0 overflow-hidden rounded-2xl bg-muted">
                      {product.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.imageUrl}
                          alt=""
                          className="size-full object-cover"
                        />
                      ) : (
                        <PackageSearch className="m-auto size-5 text-muted-foreground" />
                      )}
                    </span>

                    <span className="min-w-0 flex-1">
                      <strong className="block truncate text-xs">
                        {product.name}
                      </strong>
                      <span className="mt-1 block truncate text-[9px] text-muted-foreground">
                        {product.category ?? 'Uncategorized'}
                        {product.vendor ? ` · ${product.vendor}` : ''}
                      </span>
                      <span
                        className={cn(
                          'mt-2 inline-flex rounded-full px-2 py-1 text-[8px] font-bold',
                          unavailable
                            ? 'bg-destructive/10 text-destructive'
                            : product.available <= 5
                              ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                              : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                        )}
                      >
                        {product.status.replaceAll('_', ' ')} · {product.available} available
                      </span>
                    </span>

                    <span
                      className={cn(
                        'grid size-7 shrink-0 place-items-center rounded-full border',
                        selectedProduct
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border'
                      )}
                    >
                      {selectedProduct ? <Check className="size-4" /> : null}
                    </span>
                  </button>
                );
              })}
            </div>

            {!filtered.length ? (
              <div className="grid min-h-52 place-items-center text-center">
                <div>
                  <PackageSearch className="mx-auto size-7 text-muted-foreground" />
                  <p className="mt-3 text-sm font-bold">No matching products</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Adjust the search or confirm that products are available in this workspace.
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          <footer className="flex flex-col gap-3 border-t border-border/60 bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-bold">
              {selected.length} selected
              {maxSelections ? ` · maximum ${maxSelections}` : ''}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                className="h-10 rounded-full border border-border px-4 text-xs font-bold"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-10 rounded-full bg-foreground px-5 text-xs font-bold text-background"
              >
                Use selected products
              </button>
            </div>
          </footer>
        </DialogContent>
      </Dialog>
    </div>
  );
}
