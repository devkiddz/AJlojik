'use client';

import { useState, useMemo, useEffect } from 'react';

import Image from 'next/image';
import { Heart, ShoppingBag } from 'lucide-react';
import { products } from '@/data/products';
import { ProductType } from '@/types';
import { useParams } from 'next/navigation';

type ClientViewProps = {
  productId: string;
};

export default function ProductPageClientView({ productId }: ClientViewProps) {
  const params = useParams();

  const id = typeof params?.id === 'string' ? params.id : '';

  const product: ProductType | undefined = products.find(p => p.id === id || p.slug === id);

  const variants = product?.variants ?? [];

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);

  const activeVariant = useMemo(() => {
    if (!product) return null;

    return product.variants.find(v => v.id === selectedVariantId) ?? product.variants[0] ?? null;
  }, [product, selectedVariantId]);

  if (!product) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-zinc-400">Product not found</p>
      </div>
    );
  }

  const activePrice = activeVariant?.price ?? 0;
  const activeImage = activeVariant?.image ?? '';
  const activeStock = activeVariant?.stockLeft ?? 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 items-start">
        {/* IMAGE */}
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/40">
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
        <div className="flex flex-col space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white">{product.name}</h1>
            <p className="mt-2 text-sm text-zinc-400">{product.shortDescription}</p>
            <p className="mt-3 text-2xl font-semibold text-rose-500">₦{activePrice.toLocaleString()}</p>
          </div>

          <div className="h-px bg-white/10" />

          <div>
            <h2 className="text-xs font-semibold uppercase text-zinc-400">Description</h2>
            <p className="text-sm text-zinc-300 mt-2">{product.longDescription}</p>
          </div>

          {/* VARIANTS */}
          {variants.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase text-zinc-400 mb-2">Options</h3>

              <div className="flex flex-wrap gap-2">
                {variants.map(v => (
                  <button
                    aria-label="Options"
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`px-4 py-2 rounded-lg border text-xs transition ${
                      activeVariant?.id === v.id
                        ? 'border-rose-500 bg-rose-500/10 text-rose-400'
                        : 'border-white/10 text-zinc-300 hover:border-white/20'
                    }`}>
                    {v.label}
                  </button>
                ))}
              </div>

              <p className="text-xs text-zinc-500 mt-2">Stock: {activeStock}</p>
            </div>
          )}

          {/* CTA */}
          <div className="flex gap-3 pt-2">
            <button
              aria-label="Add to cart"
              type="button"
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-rose-600 text-white py-3.5 text-sm">
              <ShoppingBag size={18} />
              Add to Cart
            </button>

            <button
              type="button"
              aria-label="Wishlist"
              onClick={() => setIsLiked(!isLiked)}
              className={`h-12 w-12 rounded-xl border flex items-center justify-center ${
                isLiked ? 'border-rose-500 text-rose-500' : 'border-white/10 text-zinc-400'
              }`}>
              <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
