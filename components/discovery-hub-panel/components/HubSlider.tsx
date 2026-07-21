'use client';

import Image from 'next/image';

import { ArrowRight, ChevronLeft, ChevronRight, LoaderCircle, Minus, Plus } from 'lucide-react';

import { useEffect, useMemo, useState } from 'react';

import { useCart } from '@/features/cart';
import { useCatalog } from '@/features/catalog';
import { useFeedExperience } from '@/features/feed-experience';

import { cn } from '@/lib/utils';

import type { HubSlideItem } from '../discoveryHubTypes';

type HubSliderProps = {
  items: HubSlideItem[];
  autoSlide?: boolean;

  variant?: 'hero' | 'strip' | 'grid' | 'minimal-grid';
};

type CartActionOptions = {
  containerClassName?: string;
  buttonClassName?: string;
  compact?: boolean;
};

function formatPrice(price?: number): string | null {
  if (price === undefined || price === null) {
    return null;
  }

  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0
  }).format(price);
}

function getTargetProductId(target: unknown): string | null {
  if (typeof target !== 'object' || target === null) {
    return null;
  }

  const candidate = target as {
    type?: unknown;
    productId?: unknown;
  };

  if (candidate.type !== 'product' || typeof candidate.productId !== 'string') {
    return null;
  }

  return candidate.productId;
}

export default function HubSlider({ items, autoSlide = false, variant = 'strip' }: HubSliderProps) {
  const { actions } = useFeedExperience();

  const { products } = useCatalog();

  const {
    items: cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    mutating
  } = useCart();

  const [activeIndex, setActiveIndex] = useState(0);

  const [pendingVariantId, setPendingVariantId] = useState<string | null>(null);

  const safeItems = useMemo(() => items.filter(Boolean), [items]);

  const productById = useMemo(() => new Map(products.map(product => [product.id, product])), [products]);

  const currentActiveIndex = safeItems.length > 0 ? Math.min(activeIndex, safeItems.length - 1) : 0;

  const activeItem = safeItems[currentActiveIndex];

  const resolveProduct = (item: HubSlideItem) => {
    const targetProductId = getTargetProductId(item.target);

    return productById.get(targetProductId ?? item.id);
  };

  const getCommerceState = (item: HubSlideItem) => {
    const product = resolveProduct(item);

    const selectedVariant = product
      ? (product.variants.find(variant => variant.stockLeft > 0) ?? product.variants[0])
      : undefined;

    const cartItem = selectedVariant
      ? cartItems.find(item => item.variantId === selectedVariant.id)
      : undefined;

    return {
      product,
      selectedVariant,
      cartItem,

      pending: Boolean(selectedVariant) && pendingVariantId === selectedVariant?.id
    };
  };

  const increaseSlideCartQuantity =
    async (
      item: HubSlideItem
    ): Promise<void> => {
      const {
        product,
        selectedVariant,
        cartItem
      } = getCommerceState(
        item
      );

      if (
        !product ||
        !selectedVariant ||
        selectedVariant.stockLeft <=
          0 ||
        mutating ||
        (
          cartItem &&
          cartItem.quantity >=
            selectedVariant.stockLeft
        )
      ) {
        return;
      }

      setPendingVariantId(
        selectedVariant.id
      );

      try {
        if (cartItem) {
          await updateQuantity({
            itemId:
              cartItem.id,

            quantity:
              cartItem.quantity +
              1
          });

          return;
        }

        await addToCart({
          product,
          variant:
            selectedVariant,
          quantity: 1
        });
      } finally {
        setPendingVariantId(
          null
        );
      }
    };

  const decreaseSlideCartQuantity =
    async (
      item: HubSlideItem
    ): Promise<void> => {
      const {
        selectedVariant,
        cartItem
      } = getCommerceState(
        item
      );

      if (
        !selectedVariant ||
        !cartItem ||
        mutating
      ) {
        return;
      }

      setPendingVariantId(
        selectedVariant.id
      );

      try {
        if (
          cartItem.quantity <=
          1
        ) {
          await removeFromCart(
            cartItem.id
          );

          return;
        }

        await updateQuantity({
          itemId:
            cartItem.id,

          quantity:
            cartItem.quantity -
            1
        });
      } finally {
        setPendingVariantId(
          null
        );
      }
    };

  const openItem = (item: HubSlideItem): void => {
    const product = resolveProduct(item);

    /*
     * Real catalog products always launch the complete
     * Product Experience inside the active feed.
     */
    if (product) {
      actions.openExperience({
        type: 'product',
        productId: product.id
      });

      return;
    }

    /*
     * Promotions, coupons and other Hub items may
     * publish their own experience targets.
     */
    if (item.target) {
      actions.openExperience(item.target);
    }
  };

  const renderCartAction = (
    item: HubSlideItem,
    options:
      CartActionOptions = {}
  ) => {
    const {
      product,
      selectedVariant,
      cartItem,
      pending
    } = getCommerceState(
      item
    );

    if (
      !product ||
      !selectedVariant
    ) {
      return null;
    }

    const {
      containerClassName,
      buttonClassName,
      compact = false
    } = options;

    const soldOut =
      selectedVariant.stockLeft <=
      0;

    const reachedStockLimit =
      Boolean(
        cartItem &&
          cartItem.quantity >=
            selectedVariant.stockLeft
      );

    if (cartItem) {
      return (
        <div
          className={cn(
            'inline-flex items-center rounded-full border border-primary/12 bg-background/55 p-1 text-primary shadow-sm backdrop-blur',
            containerClassName
          )}
        >
          <button
            type="button"
            aria-label={`Remove one ${selectedVariant.label} from cart`}
            disabled={
              mutating ||
              pending
            }
            onClick={event => {
              event.preventDefault();
              event.stopPropagation();

              void decreaseSlideCartQuantity(
                item
              );
            }}
            className={cn(
              'grid shrink-0 place-items-center rounded-full transition hover:bg-primary hover:text-background disabled:cursor-not-allowed disabled:opacity-45',
              compact
                ? 'size-7'
                : 'size-8'
            )}
          >
            <Minus
              className={cn(
                compact
                  ? 'size-3'
                  : 'size-3.5'
              )}
            />
          </button>

          <span
            aria-live="polite"
            aria-label={`${cartItem.quantity} ${cartItem.quantity === 1 ? 'item' : 'items'} in cart`}
            className={cn(
              'min-w-8 text-center font-bold',
              compact
                ? 'text-[10px]'
                : 'text-xs'
            )}
          >
            {pending ? (
              <LoaderCircle className="mx-auto size-3.5 animate-spin" />
            ) : (
              cartItem.quantity >
              99
                ? '99+'
                : cartItem.quantity
            )}
          </span>

          <button
            type="button"
            aria-label={`Add one more ${selectedVariant.label} to cart`}
            disabled={
              mutating ||
              pending ||
              reachedStockLimit
            }
            onClick={event => {
              event.preventDefault();
              event.stopPropagation();

              void increaseSlideCartQuantity(
                item
              );
            }}
            className={cn(
              'grid shrink-0 place-items-center rounded-full transition hover:bg-primary hover:text-background disabled:cursor-not-allowed disabled:opacity-45',
              compact
                ? 'size-7'
                : 'size-8'
            )}
          >
            <Plus
              className={cn(
                compact
                  ? 'size-3'
                  : 'size-3.5'
              )}
            />
          </button>
        </div>
      );
    }

    return (
      <button
        type="button"
        disabled={
          soldOut ||
          mutating ||
          pending
        }
        onClick={event => {
          event.preventDefault();
          event.stopPropagation();

          void increaseSlideCartQuantity(
            item
          );
        }}
        className={cn(
          'inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full border border-primary/12 bg-background/55 px-3 py-2 text-[10px] font-semibold text-primary transition hover:bg-primary hover:text-background disabled:cursor-not-allowed disabled:opacity-55',
          containerClassName,
          buttonClassName
        )}
      >
        {pending ? (
          <LoaderCircle className="size-3.5 shrink-0 animate-spin" />
        ) : (
          <Plus className="size-3.5 shrink-0" />
        )}

        <span className="truncate">
          {soldOut
            ? 'Sold out'
            : pending
              ? 'Adding...'
              : compact
                ? 'Add'
                : 'Add to cart'}
        </span>
      </button>
    );
  };

  const showPrevious = (): void => {
    setActiveIndex(currentActiveIndex === 0 ? safeItems.length - 1 : currentActiveIndex - 1);
  };

  const showNext = (): void => {
    setActiveIndex((currentActiveIndex + 1) % safeItems.length);
  };

  useEffect(() => {
    if (!autoSlide || safeItems.length <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex(current => (current + 1) % safeItems.length);
    }, 4500);

    return () => window.clearInterval(interval);
  }, [autoSlide, safeItems.length]);

  if (!safeItems.length) {
    return null;
  }

  // ============================================================
  // EDITORIAL HERO
  // ============================================================

  if (variant === 'hero' && activeItem) {
    const { product: activeProduct, selectedVariant } = getCommerceState(activeItem);

    const activeTitle = activeProduct?.name ?? activeItem.title;

    const activeImage = selectedVariant?.image ?? activeItem.image;

    const activePrice = formatPrice(selectedVariant?.price ?? activeItem.price);

    return (
      <div>
        <div className="group relative overflow-hidden rounded-3xl border border-primary/10 bg-background shadow-[0_24px_70px_rgba(0,0,0,0.38)]">
          <div className="grid min-h-66 grid-cols-5">
            <div className="relative col-span-3 flex min-w-0 flex-col justify-between overflow-hidden p-5 md:p-6">
              <div className="absolute inset-0 bg-gradient-to-br from-card via-background to-background" />

              <div className="absolute -left-20 -top-20 size-52 rounded-full bg-primary/5 blur-3xl" />

              <div className="relative">
                <div className="flex items-center gap-2">
                  <span className="h-px w-7 bg-primary/30" />

                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary/45">
                    Featured promotion
                  </p>
                </div>

                <h4 className="mt-5 text-xl font-bold leading-tight tracking-tight text-primary">
                  {activeTitle}
                </h4>

                {activeItem.subtitle ? (
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-primary/55">{activeItem.subtitle}</p>
                ) : null}

                {activePrice ? (
                  <div className="mt-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/35">
                      Promotional price
                    </p>

                    <p className="mt-1 text-lg font-bold text-primary">{activePrice}</p>
                  </div>
                ) : null}
              </div>

              <div className="relative mt-6">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openItem(activeItem)}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-background transition hover:opacity-90">
                    {activeProduct ? 'View product' : 'Explore promotion'}

                    <ArrowRight className="size-4" />
                  </button>

                  {renderCartAction(activeItem, {
                    buttonClassName: 'px-4 py-2.5 text-xs'
                  })}
                </div>

                {safeItems.length > 1 ? (
                  <div className="mt-5 flex items-center justify-between gap-3">
                    <div className="flex gap-1.5">
                      {safeItems.map((item, index) => (
                        <button
                          key={item.id}
                          type="button"
                          title={`Show ${item.title}`}
                          onClick={() => setActiveIndex(index)}
                          className={cn(
                            'h-1.5 rounded-full transition-all duration-300',

                            index === currentActiveIndex
                              ? 'w-7 bg-primary'
                              : 'w-1.5 bg-primary/20 hover:bg-primary/40'
                          )}
                        />
                      ))}
                    </div>

                    <span className="shrink-0 text-[10px] font-medium text-primary/35">
                      {String(currentActiveIndex + 1).padStart(2, '0')} / {String(safeItems.length).padStart(2, '0')}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="relative col-span-2 min-h-66 overflow-hidden border-l border-primary/10 bg-card">
              <button
                type="button"
                onClick={() => openItem(activeItem)}
                aria-label={`Explore ${activeTitle}`}
                className="absolute inset-0 block h-full w-full overflow-hidden text-left">
                <Image
                  src={activeImage}
                  alt={activeTitle}
                  fill
                  sizes="(max-width: 1024px) 40vw, 280px"
                  className="object-cover object-center transition duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-r from-black/15 via-transparent to-transparent" />

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/5" />
              </button>

              {activeItem.badge ? (
                <span className="pointer-events-none absolute right-3 top-3 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-xl">
                  {activeItem.badge}
                </span>
              ) : null}

              <span className="pointer-events-none absolute bottom-4 left-3 rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-[9px] font-medium text-white/75 backdrop-blur-xl">
                AJ Logik
              </span>

              {safeItems.length > 1 ? (
                <div className="absolute bottom-4 right-3 flex gap-2">
                  <button
                    type="button"
                    onClick={showPrevious}
                    aria-label="Previous promotion"
                    className="grid size-8 place-items-center rounded-full border border-white/10 bg-black/45 text-white backdrop-blur transition hover:bg-black/70">
                    <ChevronLeft className="size-4" />
                  </button>

                  <button
                    type="button"
                    onClick={showNext}
                    aria-label="Next promotion"
                    className="grid size-8 place-items-center rounded-full border border-white/10 bg-black/45 text-white backdrop-blur transition hover:bg-black/70">
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // THREE-PRODUCT GRID
  // ============================================================

  if (variant === 'grid' || variant === 'minimal-grid') {
    const visibleItems = safeItems.slice(0, 3);

    return (
      <div className="mt-5 grid grid-cols-3 gap-2.5 sm:gap-3">
        {visibleItems.map(item => {
          const { product, selectedVariant } = getCommerceState(item);

          const title = product?.name ?? item.title;

          const image = selectedVariant?.image ?? item.image;

          const price = formatPrice(selectedVariant?.price ?? item.price);

          return (
            <article
              key={item.id}
              className="group min-w-0 overflow-hidden rounded-2xl border border-primary/10 bg-background/45 text-left shadow-[0_12px_35px_rgba(0,0,0,0.22)] transition duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:bg-background/60">
              <button type="button" onClick={() => openItem(item)} className="block w-full text-left">
                <div className="relative aspect-[3/4] min-h-32 overflow-hidden">
                  <Image
                    src={image}
                    alt={title}
                    fill
                    sizes="(max-width: 640px) 31vw, 140px"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

                  {item.badge ? (
                    <span className="absolute left-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-[9px] font-semibold text-white backdrop-blur">
                      {item.badge}
                    </span>
                  ) : null}
                </div>

                <div className="p-2.5">
                  <p className="line-clamp-2 min-h-8 text-[11px] font-semibold leading-4 text-primary">
                    {title}
                  </p>

                  {variant === 'grid' && item.subtitle ? (
                    <p className="mt-1 line-clamp-1 text-[10px] text-primary/50">{item.subtitle}</p>
                  ) : null}

                  {variant === 'grid' && price ? (
                    <p className="mt-2 truncate text-[11px] font-bold text-primary/80">{price}</p>
                  ) : null}
                </div>
              </button>

              {product && selectedVariant ? (
                <div className="px-2.5 pb-2.5">
                  {renderCartAction(item, {
                    containerClassName: 'w-full',
                    compact: true
                  })}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    );
  }

  // ============================================================
  // COMPACT STRIP
  // ============================================================

  return (
    <div className="mt-5 flex gap-3 overflow-x-auto pb-2 scrollbar-none">
      {safeItems.map(item => {
        const { product, selectedVariant } = getCommerceState(item);

        const title = product?.name ?? item.title;

        const image = selectedVariant?.image ?? item.image;

        const price = formatPrice(selectedVariant?.price ?? item.price);

        return (
          <article key={item.id} className="w-28 shrink-0">
            <button type="button" onClick={() => openItem(item)} className="block w-full text-left">
              <div className="relative aspect-square w-28 overflow-hidden rounded-2xl border border-primary/10 bg-background shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
                <Image
                  src={image}
                  alt={title}
                  fill
                  sizes="112px"
                  className="object-cover transition duration-500 hover:scale-105"
                />
              </div>

              <p className="mt-2 line-clamp-2 text-[11px] font-medium leading-4 text-primary/75">{title}</p>

              {price ? <p className="mt-1 text-[11px] font-semibold text-primary/45">{price}</p> : null}
            </button>

            {product && selectedVariant ? (
              <div className="mt-2">
                {renderCartAction(item, {
                  containerClassName: 'w-full',
                  buttonClassName: 'px-2',
                  compact: true
                })}
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
