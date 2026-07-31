'use client';

import Image from 'next/image';

import { cn } from '@/lib/utils';

import type { BaseProductCardProps } from './productCardTypes';

import { openProductExperience } from './productCardPresentation';

import { ProductActionTray } from './ProductActionTray';

import { useProductVariant } from './useProductVariant';

type FeaturedProductCardPresentation = 'hero' | 'collection';

type FeaturedProductCardProps = BaseProductCardProps & {
  presentation?: FeaturedProductCardPresentation;
  title?: string;
};

export function FeaturedProductCard({
  product,
  className,
  presentation = 'hero',
  title,
  onOpenExperience,
  onPreview,
  onAddToCart,
  onAskAI
}: FeaturedProductCardProps) {
  const { selectedVariant } = useProductVariant(product);

  if (!selectedVariant) {
    return null;
  }

  const compact = presentation === 'collection';

  const displayTitle = title ?? product.name;

  const openExperience = (): void => {
    openProductExperience({
      product,
      onOpenExperience,
      onPreview
    });
  };

  return (
    <article
      className={cn(
        'group relative w-full min-w-0 overflow-hidden',
        'border border-border/60 bg-card shadow-sm',
        'transition duration-300 ease-out',
        'hover:border-border hover:shadow-lg',
        'focus-within:border-ring/40 focus-within:shadow-md',

        compact ? 'aspect-[4/3] rounded-2xl md:aspect-[16/9]' : 'aspect-[16/11] rounded-3xl md:aspect-[16/7]',

        className
      )}>
      <button
        type="button"
        onClick={openExperience}
        aria-label={`Open ${product.name}`}
        className="
          relative block size-full
          overflow-hidden text-left
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-inset
          focus-visible:ring-ring
        ">
        {/* ==================================================
            PRODUCT ARTWORK
        ================================================== */}

        <Image
          src={selectedVariant.image}
          alt={product.name}
          fill
          priority={!compact}
          sizes={compact ? '(max-width: 768px) 100vw, 48vw' : '(max-width: 768px) 100vw, 70vw'}
          className="
            object-cover object-center
            transition-transform
            duration-700 ease-out
            md:group-hover:scale-[1.025]
          "
        />

        {/* ==================================================
            IMAGE READABILITY
        ================================================== */}

        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute inset-0
            bg-gradient-to-t
            from-black/80
            via-black/10
            to-black/10
          "
        />

        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute inset-0
            hidden
            bg-gradient-to-r
            from-black/55
            via-black/10
            to-transparent
            md:block
          "
        />

        {/* ==================================================
            PRODUCT TITLE
        ================================================== */}

        <span
          className={cn(
            'absolute inset-x-0 bottom-0 z-10',
            'flex min-w-0 items-end',
            compact ? 'p-4 md:p-5' : 'p-5 md:p-7'
          )}>
          <span
            className={cn(
              'line-clamp-2 max-w-2xl',
              'font-semibold leading-tight tracking-tight',
              'text-white drop-shadow-sm',

              compact ? 'text-lg md:text-xl' : 'text-2xl md:text-3xl'
            )}>
            {displayTitle}
          </span>
        </span>
      </button>

      <ProductActionTray
        product={product}
        variant={selectedVariant}
        onAddToCart={onAddToCart}
        onAskAI={onAskAI}
        presentation="overlay"
        compact={compact}
      />
    </article>
  );
}
