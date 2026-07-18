'use client';

import Image from 'next/image';

import { cn } from '@/lib/utils';

import type { BaseProductCardProps } from './productCardTypes';

import { PremiumCardSurface } from './PremiumCardSurface';

import { ProductActionTray } from './ProductActionTray';

import { ProductStatusBadges } from './ProductStatusBadges';

import { useProductVariant } from './useProductVariant';

export function ProductCard({
  product,
  className,
  onPreview,
  onOpenExperience,
  onAddToCart
}: BaseProductCardProps) {
  const { selectedVariant, selectedVariantId, setSelectedVariantId } = useProductVariant(product);

  if (!selectedVariant) {
    return null;
  }

  const openProductExperience = () => {
    onOpenExperience?.(product);
  };

  return (
    <PremiumCardSurface
      glowSize={320}
      className={cn('group h-full min-w-0 rounded-2xl border border-border/60 bg-card shadow-sm', className)}>
      <div className="flex h-full flex-col">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <button
            type="button"
            aria-label={`Open ${product.name} experience`}
            onClick={openProductExperience}
            className="absolute inset-0 z-10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
            <span className="sr-only">Open {product.name}</span>
          </button>

          <Image
            src={selectedVariant.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 260px"
            className="object-cover transition duration-500 group-hover:scale-[1.025]"
          />

          <ProductStatusBadges product={product} />

          <ProductActionTray
            product={product}
            selectedVariant={selectedVariant}
            selectedVariantId={selectedVariantId}
            onSelectedVariantIdChange={setSelectedVariantId}
            onPreview={onPreview}
            onAddToCart={onAddToCart}
          />
        </div>

        <button
          type="button"
          onClick={openProductExperience}
          className="w-full min-w-0 p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
          <h3 className="line-clamp-2 text-sm font-semibold leading-5 tracking-tight text-card-foreground">
            {product.name}
          </h3>
        </button>
      </div>
    </PremiumCardSurface>
  );
}
