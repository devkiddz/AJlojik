'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { ArrowRight, LoaderCircle, PackageOpen, ShoppingBag } from 'lucide-react';

import { useCart } from '@/features/cart';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0
  }).format(value);
}

export default function CartSummaryWidget() {
  const router = useRouter();

  const { items, itemCount, totalQuantity, subtotal, loading, mutating, error } = useCart();

  const previewItems = items.slice(0, 3);
  const remainingItemCount = Math.max(itemCount - previewItems.length, 0);

  if (loading) {
    return (
      <section className="rounded-3xl border border-primary/12 bg-card/40 p-5">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-primary/10">
            <LoaderCircle className="size-5 animate-spin text-primary" />
          </div>

          <div className="space-y-2">
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            <div className="h-5 w-36 animate-pulse rounded bg-muted" />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <div className="h-20 animate-pulse rounded-2xl bg-muted" />
          <div className="h-20 animate-pulse rounded-2xl bg-muted" />
        </div>

        <div className="mt-3 h-11 animate-pulse rounded-full bg-muted" />
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-primary/12 bg-card/40 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_20px_60px_rgba(0,0,0,0.25)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/45">
            Shopping activity
          </p>

          <h3 className="mt-1 text-base font-bold tracking-tight text-primary">Cart Summary</h3>

          <p className="mt-1 text-xs leading-5 text-primary/50">
            Your current selections and shopping subtotal.
          </p>
        </div>

        <div className="relative grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
          <ShoppingBag className="size-5" />

          {totalQuantity > 0 ? (
            <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold leading-5 text-accent-foreground">
              {totalQuantity > 99 ? '99+' : totalQuantity}
            </span>
          ) : null}
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-destructive/20 bg-destructive/10 p-3">
          <p className="text-xs leading-5 text-destructive">{error}</p>
        </div>
      ) : null}

      {items.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-primary/15 bg-background/30 p-5 text-center">
          <PackageOpen className="mx-auto size-7 text-primary/35" />

          <p className="mt-3 text-sm font-semibold text-primary">Your cart is empty</p>

          <p className="mt-1 text-xs leading-5 text-primary/50">
            Products you add from the feed will appear here automatically.
          </p>

          <button
            type="button"
            onClick={() => router.push('/store')}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-background/50 px-4 py-2 text-xs font-semibold text-primary transition hover:bg-primary hover:text-background">
            Explore products
            <ArrowRight className="size-3.5" />
          </button>
        </div>
      ) : (
        <>
          <div className="mt-5 space-y-2">
            {previewItems.map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => router.push(`/store?product=${item.productId}`)}
                className="group flex w-full items-center gap-3 rounded-2xl border border-primary/10 bg-background/35 p-2.5 text-left transition hover:border-primary/20 hover:bg-background/55">
                <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-muted">
                  <Image
                    src={item.variant.image}
                    alt={item.product.name}
                    fill
                    sizes="48px"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-primary">{item.product.name}</p>

                  <p className="mt-0.5 truncate text-[10px] text-primary/45">{item.variant.label}</p>

                  <p className="mt-1 text-[11px] font-bold text-primary/75">
                    {formatCurrency(Number(item.variant.price))}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-[10px] text-primary/40">Quantity</p>

                  <p className="mt-0.5 text-sm font-bold text-primary">{item.quantity}</p>
                </div>
              </button>
            ))}

            {remainingItemCount > 0 ? (
              <p className="px-2 pt-1 text-center text-[11px] font-medium text-primary/45">
                +{remainingItemCount} more {remainingItemCount === 1 ? 'selection' : 'selections'}
              </p>
            ) : null}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-background/40 p-3">
              <p className="text-[10px] font-medium uppercase tracking-wide text-primary/45">Selections</p>

              <p className="mt-1 text-lg font-bold text-primary">{itemCount}</p>

              <p className="text-[10px] text-primary/40">Distinct products</p>
            </div>

            <div className="rounded-2xl bg-background/40 p-3">
              <p className="text-[10px] font-medium uppercase tracking-wide text-primary/45">Total units</p>

              <p className="mt-1 text-lg font-bold text-primary">{totalQuantity}</p>

              <p className="text-[10px] text-primary/40">Across your cart</p>
            </div>
          </div>

          <div className="mt-2 rounded-2xl border border-primary/10 bg-background/45 p-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-primary/55">Subtotal</span>

              <span className="text-sm font-bold text-primary">{formatCurrency(subtotal)}</span>
            </div>
          </div>

          <button
            type="button"
            disabled={mutating}
            onClick={() => router.push('/cart')}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-xs font-semibold text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
            {mutating ? 'Updating cart...' : 'View cart'}

            {!mutating ? (
              <ArrowRight className="size-3.5" />
            ) : (
              <LoaderCircle className="size-3.5 animate-spin" />
            )}
          </button>
        </>
      )}
    </section>
  );
}
