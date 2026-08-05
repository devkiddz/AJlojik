'use client';

/* AJ_FEATURED_PRODUCT_RAIL_ONE_LINE_V1 */
/* AJ_FEATURED_RAIL_PHOTO_CARDS_V1 */
/* AJ_FEATURED_RAIL_ICON_SEND_V1 */
/* AJ_FEATURED_RAIL_DARK_SEND_V1 */

import Image from 'next/image';

import { Send, Star } from 'lucide-react';

import { useMemo } from 'react';

import type { FeedActions } from '@/features/feed-experience/contracts';

import { ProductActionTray } from '@/features/products/cards';

import { useProductVariant } from '@/features/products/cards/useProductVariant';

import { cn } from '@/lib/utils';

import type { ProductType } from '@/types/types';

type ProductExperienceCardPresentation = 'default' | 'featured-rail';

type ProductExperienceCardProps = {
  product: ProductType;
  actions: FeedActions;
  locale?: string;
  currency?: string;
  className?: string;
  presentation?: ProductExperienceCardPresentation;
};

export default function ProductExperienceCard({
  product,
  actions,
  locale = 'en-NG',
  currency = 'NGN',
  className,
  presentation = 'default'
}: ProductExperienceCardProps) {
  const { selectedVariant } = useProductVariant(product);

  const compact = presentation === 'featured-rail';

  const priceFormatter = useMemo(() => {
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        maximumFractionDigits: 0
      });
    } catch {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        maximumFractionDigits: 0
      });
    }
  }, [currency, locale]);

  if (!selectedVariant) {
    return null;
  }

  const outOfStock = selectedVariant.stockLeft <= 0;

  const reviewLabel = product.reviews === 1 ? 'review' : 'reviews';

  const openProductExperience = (): void => {
    actions.openExperience({
      type: 'product',
      productId: product.id
    });
  };

  if (compact) {
    return (
      <article
        data-aj-featured-rail-photo-card
        className={cn(
          'group relative h-full min-h-0 w-full min-w-0 overflow-hidden rounded-2xl border border-border/70 bg-muted shadow-sm',
          'transition duration-300 hover:border-primary/25 hover:shadow-lg',
          className
        )}>
        <Image
          src={selectedVariant.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 46vw, 160px"
          className="object-cover object-center transition duration-500 group-hover:scale-[1.03]"
        />

        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-black/5"
        />

        <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-start p-2.5">
          <button
            type="button"
            onClick={() => actions.previewProduct(product)}
            aria-label={`Send ${product.name} to Discovery Hub`}
            title="Send to Discovery Hub"
            className="mb-2 grid size-8 place-items-center rounded-full border border-white/20 bg-black/80 text-white shadow-[0_8px_24px_rgba(0,0,0,0.48)] backdrop-blur-xl transition hover:scale-105 hover:border-white/30 hover:bg-black/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80">
            <Send className="size-3.5" />
          </button>

          <h3
            title={product.name}
            className="w-full truncate text-xs font-bold tracking-tight text-white drop-shadow">
            {product.name}
          </h3>
        </div>
      </article>
    );
  }

  console.count(`ProductExperienceCard render: ${product.id}`);

  return (
    <article
      className={cn(
        'group flex h-full w-full min-w-0 flex-col overflow-hidden border border-border/70 bg-card shadow-sm',
        'transition duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl',
        compact ? 'rounded-2xl' : 'rounded-xl',
        className
      )}>
      <div className={cn('relative overflow-hidden bg-muted', compact ? 'aspect-[4/3]' : 'aspect-square')}>
        <Image
          src={selectedVariant.image}
          alt={product.name}
          fill
          sizes={compact ? '(max-width: 640px) 46vw, 160px' : '(max-width: 640px) 176px, 208px'}
          className="object-cover transition duration-500 group-hover:scale-105"
        />

        <button
          type="button"
          onClick={openProductExperience}
          aria-label={`Open ${product.name} experience`}
          className="absolute inset-0 z-10"
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/5" />

        <div className="pointer-events-none absolute left-2 top-2 z-20 flex max-w-[72%] flex-wrap gap-1">
          {product.discountPercentage > 0 ? (
            <span className="rounded-full bg-secondary px-2 py-1 text-[9px] font-bold text-secondary-foreground shadow-md">
              -{product.discountPercentage}%
            </span>
          ) : null}

          {product.isNew ? (
            <span className="rounded-full border border-white/15 bg-black/40 px-2 py-1 text-[9px] font-semibold text-white backdrop-blur-md">
              New
            </span>
          ) : null}
        </div>

        <div className="pointer-events-none absolute inset-x-3 bottom-3 z-20">
          <p className="truncate text-[9px] font-semibold uppercase tracking-[0.16em] text-white/70">
            {product.category.replaceAll('-', ' ')}
          </p>
        </div>
      </div>

      <div className={cn('flex flex-1 flex-col', compact ? 'p-2' : 'p-3')}>
        <button type="button" onClick={openProductExperience} className="text-left">
          <h3
            className={cn(
              'font-semibold tracking-tight',
              compact
                ? 'line-clamp-1 min-h-4 text-[11px] leading-4'
                : 'line-clamp-2 min-h-10 text-sm leading-5'
            )}>
            {product.name}
          </h3>
        </button>

        <div
          className={cn(
            'flex min-h-4 items-center gap-1 text-muted-foreground',
            compact ? 'mt-1 text-[8px]' : 'mt-2 text-[10px]'
          )}>
          <Star className="size-3 shrink-0 fill-amber-400 text-amber-400" />

          <span className="font-semibold text-foreground">{product.rating.toFixed(1)}</span>

          <span aria-hidden="true">·</span>

          <span className="truncate">
            {product.reviews} {reviewLabel}
          </span>
        </div>

        {!compact ? (
          <p className="mt-2 line-clamp-2 text-[10px] leading-4 text-muted-foreground">
            {product.shortDescription}
          </p>
        ) : null}

        <div className={cn(
            'mt-auto flex flex-col justify-end',
            compact ? 'min-h-[4rem] pt-1.5' : 'min-h-[4.5rem] pt-2.5'
          )}>
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
            <p className={cn('shrink-0 font-bold', compact ? 'text-[11px]' : 'text-sm')}>
              {priceFormatter.format(Number(selectedVariant.price))}
            </p>

            <span aria-hidden="true" className="text-[8px] text-muted-foreground">
              ·
            </span>

            <p
              title={selectedVariant.label}
              className={cn(
                'min-w-0 truncate font-medium text-muted-foreground',
                compact ? 'max-w-[5.75rem] text-[8px]' : 'max-w-[8rem] text-[10px]'
              )}>
              {selectedVariant.label}
            </p>
          </div>

          <p
            className={cn(
              'mt-0.5',
              compact ? 'text-[7px]' : 'text-[9px]',
              outOfStock ? 'text-destructive' : 'text-muted-foreground'
            )}>
            {outOfStock ? 'Out of stock' : `${selectedVariant.stockLeft} available`}
          </p>

          <ProductActionTray
            product={product}
            variant={selectedVariant}
            onAddToCart={actions.addToCart}
            presentation="inline"
            compact
            className="mt-1.5 w-full justify-start border-0 bg-transparent p-0 shadow-none backdrop-blur-none"
          />
        </div>
      </div>
    </article>
  );
}
