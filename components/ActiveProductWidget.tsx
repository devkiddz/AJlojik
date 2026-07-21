'use client';

import Image from 'next/image';

import { useMemo, useState } from 'react';

import {
  ArrowLeft,
  BadgeCheck,
  CalendarClock,
  Eye,
  Heart,
  Layers3,
  LoaderCircle,
  PackageCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Tag
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useCart } from '@/features/cart';
import { useFeedExperience } from '@/features/feed-experience';
import { cn } from '@/lib/utils';

function normalizeText(value?: string): string | undefined {
  const normalized = value?.trim();

  return normalized || undefined;
}

function formatLabel(value: string): string {
  return value
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, letter => letter.toUpperCase());
}

type ActiveProductWidgetProps = {
  onBackToDiscovery: () => void;
};

export default function ActiveProductWidget({ onBackToDiscovery }: ActiveProductWidgetProps) {
  const { intent, context, actions, productDetailsDisclosure } = useFeedExperience();

  const { items: cartItems, mutating } = useCart();

  const product = useMemo(() => {
    if (intent.type !== 'product' || !intent.targetId) {
      return undefined;
    }

    return context.catalog.products.find(candidate => candidate.id === intent.targetId);
  }, [context.catalog.products, intent.targetId, intent.type]);

  const category = useMemo(() => {
    if (!product) {
      return undefined;
    }

    return context.catalog.categories.find(candidate => candidate.slug === product.category);
  }, [context.catalog.categories, product]);

  const [variantSelection, setVariantSelection] = useState<{
    productId: string;
    variantId: string;
  } | null>(null);

  const selectedVariantId =
    product && variantSelection?.productId === product.id
      ? variantSelection.variantId
      : product?.variants[0]?.id;

  const selectedVariant = useMemo(
    () => product?.variants.find(variant => variant.id === selectedVariantId) ?? product?.variants[0],
    [product, selectedVariantId]
  );

  const priceFormatter = useMemo(() => {
    try {
      return new Intl.NumberFormat(context.environment.locale || 'en-NG', {
        style: 'currency',
        currency: context.environment.currency || 'NGN',
        maximumFractionDigits: 0
      });
    } catch {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        maximumFractionDigits: 0
      });
    }
  }, [context.environment.currency, context.environment.locale]);

  const numberFormatter = useMemo(() => {
    try {
      return new Intl.NumberFormat(context.environment.locale || 'en-NG', {
        notation: 'compact',
        maximumFractionDigits: 1
      });
    } catch {
      return new Intl.NumberFormat('en-NG', {
        notation: 'compact',
        maximumFractionDigits: 1
      });
    }
  }, [context.environment.locale]);

  if (!product) {
    return null;
  }

  const detailsAreRevealed =
    productDetailsDisclosure.expanded &&
    productDetailsDisclosure.productId === product.id;

  const productArtwork = selectedVariant?.image ?? product.variants[0]?.image ?? category?.image;

  const categoryCover = category?.coverImages?.[0] ?? category?.image;

  const selectedVariantCartQuantity =
    cartItems.find(item => item.variantId === selectedVariant?.id)?.quantity ?? 0;

  const totalProductCartQuantity = cartItems
    .filter(item => item.productId === product.id)
    .reduce((total, item) => total + item.quantity, 0);

  const isOutOfStock = !selectedVariant || selectedVariant.stockLeft <= 0;

  const isLowStock = Boolean(
    selectedVariant && selectedVariant.stockLeft > 0 && selectedVariant.stockLeft <= 5
  );

  const shortDescription = normalizeText(product.shortDescription);

  const longDescription = normalizeText(product.longDescription);

  const descriptionsAreDifferent = Boolean(
    shortDescription && longDescription && shortDescription.toLowerCase() !== longDescription.toLowerCase()
  );

  const categoryDescription =
    normalizeText(category?.description) ?? normalizeText(category?.shortDescription);

  const visibleTags = (product.tags ?? []).filter(tag => !tag.includes(':')).slice(0, 12);

  const handleAddToCart = () => {
    if (!selectedVariant || isOutOfStock || mutating) {
      return;
    }

    actions.addToCart(product, selectedVariant);
  };

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
      {/* ====================================================
          FIXED PRODUCT NAVIGATION
      ==================================================== */}

      <header className="z-30 flex shrink-0 items-center justify-between gap-3 border-b border-border bg-background/95 px-3 py-3 backdrop-blur-xl">
        <div className="min-w-0">
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Now exploring
          </p>

          <p className="mt-0.5 truncate text-xs font-medium text-foreground/80">
            {category?.label ?? formatLabel(product.category)}
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onBackToDiscovery}
          className="h-9 shrink-0 rounded-full bg-background px-3 text-xs font-semibold shadow-sm">
          <ArrowLeft className="size-3.5" />
          Continue Discovery
        </Button>
      </header>
      {/* ====================================================
          SCROLLABLE PRODUCT INFORMATION
      ==================================================== */}

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="space-y-5 px-3 pb-8 pt-3">
          {/* ==================================================
              FULL-BLEED PRODUCT ARTWORK
          ================================================== */}

          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border bg-muted shadow-xl">
            {categoryCover ? (
              <Image
                src={categoryCover}
                alt=""
                fill
                priority
                sizes="360px"
                className="scale-110 object-cover opacity-20 blur-xl"
              />
            ) : null}

            {productArtwork ? (
              <Image
                key={selectedVariant?.id}
                src={productArtwork}
                alt={selectedVariant?.label ? `${product.name} — ${selectedVariant.label}` : product.name}
                fill
                priority
                quality={95}
                sizes="360px"
                className="object-cover object-center"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
                Product image unavailable
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-black/15" />

            {/* Product states */}

            <div className="absolute left-3 top-3 flex max-w-[55%] flex-wrap gap-2">
              {product.isNew ? (
                <span className="rounded-full border border-white/15 bg-black/50 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-xl">
                  New
                </span>
              ) : null}

              {product.featured ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/50 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-xl">
                  <Sparkles className="size-3" />
                  Featured
                </span>
              ) : null}

              {product.discountPercentage > 0 ? (
                <span className="rounded-full border border-white/15 bg-black/50 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-xl">
                  Save {product.discountPercentage}%
                </span>
              ) : null}
            </div>

            {/* Cart state */}

            <div className="absolute right-3 top-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/60 py-1.5 pl-1.5 pr-3 text-white shadow-lg backdrop-blur-xl">
              <span className="grid size-7 place-items-center rounded-full bg-white/15">
                <ShoppingCart className="size-3.5" />
              </span>

              <span className="text-xs font-semibold">
                {totalProductCartQuantity > 0 ? `${totalProductCartQuantity} in cart` : 'Cart empty'}
              </span>
            </div>

            {/* Artwork caption */}

            <div className="absolute inset-x-0 bottom-0 p-4 text-white">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/65">
                {category?.label ?? formatLabel(product.category)}
              </p>

              <h2 className="mt-1 text-2xl font-bold leading-tight tracking-tight">{product.name}</h2>

              {selectedVariant?.label ? (
                <p className="mt-1 text-xs text-white/65">{selectedVariant.label}</p>
              ) : null}
            </div>
          </div>

          {/* ==================================================
              QUICK OVERVIEW
          ================================================== */}

          <section>
            {shortDescription ? (
              <p className="text-sm leading-6 text-muted-foreground">{shortDescription}</p>
            ) : null}

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Star className="size-3.5 fill-amber-400 text-amber-400" />

                <strong className="font-semibold text-foreground">{product.rating}</strong>

                <span>({numberFormatter.format(product.reviews)} reviews)</span>
              </span>

              <span className="size-1 rounded-full bg-border" />

              <span>{numberFormatter.format(product.soldCount)} sold</span>
            </div>
          </section>

          {/* ==================================================
              VARIANT SELECTION
          ================================================== */}

          {product.variants.length > 1 ? (
            <section>
              <div className="mb-2 flex items-center gap-2">
                <Layers3 className="size-3.5 text-muted-foreground" />

                <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Choose an option
                </h3>
              </div>

              <div className="flex flex-wrap gap-2">
                {product.variants.map(variant => {
                  const active = variant.id === selectedVariant?.id;

                  const unavailable = variant.stockLeft <= 0;

                  return (
                    <button
                      key={variant.id}
                      type="button"
                      disabled={unavailable}
                      aria-pressed={active}
                      onClick={() =>
                        setVariantSelection({
                          productId: product.id,
                          variantId: variant.id
                        })
                      }
                      className={cn(
                        'rounded-full border px-3 py-1.5 text-xs font-medium transition',

                        active
                          ? 'border-foreground bg-foreground text-background'
                          : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground',

                        unavailable && 'cursor-not-allowed opacity-35'
                      )}>
                      {variant.label}
                    </button>
                  );
                })}
              </div>
            </section>
          ) : null}

          {/* ==================================================
              PRICE AND AVAILABILITY
          ================================================== */}

          <section className="rounded-2xl border border-border bg-muted/35 p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Current price
                </p>

                <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                  {selectedVariant ? priceFormatter.format(Number(selectedVariant.price)) : 'Unavailable'}
                </p>
              </div>

              <span
                className={cn(
                  'inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold',

                  isOutOfStock
                    ? 'bg-destructive/10 text-destructive'
                    : isLowStock
                      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                      : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                )}>
                <PackageCheck className="size-3.5" />

                {isOutOfStock
                  ? 'Out of stock'
                  : isLowStock
                    ? `Only ${selectedVariant?.stockLeft} left`
                    : `${selectedVariant?.stockLeft} available`}
              </span>
            </div>

            {selectedVariantCartQuantity > 0 ? (
              <div className="mt-3 rounded-xl border border-primary/15 bg-primary/5 px-3 py-2">
                <p className="text-xs font-medium text-primary">
                  {selectedVariantCartQuantity} of this option currently in your cart
                </p>
              </div>
            ) : null}
          </section>

          {/* ==================================================
              COMMERCE CONTROLS
          ================================================== */}

          <div className="grid grid-cols-[1fr_auto] gap-2">
            <Button
              type="button"
              disabled={isOutOfStock || mutating}
              onClick={handleAddToCart}
              className="rounded-full">
              {mutating ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <ShoppingCart className="size-4" />
              )}

              {mutating ? 'Adding...' : selectedVariantCartQuantity > 0 ? 'Add another' : 'Add to cart'}
            </Button>

            <Button
              type="button"
              size="icon"
              variant="outline"
              aria-label={product.liked ? 'Remove from wishlist' : 'Add to wishlist'}
              aria-pressed={product.liked}
              onClick={() => actions.toggleLike(product.id)}
              className="rounded-full">
              <Heart
                className={cn(
                  'size-4',

                  product.liked && 'fill-current text-rose-500'
                )}
              />
            </Button>
          </div>

          {/* ==================================================
              FULL DESCRIPTION
          ================================================== */}

          {longDescription ? (
            <section className="border-t border-border pt-5">
              <h3 className="text-sm font-semibold text-foreground">About this product</h3>

              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                {longDescription}
              </p>
            </section>
          ) : null}

          {descriptionsAreDifferent && shortDescription ? (
            <section className="rounded-2xl border border-border bg-muted/25 p-4">
              <h3 className="text-xs font-semibold text-foreground">Quick overview</h3>

              <p className="mt-2 text-xs leading-5 text-muted-foreground">{shortDescription}</p>
            </section>
          ) : null}

          {/* ==================================================
              PRODUCT INFORMATION
          ================================================== */}

          <section className="border-t border-border pt-5">
            <h3 className="text-sm font-semibold text-foreground">Product information</h3>

            <dl className="mt-3 divide-y divide-border rounded-2xl border border-border">
              <div className="flex items-center justify-between gap-4 px-3 py-3">
                <dt className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Tag className="size-3.5" />
                  Category
                </dt>

                <dd className="text-right text-xs font-medium text-foreground">
                  {category?.label ?? formatLabel(product.category)}
                </dd>
              </div>

              {product.subcategory ? (
                <div className="flex items-center justify-between gap-4 px-3 py-3">
                  <dt className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Layers3 className="size-3.5" />
                    Subcategory
                  </dt>

                  <dd className="text-right text-xs font-medium text-foreground">
                    {formatLabel(product.subcategory)}
                  </dd>
                </div>
              ) : null}

              <div className="flex items-center justify-between gap-4 px-3 py-3">
                <dt className="flex items-center gap-2 text-xs text-muted-foreground">
                  <BadgeCheck className="size-3.5" />
                  Status
                </dt>

                <dd className="text-right text-xs font-medium text-foreground">
                  {product.isNew
                    ? 'New arrival'
                    : product.featured
                      ? 'Featured selection'
                      : 'Available selection'}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-4 px-3 py-3">
                <dt className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Layers3 className="size-3.5" />
                  Options
                </dt>

                <dd className="text-right text-xs font-medium text-foreground">
                  {product.variants.length} {product.variants.length === 1 ? 'variant' : 'variants'}
                </dd>
              </div>

              {product.estimatedDelivery ? (
                <div className="flex items-center justify-between gap-4 px-3 py-3">
                  <dt className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarClock className="size-3.5" />
                    Delivery
                  </dt>

                  <dd className="text-right text-xs font-medium text-foreground">
                    {product.estimatedDelivery}
                  </dd>
                </div>
              ) : null}

              {product.discountPercentage > 0 ? (
                <div className="flex items-center justify-between gap-4 px-3 py-3">
                  <dt className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Sparkles className="size-3.5" />
                    Discount
                  </dt>

                  <dd className="text-right text-xs font-medium text-foreground">
                    {product.discountPercentage}% off
                  </dd>
                </div>
              ) : null}
            </dl>
          </section>

          {/* ==================================================
              CHARACTERISTICS
          ================================================== */}

          {visibleTags.length > 0 ? (
            <section className="border-t border-border pt-5">
              <h3 className="text-sm font-semibold text-foreground">Characteristics</h3>

              <div className="mt-3 flex flex-wrap gap-2">
                {visibleTags.map(tag => (
                  <span
                    key={tag}
                    className="rounded-full border border-border bg-muted/50 px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                    {formatLabel(tag)}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          {/* ==================================================
              CATEGORY CONTEXT
          ================================================== */}

          {categoryDescription ? (
            <section className="rounded-2xl border border-border bg-muted/25 p-4">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                About {category?.label ?? formatLabel(product.category)}
              </p>

              <p className="mt-2 text-xs leading-5 text-muted-foreground">{categoryDescription}</p>
            </section>
          ) : null}
        </div>
      </div>

      {/* ====================================================
          CENTRAL FEED DETAILS CONTROL
      ==================================================== */}

      <footer className="relative z-50 shrink-0 border-t border-border bg-background/95 p-3 shadow-[0_-18px_45px_rgba(0,0,0,0.2)] backdrop-blur-xl">
        <Button
          type="button"
          onClick={() => actions.previewProduct(product)}
          className="group h-auto min-h-16 w-full justify-between rounded-2xl bg-primary px-3.5 py-3 text-primary-foreground shadow-lg shadow-primary/25 ring-1 ring-primary/30 transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30">
          <span className="flex min-w-0 items-center gap-3 text-left">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-foreground/15 ring-1 ring-primary-foreground/20">
              <Eye className="size-5 transition-transform group-hover:scale-110" />
            </span>

            <span className="min-w-0">
              <span className="block text-sm font-bold">
                {detailsAreRevealed
                  ? 'View revealed details'
                  : 'Reveal all details in Feed'}
              </span>

              <span className="mt-0.5 block truncate text-[10px] font-medium text-primary-foreground/75">
                {detailsAreRevealed
                  ? 'Jump back to the complete product information'
                  : 'Description, variants, availability, delivery and more'}
              </span>
            </span>
          </span>

          <span className="shrink-0 rounded-full bg-primary-foreground px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-primary shadow-sm">
            {detailsAreRevealed ? 'Jump' : 'Reveal'}
          </span>
        </Button>
      </footer>
    </section>
  );
}
