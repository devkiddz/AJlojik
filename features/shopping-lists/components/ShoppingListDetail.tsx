'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Archive, ArrowLeft, LoaderCircle, Minus, PackageOpen, Pencil, Plus, ShoppingBag, Sparkles, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useCart } from '@/features/cart';

import { useShoppingLists } from '../client';
import type { ShoppingListItem } from '../shoppingListTypes';
import { ShoppingListFormDialog } from './ShoppingListFormDialog';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value);
}

export function ShoppingListDetail({ listId }: { listId: string }) {
  const router = useRouter();
  const { lists, loading, mutating, error, updateList, archiveList, updateItem, removeItem } = useShoppingLists();
  const { addToCart } = useCart();
  const [editing, setEditing] = useState(false);
  const [addingAll, setAddingAll] = useState(false);
  const [cartMessage, setCartMessage] = useState<string | null>(null);

  const list = useMemo(() => lists.find(item => item.id === listId) ?? null, [listId, lists]);

  async function addAllToCart() {
    if (!list) return;
    setAddingAll(true);
    setCartMessage(null);
    try {
      let added = 0;
      for (const item of list.items) {
        if (!item.variant || item.variant.stockLeft <= 0) continue;
        await addToCart({ product: item.product, variant: item.variant, quantity: Math.min(item.quantity, item.variant.stockLeft) });
        added += 1;
      }
      setCartMessage(added ? `${added} ${added === 1 ? 'product' : 'products'} added to cart.` : 'No available list items could be added.');
    } catch (cause) {
      setCartMessage(cause instanceof Error ? cause.message : 'Unable to add this list to cart.');
    } finally {
      setAddingAll(false);
    }
  }

  if (loading) return <main className="mx-auto max-w-6xl px-4 py-10"><div className="h-[34rem] animate-pulse rounded-3xl border bg-muted/40" /></main>;

  if (!list) return (
    <main className="mx-auto grid min-h-[70vh] max-w-3xl place-items-center px-4 py-10 text-center">
      <div><PackageOpen className="mx-auto size-10 text-muted-foreground" /><h1 className="mt-4 text-2xl font-semibold">Shopping list not found</h1><p className="mt-2 text-sm text-muted-foreground">It may have been archived or belongs to another workspace.</p><Link href="/account/lists" className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-foreground px-4 text-sm font-semibold text-background"><ArrowLeft className="size-4" />Return to lists</Link></div>
    </main>
  );

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <Link href="/account/lists" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />All shopping lists</Link>

      <section className="mt-6 overflow-hidden rounded-[2rem] border bg-card">
        <div className="relative p-6 sm:p-8">
          <div className="pointer-events-none absolute -right-12 -top-20 size-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl"><div className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"><Sparkles className="size-3.5" />{list.visibility === 'SHARED' ? 'Shared plan' : 'Private plan'}</div><h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-5xl">{list.name}</h1><p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">{list.description ?? 'A personal shopping plan that stays current with product pricing and availability.'}</p></div>
            <div className="flex flex-wrap gap-2"><button type="button" onClick={() => setEditing(true)} className="inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-medium hover:bg-muted"><Pencil className="size-4" />Edit</button><button type="button" onClick={() => void addAllToCart()} disabled={addingAll || !list.items.length} className="inline-flex h-10 items-center gap-2 rounded-xl bg-foreground px-4 text-sm font-semibold text-background disabled:opacity-50">{addingAll ? <LoaderCircle className="size-4 animate-spin" /> : <ShoppingBag className="size-4" />}Add list to cart</button></div>
          </div>
        </div>
        <div className="grid border-t sm:grid-cols-3"><div className="p-5 sm:border-r"><p className="text-2xl font-semibold">{list.itemCount}</p><p className="text-sm text-muted-foreground">Products</p></div><div className="border-t p-5 sm:border-r sm:border-t-0"><p className="text-2xl font-semibold">{list.totalQuantity}</p><p className="text-sm text-muted-foreground">Planned quantity</p></div><div className="border-t p-5 sm:border-t-0"><p className="text-2xl font-semibold">{formatCurrency(list.totalValue)}</p><p className="text-sm text-muted-foreground">Current estimated value</p></div></div>
      </section>

      {error || cartMessage ? <div className="mt-5 rounded-2xl border bg-muted/30 px-4 py-3 text-sm">{error ?? cartMessage}</div> : null}

      <section className="mt-8">
        <div className="flex items-end justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">List contents</p><h2 className="mt-1 text-2xl font-semibold tracking-tight">Your planned products</h2></div></div>

        {list.items.length ? <div className="mt-5 space-y-3">{list.items.map(item => <ShoppingListItemRow key={item.id} item={item} busy={mutating} onQuantity={quantity => updateItem(list.id, item.id, { quantity })} onRemove={() => removeItem(list.id, item.id)} />)}</div> : (
          <div className="mt-5 grid min-h-72 place-items-center rounded-3xl border border-dashed bg-muted/10 p-8 text-center"><div><PackageOpen className="mx-auto size-8 text-muted-foreground" /><h3 className="mt-4 font-semibold">This list is ready</h3><p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">Use “Add to Shopping List” from a product card. The selected product and variant will appear here.</p></div></div>
        )}
      </section>

      <div className="mt-10 flex justify-end border-t pt-6"><button type="button" disabled={mutating} onClick={async () => { await archiveList(list.id); router.push('/account/lists'); }} className="inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-medium text-destructive hover:bg-destructive/10"><Archive className="size-4" />Archive this list</button></div>

      <ShoppingListFormDialog open={editing} list={list} busy={mutating} onClose={() => setEditing(false)} onSubmit={async input => { await updateList(list.id, { name: input.name, description: input.description ?? null }); setEditing(false); }} />
    </main>
  );
}

function ShoppingListItemRow({ item, busy, onQuantity, onRemove }: { item: ShoppingListItem; busy: boolean; onQuantity: (quantity: number) => Promise<unknown>; onRemove: () => Promise<unknown> }) {
  const image = item.variant?.image ?? item.product.variants[0]?.image ?? '/placeholder.svg';
  const price = item.promotion?.promotionalPrice ?? item.variant?.price ?? item.product.variants[0]?.price ?? 0;
  const unavailable = !item.variant || item.variant.stockLeft <= 0;

  return (
    <article className="flex gap-4 rounded-2xl border bg-card p-3 sm:items-center sm:p-4">
      <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-muted sm:size-28"><Image src={image} alt={item.product.name} fill sizes="112px" className="object-cover" /></div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{item.product.category.replaceAll('-', ' ')}</p><h3 className="mt-1 line-clamp-2 font-semibold">{item.product.name}</h3><p className="mt-1 text-sm text-muted-foreground">{item.variant?.label ?? 'Select a variant from the product experience'}</p></div><div className="shrink-0 sm:text-right"><p className="font-semibold">{formatCurrency(price * item.quantity)}</p><p className={`mt-1 text-xs ${unavailable ? 'text-destructive' : 'text-muted-foreground'}`}>{unavailable ? 'Currently unavailable' : `${item.variant?.stockLeft ?? 0} available`}</p></div></div>
        <div className="mt-4 flex items-center justify-between gap-3 border-t pt-3"><div className="inline-flex items-center rounded-full border bg-background"><button type="button" disabled={busy} onClick={() => void onQuantity(Math.max(1, item.quantity - 1))} className="grid size-9 place-items-center disabled:opacity-40" aria-label="Decrease quantity"><Minus className="size-3.5" /></button><span className="min-w-8 text-center text-sm font-semibold tabular-nums">{item.quantity}</span><button type="button" disabled={busy || unavailable || item.quantity >= (item.variant?.stockLeft ?? 0)} onClick={() => void onQuantity(item.quantity + 1)} className="grid size-9 place-items-center disabled:opacity-40" aria-label="Increase quantity"><Plus className="size-3.5" /></button></div><button type="button" disabled={busy} onClick={() => void onRemove()} className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-40" aria-label={`Remove ${item.product.name}`}><Trash2 className="size-4" /></button></div>
      </div>
    </article>
  );
}
