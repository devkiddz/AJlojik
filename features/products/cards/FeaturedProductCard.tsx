'use client';

import Image from 'next/image';

import {
  Star
} from 'lucide-react';

import {
  useMemo
} from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

import {
  cn
} from '@/lib/utils';

import {
  ProductActionTray
} from './ProductActionTray';

import type {
  BaseProductCardProps
} from './productCardTypes';

import {
  createProductPriceFormatter,
  openProductExperience,
  resolvePrimaryProductStatus
} from './productCardPresentation';

import {
  useProductVariant
} from './useProductVariant';

type FeaturedProductCardPresentation =
  | 'hero'
  | 'collection';

type FeaturedProductCardProps =
  BaseProductCardProps & {
    presentation?:
      FeaturedProductCardPresentation;

    title?: string;
  };

export function FeaturedProductCard({
  product,
  className,
  presentation = 'hero',
  title,
  locale = 'en-NG',
  currency = 'NGN',
  onOpenExperience,
  onPreview,
  onAddToCart
}: FeaturedProductCardProps) {
  const {
    selectedVariant,
    selectedVariantId,
    setSelectedVariantId,
    soldOut
  } = useProductVariant(
    product
  );

  const priceFormatter =
    useMemo(
      () =>
        createProductPriceFormatter(
          locale,
          currency
        ),
      [
        currency,
        locale
      ]
    );

  if (!selectedVariant) {
    return null;
  }

  const compact =
    presentation === 'collection';

  const displayTitle =
    title ??
    product.name;

  const status =
    resolvePrimaryProductStatus(
      product,
      soldOut
    );

  const outOfStock =
    selectedVariant.stockLeft <= 0;

  const lowStock =
    !outOfStock &&
    selectedVariant.stockLeft <= 5;

  const openExperience =
    (): void => {
      openProductExperience({
        product,
        onOpenExperience,
        onPreview
      });
    };

  return (
    <article
      className={cn(
        'group grid min-w-0 overflow-hidden rounded-3xl',
        'border border-border/60 bg-card',
        'shadow-sm transition duration-300',
        'hover:border-border hover:shadow-lg',
        compact
          ? 'grid-cols-[minmax(8rem,0.8fr)_minmax(0,1.2fr)]'
          : 'grid-cols-1 md:min-h-[24rem] md:grid-cols-[minmax(18rem,0.95fr)_minmax(0,1.05fr)]',
        className
      )}
    >
      <div
        className={cn(
          'relative overflow-hidden bg-muted',
          compact
            ? 'min-h-72'
            : 'aspect-[16/10] min-h-64 md:aspect-auto md:min-h-full'
        )}
      >
        <Image
          src={selectedVariant.image}
          alt={product.name}
          fill
          priority={!compact}
          sizes={
            compact
              ? '(max-width: 640px) 42vw, 24vw'
              : '(max-width: 768px) 100vw, 42vw'
          }
          className="
            object-cover object-center
            transition duration-700 ease-out
            group-hover:scale-[1.025]
          "
        />

        {status ? (
          <span
            className="
              pointer-events-none absolute left-3 top-3 z-30
              rounded-full border border-border/60
              bg-background/90 px-2.5 py-1
              text-[10px] font-semibold text-foreground
              shadow-sm backdrop-blur-md
            "
          >
            {status}
          </span>
        ) : null}

        <button
          type="button"
          aria-label={`Open ${product.name} experience`}
          onClick={openExperience}
          className="
            absolute inset-0 z-20
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-inset
            focus-visible:ring-ring
          "
        >
          <span className="sr-only">
            Open {product.name}
          </span>
        </button>

        <ProductActionTray
          product={product}
          variant={selectedVariant}
          onAddToCart={onAddToCart}
          className="z-40"
        />
      </div>

      <div
        className={cn(
          'flex min-w-0 flex-col',
          compact
            ? 'p-4 sm:p-5'
            : 'p-5 sm:p-7 lg:p-8'
        )}
      >
        <button
          type="button"
          onClick={openExperience}
          className="
            min-w-0 text-left
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-ring
          "
        >
          <div className="flex min-w-0 items-center gap-2 text-[10px] font-medium text-muted-foreground">
            <span className="truncate font-semibold uppercase tracking-[0.16em]">
              {product.category.replaceAll(
                '-',
                ' '
              )}
            </span>

            <span className="size-1 rounded-full bg-border" />

            <span className="inline-flex shrink-0 items-center gap-1">
              <Star className="size-3 fill-amber-400 text-amber-400" />
              {product.rating.toFixed(1)}
            </span>
          </div>

          <h2
            className={cn(
              'mt-3 line-clamp-2 font-semibold leading-tight tracking-tight text-card-foreground',
              compact
                ? 'text-lg'
                : 'text-2xl sm:text-3xl'
            )}
          >
            {displayTitle}
          </h2>

          <p
            className={cn(
              'mt-3 text-muted-foreground',
              compact
                ? 'line-clamp-2 text-xs leading-5'
                : 'line-clamp-3 text-sm leading-6'
            )}
          >
            {product.shortDescription ||
              product.longDescription}
          </p>
        </button>

        <div
          className={cn(
            'mt-auto',
            compact
              ? 'pt-5'
              : 'pt-7'
          )}
        >
          <div
            className={cn(
              'grid items-end gap-4',
              compact
                ? 'grid-cols-1'
                : 'sm:grid-cols-[minmax(0,1fr)_auto]'
            )}
          >
            <div className="min-w-0">
              {product.variants.length > 1 ? (
                <>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Option
                  </p>

                  <Select
                    value={selectedVariantId}
                    onValueChange={
                      setSelectedVariantId
                    }
                  >
                    <SelectTrigger
                      className={cn(
                        'w-full rounded-xl bg-background',
                        compact
                          ? 'h-9'
                          : 'h-10 sm:max-w-64'
                      )}
                    >
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>

                    <SelectContent>
                      {product.variants.map(
                        variant => (
                          <SelectItem
                            key={variant.id}
                            value={String(
                              variant.id
                            )}
                            disabled={
                              variant.stockLeft <= 0
                            }
                          >
                            {variant.label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </>
              ) : (
                <p className="text-xs font-medium text-muted-foreground">
                  {selectedVariant.label}
                </p>
              )}
            </div>

            <div
              className={cn(
                'min-w-0',
                compact
                  ? 'text-left'
                  : 'sm:text-right'
              )}
            >
              <p
                className={cn(
                  'font-bold tracking-tight text-card-foreground',
                  compact
                    ? 'text-lg'
                    : 'text-2xl'
                )}
              >
                {priceFormatter.format(
                  Number(
                    selectedVariant.price
                  )
                )}
              </p>

              <p
                className={cn(
                  'mt-1 text-[10px] font-medium',
                  outOfStock
                    ? 'text-destructive'
                    : lowStock
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-muted-foreground'
                )}
              >
                {outOfStock
                  ? 'Unavailable'
                  : lowStock
                    ? `Only ${selectedVariant.stockLeft} left`
                    : `${selectedVariant.stockLeft} available`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
