'use client';

import Image from 'next/image';
import { ArrowUpRight, Package, Tag } from 'lucide-react';
import { ProductType } from '@/types';

type Props = {
  product?: ProductType;
};

export default function SearchPreview({ product }: Props) {
  if (!product) {
    return (
      <div className="flex h-full items-center justify-center rounded-3xl border border-dashed text-sm text-muted-foreground">
        Select a product to preview
      </div>
    );
  }

  const variant = product.variants[0];

  return (
    <aside className="flex flex-col rounded-3xl border bg-muted/20 p-5">
      <div className="relative mb-5 aspect-square rounded-2xl">
        <Image src={variant.image} alt={product.name} fill className="object-cover" />
      </div>

      <h2 className="text-lg font-bold">{product.name}</h2>

      <p className="mt-2 text-sm text-muted-foreground">{product.shortDescription}</p>

      <div className="mt-6 space-y-3">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4" />
          <span>{variant.label}</span>
        </div>

        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4" />
          <span>{product.category}</span>
        </div>
      </div>

      <div className="mt-auto pt-8">
        <p className="text-2xl font-bold text-primary">₦{variant.price.toLocaleString()}</p>

        <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-primary-foreground transition hover:opacity-90">
          View Product
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
