'use client';

import { useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { ArrowRight, ChevronLeft, ChevronRight, Clock3, ShoppingBag, Star } from 'lucide-react';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';

import { WishlistButton } from '@/features/wishlist';

import { cn } from '@/lib/utils';

import type { ProductType, ProductVariantType } from '@/types/types';

type ProductPreviewMode = 'regular' | 'featured' | 'promo';

export type ProductPreviewModalProps = {
  product: ProductType | null;
  open: boolean;

  mode?: ProductPreviewMode;

  badge?: string;
  accent?: string;

  onClose: () => void;

  /**
   * Retained for compatibility with existing consumers.
   * WishlistButton owns the current wishlist interaction.
   */
  onToggleLike?: (productId: string) => void;

  onAddToCart?: (product: ProductType, variant: ProductVariantType) => void;

  onPrevious?: () => void;
  onNext?: () => void;

  hasPrevious?: boolean;
  hasNext?: boolean;

  currentIndex?: number;
  totalProducts?: number;
};

type PreviewContentProps = Omit<ProductPreviewModalProps, 'open' | 'product'> & {
  product: ProductType;
  mode: ProductPreviewMode;
};

function PreviewContent({
  product,
  mode,
  badge,
  accent,
  onClose,
  onAddToCart,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  currentIndex,
  totalProducts
}: PreviewContentProps) {
  const initialVariant =
    product.variants.find(variant => variant.stockLeft > 0) ?? product.variants[0] ?? null;

  const [selectedVariantId, setSelectedVariantId] = useState(initialVariant ? String(initialVariant.id) : '');

  const activeVariant =
    product.variants.find(variant => String(variant.id) === selectedVariantId) ?? initialVariant;

  if (!activeVariant) {
    return null;
  }

  const discountPercentage = product.discountPercentage ?? 0;

  const originalPrice =
    discountPercentage > 0 && discountPercentage < 100
      ? Math.round(activeVariant.price / (1 - discountPercentage / 100))
      : null;

  const categoryLabel = product.category.replaceAll('-', ' ');

  const previewLabel =
    mode === 'featured'
      ? (badge ?? 'Featured')
      : mode === 'promo'
        ? (badge ?? (discountPercentage > 0 ? `${discountPercentage}% off` : 'Special offer'))
        : product.isNew
          ? 'New arrival'
          : 'Quick preview';

  const inStock = activeVariant.stockLeft > 0;

  return (
    <div
      className={cn(
        'grid h-full min-h-0',
        'grid-rows-[16rem_minmax(0,1fr)]',
        'lg:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)]',
        'lg:grid-rows-1'
      )}>
      {/* =====================================================
          LEFT — PRODUCT IMAGE
      ====================================================== */}

      <section
        className={cn(
          'relative min-h-0 overflow-hidden',
          'border-b border-border/60',
          'bg-muted/20',
          'lg:border-b-0 lg:border-r'
        )}>
        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-0',
            'bg-gradient-to-br',
            'from-background/20',
            'via-transparent',
            'to-primary/[0.06]'
          )}
        />

        <div
          className={cn(
            'relative flex h-full min-h-0',
            'items-center justify-center',
            'overflow-hidden',
            'px-10 py-8',
            'sm:px-14',
            'lg:px-16 lg:py-14'
          )}>
          <Image
            src={activeVariant.image}
            alt={product.name}
            width={1000}
            height={1000}
            priority
            sizes="(max-width: 1024px) 80vw, 520px"
            className={cn(
              'h-auto w-auto',
              'max-h-full max-w-full',
              'object-contain',
              'drop-shadow-[0_24px_42px_rgba(0,0,0,0.22)]'
            )}
          />
        </div>

        {onPrevious ? (
          <button
            type="button"
            aria-label="Previous product"
            disabled={hasPrevious === false}
            onClick={onPrevious}
            className={cn(
              'absolute left-4 top-1/2',
              'grid size-10',
              '-translate-y-1/2',
              'place-items-center',
              'rounded-full border',
              'border-border/60',
              'bg-background/80',
              'text-foreground',
              'shadow-sm backdrop-blur-md',
              'transition',
              'hover:bg-background',
              'focus-visible:outline-none',
              'focus-visible:ring-2',
              'focus-visible:ring-ring',
              'disabled:pointer-events-none',
              'disabled:opacity-25'
            )}>
            <ChevronLeft className="size-5" />
          </button>
        ) : null}

        {onNext ? (
          <button
            type="button"
            aria-label="Next product"
            disabled={hasNext === false}
            onClick={onNext}
            className={cn(
              'absolute right-4 top-1/2',
              'grid size-10',
              '-translate-y-1/2',
              'place-items-center',
              'rounded-full border',
              'border-border/60',
              'bg-background/80',
              'text-foreground',
              'shadow-sm backdrop-blur-md',
              'transition',
              'hover:bg-background',
              'focus-visible:outline-none',
              'focus-visible:ring-2',
              'focus-visible:ring-ring',
              'disabled:pointer-events-none',
              'disabled:opacity-25'
            )}>
            <ChevronRight className="size-5" />
          </button>
        ) : null}

        <div
          className={cn('absolute inset-x-0 bottom-0', 'flex items-end justify-between gap-4', 'px-5 pb-5')}>
          <div className="min-w-0">
            <p
              className={cn(
                'text-[0.65rem] font-semibold',
                'uppercase tracking-[0.16em]',
                'text-muted-foreground'
              )}>
              Selected
            </p>

            <p className="mt-1 truncate text-sm font-semibold text-foreground">{activeVariant.label}</p>
          </div>

          {totalProducts !== undefined && totalProducts > 0 ? (
            <span
              className={cn(
                'shrink-0 rounded-full',
                'border border-border/60',
                'bg-background/80',
                'px-3 py-1.5',
                'text-xs text-muted-foreground',
                'backdrop-blur-md'
              )}>
              {(currentIndex ?? 0) + 1}
              {' / '}
              {totalProducts}
            </span>
          ) : null}
        </div>
      </section>

      {/* =====================================================
          RIGHT — PRODUCT DETAILS
      ====================================================== */}

      <section className={cn('flex h-full min-h-0 flex-col', 'overflow-hidden bg-background')}>
        <div className={cn('min-h-0 flex-1', 'overflow-y-auto', 'overscroll-contain', 'scrollbar-none')}>
          <div className="p-6 sm:p-8 lg:p-10">
            {/* Header */}

            <div className="flex items-start justify-between gap-5 pr-8">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <p className={cn('text-xs font-semibold', 'uppercase tracking-[0.18em]', 'text-primary')}>
                    {categoryLabel}
                  </p>

                  <span
                    className={cn(
                      'rounded-full bg-muted',
                      'px-2.5 py-1',
                      'text-[0.68rem] font-medium',
                      'text-muted-foreground'
                    )}
                    style={
                      mode === 'promo' && accent
                        ? {
                            backgroundColor: accent,
                            color: '#ffffff'
                          }
                        : undefined
                    }>
                    {previewLabel}
                  </span>
                </div>

                <h2
                  className={cn(
                    'mt-4 text-2xl',
                    'font-bold leading-tight',
                    'tracking-tight text-foreground',
                    'sm:text-3xl lg:text-4xl'
                  )}>
                  {product.name}
                </h2>
              </div>

              <WishlistButton productId={product.id} productName={product.name} className="shrink-0" />
            </div>

            {/* Rating */}

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <Star className="size-4 fill-amber-400 text-amber-400" />

                {product.rating.toFixed(1)}
              </span>

              <span className="text-sm text-muted-foreground">
                {product.reviews.toLocaleString()}
                {' reviews'}
              </span>

              <span className="text-sm text-muted-foreground">
                {product.soldCount.toLocaleString()}
                {' sold'}
              </span>
            </div>

            {/* Description */}

            <p className="mt-6 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
              {product.shortDescription}
            </p>

            {/* Price */}

            <div className="mt-7">
              <div className="flex flex-wrap items-baseline gap-3">
                <p className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  ₦{activeVariant.price.toLocaleString()}
                </p>

                {originalPrice ? (
                  <p className="text-sm text-muted-foreground line-through">
                    ₦{originalPrice.toLocaleString()}
                  </p>
                ) : null}
              </div>

              {discountPercentage > 0 ? (
                <p className="mt-2 text-xs font-semibold text-emerald-600">Save {discountPercentage}%</p>
              ) : null}
            </div>

            {/* Stock and delivery */}

            <div
              className={cn(
                'mt-7 flex flex-wrap',
                'items-center gap-x-6 gap-y-3',
                'border-y border-border/60',
                'py-4'
              )}>
              <span
                className={cn(
                  'inline-flex items-center gap-2',
                  'text-sm font-medium',

                  inStock ? 'text-emerald-600' : 'text-destructive'
                )}>
                <span
                  className={cn(
                    'size-2 rounded-full',

                    inStock ? 'bg-emerald-500' : 'bg-destructive'
                  )}
                />

                {inStock ? `${activeVariant.stockLeft} in stock` : 'Out of stock'}
              </span>

              <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Clock3 className="size-4" />

                {product.estimatedDelivery}
              </span>
            </div>

            {/* Variants */}

            <div className="mt-7">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-sm font-semibold text-foreground">Choose an option</h3>

                <span className="text-xs text-muted-foreground">{activeVariant.label}</span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {product.variants.map(variant => {
                  const selected = String(variant.id) === selectedVariantId;

                  return (
                    <button
                      key={variant.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => {
                        setSelectedVariantId(String(variant.id));
                      }}
                      className={cn(
                        'min-w-24 rounded-xl',
                        'border px-4 py-3',
                        'text-left transition',

                        selected
                          ? cn(
                              'border-primary',
                              'bg-primary/10',
                              'text-foreground',
                              'ring-1',
                              'ring-primary/20'
                            )
                          : cn(
                              'border-border/70',
                              'bg-background',
                              'text-muted-foreground',
                              'hover:border-primary/40',
                              'hover:text-foreground'
                            ),

                        variant.stockLeft <= 0 && !selected && 'opacity-40'
                      )}>
                      <span className="block text-sm font-semibold">{variant.label}</span>

                      <span className="mt-1 block text-xs opacity-70">₦{variant.price.toLocaleString()}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Long description */}

            {product.longDescription ? (
              <div className="mt-8 border-t border-border/60 pt-7">
                <h3 className="text-sm font-semibold text-foreground">Product details</h3>

                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted-foreground">
                  {product.longDescription}
                </p>
              </div>
            ) : null}

            <div className="h-4" />
          </div>
        </div>

        {/* Fixed footer */}

        <footer
          className={cn(
            'shrink-0 border-t',
            'border-border/60',
            'bg-background/95',
            'p-4 backdrop-blur-xl',
            'sm:p-5'
          )}>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              size="lg"
              disabled={!inStock}
              onClick={() => {
                onAddToCart?.(product, activeVariant);
              }}
              className="h-12 flex-1 gap-2 rounded-xl">
              <ShoppingBag className="size-4" />

              {inStock ? 'Add to cart' : 'Unavailable'}
            </Button>

            <Button
              render={<Link href={`/products/${product.slug}`} onClick={onClose} />}
              size="lg"
              variant="outline"
              className="h-12 gap-2 rounded-xl px-5">
              View full details
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </footer>
      </section>
    </div>
  );
}

export function ProductPreviewModal({
  product,
  open,
  mode = 'regular',
  onClose,
  ...props
}: ProductPreviewModalProps) {
  if (!product) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={nextOpen => {
        if (!nextOpen) {
          onClose();
        }
      }}>
      <DialogContent
        className={cn(
          'h-[82dvh] max-h-[42rem]',
          'w-[calc(100%_-_1.5rem)]',
          'max-w-none overflow-hidden',
          'rounded-3xl',
          'border-border/60',
          'bg-background p-0',
          'shadow-2xl',

          'sm:max-w-[96vw]',
          'lg:h-[76dvh]',
          'lg:max-w-[1180px]',
          'xl:max-w-[1280px]',

          '[&>button]:z-50',
          '[&>button]:rounded-full',
          '[&>button]:border',
          '[&>button]:border-border/60',
          '[&>button]:bg-background/85',
          '[&>button]:p-2',
          '[&>button]:shadow-sm',
          '[&>button]:backdrop-blur-md'
        )}>
        <DialogHeader className="sr-only">
          <DialogTitle>Preview {product.name}</DialogTitle>

          <DialogDescription>Review product pricing, options and availability.</DialogDescription>
        </DialogHeader>

        <div className="h-full min-h-0 overflow-hidden">
          <PreviewContent
            key={`${mode}:${product.id}`}
            product={product}
            mode={mode}
            onClose={onClose}
            {...props}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
