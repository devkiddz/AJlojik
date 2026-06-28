'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { Heart, ShoppingBag } from 'lucide-react';

import { ProductType } from '@/types';
import { categories } from '@/categories';
import RecentlyViewedSidebar from '../modules/RecentlyViewedSidebar';
import ProductActions from './ProductActions';

type Props = {
  product: ProductType;
};

export default function SingleProductGalleryView({ product }: Props) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(product.liked);

  const category = categories.find(item => item.slug === product.category);

  const activeVariant = useMemo(() => {
    return product.variants.find(variant => variant.id === selectedVariantId) ?? product.variants[0] ?? null;
  }, [product, selectedVariantId]);

  const activeImage = activeVariant?.image ?? product.variants[0]?.image;
  const activePrice = activeVariant?.price ?? 0;
  const activeStock = activeVariant?.stockLeft ?? 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      {/* TOP BAR */}
      <div className="mb-8 border-y border-border bg-card p-5">
        <h3 className="text-sm font-medium text-muted-foreground">Available Options</h3>
      </div>

      {/* MAIN GRID */}
      <div className="grid gap-8 lg:grid-cols-[1fr_340px_320px]">
        {/* IMAGE + VARIANTS */}
        <div className="rounded-2xl border border-border bg-card">
          <div className="flex h-full gap-4 p-4">
            {/* VARIANTS */}
            <div className="flex flex-col gap-3">
              {product.variants.map(variant => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariantId(variant.id)}
                  className={`min-h-11 min-w-[90px] rounded-xl border px-4 text-sm transition-all ${
                    activeVariant?.id === variant.id
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border hover:bg-muted'
                  }`}>
                  {variant.label}
                </button>
              ))}
            </div>

            {/* PRODUCT IMAGE */}
            <div className="relative aspect-20/25 flex-1 overflow-hidden rounded-xl bg-muted">
              {activeImage && (
                <Image
                  src={activeImage}
                  alt={product.name}
                  fill
                  priority
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              )}
            </div>
          </div>
        </div>

        {/* PRODUCT INFO */}
        <div className="space-y-4">
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{category?.label}</span>

          <h1 className="text-4xl font-bold leading-tight xl:text-5xl">{product.name}</h1>

          <p className="leading-7 text-muted-foreground">{product.shortDescription}</p>

          <div className="sticky top-24 rounded-2xl border border-border bg-card p-6">
            <p className="text-3xl font-bold">₦{activePrice.toLocaleString()}</p>

            <p className="mt-2 text-sm text-muted-foreground">Stock Available: {activeStock}</p>

            <div className="mt-6 space-y-3">
              <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-medium text-primary-foreground">
                <ShoppingBag size={18} />
                Add To Cart
              </button>

              <button
                onClick={() => setIsLiked(prev => !prev)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3">
                <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
                Wishlist
              </button>
            </div>
          </div>
          <ProductActions product={product} />
        </div>

        {/* PURCHASE CARD */}
        <aside>
          <RecentlyViewedSidebar />
        </aside>
      </div>
    </div>
  );
}
