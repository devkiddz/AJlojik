'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Eye, ShoppingCart } from 'lucide-react';

import { ProductType, ProductVariantType } from '@/types';

type Props = {
  product: ProductType;
  onPreview?: (product: ProductType) => void;
  onToggleLike?: (productId: string) => void;
  onAddToCart?: (product: ProductType, variant: ProductVariantType) => void;
};

export default function StoreProductGridCard({ product, onPreview, onAddToCart }: Props) {
  const variant = product.variants[0];

  return (
    <article
      className="
        p-2
        group rounded-lg
        bg-gradient-brand
        transition-all
        hover:bg-card
      ">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-md">
          <Image
            src={variant.image}
            alt={product.name}
            fill
            sizes="(max-width:768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        <h3 className="mt-2 line-clamp-1 text-xs font-semibold text-white md:text-sm">{product.name}</h3>
      </Link>

      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-white md:text-sm">₦{variant.price.toLocaleString()}</span>

        <div className="flex items-center gap-1 md:gap-2">
          {onPreview && (
            <button
              type="button"
              aria-label="Preview"
              onClick={e => {
                e.preventDefault();
                onPreview(product);
              }}
              className="
                flex h-7 w-7 items-center justify-center
                rounded-full bg-card text-white
                transition hover:ring
                md:h-8 md:w-8
                cursor-pointer
              ">
              <Eye className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </button>
          )}

          <button
            type="button"
            aria-label="Add to cart"
            onClick={e => {
              e.preventDefault();
              onAddToCart?.(product, variant);
            }}
            className="
              flex h-7 w-7 items-center justify-center
              rounded-full bg-card text-white
              transition hover:ring
              md:h-8 md:w-8
              cursor-pointer
            ">
            <ShoppingCart className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
