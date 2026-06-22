'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Heart, ShoppingBag } from 'lucide-react';

import { products } from '@/data/products';
import { ProductType } from '@/types';

import SingleProductSidebar from './SingleProductSidebar';

type ClientViewProps = {
  productId: string;
};

export default function ProductPageClientView({ productId }: ClientViewProps) {
  console.log('Received Product ID:', productId);

  const product = products.find(
    product =>
      product.id.trim() === String(productId).trim() || product.slug.trim() === String(productId).trim()
  );

  console.log('Found Product:', product);

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);

  const variants = product?.variants ?? [];

  const activeVariant = useMemo(() => {
    if (!product) return null;

    return product.variants.find(v => v.id === selectedVariantId) ?? product.variants[0] ?? null;
  }, [product, selectedVariantId]);

  if (!product) {
    return (
      <div className="p-10 text-white">
        <p>Product not found</p>

        <pre className="mt-4 text-xs">
          {JSON.stringify(
            {
              productId,
              firstProductId: products[0]?.id,
              firstProductSlug: products[0]?.slug
            },
            null,
            2
          )}
        </pre>
      </div>
    );
  }

  const activePrice = activeVariant?.price ?? 0;
  const activeImage = activeVariant?.image ?? '';
  const activeStock = activeVariant?.stockLeft ?? 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        {/* PRODUCT CONTENT */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 items-start">
            {/* IMAGE */}
            <div className="relative aspect-15/18 w-full overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/40">
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
            <div className="flex flex-col space-y-6 justify-center">
              <div className="bg-card p-4 rounded-md">
                <h1 className="text-xl md:text-3xl font-bold text-white">{product.name}</h1>

                <p className="mt-2 text-sm text-zinc-400">{product.shortDescription}</p>

                <p className="mt-3 text-xl md:text-2xl font-semibold text-rose-500">
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
                        key={variant.id}
                        type="button"
                        aria-label={variant.label}
                        onClick={() => setSelectedVariantId(variant.id)}
                        className={`rounded-lg border px-4 py-2 text-xs transition ${
                          activeVariant?.id === variant.id
                            ? 'border-rose-500 bg-rose-500/10 text-rose-400'
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
                  type="button"
                  aria-label="Add to cart"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-600 py-3.5 text-sm text-white">
                  <ShoppingBag size={18} />
                  Add to Cart
                </button>

                <button
                  type="button"
                  aria-label="Wishlist"
                  onClick={() => setIsLiked(prev => !prev)}
                  className={`flex h-12 w-12 items-center justify-center rounded-xl border ${
                    isLiked ? 'border-rose-500 text-rose-500' : 'border-white/10 text-zinc-400'
                  }`}>
                  <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <div>
          <SingleProductSidebar productId={productId} />
        </div>
      </div>
    </div>
  );
}
