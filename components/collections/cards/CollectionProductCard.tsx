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
    <article className="group relative h-[285px] w-[220px] shrink-0 overflow-hidden rounded-xl border border-white/10 bg-card shadow-lg">
      <button type="button" onClick={() => onSelect?.(product.id)} className="absolute inset-0 text-left">
        <Image
          src={variant.image}
          alt={product.name}
          fill
          sizes="240px"
          className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10" />

        <div className="absolute inset-x-0 top-0 z-20 bg-gradient-royal px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wider text-white">
          {product.category}
        </div>

        <button
          aria-label="Like product"
          type="button"
          onClick={e => {
            e.stopPropagation();
            onToggleLike?.(product.id);
          }}
          className="absolute left-3 top-12 z-30 text-secondary">
          <Heart className="h-5 w-5" />
        </button>

        <div className="absolute inset-x-0 bottom-0 z-30 p-4">
          <h3 className="line-clamp-1 text-sm font-bold text-white">{product.name}</h3>

          <div className="mt-2 flex gap-1">
            {product.variants.slice(0, 3).map(item => (
              <span
                key={item.id}
                className="rounded-md bg-accent px-2 py-1 text-[9px] font-medium text-accent-foreground">
                {item.label}
              </span>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <p className="text-base font-extrabold text-accent">₦{variant.price.toLocaleString()}</p>

            <div className="flex gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <Eye className="h-4 w-4" />
              </span>

              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-white">
                <ShoppingCart className="h-4 w-4" />
              </span>
            </div>
          </div>
        </div>
      </button>
    </article>
  );
}
