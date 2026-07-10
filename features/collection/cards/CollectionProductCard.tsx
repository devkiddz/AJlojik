'use client';

import Image from 'next/image';
import { Eye, Heart, ShoppingCart } from 'lucide-react';

import { ProductType } from '@/types';

type Props = {
  product: ProductType;
  onSelect?: (id: string) => void;
  onToggleLike?: (id: string) => void;
};

export default function CollectionProductCard({ product, onSelect, onToggleLike }: Props) {
  const variant = product.variants[0];

  return (
    <article
      onClick={() => onSelect?.(product.id)}
      className="group shrink-0 cursor-pointer rounded-lg text-left">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
        <Image
          src={variant.image}
          alt={product.name}
          fill
          sizes="170px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <button
          aria-label="Like product"
          type="button"
          onClick={e => {
            e.stopPropagation();
            onToggleLike?.(product.id);
          }}
          className="absolute left-2 top-2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md cursor-pointer">
          <Heart className="h-4 w-4" />
        </button>

        <div className="absolute bottom-2 right-2 z-20 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            aria-label="Preview Product"
            type="button"
            onClick={e => {
              e.stopPropagation();
              onSelect?.(product.id);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-md">
            <Eye className="h-4 w-4" />
          </button>

          <button
            aria-label="Add to cart"
            type="button"
            onClick={e => {
              e.stopPropagation();
              console.log('Add to cart:', product.id, variant.id);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-white shadow-md">
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-2">
        <h3 className="line-clamp-1 text-sm font-semibold">{product.name}</h3>

        {/* <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{product.shortDescription}</p> */}

        <p className=" text-sm font-bold text-secondary">₦{variant.price.toLocaleString()}</p>
      </div>
    </article>
  );
}
