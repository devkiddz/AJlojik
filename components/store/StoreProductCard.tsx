'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChartColumnStacked, ShoppingCartIcon, Eye } from 'lucide-react';

import { ProductType, ProductVariantType } from '@/types';
import LikedComponent from '@/components/shared/LikedComponent';
import { Button } from '../ui/button';

type ProductCardProps = {
  product: ProductType;
  onAddToCart?: (product: ProductType, variant: ProductVariantType) => void;
  onPreview?: (product: ProductType) => void;
  onToggleLike?: (productId: string) => void;
};

export default function ProductCard({ product, onAddToCart, onPreview, onToggleLike }: ProductCardProps) {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);

  // Track the selected variant; default to the first one available
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0]?.id ?? '');

  const activeVariant = product.variants.find(v => v.id === selectedVariantId) ?? product.variants[0];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  return (
    <article onClick={() => router.push(`/products/${product.slug}`)} className="group cursor-pointer">
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        className="premium-card relative overflow-hidden rounded-2xl border border-accent/10 transition-all duration-500 hover:-translate-y-1 hover:border-accent/30 hover:shadow-[0_25px_60px_rgba(0,0,0,0.25)]">
        {/* MICROSOFT FLUENT LIGHT EFFECT */}
        <div
          className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(350px circle at var(--mouse-x) var(--mouse-y), rgba(201,162,39,.18), transparent 45%)`
          }}
        />

        {/* IMAGE */}
        <div className="relative aspect-[5/7] md:aspect-[5/6]">
          <Image
            src={activeVariant.image}
            alt={product.name}
            fill
            sizes="(max-width:768px) 75vw, 240px"
            className="object-cover transition-all duration-700 brightness-105 group-hover:scale-[1.08] group-hover:brightness-125"
          />

          {/* CATEGORY, LIKE, DISCOUNT BANNERS (Kept original logic) */}
          <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-center gap-1 bg-gradient-royal p-2 text-[10px] uppercase tracking-wider text-white">
            <ChartColumnStacked className="h-3 w-3" /> {product.category}
          </div>

          <div className="absolute left-2 top-8 z-40" onClick={e => e.stopPropagation()}>
            <LikedComponent
              productId={product.id}
              liked={product.liked}
              onToggle={() => onToggleLike?.(product.id)}
            />
          </div>

          {product.discountPercentage > 0 && (
            <div className="absolute right-2 top-11 z-40 rounded-full bg-secondary px-2 py-1 text-[10px] font-semibold text-white">
              -{product.discountPercentage}% OFF
            </div>
          )}

          <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

          {/* CONTENT AREA */}
          <div className="absolute inset-x-0 bottom-0 z-30 p-3 text-white">
            <h3 className="line-clamp-1 text-sm font-semibold">{product.name}</h3>

            {/* VARIANT TOGGLE UI */}
            <div className="flex gap-1.5 my-1.5" onClick={e => e.stopPropagation()}>
              {product.variants.map(v => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariantId(v.id)}
                  className={`text-[9px] px-2 py-0.5 rounded border transition-colors ${
                    selectedVariantId === v.id
                      ? 'bg-accent text-black border-accent'
                      : 'bg-white/10 border-white/20'
                  }`}>
                  {v.label}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-accent drop-shadow-md">
                ₦{activeVariant.price.toLocaleString()}
              </span>

              <div className="flex items-center gap-2">
                {onPreview && (
                  <Button
                    className="h-8 w-8 rounded-full text-base hover:ring transition-all cursor-pointer hover:scale-110"
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      onPreview?.(product);
                    }}>
                    <Eye className="h-4 w-4 text-base" />
                  </Button>
                )}
                <Button
                  size="icon"
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    onAddToCart?.(product, activeVariant);
                  }}
                  className="h-8 w-8 rounded-full bg-secondary text-white hover:ring hover:scale-110 hover:bg-secondary/90 transition-transform cursor-pointer">
                  <ShoppingCartIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
