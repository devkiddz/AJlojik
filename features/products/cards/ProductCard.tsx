'use client';

import Image from 'next/image';

import { Star } from 'lucide-react';

import { cn } from '@/lib/utils';

import type { BaseProductCardProps } from './productCardTypes';

import { ProductActionTray } from './ProductActionTray';
import { useProductVariant } from './useProductVariant';

export function ProductCard({
  product,
  className,
  onPreview,
  onOpenExperience,
  onAddToCart
}: BaseProductCardProps) {
  const { selectedVariant, soldOut } = useProductVariant(product);

  if (!selectedVariant) {
    return null;
  }

  const openProductExperience = () => {
    onOpenExperience?.(product);
  };

  /**
   * Every card now has a permanent label.
   *
   * Promotional states take priority, while ordinary
   * products fall back to their category.
   */
  const cardLabel = soldOut
    ? 'Sold out'
    : (product.discountPercentage ?? 0) > 0
      ? `${product.discountPercentage}% off`
      : product.featured
        ? 'Featured'
        : product.isNew
          ? 'New arrival'
          : product.category.replaceAll('-', ' ');

  const formattedPrice = `₦${selectedVariant.price.toLocaleString()}`;

  return (
    <article
      className={cn(
        'group relative isolate aspect-[3/4] w-full min-w-0',
        'overflow-hidden rounded-2xl',
        'border border-white/10 bg-black',
        'shadow-md transition duration-300',
        'hover:-translate-y-1 hover:shadow-xl',
        'focus-within:-translate-y-1 focus-within:shadow-xl',
        className
      )}>
      {/* ============================================
          FULL-BLEED PRODUCT IMAGE
      ============================================ */}

      <Image
        src={selectedVariant.image}
        alt={product.name}
        fill
        sizes="(max-width: 640px) 192px, (max-width: 1280px) 208px, 224px"
        className={cn(
          'z-0 object-cover object-center',
          'transition-transform duration-700 ease-out',
          'group-hover:scale-105',
          'group-focus-within:scale-105'
        )}
      />

      {/* ============================================
          IMAGE ATMOSPHERE
      ============================================ */}

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 bg-black/5" />

      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0 z-10',
          'bg-gradient-to-t',
          'from-black via-black/40 to-transparent',
          'from-0% via-40% to-75%'
        )}
      />

      {/* ============================================
          PERMANENT TOP GLASS LABEL
      ============================================ */}

      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 z-20 h-20',
          'bg-gradient-to-b',
          'from-black/65 via-black/25 to-transparent'
        )}
      />

      <div
        className={cn(
          'pointer-events-none absolute inset-x-2 top-2 z-40',
          'overflow-hidden rounded-xl',
          'border border-white/10',
          'bg-white/[0.07]',
          'shadow-lg backdrop-blur-md'
        )}>
        {/* Glass reflection */}

        <div
          aria-hidden="true"
          className={cn(
            'absolute inset-0',
            'bg-gradient-to-r',
            'from-white/[0.04]',
            'via-white/[0.11]',
            'to-white/[0.02]'
          )}
        />

        {/* Lower fade into the product image */}

        <div
          aria-hidden="true"
          className={cn(
            'absolute inset-x-0 bottom-0 h-3',
            'bg-gradient-to-b',
            'from-transparent to-black/10'
          )}
        />

        <p
          className={cn(
            'relative truncate px-3 py-1.5 text-center',
            'text-[0.65rem] font-bold uppercase',
            'tracking-[0.12em] text-white/90',
            'drop-shadow-sm'
          )}>
          {cardLabel}
        </p>
      </div>

      {/* ============================================
          FULL-CARD EXPERIENCE TRIGGER
      ============================================ */}

      <button
        type="button"
        aria-label={`Open ${product.name} experience`}
        onClick={openProductExperience}
        className={cn(
          'absolute inset-0 z-20 cursor-pointer',
          'focus-visible:outline-none',
          'focus-visible:ring-2',
          'focus-visible:ring-inset',
          'focus-visible:ring-white/70'
        )}>
        <span className="sr-only">Open {product.name}</span>
      </button>

      {/* ============================================
          PERMANENT BOTTOM GLASS ATMOSPHERE
      ============================================ */}

      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-x-0 bottom-0 z-20 h-40',
          'bg-gradient-to-t',
          'from-black/95 via-black/70 to-transparent'
        )}
      />

      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-x-0 bottom-0 z-20 h-28',
          'bg-[radial-gradient(circle_at_50%_120%,rgba(124,58,237,0.22),transparent_70%)]'
        )}
      />

      {/* ============================================
          PRODUCT INFORMATION PANEL

          Touch:
          Always lifted to leave room for actions.

          Desktop:
          Rests near the bottom and moves upward when
          the action tray appears.
      ============================================ */}

      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 bottom-0 z-30',
          'px-3 pt-14',

          /**
           * Touch devices have no reliable hover state,
           * so space is permanently reserved for actions.
           */
          'pb-16',

          /**
           * Desktop rests lower until hovered.
           */
          'md:pb-3',
          'md:group-hover:pb-16',
          'md:group-focus-within:pb-16',

          'transition-all duration-300 ease-out'
        )}>
        <div
          className={cn(
            'relative overflow-hidden rounded-xl',
            'border border-white/10',
            'bg-white/[0.06]',
            'px-3 py-2.5',
            'shadow-lg backdrop-blur-md'
          )}>
          {/* Faint glass reflection */}

          <div
            aria-hidden="true"
            className={cn(
              'absolute inset-0',
              'bg-gradient-to-br',
              'from-white/[0.08]',
              'via-transparent',
              'to-black/10'
            )}
          />

          <div className="relative">
            <h3
              className={cn(
                'line-clamp-2 text-sm font-semibold',
                'leading-5 tracking-tight text-white',
                'drop-shadow-md'
              )}>
              {product.name}
            </h3>

            <div className="mt-2 flex min-w-0 items-center justify-between gap-2">
              <div className="flex shrink-0 items-center gap-1 text-xs font-semibold text-white/90">
                <span>{product.rating.toFixed(1)}</span>

                <Star aria-hidden="true" className="size-3 fill-current" />
              </div>

              <span
                className={cn(
                  'min-w-0 truncate rounded-md',
                  'border border-white/10',
                  'bg-black/25 px-2 py-1',
                  'text-[0.68rem] font-semibold text-white/90',
                  'backdrop-blur-sm',

                  /**
                   * The price disappears only when desktop
                   * actions occupy the bottom row.
                   */
                  'transition duration-200',
                  'md:group-hover:translate-y-1',
                  'md:group-hover:opacity-0',
                  'md:group-focus-within:translate-y-1',
                  'md:group-focus-within:opacity-0'
                )}>
                {soldOut ? 'Unavailable' : formattedPrice}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================
          ACTION TRAY

          It occupies the space created when the
          information panel increases its bottom padding.
      ============================================ */}

      <div
        className={cn(
          'absolute inset-x-3 bottom-3 z-50',
          'flex justify-end',

          /**
           * Touch controls remain available.
           */
          'pointer-events-auto',
          'translate-y-0 scale-100 opacity-100',

          /**
           * Desktop controls reveal on hover/focus.
           */
          'md:pointer-events-none',
          'md:translate-y-3',
          'md:scale-95',
          'md:opacity-0',

          'md:group-hover:pointer-events-auto',
          'md:group-hover:translate-y-0',
          'md:group-hover:scale-100',
          'md:group-hover:opacity-100',

          'md:group-focus-within:pointer-events-auto',
          'md:group-focus-within:translate-y-0',
          'md:group-focus-within:scale-100',
          'md:group-focus-within:opacity-100',

          'transition-all duration-300 ease-out'
        )}>
        <div
          className={cn(
            'overflow-hidden rounded-full',
            'border border-white/15',
            'bg-white/[0.08] p-1',
            'shadow-xl backdrop-blur-lg'
          )}>
          <ProductActionTray product={product} onPreview={onPreview} onAddToCart={onAddToCart} />
        </div>
      </div>
    </article>
  );
}
