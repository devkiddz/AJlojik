'use client';

import { useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { ArrowLeft, ArrowRight, LoaderCircle, Minus, PackageOpen, Plus, RefreshCw, ShoppingBag, Trash2 } from 'lucide-react';

import StoreLoadingState from '@/components/loading/StoreLoadingState';
import { useCart } from '@/features/cart';
import { openCustomerProductExperience } from '@/features/customer-experience';

const currency = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 });

export default function CartPage() {
  const { items, itemCount, totalQuantity, subtotal, loading, error, refreshCart, updateQuantity, removeFromCart } = useCart();
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  const runItemAction = async (itemId: string, action: () => Promise<void>) => {
    setActiveItemId(itemId);
    try {
      await action();
    } finally {
      setActiveItemId(null);
    }
  };

  if (loading) return <StoreLoadingState label="Loading your cart" />;

  return (
    <main className="mx-auto min-h-[70vh] w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      <Link href="/store" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground"><ArrowLeft className="size-4" /> Back to store</Link>

      <header className="relative mt-5 overflow-hidden rounded-[2rem] border border-border/60 bg-gradient-to-br from-primary/15 via-card to-card p-6 shadow-xl sm:p-9">
        <div className="absolute -right-16 -top-24 size-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div><div className="mb-5 grid size-14 place-items-center rounded-2xl bg-foreground text-background shadow-lg"><ShoppingBag className="size-7" /></div><p className="text-xs font-bold uppercase tracking-[.18em] text-primary">Shopping activity</p><h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">Your cart</h1><p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Review quantities, remove selections, and continue when everything feels right.</p></div>
          <div className="grid grid-cols-3 gap-2 rounded-2xl border border-border/60 bg-background/60 p-2 backdrop-blur">
            <Metric label="Selections" value={String(itemCount)} /><Metric label="Units" value={String(totalQuantity)} /><Metric label="Subtotal" value={currency.format(subtotal)} />
          </div>
        </div>
      </header>

      {error ? <div role="alert" className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-destructive/25 bg-destructive/5 p-4 text-sm"><span>{error}</span><button type="button" onClick={() => void refreshCart()} className="inline-flex shrink-0 items-center gap-2 font-bold text-destructive"><RefreshCw className="size-4" /> Retry</button></div> : null}

      {!items.length ? (
        <section className="mt-8 grid min-h-72 place-items-center rounded-[2rem] border border-dashed border-border bg-card/50 p-8 text-center"><div><div className="mx-auto grid size-14 place-items-center rounded-full bg-muted text-muted-foreground"><PackageOpen className="size-6" /></div><h2 className="mt-5 text-xl font-black">Your cart is empty</h2><p className="mt-2 text-sm text-muted-foreground">Your next great selection can start in the discovery hub.</p><Link href="/store" className="mt-6 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-bold text-background">Discover products <ArrowRight className="size-4" /></Link></div></section>
      ) : (
        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <section className="space-y-3" aria-label="Cart products">
            {items.map(item => {
              const busy = activeItemId === item.id;
              return (
                <article key={item.id} className="flex gap-3 rounded-3xl border border-border/60 bg-card p-3 shadow-sm sm:gap-5 sm:p-4">
                  <button
                    type="button"
                    onClick={() => openCustomerProductExperience({ id: item.product.id, name: item.product.name })}
                    aria-label={`Open ${item.product.name} in Discovery Hub`}
                    className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-muted sm:size-32">
                    <Image src={item.variant.image} alt={item.product.name} fill sizes="128px" className="object-cover transition hover:scale-105" />
                  </button>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3"><div className="min-w-0"><button type="button" onClick={() => openCustomerProductExperience({ id: item.product.id, name: item.product.name })} className="line-clamp-2 text-left text-sm font-black hover:underline sm:text-base">{item.product.name}</button><p className="mt-1 text-xs text-muted-foreground">{item.variant.label}</p></div><p className="shrink-0 text-sm font-black sm:text-base">{currency.format(item.variant.price * item.quantity)}</p></div>
                    <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-4">
                      <div className="inline-flex items-center rounded-full border border-border/70 bg-background p-1"><button type="button" disabled={busy || item.quantity <= 1} onClick={() => void runItemAction(item.id, () => updateQuantity({ itemId: item.id, quantity: item.quantity - 1 }))} aria-label={`Decrease ${item.product.name} quantity`} className="grid size-8 place-items-center rounded-full transition hover:bg-muted disabled:opacity-35"><Minus className="size-3.5" /></button><span className="min-w-8 text-center text-xs font-black">{item.quantity}</span><button type="button" disabled={busy || item.quantity >= item.variant.stockLeft} onClick={() => void runItemAction(item.id, () => updateQuantity({ itemId: item.id, quantity: item.quantity + 1 }))} aria-label={`Increase ${item.product.name} quantity`} className="grid size-8 place-items-center rounded-full transition hover:bg-muted disabled:opacity-35"><Plus className="size-3.5" /></button></div>
                      <button type="button" disabled={busy} onClick={() => void runItemAction(item.id, () => removeFromCart(item.id))} className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold text-destructive transition hover:bg-destructive/10 disabled:opacity-50">{busy ? <LoaderCircle className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />} Remove from list</button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          <aside className="sticky top-24 rounded-3xl border border-border/60 bg-card p-5 shadow-lg"><p className="text-xs font-bold uppercase tracking-[.16em] text-muted-foreground">Order summary</p><div className="mt-5 space-y-3 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">Products</span><span>{currency.format(subtotal)}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>Calculated next</span></div></div><div className="my-5 border-t border-border/60" /><div className="flex items-end justify-between"><span className="font-bold">Subtotal</span><span className="text-2xl font-black">{currency.format(subtotal)}</span></div><Link href="/payments" className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-black text-background">Continue securely <ArrowRight className="size-4" /></Link><p className="mt-3 text-center text-[10px] leading-4 text-muted-foreground">Delivery options and final charges are confirmed before payment.</p></aside>
        </div>
      )}
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0 rounded-xl px-2 py-2 text-center"><p className="truncate text-[9px] uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-1 truncate text-sm font-black">{value}</p></div>;
}
