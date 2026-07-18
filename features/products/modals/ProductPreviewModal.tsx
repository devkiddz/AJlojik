'use client';

import { useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { AnimatePresence, motion } from 'framer-motion';
import { WishlistButton } from '@/features/wishlist';

import {
  ArrowRight,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Clock3,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Tag
} from 'lucide-react';

import { Dialog, DialogContent } from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

function PreviewContent({
  product,
  mode,
  badge,
  accent,
  onAddToCart,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  currentIndex,
  totalProducts
}: Omit<ProductPreviewModalProps, 'open' | 'onClose'> & {
  product: ProductType;
  mode: ProductPreviewMode;
}) {
  const [variantSelection, setVariantSelection] = useState<{
    productId: string;
    variantId: string;
  } | null>(null);

  const selectedVariantId =
    variantSelection?.productId === product.id
      ? variantSelection.variantId
      : String(product.variants[0]?.id ?? '');

  const activeVariant =
    product.variants.find(variant => String(variant.id) === selectedVariantId) ?? product.variants[0] ?? null;

  if (!activeVariant) return null;

  const originalPrice =
    mode === 'promo' && product.discountPercentage > 0
      ? Math.round(activeVariant.price / (1 - product.discountPercentage / 100))
      : null;

  return (
    <motion.div
      key={product.id}
      initial={{
        opacity: 0,
        x: 30
      }}
      animate={{
        opacity: 1,
        x: 0
      }}
      exit={{
        opacity: 0,
        x: -30
      }}
      transition={{
        duration: 0.22
      }}
      className="grid h-full min-h-0 lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
      {/* MEDIA PANEL */}
      <section className="relative min-h-[20rem] overflow-hidden bg-muted lg:min-h-full">
        <Image
          src={activeVariant.image}
          alt={product.name}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/25" />

        {mode === 'featured' && (
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
        )}

        <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
          {mode === 'featured' && (
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md">
              <Sparkles className="size-3.5" />
              Featured
            </span>
          )}

          {mode === 'promo' && (
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md"
              style={{
                backgroundColor: accent ?? 'hsl(var(--secondary))'
              }}>
              <Tag className="size-3.5" />
              {badge ?? 'Special offer'}
            </span>
          )}

          {product.isNew && (
            <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-black">
              New arrival
            </span>
          )}
        </div>

        <WishlistButton
          productId={product.id}
          productName={product.name}
          appearance="dark-overlay"
          className="absolute right-4 top-4"
        />

        {(onPrevious || onNext) && (
          <>
            <button
              type="button"
              aria-label="Previous product"
              onClick={onPrevious}
              disabled={!hasPrevious}
              className="absolute left-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white backdrop-blur-md transition hover:bg-black/70 disabled:opacity-25">
              <ChevronLeft className="size-5" />
            </button>

            <button
              type="button"
              aria-label="Next product"
              onClick={onNext}
              disabled={!hasNext}
              className="absolute right-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white backdrop-blur-md transition hover:bg-black/70 disabled:opacity-25">
              <ChevronRight className="size-5" />
            </button>
          </>
        )}

        {totalProducts !== undefined && totalProducts > 0 && (
          <span className="absolute bottom-5 left-5 rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
            {(currentIndex ?? 0) + 1} / {totalProducts}
          </span>
        )}

        <div className="absolute inset-x-0 bottom-0 p-5 text-white lg:p-7">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/65">{product.category}</p>

          <h2 className="mt-2 max-w-2xl text-2xl font-black tracking-tight md:text-4xl">{product.name}</h2>
        </div>
      </section>

      {/* DETAILS PANEL */}
      <section className="min-h-0 overflow-y-auto bg-background scrollbar-none">
        <div className="space-y-6 p-5 md:p-7 lg:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium">
              <Star className="size-4 fill-amber-400 text-amber-400" />
              {product.rating.toFixed(1)}
            </span>

            <span className="text-sm text-muted-foreground">{product.reviews.toLocaleString()} reviews</span>

            <span className="text-sm text-muted-foreground">{product.soldCount.toLocaleString()} sold</span>
          </div>

          <p className="text-sm leading-7 text-muted-foreground">{product.shortDescription}</p>

          <div className="rounded-2xl border bg-card p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="w-full sm:max-w-[14rem]">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Product option
                </p>

                <Select
                  value={selectedVariantId}
                  onValueChange={value => {
                    if (value !== null) {
                      setVariantSelection({
                        productId: product.id,
                        variantId: value
                      });
                    }
                  }}>
                  <SelectTrigger className="w-full rounded-xl">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {product.variants.map(variant => (
                      <SelectItem key={variant.id} value={String(variant.id)}>
                        {variant.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:text-right">
                {originalPrice && (
                  <p className="text-sm text-muted-foreground line-through">
                    ₦{originalPrice.toLocaleString()}
                  </p>
                )}

                <p className={cn('text-3xl font-black', mode === 'promo' && 'text-secondary')}>
                  ₦{activeVariant.price.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-muted px-3 py-1.5">{activeVariant.label}</span>

              <span
                className={cn(
                  'rounded-full px-3 py-1.5',
                  activeVariant.stockLeft > 0
                    ? 'bg-emerald-500/10 text-emerald-600'
                    : 'bg-destructive/10 text-destructive'
                )}>
                {activeVariant.stockLeft > 0 ? `${activeVariant.stockLeft} available` : 'Out of stock'}
              </span>

              {product.discountPercentage > 0 && (
                <span className="rounded-full bg-secondary/10 px-3 py-1.5 text-secondary">
                  {product.discountPercentage}% off
                </span>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-bold">Product details</h3>

            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted-foreground">
              {product.longDescription}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border bg-card p-4">
              <PackageCheck className="size-5 text-primary" />

              <p className="mt-3 text-sm font-semibold">Availability</p>

              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Inventory is updated from the AJ Logik catalog.
              </p>
            </div>

            <div className="rounded-2xl border bg-card p-4">
              <Clock3 className="size-5 text-primary" />

              <p className="mt-3 text-sm font-semibold">Delivery</p>

              <p className="mt-1 text-xs leading-5 text-muted-foreground">{product.estimatedDelivery}</p>
            </div>

            <div className="rounded-2xl border bg-card p-4">
              <ShieldCheck className="size-5 text-primary" />

              <p className="mt-3 text-sm font-semibold">Secure shopping</p>

              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Protected checkout and verified inventory.
              </p>
            </div>

            <div className="rounded-2xl border bg-card p-4">
              <BadgeCheck className="size-5 text-primary" />

              <p className="mt-3 text-sm font-semibold">Premium selection</p>

              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Curated for the AJ Logik shopping experience.
              </p>
            </div>
          </div>

          {product.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-bold">Tags</h3>

              <div className="mt-3 flex flex-wrap gap-2">
                {product.tags.map(tag => (
                  <span
                    key={tag}
                    className="rounded-full border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <footer className="sticky bottom-0 border-t bg-background/95 p-4 backdrop-blur-xl md:p-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              size="lg"
              className="flex-1 gap-2 rounded-full"
              disabled={activeVariant.stockLeft <= 0}
              onClick={() => onAddToCart?.(product, activeVariant)}>
              <ShoppingBag className="size-4" />
              Add {activeVariant.label} to cart
            </Button>

            <Button size="lg" variant="outline" className="gap-2 rounded-full">
              <Link href={`/products/${product.slug}`}>
                View full product
                <ArrowRight className="size-4" />
              </Link>
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
  if (!product) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={nextOpen => {
        if (!nextOpen) onClose();
      }}>
      <DialogContent
        className={cn(
          'h-[92dvh] w-[96vw] max-w-7xl p-0',
          'rounded-3xl border-border/70 shadow-2xl',
          '[&>button]:z-50 [&>button]:rounded-full [&>button]:bg-background/80'
        )}>
        <div className="h-full min-h-0">
          <AnimatePresence mode="wait">
            <PreviewContent key={`${mode}:${product.id}`} product={product} mode={mode} {...props} />
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
