'use client';

import Image from 'next/image';

import { cn } from '@/lib/utils';

import type { BaseProductCardProps } from './productCardTypes';
import { openProductExperience } from './productCardPresentation';
import { PremiumCardSurface } from './PremiumCardSurface';
import { ProductActionTray } from './ProductActionTray';
import { useProductVariant } from './useProductVariant';

export function ProductCard({
  product,
  presentation = 'standard',
  className,
  onOpenExperience,
  onPreview,
  onAddToCart,
  onAskAI
}: BaseProductCardProps) {
  const { selectedVariant } = useProductVariant(product);

  if (!selectedVariant) {
    return null;
  }

  const featured = presentation === 'featured';

  const openExperience = (): void => {
    openProductExperience({
      product,
      onOpenExperience,
      onPreview
    });
  };

  return (
    <PremiumCardSurface
      glowSize={featured ? 280 : 200}
      className={cn(
        `group flex w-full max-w-[200px] min-w-0 flex-col rounded-lg border border-border/20 bg-card/60 p-1 shadow-sm backdrop-blur-sm`,
        featured && ['border-primary/25', 'bg-gradient-to-b', 'from-primary/10', 'via-card/85', 'to-card'],
        className
      )}>
      <button
        type="button"
        onClick={openExperience}
        aria-label={`Open ${product.name}`}
        className="relative block aspect-square w-full overflow-hidden rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70">
        <Image
          src={selectedVariant.image}
          alt=""
          fill
          sizes="(max-width: 640px) 42vw, (max-width: 900px) 28vw, (max-width: 1280px) 22vw, 17vw"
          className="scale-125 object-cover opacity-35 blur-2xl saturate-150"
        />

        <Image
          src={selectedVariant.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 42vw, (max-width: 900px) 28vw, (max-width: 1280px) 22vw, 17vw"
          className="relative z-10 object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />

        {featured ? (
          <span className="absolute left-1.5 top-1.5 z-30 rounded-full border border-white/20 bg-black/45 px-1.5 py-0.5 text-[0.45rem] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-lg">
            Featured
          </span>
        ) : null}
      </button>

      <div className="min-w-0 px-0.5 pb-0.5 pt-3">
        <button type="button" onClick={openExperience} className="block min-w-0 max-w-full text-left">
          <h3 title={product.name} className="line-clamp-1 text-[0.78rem] leading-3.5 text-foreground">
            {product.name}
          </h3>
        </button>
        <ProductActionTray
          product={product}
          variant={selectedVariant}
          onAddToCart={onAddToCart}
          onAskAI={onAskAI}
          presentation="inline"
          compact
          className="mt-2 border-0 bg-transparent p-0 shadow-none backdrop-blur-none"
        />
      </div>
    </PremiumCardSurface>
  );
}
