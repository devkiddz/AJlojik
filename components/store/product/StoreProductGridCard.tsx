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
    <article className="group overflow-hidden rounded-xl border border-card bg-card shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-card hover:border-accent/30">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-lg">
          <Image
            src={variant.image}
            alt={product.name}
            fill
            sizes="(max-width:768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      </Link>

      <div className=" flex-col p-4 items-center justify-between">
        <div className="flex">
          <h3 className="line-clamp-1 text-sm font-semibold text-primary md:text-sm">{product.name}</h3>
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          <span className="text-[11px] font-bold text-base md:text-sm">
            ₦{variant.price.toLocaleString()}
          </span>
          {onPreview && (
            <button
              type="button"
              aria-label="Preview"
              onClick={e => {
                e.preventDefault();
                onPreview(product);
              }}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-card/10 text-base transition-all duration-200 hover:text-primary hover:shadow-sm md:h-8 md:w-8">
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
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-card/10 text-base transition-all duration-200 hover:text-primary hover:shadow-sm md:h-8 md:w-8">
            <ShoppingCart className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
