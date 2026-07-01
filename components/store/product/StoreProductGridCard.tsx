'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChartColumnStacked, Eye, ShoppingCart } from 'lucide-react';

import { ProductType, ProductVariantType } from '@/types';
import LikedComponent from '@/components/shared/LikedComponent';

type Props = {
  product: ProductType;
  onPreview?: (product: ProductType) => void;
  onToggleLike?: (productId: string) => void;
  onAddToCart?: (product: ProductType, variant: ProductVariantType) => void;
};

export default function StoreProductGridCard({ product, onPreview, onToggleLike, onAddToCart }: Props) {
  const variant = product.variants[0];

  return (
    <article className="relative group flex flex-col rounded-xl bg-gradient-brand p-4 transition-colors hover:bg-[#282828]">
      {/* LIKE BUTTON - Placed outside the Link to prevent navigation trigger */}
      <div className="absolute left-5 top-5 z-10">
        <LikedComponent
          productId={product.id}
          liked={product.liked}
          onToggle={() => onToggleLike?.(product.id)}
        />
      </div>

      {product.discountPercentage > 0 && (
        <div className="absolute right-2 top-7 z-40 rounded-full bg-secondary px-2 py-1 text-[10px] font-semibold text-white">
          -{product.discountPercentage}% OFF
        </div>
      )}

      {/* WRAPPER FOR NAVIGATION - Now excludes the LikedComponent */}
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative mb-4 aspect-square overflow-hidden rounded-md">
          <Image
            src={variant.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        <div className="mb-4">
          <h3 className="line-clamp-1 text-base font-semibold text-white">{product.name}</h3>
          <div className="flex items-center gap-2 text-secondary">
            <ChartColumnStacked className="h-3 w-3" /> {product.category}
          </div>
        </div>
      </Link>

      {/* ACTIONS AREA */}
      <div className="mt-auto flex items-center justify-between">
        <span className="text-sm font-bold text-white">₦{variant.price.toLocaleString()}</span>

        <div className="flex gap-2">
          {onPreview && (
            <button
              aria-label="Preview product"
              type="button"
              onClick={e => {
                e.preventDefault();
                onPreview?.(product);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-card hover:ring text-white transition-all cursor-pointer">
              <Eye className="h-4 w-4" />
            </button>
          )}

          <button
            aria-label="Add to cart"
            type="button"
            onClick={e => {
              e.preventDefault();
              onAddToCart?.(product, variant);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-card hover:ring text-white transition-all cursor-pointer">
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
