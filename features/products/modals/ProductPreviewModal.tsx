'use client';

import Image from 'next/image';
import Link from 'next/link';

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

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { WishlistButton } from '@/features/wishlist';
import { useProductCartQuantity } from '@/features/products/cards/useProductCartQuantity';
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
  const initialVariant = product.variants.find(variant => variant.stockLeft > 0) ?? product.variants[0] ?? null;
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
    <div className="grid h-full min-h-0 grid-rows-[minmax(20rem,48vh)_minmax(0,1fr)] md:grid-cols-[minmax(0,1.15fr)_minmax(24rem,0.85fr)] md:grid-rows-1">
      <section className="group/visual relative min-h-0 overflow-hidden border-b border-border/60 bg-muted md:border-b-0 md:border-r">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-background via-muted to-primary/10" />
        <div className="pointer-events-none absolute -left-20 -top-20 size-64 rounded-full bg-white/20 blur-3xl dark:bg-white/5" />

        <div className="absolute left-4 top-4 z-30 flex items-center gap-2">
          <span
            className="rounded-full border border-white/20 bg-black/45 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white shadow-lg backdrop-blur-xl"
            style={mode === 'promo' && accent ? { backgroundColor: accent } : undefined}>
            {previewLabel}
          </span>

          {totalProducts !== undefined && totalProducts > 0 ? (
            <span className="rounded-full border border-white/15 bg-black/35 px-2.5 py-1.5 text-[10px] font-medium text-white/80 backdrop-blur-xl">
              {(currentIndex ?? 0) + 1} / {totalProducts}
            </span>
          ) : null}
        </div>

        <div className="relative flex h-full items-center justify-center px-5 pb-14 pt-12 sm:px-8 lg:px-10">
          <Image
            src={activeVariant.image}
            alt={product.name}
            width={900}
            height={900}
            priority
            sizes="(max-width: 768px) 92vw, 62vw"
            className="h-full max-h-full w-full max-w-full object-contain drop-shadow-[0_28px_38px_rgba(0,0,0,0.25)] transition duration-700 ease-out group-hover/visual:scale-[1.055] group-hover/visual:-rotate-1"
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

        <div className="absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-3 bg-gradient-to-t from-black/65 to-transparent px-4 pb-4 pt-12 text-white">
          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/60">Selected option</p>
            <p className="mt-1 truncate text-xs font-semibold">{activeVariant.label}</p>
          </div>
          <span className="shrink-0 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] backdrop-blur-md">
            Hover to inspect
          </span>
        </div>
      </section>

      <section className="flex min-h-0 flex-col overflow-hidden bg-background/95">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain scrollbar-none">
          <div className="p-5 pr-12 sm:p-6 sm:pr-14 lg:p-7 lg:pr-14">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/70">{categoryLabel}</p>
                <h2 className="mt-2 line-clamp-2 text-2xl font-bold leading-tight tracking-tight text-foreground lg:text-3xl">
                  {product.name}
                </h2>
              </div>
              <WishlistButton productId={product.id} productName={product.name} className="shrink-0" />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
                <Star className="size-3.5 fill-amber-400 text-amber-400" />
                {product.rating.toFixed(1)}
              </span>
              <span>{product.reviews.toLocaleString()} reviews</span>
              <span>{product.soldCount.toLocaleString()} sold</span>
            </div>

            <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground">{product.shortDescription}</p>

            <div className="mt-5 flex flex-wrap items-end justify-between gap-3 border-y border-border/60 py-4">
              <div>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold tracking-tight text-foreground">
                    {currencyFormatter.format(activeVariant.price)}
                  </p>
                  {originalPrice ? (
                    <p className="text-xs text-muted-foreground line-through">{currencyFormatter.format(originalPrice)}</p>
                  ) : null}
                </div>
                {discountPercentage > 0 ? (
                  <p className="mt-1 text-[10px] font-semibold text-emerald-600">Save {discountPercentage}%</p>
                ) : null}
              </div>

              <div className="text-right">
                <p className={cn('text-xs font-semibold', inStock ? (lowStock ? 'text-amber-600' : 'text-emerald-600') : 'text-destructive')}>
                  {inStock ? (lowStock ? `Only ${activeVariant.stockLeft} left` : 'In stock') : 'Out of stock'}
                </p>
                <p className="mt-1 inline-flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <Clock3 className="size-3" /> {product.estimatedDelivery}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xs font-semibold text-foreground">Choose an option</h3>
                <span className="text-[10px] text-muted-foreground">{product.variants.length} available styles</span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {product.variants.map(variant => {
                  const selected = String(variant.id) === selectedVariantId;

                  return (
                    <button
                      key={variant.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setSelectedVariantId(String(variant.id))}
                      className={cn(
                        'group/variant min-w-0 rounded-xl border p-2.5 text-left transition duration-200',
                        'hover:-translate-y-0.5 hover:shadow-md',
                        selected
                          ? 'border-primary/60 bg-primary/10 ring-1 ring-primary/20'
                          : 'border-border/70 bg-card/60 hover:border-primary/30 hover:bg-card',
                        variant.stockLeft <= 0 && !selected && 'opacity-45'
                      )}>
                      <span className="block truncate text-xs font-semibold">{variant.label}</span>
                      <span className="mt-1 block truncate text-[10px] text-muted-foreground">
                        {currencyFormatter.format(variant.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-2.5 text-[11px] text-muted-foreground">
              <PackageCheck className="size-4 shrink-0 text-primary" />
              Secure checkout and workspace-synced shopping activity.
            </div>
          </div>
        </div>

        <footer className="shrink-0 border-t border-border/60 bg-background/95 p-4 backdrop-blur-xl">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
            <Button
              type="button"
              size="lg"
              disabled={!inStock || cartMutating || !onAddToCart}
              onClick={() => onAddToCart?.(product, activeVariant)}
              className="relative h-11 gap-2 rounded-full bg-foreground text-background hover:bg-foreground/90">
              {cartMutating ? <LoaderCircle className="size-4 animate-spin" /> : <ShoppingBag className="size-4" />}
              {inStock ? 'Add to cart' : 'Unavailable'}
              {quantity > 0 ? (
                <span className="rounded-full bg-background/15 px-1.5 py-0.5 text-[10px] font-black">{quantity}</span>
              ) : null}
            </Button>

            <Button
              render={<Link href={`/products/${product.slug}`} onClick={onClose} />}
              size="lg"
              variant="outline"
              className="h-11 gap-2 rounded-full px-5">
              Full details <ArrowRight className="size-4" />
            </Button>
          </div>
        </footer>
      </section>
    </div>
  );
}

function PreviewNavigationButton({
  label,
  direction,
  disabled,
  onClick
}: {
  label: string;
  direction: 'previous' | 'next';
  disabled: boolean;
  onClick: () => void;
}) {
  const Icon = direction === 'previous' ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'absolute top-1/2 z-30 grid size-10 -translate-y-1/2 place-items-center rounded-full',
        'border border-white/20 bg-black/35 text-white shadow-lg backdrop-blur-xl transition duration-200',
        'hover:scale-105 hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80',
        'md:opacity-0 md:group-hover/visual:opacity-100 md:group-focus-within/visual:opacity-100',
        'disabled:pointer-events-none disabled:opacity-20',
        direction === 'previous' ? 'left-3' : 'right-3'
      )}>
      <Icon className="size-5" />
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
    <Dialog open={open} onOpenChange={nextOpen => !nextOpen && onClose()}>
      <DialogContent
        className={cn(
          'h-[min(94dvh,58rem)] w-[calc(100%_-_1rem)] max-w-[86rem] overflow-hidden rounded-[1.75rem]',
          'border-border/60 bg-background p-0 shadow-[0_32px_100px_-24px_rgba(0,0,0,0.65)]',
          'md:h-[min(88dvh,52rem)]',
          '[&>button]:z-[60] [&>button]:rounded-full [&>button]:border [&>button]:border-border/60',
          '[&>button]:bg-background/80 [&>button]:shadow-lg [&>button]:backdrop-blur-xl'
        )}>
        <DialogHeader className="sr-only">
          <DialogTitle>Preview {product.name}</DialogTitle>
          <DialogDescription>Review product pricing, available options, and delivery information.</DialogDescription>
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
