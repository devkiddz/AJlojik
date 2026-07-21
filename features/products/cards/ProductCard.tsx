'use client';

import Image from 'next/image';

import { cn } from '@/lib/utils';

import type { BaseProductCardProps } from './productCardTypes';

import { openProductExperience } from './productCardPresentation';

import { useProductVariant } from './useProductVariant';

export function ProductCard({ product, className, onOpenExperience, onPreview }: BaseProductCardProps) {
  const { selectedVariant } = useProductVariant(product);

  if (!selectedVariant) {
    return null;
  }

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
        'group relative h-full w-full min-w-0',
        'overflow-hidden rounded-xl',
        'border border-border/60',
        'bg-card shadow-sm',
        'transition duration-300 ease-out',

        'hover:-translate-y-0.5',
        'hover:border-border',
        'hover:shadow-md',

        'focus-within:border-ring/40',
        'focus-within:shadow-md',

        className
      )}>
      <button
        type="button"
        onClick={openExperience}
        aria-label={`Open ${product.name}`}
        className="
          flex h-full w-full
          min-w-0 flex-col
          text-left
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-inset
          focus-visible:ring-ring
        ">
        {/* ==========================================
            PRODUCT ARTWORK
        ========================================== */}

        <span
          className="
            relative block
            aspect-square w-full
            shrink-0 overflow-hidden
            bg-muted
          ">
          <Image
            src={selectedVariant.image}
            alt={product.name}
            fill
            sizes="
              (max-width: 640px) 33vw,
              (max-width: 768px) 25vw,
              176px
            "
            className="
              object-cover
              transition-transform
              duration-500 ease-out
              md:group-hover:scale-[1.025]
            "
          />

          <span
            aria-hidden="true"
            className="
              pointer-events-none
              absolute inset-0
              bg-gradient-to-t
              from-black/10
              via-transparent
              to-transparent
            "
          />
        </span>

        {/* ==========================================
            PRODUCT TITLE
        ========================================== */}

        <span
          className="
            flex min-h-14
            min-w-0 flex-1
            items-start
            px-2.5 py-2.5
            md:min-h-16
            md:px-3 md:py-3
          ">
          <span
            className="
              line-clamp-2
              text-xs font-semibold
              leading-4 tracking-tight
              text-card-foreground
              md:text-sm
              md:leading-5
            ">
            {product.name}
          </span>
        </span>
      </button>
    </article>
  );
}
