'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Eye, Heart, ShoppingCart } from 'lucide-react';

import { ProductType, ProductVariantType } from '@/types';

type Props = {
  product: ProductType;
  onPreview?: (product: ProductType) => void;
  onToggleLike?: (productId: string) => void;
  onAddToCart?: (product: ProductType, variant: ProductVariantType) => void;
};

export default function StoreProductGridCard({ product, onPreview, onToggleLike, onAddToCart }: Props) {
  const variant = product.variants[0];

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative block overflow-hidden rounded-xl border border-border/40 bg-card transition-all duration-300 hover:border-primary/20 hover:shadow-lg">
      {/* IMAGE */}
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={variant.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* FLOATING TOOLBAR */}
        <div className="absolute top-2 right-2 z-20">
          <div className="flex h-auto md:h-10 flex-col items-center overflow-hidden rounded-full border border-border/20 bg-white shadow-lg transition-all duration-300 ease-out md:group-hover:h-[120px]">
            {/* LIKE */}
            <button
              type="button"
              aria-label="Like product"
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                onToggleLike?.(product.id);
              }}
              className="flex h-10 w-10 items-center justify-center text-muted-foreground transition-colors hover:bg-secondary hover:text-primary md:opacity-0 md:group-hover:opacity-100">
              <Heart
                className={`h-4 w-4 transition-all ${product.liked ? 'fill-secondary text-secondary' : ''}`}
              />
            </button>

            {/* PREVIEW */}
            <button
              type="button"
              aria-label="Preview product"
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                onPreview?.(product);
              }}
              className="flex h-10 w-10 items-center justify-center text-muted-foreground transition-colors hover:bg-secondary hover:text-primary md:opacity-0 md:group-hover:opacity-100">
              <Eye className="h-4 w-4" />
            </button>

            {/* CART */}
            <button
              type="button"
              aria-label="Add to cart"
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                onAddToCart?.(product, variant);
              }}
              className="flex h-10 w-10 items-center justify-center text-muted-foreground transition-colors hover:bg-secondary hover:text-primary md:opacity-0 md:group-hover:opacity-100">
              <ShoppingCart className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="space-y-0.5 p-2">
        <h3 className="line-clamp-1 text-sm font-medium leading-tight">{product.name}</h3>
        <p className="line-clamp-1 text-sm font-semibold text-primary">₦{variant.price.toLocaleString()}</p>
      </div>
    </Link>
  );
}
