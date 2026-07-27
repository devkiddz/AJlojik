'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Archive, ArrowUpRight, LockKeyhole, MoreHorizontal, Pencil, Share2 } from 'lucide-react';
import { useState } from 'react';

import type { ShoppingList } from '../shoppingListTypes';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value);
}

type Props = {
  list: ShoppingList;
  onEdit: (list: ShoppingList) => void;
  onArchive: (list: ShoppingList) => void;
};

export function ShoppingListCard({ list, onEdit, onArchive }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const previewItems = list.items.slice(0, 4);

  return (
    <article className="group relative overflow-hidden rounded-3xl border bg-card shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <Link href={`/account/lists/${list.id}`} className="block">
        <div className="grid h-48 grid-cols-2 gap-px overflow-hidden bg-border">
          {previewItems.length ? previewItems.map((item, index) => (
            <div key={item.id} className="relative overflow-hidden bg-muted">
              <Image src={item.variant?.image ?? item.product.variants[0]?.image ?? '/placeholder.svg'} alt={item.product.name} fill sizes="240px" className="object-cover transition duration-500 group-hover:scale-105" />
              {index === 3 && list.itemCount > 4 ? <span className="absolute inset-0 grid place-items-center bg-black/60 text-sm font-bold text-white">+{list.itemCount - 3}</span> : null}
            </div>
          )) : (
            <div className="col-span-2 grid place-items-center bg-muted/60 text-center">
              <div><p className="font-semibold">Ready for your plans</p><p className="mt-1 text-sm text-muted-foreground">Add your first product from any supported card.</p></div>
            </div>
          )}
          {previewItems.length === 1 ? <div className="bg-muted/40" /> : null}
          {previewItems.length === 2 ? <><div className="bg-muted/40" /><div className="bg-muted/40" /></> : null}
          {previewItems.length === 3 ? <div className="bg-muted/40" /> : null}
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-4 pr-10">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">{list.visibility === 'SHARED' ? <Share2 className="size-3.5" /> : <LockKeyhole className="size-3.5" />}<span>{list.visibility === 'SHARED' ? 'Shared' : 'Private'}</span></div>
              <h2 className="mt-2 truncate text-lg font-semibold tracking-tight">{list.name}</h2>
            </div>
            <span className="grid size-9 shrink-0 place-items-center rounded-full border bg-background transition group-hover:bg-foreground group-hover:text-background"><ArrowUpRight className="size-4" /></span>
          </div>
          <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">{list.description ?? 'A personal collection organized around a shopping purpose.'}</p>
          <div className="mt-5 flex items-end justify-between border-t pt-4">
            <div><p className="text-sm font-semibold">{list.itemCount} {list.itemCount === 1 ? 'product' : 'products'}</p><p className="text-xs text-muted-foreground">{list.totalQuantity} planned</p></div>
            <p className="text-sm font-semibold">{formatCurrency(list.totalValue)}</p>
          </div>
        </div>
      </Link>

      <div className="absolute right-4 top-[13rem] z-20">
        <button type="button" onClick={() => setMenuOpen(value => !value)} className="grid size-9 place-items-center rounded-full border bg-background shadow-sm hover:bg-muted" aria-label={`Options for ${list.name}`}><MoreHorizontal className="size-4" /></button>
        {menuOpen ? (
          <div className="absolute right-0 top-11 w-44 rounded-2xl border bg-popover p-1.5 shadow-xl">
            <button type="button" onClick={() => { setMenuOpen(false); onEdit(list); }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-muted"><Pencil className="size-4" />Rename & edit</button>
            <button type="button" onClick={() => { setMenuOpen(false); onArchive(list); }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10"><Archive className="size-4" />Archive list</button>
          </div>
        ) : null}
      </div>
    </article>
  );
}
