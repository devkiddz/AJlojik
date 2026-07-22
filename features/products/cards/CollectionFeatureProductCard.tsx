'use client';

import Image from 'next/image';

import { useMemo } from 'react';

import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { cn } from '@/lib/utils';

import type { BaseProductCardProps } from './productCardTypes';

import { createProductPriceFormatter, openProductExperience } from './productCardPresentation';

import { useProductVariant } from './useProductVariant';

export function CollectionFeatureProductCard({
  product,
  className,
  locale = 'en-NG',
  currency = 'NGN',
  onPreview,
  onOpenExperience
}: BaseProductCardProps) {
  const { selectedVariant, soldOut } = useProductVariant(product);

  const priceFormatter = useMemo(() => createProductPriceFormatter(locale, currency), [currency, locale]);

  if (!selectedVariant) {
    return null;
  }

  const discountPercentage = product.discountPercentage ?? 0;

  const badgeLabel = soldOut
    ? 'Sold out'
    : discountPercentage > 0
      ? `${discountPercentage}% off`
      : 'Featured';

  const handleOpenProductExperience = (): void => {
    openProductExperience({
      product,
      onOpenExperience,
      onPreview
    });
  };

  return (
    <article
      className={cn(
        'group grid h-full min-h-72 min-w-0 items-stretch overflow-hidden',
        'grid-cols-[minmax(7.5rem,0.9fr)_minmax(0,1.1fr)]',
        'rounded-3xl border border-border/60 bg-card',
        'shadow-lg transition duration-300',
        'hover:border-border hover:shadow-xl',
        className
      )}>
      {/* ============================================
          PRODUCT IMAGE COLUMN
      ============================================ */}

      <div
        className="
          flex min-w-0
          items-center
          p-2
          sm:p-3
        ">
        <button
          type="button"
          aria-label={`Open ${product.name} experience`}
          onClick={handleOpenProductExperience}
          className="
            relative h-56 w-full min-w-0
            overflow-hidden rounded-l-2xl
            bg-muted/40
            shadow-md
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-ring
            sm:h-64
            md:h-64
          ">
          {/* Ambient image */}

          <Image
            src={selectedVariant.image}
            alt=""
            fill
            priority
            sizes="(max-width: 768px) 42vw, 24vw"
            className="
              scale-125 object-cover
              opacity-25 blur-xl
              saturate-150
            "
          />

          {/* Ambient glow */}

          <span
            aria-hidden="true"
            className="
              pointer-events-none
              absolute inset-0
              bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.22),transparent_62%)]
            "
          />

          {/* Main product image */}

          <Image
            src={selectedVariant.image}
            alt={product.name}
            fill
            priority
            quality={95}
            sizes="(max-width: 768px) 42vw, 24vw"
            className="
              z-10 scale-105
              object-cover object-center
              drop-shadow-[0_24px_30px_rgba(0,0,0,0.48)]
              transition-transform
              duration-700 ease-out
              group-hover:scale-110
            "
          />

          {/* Bottom depth */}

          <span
            aria-hidden="true"
            className="
              pointer-events-none
              absolute inset-x-0 bottom-0 z-10
              h-20
              bg-gradient-to-t
              from-black/30
              to-transparent
            "
          />

          {/* Product status */}

          <span
            className="
              pointer-events-none
              absolute left-2 top-2 z-20
              rounded-full
              border border-white/15
              bg-black/50
              px-2 py-1
              text-[0.55rem] font-bold
              uppercase tracking-wide
              text-white
              shadow-md backdrop-blur-md
            ">
            {badgeLabel}
          </span>
        </button>
      </div>

      {/* ============================================
          PRODUCT DETAILS
      ============================================ */}

      <div
        className="
          flex min-h-0 min-w-0
          flex-col justify-center
          overflow-hidden
          px-2 py-4
          sm:px-4
        ">
        <p
          className="
            truncate
            text-[0.55rem] font-semibold
            uppercase tracking-[0.16em]
            text-muted-foreground
          ">
          Featured product
        </p>

        <button
          type="button"
          onClick={handleOpenProductExperience}
          className="
            mt-2 min-w-0 text-left
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-ring
          ">
          <h3
            className="
              line-clamp-2
              text-base font-bold
              leading-tight tracking-tight
              text-card-foreground
              sm:text-xl
            ">
            {product.name}
          </h3>

          {product.shortDescription ? (
            <p
              className="
                mt-2 line-clamp-2
                text-[0.65rem] leading-4
                text-muted-foreground
                sm:text-xs
                sm:leading-5
              ">
              {product.shortDescription}
            </p>
          ) : null}
        </button>

        <p
          className="
            mt-3 truncate
            text-lg font-bold
            tracking-tight
            text-card-foreground
          ">
          {priceFormatter.format(Number(selectedVariant.price))}
        </p>

        <Button
          type="button"
          variant="outline"
          onClick={handleOpenProductExperience}
          className="
            mt-3 h-9 w-full
            justify-between rounded-xl
            border-border/70
            bg-background/70
            px-3
            text-xs font-semibold
            shadow-sm
            transition-colors
            hover:bg-muted
          ">
          <span className="truncate">View product</span>

          <ArrowRight className="size-3.5 shrink-0" />
        </Button>
      </div>
    </article>
  );
}
