'use client';

import Image from 'next/image';
import { useState } from 'react';

import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock3,
  LoaderCircle,
  PackageCheck,
  ShoppingBag,
  Star
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { openCustomerProductExperience } from '@/features/customer-experience';
import { useProductCartQuantity } from '@/features/products/cards/useProductCartQuantity';
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

type PreviewNavigationButtonProps = {
  label: string;
  direction: 'previous' | 'next';
  disabled: boolean;
  onClick: () => void;
};

const currencyFormatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0
});

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

  const { quantity, cartMutating } = useProductCartQuantity(product.id);

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

  const inStock = activeVariant.stockLeft > 0;

  const lowStock = inStock && activeVariant.stockLeft <= 5;

  const categoryLabel = product.category.replaceAll('-', ' ');

  const previewLabel =
    mode === 'featured'
      ? (badge ?? 'Featured')
      : mode === 'promo'
        ? (badge ?? (discountPercentage > 0 ? `${discountPercentage}% off` : 'Special offer'))
        : product.isNew
          ? 'New arrival'
          : 'Quick preview';

  return (
    <div
      className="
        grid h-full min-h-0
        grid-rows-[minmax(12rem,28vh)_minmax(0,1fr)]
        md:grid-cols-[minmax(0,0.85fr)_minmax(20rem,1.15fr)]
        md:grid-rows-1
      ">
      {/* ====================================================
          PRODUCT VISUAL
      ==================================================== */}

      <section
        className="
          group/visual relative isolate min-h-0
          overflow-hidden
          border-b border-border/40
          bg-background/20
          backdrop-blur-xl
          md:border-b-0 md:border-r
        ">
        <div
          className="
            pointer-events-none absolute inset-0
            bg-gradient-to-br
            from-background/50
            via-muted/20
            to-primary/10
          "
        />

        <div
          className="
            pointer-events-none absolute
            -left-16 -top-16 size-48
            rounded-full bg-white/25
            blur-3xl
            dark:bg-white/5
          "
        />

        <div
          className="
            pointer-events-none absolute
            -bottom-20 -right-20 size-56
            rounded-full bg-primary/10
            blur-3xl
          "
        />

        <div className="absolute left-3 top-3 z-30 flex items-center gap-2">
          <span
            className="
              rounded-full
              border border-white/20
              bg-black/45 px-2.5 py-1
              text-[9px] font-semibold uppercase
              tracking-[0.14em] text-white
              shadow-md backdrop-blur-xl
            "
            style={
              mode === 'promo' && accent
                ? {
                    backgroundColor: accent
                  }
                : undefined
            }>
            {previewLabel}
          </span>

          {totalProducts !== undefined && totalProducts > 0 ? (
            <span
              className="
                rounded-full
                border border-white/15
                bg-black/35 px-2 py-1
                text-[9px] font-medium
                text-white/80
                backdrop-blur-xl
              ">
              {(currentIndex ?? 0) + 1} / {totalProducts}
            </span>
          ) : null}
        </div>

        <div
          className="
            relative flex h-full
            items-center justify-center
            px-5 pb-10 pt-9
            sm:px-6 md:px-7
          ">
          <Image
            src={activeVariant.image}
            alt={product.name}
            width={700}
            height={700}
            priority
            sizes="(max-width: 768px) 90vw, 40vw"
            className="
              h-full max-h-full
              w-full max-w-full
              object-contain
              drop-shadow-[0_18px_28px_rgba(0,0,0,0.22)]
              transition duration-500 ease-out
              group-hover/visual:scale-[1.04]
            "
          />
        </div>

        {onPrevious ? (
          <PreviewNavigationButton
            label="Previous product"
            direction="previous"
            disabled={hasPrevious === false}
            onClick={onPrevious}
          />
        ) : null}

        {onNext ? (
          <PreviewNavigationButton
            label="Next product"
            direction="next"
            disabled={hasNext === false}
            onClick={onNext}
          />
        ) : null}

        <div
          className="
            absolute inset-x-0 bottom-0 z-20
            flex items-end justify-between gap-3
            bg-gradient-to-t
            from-black/65 to-transparent
            px-3 pb-3 pt-9 text-white
          ">
          <div className="min-w-0">
            <p
              className="
                text-[8px] font-semibold uppercase
                tracking-[0.16em] text-white/60
              ">
              Selected option
            </p>

            <p className="mt-0.5 truncate text-[11px] font-semibold">{activeVariant.label}</p>
          </div>

          <span
            className="
              shrink-0 rounded-full
              border border-white/15
              bg-white/10 px-2 py-1
              text-[9px] backdrop-blur-md
            ">
            Preview
          </span>
        </div>
      </section>

      {/* ====================================================
          PRODUCT SUMMARY
      ==================================================== */}

      <section
        className="
          flex min-h-0 flex-col
          overflow-hidden
          bg-background/35
          backdrop-blur-2xl
        ">
        <div
          className="
            min-h-0 flex-1
            overflow-y-auto
            overscroll-contain
            scrollbar-none
          ">
          <div className="p-4 pr-11 sm:p-5 sm:pr-12">
            {/* Product identity */}

            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p
                  className="
                    text-[9px] font-semibold uppercase
                    tracking-[0.16em] text-primary/70
                  ">
                  {categoryLabel}
                </p>

                <h2
                  className="
                    mt-1.5 line-clamp-2
                    text-xl font-bold leading-tight
                    tracking-tight text-foreground
                    sm:text-2xl
                  ">
                  {product.name}
                </h2>
              </div>

              <WishlistButton productId={product.id} productName={product.name} className="shrink-0" />
            </div>

            {/* Product activity */}

            <div
              className="
                mt-2.5 flex flex-wrap
                items-center gap-x-3 gap-y-1.5
                text-[11px] text-muted-foreground
              ">
              <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                <Star className="size-3 fill-amber-400 text-amber-400" />

                {product.rating.toFixed(1)}
              </span>

              <span>{product.reviews.toLocaleString()} reviews</span>

              <span>{product.soldCount.toLocaleString()} sold</span>
            </div>

            <p
              className="
                mt-3 line-clamp-2
                text-xs leading-5
                text-muted-foreground
              ">
              {product.shortDescription}
            </p>

            {/* Price and stock */}

            <div
              className="
                mt-4 flex flex-wrap
                items-end justify-between gap-3
                border-y border-border/50 py-3
              ">
              <div>
                <div className="flex items-baseline gap-2">
                  <p
                    className="
                      text-xl font-bold
                      tracking-tight text-foreground
                      sm:text-2xl
                    ">
                    {currencyFormatter.format(activeVariant.price)}
                  </p>

                  {originalPrice ? (
                    <p className="text-[11px] text-muted-foreground line-through">
                      {currencyFormatter.format(originalPrice)}
                    </p>
                  ) : null}
                </div>

                {discountPercentage > 0 ? (
                  <p className="mt-0.5 text-[9px] font-semibold text-emerald-600">
                    Save {discountPercentage}%
                  </p>
                ) : null}
              </div>

              <div className="text-right">
                <p
                  className={cn(
                    'text-[11px] font-semibold',
                    inStock ? (lowStock ? 'text-amber-600' : 'text-emerald-600') : 'text-destructive'
                  )}>
                  {inStock
                    ? lowStock
                      ? `Only ${activeVariant.stockLeft} left`
                      : 'In stock'
                    : 'Out of stock'}
                </p>

                <p
                  className="
                    mt-0.5 inline-flex
                    items-center gap-1
                    text-[9px]
                    text-muted-foreground
                  ">
                  <Clock3 className="size-3" />

                  {product.estimatedDelivery}
                </p>
              </div>
            </div>

            {/* Variants */}

            <div className="mt-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-[11px] font-semibold text-foreground">Choose an option</h3>

                <span className="text-[9px] text-muted-foreground">
                  {product.variants.length} {product.variants.length === 1 ? 'style' : 'styles'}
                </span>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2">
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
                        'min-w-0 rounded-xl border px-2.5 py-2 text-left transition',
                        'backdrop-blur-md',
                        'hover:border-primary/30 hover:bg-background/45',
                        selected
                          ? 'border-primary/60 bg-primary/10 ring-1 ring-primary/20'
                          : 'border-border/50 bg-background/25',
                        variant.stockLeft <= 0 && !selected && 'opacity-45'
                      )}>
                      <span className="block truncate text-[11px] font-semibold">{variant.label}</span>

                      <span className="mt-0.5 block truncate text-[9px] text-muted-foreground">
                        {currencyFormatter.format(variant.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Assurance */}

            <div
              className="
                mt-4 flex items-center gap-2
                rounded-xl border border-border/30
                bg-background/25
                px-3 py-2
                text-[10px] text-muted-foreground
                backdrop-blur-md
              ">
              <PackageCheck className="size-3.5 shrink-0 text-primary" />
              Secure checkout and workspace-synced shopping activity.
            </div>
          </div>
        </div>

        {/* Actions */}

        <footer
          className="
            shrink-0
            border-t border-border/40
            bg-background/40 p-3
            backdrop-blur-2xl
          ">
          <div
            className="
              grid grid-cols-1 gap-2
              sm:grid-cols-[minmax(0,1fr)_auto]
            ">
            <Button
              type="button"
              disabled={!inStock || cartMutating || !onAddToCart}
              onClick={() => {
                onAddToCart?.(product, activeVariant);
              }}
              className="
                relative h-10 gap-2
                rounded-full
                bg-foreground text-background
                hover:bg-foreground/90
              ">
              {cartMutating ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <ShoppingBag className="size-4" />
              )}

              {inStock ? 'Add to cart' : 'Unavailable'}

              {quantity > 0 ? (
                <span
                  className="
                    rounded-full
                    bg-background/15
                    px-1.5 py-0.5
                    text-[9px] font-black
                  ">
                  {quantity}
                </span>
              ) : null}
            </Button>

            <Button
              type="button"
              onClick={() => {
                openCustomerProductExperience({
                  id: product.id,
                  name: product.name,
                  shortDescription: product.shortDescription
                });
                onClose();
              }}
              variant="outline"
              className="
                h-10 gap-2 rounded-full
                border-border/50
                bg-background/25 px-4
                backdrop-blur-md
                hover:bg-background/50
              ">
              Expand details
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </footer>
      </section>
    </div>
  );
}

function PreviewNavigationButton({ label, direction, disabled, onClick }: PreviewNavigationButtonProps) {
  const Icon = direction === 'previous' ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'absolute top-1/2 z-30 grid size-9 -translate-y-1/2 place-items-center rounded-full',
        'border border-white/20 bg-black/35 text-white shadow-lg backdrop-blur-xl',
        'transition hover:scale-105 hover:bg-black/60',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80',
        'md:opacity-0 md:group-hover/visual:opacity-100 md:group-focus-within/visual:opacity-100',
        'disabled:pointer-events-none disabled:opacity-20',
        direction === 'previous' ? 'left-2.5' : 'right-2.5'
      )}>
      <Icon className="size-4" />
    </button>
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
          /*
           * Compact floating preview window.
           */
          'h-[min(84dvh,38rem)]',
          'w-[calc(100%_-_1rem)]',
          'overflow-hidden rounded-3xl',
          'sm:max-w-3xl',
          'md:h-[min(72dvh,36rem)]',

          /*
           * Glassmorphism shell.
           */
          'isolate border border-border/50',
          'bg-background/55 p-0',
          'backdrop-blur-2xl',
          'supports-[backdrop-filter]:bg-background/40',
          'dark:border-white/10',
          'dark:bg-background/35',

          /*
           * Floating depth.
           */
          'shadow-[0_28px_90px_-28px_rgba(0,0,0,0.75)]',
          'ring-1 ring-black/5',
          'dark:ring-white/10',

          /*
           * Dialog close button.
           */
          '[&>button]:z-[60]',
          '[&>button]:rounded-full',
          '[&>button]:border',
          '[&>button]:border-border/50',
          '[&>button]:bg-background/60',
          '[&>button]:shadow-md',
          '[&>button]:backdrop-blur-2xl',
          '[&>button]:transition',
          '[&>button]:hover:bg-background/80'
        )}>
        <DialogHeader className="sr-only">
          <DialogTitle>Preview {product.name}</DialogTitle>

          <DialogDescription>
            Review product pricing, available options and delivery information.
          </DialogDescription>
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
