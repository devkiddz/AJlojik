'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { ChartColumnStacked, Heart, ShoppingBag } from 'lucide-react';

import { ProductType } from '@/types/types';

import SingleProductSidebar from './SingleProductSidebar';

type ClientViewProps = {
  product: ProductType;
};

export default function ProductPageClientView({ product }: ClientViewProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  const [isLiked, setIsLiked] = useState(product.liked);

  const variants = product.variants ?? [];

  const activeVariant = useMemo(() => {
    return product.variants.find(variant => variant.id === selectedVariantId) ?? product.variants[0] ?? null;
  }, [product, selectedVariantId]);

  const activePrice = activeVariant?.price ?? 0;

  const activeImage = activeVariant?.image ?? '';

  const activeStock = activeVariant?.stockLeft ?? 0;

  console.log(product.category);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        {/* PRODUCT CONTENT */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-2">
            {/* IMAGE */}
            <div className="relative aspect-[15/18] w-full overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/40">
              {activeImage && (
                <Image
                  src={activeImage}
                  alt={product.name}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              )}
            </div>

            {/* DETAILS */}
            <div className="flex flex-col justify-center space-y-6">
              <div className="relative rounded-md bg-card p-4">
                <span className="absolute top-0 left-0 z-35 flex w-full items-center justify-center gap-1.5 border-b border-white/10 bg-gradient-to-r from-rose-950 via-rose-900 to-rose-600 p-2 text-[11px] font-medium text-white backdrop-blur-sm">
                  <ChartColumnStacked className="h-3 w-3 animate-pulse text-white" />

                  <span className="text-[10px] tracking-wide uppercase text-white/90">
                    {product.category}
                  </span>
                </span>

                <div className="relative mt-5">
                  <h1 className="text-xl font-bold text-white md:text-3xl">{product.name}</h1>
                </div>

                <p className="mt-2 text-sm text-zinc-400">{product.shortDescription}</p>

                <p className="mt-3 text-xl font-semibold text-secondary md:text-2xl">
                  ₦{activePrice.toLocaleString()}
                </p>
              </div>

              <div className="bg-white/10" />

              <div>
                <h2 className="text-xs font-semibold uppercase text-zinc-400">Description</h2>

                <p className="mt-2 text-sm text-zinc-300">{product.longDescription}</p>
              </div>

              {/* VARIANTS */}
              {variants.length > 0 && (
                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase text-zinc-400">Options</h3>

                  <div className="flex flex-wrap gap-2">
                    {variants.map(variant => (
                      <button
                        aria-label="Select variant"
                        key={variant.id}
                        type="button"
                        onClick={() => setSelectedVariantId(variant.id)}
                        className={`rounded-lg border px-4 py-2 text-xs transition ${
                          activeVariant?.id === variant.id
                            ? 'border-secondary bg-secondary/10 text-rose-400'
                            : 'border-white/10 text-zinc-300 hover:border-white/20'
                        }`}>
                        {variant.label}
                      </button>
                    ))}
                  </div>

                  <p className="mt-2 text-xs text-zinc-500">Stock: {activeStock}</p>
                </div>
              )}

              {/* CTA */}
              <div className="flex gap-3 pt-2">
                <button
                  aria-label="Add to cart"
                  type="button"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-600 py-3.5 text-sm text-white">
                  <ShoppingBag size={18} />
                  Add to Cart
                </button>

                <button
                  type="button"
                  aria-label="Add to wishlist"
                  onClick={() => setIsLiked(prev => !prev)}
                  className={`flex h-12 w-12 items-center justify-center rounded-xl border ${
                    isLiked ? 'border-secondary text-secondary' : 'border-white/10 text-zinc-400'
                  }`}>
                  <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <div>
          <SingleProductSidebar productId={product.id} />
        </div>
      </div>
    </div>
  );
}
