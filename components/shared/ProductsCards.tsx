'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChartColumnStacked, Eye } from 'lucide-react';

import { ProductType } from '@/types';
import LikedComponent from './LikedComponent';
import RatingComponent from './RatingComponent';

type ProductCardProps = {
  product: ProductType;
  onSelect?: () => void;
  onPreview?: () => void;
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
      className="group cursor-pointer rounded-xl border bg-background p-2 transition-all duration-300 hover:shadow-md">
      <div className="relative aspect-3/5 overflow-hidden rounded-lg bg-muted">
        {/* CATEGORY TAG */}
        <span className="absolute top-0 left-0 w-full z-35 flex items-center justify-center gap-1.5 p-2 text-[11px] font-medium text-white bg-gradient-to-r from-rose-950 via-rose-900 to-rose-600 backdrop-blur-sm border-b border-white/10">
          <ChartColumnStacked className="h-3 w-3 text-rose-300 animate-pulse" />
          <span className="tracking-wide uppercase text-[10px] text-white/90">{product.category}</span>
        </span>

        {/* BACKGROUND PRODUCT IMAGE */}
        <Image
          src={activeVariant.image}
          alt={product.name}
          fill
          sizes="(max-w:768px) 100vw, (max-w:1200px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />

        {/* ACTIONS HEADER BAR */}
        <div
          className="w-full absolute inset-x-0 top-7 z-20 flex items-center justify-between px-2"
          onClick={e => e.stopPropagation()}>
          <span>
            <LikedComponent productId={product.id} liked={product.liked} onToggle={onToggleLike} />
          </span>
          {product.discountPercentage > 0 && (
            <span className="rounded-full absolute top-3 right-1 bg-rose-500/30 px-2 py-1 text-[0.6rem] font-semibold text-white backdrop-blur-md shadow-sm border border-white/5">
              -{product.discountPercentage}% OFF
            </span>
          )}
        </div>

        {/* DARK GRADIENT OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300 group-hover:from-black/95" />

        {/* BOTTOM CONTENT SHELF */}
        <div className="absolute inset-x-0 bottom-0 z-20 p-3 text-white">
          <div className="flex flex-col gap-1">
            <div className="flex flex-col">
              <h3 className="line-clamp-1 text-sm md:text-base font-medium tracking-wide">{product.name}</h3>
              <p className="line-clamp-1 text-[0.7rem]">{product.shortDescription}</p>
            </div>
            <div className="flex items-center justify-between min-h-8">
              <div className="text-sm font-bold text-rose-500">
                {/* RATING */}
                {/* <RatingComponent rating={product.rating} reviews={product.reviews} />₦ */}
                {activeVariant.price.toLocaleString()}
              </div>

              {/* REVEAL ON HOVER ACTION CONTAINER */}
              <div
                className="transition-all duration-300 ease-out transform pointer-events-auto opacity-100 translate-y-0 md:opacity-0 md:translate-y-2 md:pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto"
                onClick={e => {
                  e.stopPropagation();
                  if (onPreview) onPreview();
                  else if (onSelect) onSelect();
                }}>
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs backdrop-blur-md font-medium text-white transition active:scale-95 cursor-pointer">
                  <span className="hidden md:inline">Preview</span>
                  <Eye className="h-3 w-3 text-rose-500" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
