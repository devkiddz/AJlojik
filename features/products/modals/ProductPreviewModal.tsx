'use client';

import { useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { AnimatePresence, motion } from 'framer-motion';

import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock3,
  PackageCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Tag
} from 'lucide-react';

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

  const formattedCategory = product.category.replaceAll('-', ' ');

  const previewBadge =
    mode === 'featured'
      ? (badge ?? 'Featured experience')
      : mode === 'promo'
        ? (badge ?? (discountPercentage > 0 ? `${discountPercentage}% off` : 'Special offer'))
        : product.isNew
          ? 'New arrival'
          : 'Quick preview';

  const PreviewBadgeIcon = mode === 'featured' ? Sparkles : mode === 'promo' ? Tag : PackageCheck;

  const hasNavigation =
    Boolean(onPrevious) || Boolean(onNext) || (totalProducts !== undefined && totalProducts > 0);

  return (
    <motion.div
      key={product.id}
      initial={{
        opacity: 0,
        scale: 0.99
      }}
      animate={{
        opacity: 1,
        scale: 1
      }}
      exit={{
        opacity: 0,
        scale: 0.99
      }}
      transition={{
        duration: 0.18,
        ease: 'easeOut'
      }}
      className={cn(
        'grid h-full min-h-0',

        /**
         * Mobile:
         * Image window above the independently scrollable details.
         *
         * Desktop:
         * Two equal windows beside each other.
         */
        'grid-rows-[18rem_minmax(0,1fr)]',
        'lg:grid-cols-2',
        'lg:grid-rows-1'
      )}>
      {/* =====================================================
          LEFT WINDOW — IMAGE ONLY

          This column does not scroll.
          The primary image does not use fill.
      ====================================================== */}

      <section
        className={cn(
          'relative min-h-0 overflow-hidden',
          'border-b border-primary/10',
          'bg-muted/20',
          'lg:border-b-0 lg:border-r'
        )}>
        <div
          className={cn(
            'flex size-full min-h-0',
            'items-center justify-center',
            'overflow-hidden',
            'p-6 sm:p-8 lg:p-12'
          )}>
          <Image
            src={activeVariant.image}
            alt={product.name}
            width={1200}
            height={1200}
            priority
            sizes="(max-width: 1024px) 90vw, 50vw"
            className={cn(
              /**
               * Intrinsic image dimensions make the image
               * independent of absolute positioning.
               */
              'h-auto w-auto',
              'max-h-full max-w-full',
              'object-contain',
              'drop-shadow-2xl'
            )}
          />
        </div>
      </section>

      {/* =====================================================
          RIGHT WINDOW — DETAILS

          This is a flex column:
          - Details body scrolls
          - Footer remains fixed
      ====================================================== */}

      <section className={cn('flex h-full min-h-0 flex-col', 'overflow-hidden bg-background')}>
        {/* =================================================
            SCROLLABLE DETAILS BODY
        ================================================== */}

        <div className={cn('min-h-0 flex-1', 'overflow-y-auto overscroll-contain', 'scrollbar-none')}>
          <div className="space-y-7 p-6 sm:p-8 lg:p-10">
            {/* ============================================
                TOP LABELS
            ============================================ */}

            <div className="flex flex-wrap items-center gap-2 pr-10">
              <span
                className={cn(
                  'inline-flex items-center gap-1.5',
                  'rounded-full',
                  'bg-primary/10 px-3 py-1.5',
                  'text-xs font-semibold text-primary'
                )}
                style={
                  mode === 'promo' && accent
                    ? {
                        backgroundColor: accent,
                        color: '#ffffff'
                      }
                    : undefined
                }>
                <PreviewBadgeIcon className="size-3.5" />

                {previewBadge}
              </span>

              <span
                className={cn(
                  'rounded-full bg-muted',
                  'px-3 py-1.5',
                  'text-xs capitalize',
                  'text-muted-foreground'
                )}>
                {formattedCategory}
              </span>

              {discountPercentage > 0 ? (
                <span
                  className={cn(
                    'rounded-full',
                    'bg-emerald-500/10',
                    'px-3 py-1.5',
                    'text-xs font-semibold',
                    'text-emerald-600'
                  )}>
                  Save {discountPercentage}%
                </span>
              ) : null}
            </div>

            {/* ============================================
                PRODUCT IDENTITY
            ============================================ */}

            <DialogHeader className="text-left">
              <DialogTitle
                className={cn('text-2xl font-bold', 'leading-tight tracking-tight', 'sm:text-3xl')}>
                {product.name}
              </DialogTitle>

              <DialogDescription className="mt-3 text-sm leading-7 sm:text-base">
                {product.shortDescription}
              </DialogDescription>
            </DialogHeader>

            {/* ============================================
                RATING, ACTIVITY AND PRODUCT NAVIGATION
            ============================================ */}

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  <Star className="size-4 fill-amber-400 text-amber-400" />

                  {product.rating.toFixed(1)}
                </span>

                <span className="text-sm text-muted-foreground">
                  {product.reviews.toLocaleString()} reviews
                </span>

                <span className="text-sm text-muted-foreground">
                  {product.soldCount.toLocaleString()} sold
                </span>
              </div>

              {hasNavigation ? (
                <div className="flex items-center gap-2">
                  {onPrevious ? (
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      aria-label="Previous product"
                      disabled={hasPrevious === false}
                      onClick={onPrevious}
                      className="size-9 rounded-full">
                      <ChevronLeft className="size-4" />
                    </Button>
                  ) : null}

                  {totalProducts !== undefined && totalProducts > 0 ? (
                    <span className="min-w-12 text-center text-xs text-muted-foreground">
                      {(currentIndex ?? 0) + 1}
                      {' / '}
                      {totalProducts}
                    </span>
                  ) : null}

                  {onNext ? (
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      aria-label="Next product"
                      disabled={hasNext === false}
                      onClick={onNext}
                      className="size-9 rounded-full">
                      <ChevronRight className="size-4" />
                    </Button>
                  ) : null}

                  <WishlistButton productId={product.id} productName={product.name} className="shrink-0" />
                </div>
              ) : (
                <WishlistButton productId={product.id} productName={product.name} className="shrink-0" />
              )}
            </div>

            {/* ============================================
                SELECTED PRICE
            ============================================ */}

            <div className={cn('rounded-3xl', 'border border-primary/10', 'bg-primary/5 p-5')}>
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div>
                  <p
                    className={cn(
                      'text-xs font-medium uppercase',
                      'tracking-[0.14em]',
                      'text-muted-foreground'
                    )}>
                    Selected option
                  </p>

                  <p className="mt-1 text-sm font-semibold text-foreground">{activeVariant.label}</p>

                  <div className="mt-4 flex flex-wrap items-baseline gap-2">
                    <p className="text-3xl font-bold tracking-tight text-foreground">
                      ₦{activeVariant.price.toLocaleString()}
                    </p>

                    {originalPrice ? (
                      <p className="text-sm text-muted-foreground line-through">
                        ₦{originalPrice.toLocaleString()}
                      </p>
                    ) : null}
                  </div>
                </div>

                <span
                  className={cn(
                    'rounded-full px-3 py-1.5',
                    'text-xs font-semibold',

                    activeVariant.stockLeft > 0
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : 'bg-destructive/10 text-destructive'
                  )}>
                  {activeVariant.stockLeft > 0 ? `${activeVariant.stockLeft} available` : 'Out of stock'}
                </span>
              </div>
            </div>

            {/* ============================================
                VARIANT SELECTOR
            ============================================ */}

            <div>
              <h3 className="text-sm font-semibold text-foreground">Choose your preferred option</h3>

              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Selecting an option updates the image, price and availability.
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {product.variants.map(variant => {
                  const isSelected = String(variant.id) === selectedVariantId;

                  const isUnavailable = variant.stockLeft <= 0;

                  return (
                    <button
                      key={variant.id}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => {
                        setSelectedVariantId(String(variant.id));
                      }}
                      className={cn(
                        'min-w-0 rounded-2xl border',
                        'px-3 py-3.5 text-left',
                        'transition',

                        isSelected
                          ? cn('border-primary', 'bg-primary', 'text-primary-foreground', 'shadow-sm')
                          : cn(
                              'border-primary/10',
                              'bg-card',
                              'text-muted-foreground',
                              'hover:border-primary/30',
                              'hover:text-foreground'
                            ),

                        isUnavailable && !isSelected && 'opacity-45'
                      )}>
                      <span className="block truncate text-sm font-semibold">{variant.label}</span>

                      <span className="mt-1 block text-xs opacity-75">₦{variant.price.toLocaleString()}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ============================================
                AVAILABILITY AND DELIVERY
            ============================================ */}

            <div className="grid gap-3 sm:grid-cols-2">
              <div className={cn('rounded-3xl', 'border border-primary/10', 'bg-card p-5')}>
                <div
                  className={cn(
                    'grid size-10 place-items-center',
                    'rounded-2xl',
                    'bg-primary/10 text-primary'
                  )}>
                  <PackageCheck className="size-5" />
                </div>

                <h3 className="mt-4 text-sm font-semibold text-foreground">
                  {activeVariant.stockLeft > 0 ? 'Available now' : 'Currently unavailable'}
                </h3>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {activeVariant.stockLeft > 0
                    ? `${activeVariant.stockLeft} units remain for the selected option.`
                    : 'Select another available product option.'}
                </p>
              </div>

              <div className={cn('rounded-3xl', 'border border-primary/10', 'bg-card p-5')}>
                <div
                  className={cn(
                    'grid size-10 place-items-center',
                    'rounded-2xl',
                    'bg-primary/10 text-primary'
                  )}>
                  <Clock3 className="size-5" />
                </div>

                <h3 className="mt-4 text-sm font-semibold text-foreground">Estimated delivery</h3>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">{product.estimatedDelivery}</p>
              </div>
            </div>

            {/* ============================================
                LONG DESCRIPTION
            ============================================ */}

            {product.longDescription ? (
              <div>
                <h3 className="text-sm font-semibold text-foreground">About this product</h3>

                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted-foreground">
                  {product.longDescription}
                </p>
              </div>
            ) : null}

            {/* ============================================
                PRODUCT TAGS
            ============================================ */}

            {product.tags.length > 0 ? (
              <div>
                <h3 className="text-sm font-semibold text-foreground">Product highlights</h3>

                <div className="mt-3 flex flex-wrap gap-2">
                  {product.tags.map(tag => (
                    <span
                      key={tag}
                      className={cn('rounded-full bg-muted', 'px-3 py-1.5', 'text-xs text-muted-foreground')}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* =================================================
            FIXED RIGHT FOOTER

            This footer never enters the details scrollbar.
        ================================================== */}

        <footer
          className={cn(
            'shrink-0',
            'border-t border-primary/10',
            'bg-background/95 p-4',
            'backdrop-blur-xl',
            'sm:p-5'
          )}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              type="button"
              size="lg"
              disabled={activeVariant.stockLeft <= 0}
              onClick={() => {
                onAddToCart?.(product, activeVariant);
              }}
              className="h-12 justify-between rounded-2xl">
              <span className="flex items-center gap-2">
                <ShoppingBag className="size-4" />

                {activeVariant.stockLeft > 0 ? 'Add to cart' : 'Unavailable'}
              </span>

              <ArrowRight className="size-4" />
            </Button>

            <Button
              render={<Link href={`/products/${product.slug}`} onClick={onClose} />}
              size="lg"
              variant="outline"
              className="h-12 justify-between rounded-2xl">
              <span>View full product</span>

              <ArrowRight className="size-4" />
            </Button>
          </div>
        </footer>
      </section>
    </motion.div>
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
          /**
           * Wide like onboarding, but noticeably shorter.
           *
           * The fixed height still allows the right details
           * window to become independently scrollable.
           */
          'h-[84dvh] max-h-[44rem]',
          'w-[calc(100%_-_1.5rem)]',
          'max-w-none overflow-hidden',
          'rounded-3xl',
          'border-primary/10 p-0',
          'shadow-2xl',

          'sm:max-w-[96vw]',
          'lg:h-[78dvh]',
          'lg:max-w-[1180px]',
          'xl:max-w-[1320px]',

          '[&>button]:z-50',
          '[&>button]:rounded-full',
          '[&>button]:bg-background/85',
          '[&>button]:p-2',
          '[&>button]:shadow-md',
          '[&>button]:backdrop-blur-md'
        )}>
        <DialogHeader className="sr-only">
          <DialogTitle>Preview {product.name}</DialogTitle>

          <DialogDescription>
            Review product pricing, options, availability and information.
          </DialogDescription>
        </DialogHeader>

        <div className="h-full min-h-0 overflow-hidden">
          <AnimatePresence initial={false} mode="wait">
            <PreviewContent
              key={`${mode}:${product.id}`}
              product={product}
              mode={mode}
              onClose={onClose}
              {...props}
            />
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
