'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChartColumnStacked, Eye, ShoppingCartIcon } from 'lucide-react';

import { ProductType } from '@/types';
import LikedComponent from '@/components/shared/LikedComponent';

type ProductCardProps = {
  product: ProductType;
  onSelect?: () => void; // Main card fallback click
  onPreview?: () => void; // Dedicated preview button function
  onToggleLike?: () => void;
};

export default function ProductCard({ product, onSelect, onPreview, onToggleLike }: ProductCardProps) {
  const router = useRouter();
  const [selectedVariantId, setSelectedVariantId] = useState<string>(product.variants[0]?.id ?? '');

  const activeVariant =
    product.variants.find(variant => variant.id === selectedVariantId) ?? product.variants[0];

  const handleCardClick = () => {
    router.push(`/products/${product.slug}`);
  };

  return (
    <article
      onClick={handleCardClick}
      className="group cursor-pointer rounded-xl border bg-background p-1.5 transition-all duration-300 hover:shadow-lg">
      {/* MASTER HOVER CANVAS CONTAINER */}
      <div className="relative aspect-3/4 overflow-hidden rounded-lg bg-muted w-full">
        {/* PREMIUM WINE GRADIENT CATEGORY BANNER */}
        <span className="absolute top-0 left-0 w-full z-30 flex items-center justify-center gap-1.5 p-2 text-[10px] font-medium text-white bg-gradient-to-r from-rose-950 via-rose-900 to-rose-600 backdrop-blur-sm border-b border-white/10">
          <ChartColumnStacked className="h-3 w-3 text-rose-300 animate-pulse" />
          <span className="tracking-wide uppercase text-[9px] text-white/90">{product.category}</span>
        </span>

        {/* ACTIVE OVERLAY BACKGROUND IMAGE */}
        <Image
          src={activeVariant.image}
          alt={product.name}
          fill
          sizes="(max-w: 768px) 75vw, 240px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />

        {/* INTERACTION BADGES TRACK */}
        <div className="absolute inset-0 z-20 pointer-events-none" onClick={e => e.stopPropagation()}>
          <span className="absolute top-11 left-2.5 pointer-events-auto">
            <LikedComponent productId={product.id} liked={product.liked} onToggle={onToggleLike} />
          </span>

          {product.discountPercentage > 0 && (
            <span className="top-11 right-2.5 absolute rounded-full bg-rose-500 px-2 py-0.5 text-[9px] font-semibold text-white shadow-sm border border-white/5">
              -{product.discountPercentage}% OFF
            </span>
          )}
        </div>

        {/* DENSE TEXT-LEGIBILITY GRADIENT OVERLAY (Fades deeper from the midsection down) */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/95 via-black/60 to-transparent transition-all duration-300 group-hover:via-black/70" />

        {/* METADATA CONTENT OVERLAYED DIRECTLY ON TOP OF IMAGE */}
        <div className="absolute inset-x-0 bottom-0 z-20 p-3 text-white flex flex-col justify-end">
          <h3 className="line-clamp-1 text-xs md:text-sm font-semibold tracking-tight text-white drop-shadow-xs">
            {product.name}
          </h3>

          <p className="mt-0.5 line-clamp-1 pr-2 text-[10px] text-zinc-300 leading-normal">
            {product.shortDescription}
          </p>

          {/* PRICE + ACCORDION HOVER ROW */}
          <div className="mt-2.5 flex items-center justify-between min-h-7">
            <span className="text-xs md:text-sm font-bold text-rose-400 drop-shadow-sm">
              ₦{activeVariant.price.toLocaleString()}
            </span>

            {/* PREVIEW BUTTON CONTAINER */}
            <div
              className="transition-all duration-300 ease-out transform pointer-events-auto opacity-100 translate-y-0 md:opacity-0 md:translate-y-2 md:pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto"
              onClick={e => {
                e.stopPropagation();
                if (onPreview) onPreview();
                else if (onSelect) onSelect();
              }}>
              <button
                type="button"
                className="flex items-center gap-1 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-md transition active:scale-95 cursor-pointer">
                <span>Add Item</span>
                <ShoppingCartIcon className="h-3 w-3 text-rose-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
