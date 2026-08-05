'use client';

/* AJ_FEATURED_PRODUCT_SHOWCASE_V2 */
/* AJ_FEATURED_PRODUCT_COMPACT_FADE_V1 */
/* AJ_FEATURED_PRODUCT_FINAL_BALANCE_V1 */

import Image from 'next/image';

import {
  Send,
  Star
} from 'lucide-react';

import {
  useMemo
} from 'react';

import type {
  FeedActions
} from '@/features/feed-experience/contracts';

import {
  useProductVariant
} from '@/features/products/cards/useProductVariant';

import {
  cn
} from '@/lib/utils';

import type {
  ProductType
} from '@/types/types';

type FeaturedProductExperienceCardProps = {
  product: ProductType;
  actions: FeedActions;
  locale?: string;
  currency?: string;
  title?: string;
};

export default function FeaturedProductExperienceCard({
  product,
  actions,
  locale = 'en-NG',
  currency = 'NGN',
  title
}: FeaturedProductExperienceCardProps) {
  const {
    selectedVariant,
    selectedVariantId,
    setSelectedVariantId
  } = useProductVariant(
    product
  );

  const priceFormatter =
    useMemo(
      () => {
        try {
          return new Intl.NumberFormat(
            locale,
            {
              style: 'currency',
              currency,
              maximumFractionDigits: 0
            }
          );
        } catch {
          return new Intl.NumberFormat(
            'en-NG',
            {
              style: 'currency',
              currency: 'NGN',
              maximumFractionDigits: 0
            }
          );
        }
      },
      [
        currency,
        locale
      ]
    );

  if (!selectedVariant) {
    return null;
  }

  const outOfStock =
    selectedVariant.stockLeft <= 0;

  const sendToHub = (): void => {
    actions.previewProduct(
      product
    );
  };

  return (
    <article
      data-aj-featured-product-showcase
      className="mx-auto grid h-[13.25rem] max-h-[13.25rem] w-full max-w-[26rem] min-w-0 grid-cols-[minmax(7.25rem,0.82fr)_minmax(0,1.18fr)] overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm transition duration-300 hover:border-primary/20 hover:shadow-xl"
    >
      <div className="relative min-h-0 overflow-hidden bg-muted">
        <Image
          key={
            selectedVariant.id
          }
          src={
            selectedVariant.image
          }
          alt={
            product.name
          }
          fill
          priority
          sizes="(max-width: 640px) 40vw, 12rem"
          className="object-cover transition duration-700 hover:scale-[1.025]"
        />

        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/5"
        />

        <div className="pointer-events-none absolute left-3 top-3 z-20 flex flex-wrap gap-1.5">
          {product.discountPercentage >
          0 ? (
            <span className="rounded-full bg-secondary px-2.5 py-1 text-[9px] font-black text-secondary-foreground shadow-md">
              -{product.discountPercentage}%
            </span>
          ) : null}

          {product.isNew ? (
            <span className="rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-[9px] font-bold text-white backdrop-blur-md">
              New
            </span>
          ) : null}
        </div>

        <p className="pointer-events-none absolute inset-x-4 bottom-4 z-20 truncate text-[9px] font-bold uppercase tracking-[0.18em] text-white/75">
          {product.category.replaceAll(
            '-',
            ' '
          )}
        </p>
      </div>

      <div className="flex min-w-0 flex-col justify-center px-3 py-3 sm:px-4">
        <div className="min-w-0">
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-primary">
            Featured product
          </p>

          <h3 className="mt-1 line-clamp-2 text-base font-semibold leading-tight tracking-tight sm:text-lg">
            {title ?? product.name}
          </h3>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
          <Star className="size-3.5 fill-amber-400 text-amber-400" />

          <span className="font-bold text-foreground">
            {product.rating.toFixed(
              1
            )}
          </span>

          <span>
            ({product.reviews})
          </span>

          <span className="mx-1 size-1 rounded-full bg-border" />

          <span>
            {product.soldCount} sold
          </span>
        </div>

        <div
          role="group"
          aria-label={`Choose a variant for ${product.name}`}
          className="mt-2.5 flex flex-wrap gap-1.5"
        >
          {product.variants.map(
            variant => {
              const active =
                String(
                  variant.id
                ) ===
                String(
                  selectedVariantId
                );

              const unavailable =
                variant.stockLeft <= 0;

              return (
                <button
                  key={
                    variant.id
                  }
                  type="button"
                  aria-pressed={
                    active
                  }
                  disabled={
                    unavailable
                  }
                  onClick={() =>
                    setSelectedVariantId(
                      String(
                        variant.id
                      )
                    )
                  }
                  className={cn(
                    'min-w-0 rounded-full border px-2.5 py-1 text-[9px] font-semibold transition',
                    active
                      ? 'border-foreground bg-foreground text-background shadow-sm'
                      : 'border-border/80 bg-background/70 text-muted-foreground hover:bg-muted hover:text-foreground',
                    unavailable &&
                      'cursor-not-allowed opacity-35'
                  )}
                >
                  <span className="block max-w-24 truncate">
                    {variant.label}
                  </span>
                </button>
              );
            }
          )}
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-base font-black">
              {priceFormatter.format(
                Number(
                  selectedVariant.price
                )
              )}
            </p>

            <p
              className={cn(
                'mt-0.5 text-[9px]',
                outOfStock
                  ? 'text-destructive'
                  : 'text-muted-foreground'
              )}
            >
              {outOfStock
                ? 'Out of stock'
                : `${selectedVariant.stockLeft} available`}
            </p>
          </div>

          <button
            type="button"
            title="Send product to Discovery Hub"
            aria-label={`Send ${product.name} to the Discovery Hub`}
            onClick={
              sendToHub
            }
            className="group grid size-9 shrink-0 place-items-center rounded-full border border-primary/25 bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Send className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>
    </article>
  );
}
