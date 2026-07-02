'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChartColumnStacked, Eye } from 'lucide-react';
import { ProductType } from '@/types';
import LikedComponent from './LikedComponent';

type ProductCardProps = {
  product: ProductType;
  onSelect?: () => void;
  onPreview?: () => void;
  onToggleLike?: () => void;
};

export default function ProductCard({ product, onSelect, onPreview, onToggleLike }: ProductCardProps) {
  const router = useRouter();
  const cardRef = useRef<HTMLElement>(null);
  const [selectedVariantId] = useState(product.variants[0]?.id ?? '');
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

  const activeVariant = product.variants.find(v => v.id === selectedVariantId) ?? product.variants[0];

  const handleCardClick = () => {
    router.push(`/products/${product.slug}`);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  return (
    <article
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onClick={handleCardClick}
      className="group relative overflow-hidden rounded-2xl premium-card fluent-card cursor-pointer transition-all duration-500 hover:shadow-[0_30px_80px_rgba(8,17,32,.28)]">
      {/* FLUENT SPOTLIGHT */}
      <div
        className="pointer-events-none absolute inset-0 z-20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(201,162,39,.28) 0%, rgba(201,162,39,.12) 15%, transparent 45%)`
        }}
      />

      <div className="relative w-full aspect-[5/7] md:aspect-[5/6] overflow-hidden rounded-xl bg-gradient-brand">
        {/* CATEGORY */}
        <span className="absolute top-0 left-0 z-30 flex w-full items-center justify-center gap-1.5 bg-gradient-royal p-2 text-[11px] font-medium text-white border-b border-white/10 backdrop-blur-sm">
          <ChartColumnStacked className="h-3 w-3 animate-pulse" />
          <span className="text-[10px] uppercase tracking-wide">{product.category}</span>
        </span>

        {/* IMAGE */}
        <Image
          src={activeVariant.image}
          alt={product.name}
          fill
          sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 25vw"
          className="object-cover transition-all duration-700 group-hover:scale-[1.08] group-hover:saturate-125 group-hover:contrast-110 group-hover:brightness-110"
        />

        {/* IMAGE COLOR ENHANCER */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/15 via-transparent to-transparent" />

        {/* GOLD GLOW */}
        <div
          className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: 'radial-gradient(circle at center, rgba(201,162,39,.18), transparent 70%)' }}
        />

        {/* ACTIONS */}
        <div
          className="absolute inset-x-0 top-7 z-30 flex items-center justify-between px-2"
          onClick={e => e.stopPropagation()}>
          <LikedComponent productId={product.id} liked={product.liked} onToggle={onToggleLike} />

          {product.discountPercentage > 0 && (
            <span className="absolute top-3 right-1 rounded-full border border-accent/30 bg-secondary/80 px-2 py-1 text-[0.6rem] font-semibold text-white backdrop-blur-md animate-pulse">
              -{product.discountPercentage}% OFF
            </span>
          )}
        </div>

        {/* READABILITY OVERLAY */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/45 to-transparent" />

        {/* CONTENT */}
        <div className="absolute inset-x-0 bottom-0 z-40 p-4 text-white backdrop-blur-[2px]">
          <div className="flex flex-col gap-2">
            <div>
              <h3 className="line-clamp-1 text-sm md:text-base font-semibold tracking-wide">
                {product.name}
              </h3>
              <p className="line-clamp-1 text-[0.7rem] text-white/80">{product.shortDescription}</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm font-bold text-accent drop-shadow-[0_0_12px_rgba(201,162,39,.5)]">
                ₦{activeVariant.price.toLocaleString()}
              </div>

              <div
                className="pointer-events-auto translate-y-0 opacity-100 transition-all duration-300 md:pointer-events-none md:translate-y-2 md:opacity-0 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100"
                onClick={e => {
                  e.stopPropagation();
                  onPreview?.() ?? onSelect?.();
                }}>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full bg-secondary/70 hover:bg-secondary px-3 py-1.5 text-xs font-medium text-primary backdrop-blur-md transition-all active:scale-95 cursor-pointer">
                  <span className="hidden md:inline">Preview</span>
                  <Eye className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
