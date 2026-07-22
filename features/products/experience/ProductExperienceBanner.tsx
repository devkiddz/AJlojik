'use client';

import Image, { type ImageProps } from 'next/image';

import { useEffect, useMemo, useState } from 'react';

import { Eye, Heart, LoaderCircle, ShoppingCart, Star } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { useCart } from '@/features/cart';
import type { FeedActions, ProductExperienceBannerModule } from '@/features/feed-experience/contracts';
import { useWishlist } from '@/features/wishlist';

import { cn } from '@/lib/utils';

type ProductExperienceBannerProps = {
  module: ProductExperienceBannerModule;
  actions: FeedActions;
};

type Palette = {
  primary: string;
  secondary: string;
};

type RGBColor = {
  r: number;
  g: number;
  b: number;
};

// ============================================================
// COLOUR UTILITIES
// ============================================================

function clamp(value: number, minimum = 0, maximum = 255): number {
  return Math.max(minimum, Math.min(maximum, value));
}

function hexToRgb(hex: string): RGBColor {
  const normalized = hex.replace('#', '').trim();

  if (normalized.length !== 6) {
    return {
      r: 124,
      g: 58,
      b: 237
    };
  }

  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),

    g: Number.parseInt(normalized.slice(2, 4), 16),

    b: Number.parseInt(normalized.slice(4, 6), 16)
  };
}

function rgbToHex(red: number, green: number, blue: number): string {
  return [
    '#',

    clamp(red).toString(16).padStart(2, '0'),

    clamp(green).toString(16).padStart(2, '0'),

    clamp(blue).toString(16).padStart(2, '0')
  ].join('');
}

function toRgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function boostColour(hex: string, saturationMultiplier = 1.95, brightnessMultiplier = 1.1): string {
  const { r, g, b } = hexToRgb(hex);

  const average = (r + g + b) / 3;

  return rgbToHex(
    Math.round((average + (r - average) * saturationMultiplier) * brightnessMultiplier),

    Math.round((average + (g - average) * saturationMultiplier) * brightnessMultiplier),

    Math.round((average + (b - average) * saturationMultiplier) * brightnessMultiplier)
  );
}

function darkenColour(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);

  return rgbToHex(r - amount, g - amount, b - amount);
}

function getFallbackPalette(accentColor?: string): Palette {
  const baseColour = accentColor?.startsWith('#') ? accentColor : '#7c3aed';

  return {
    primary: boostColour(baseColour),

    secondary: boostColour(darkenColour(baseColour, 38), 1.8, 1.05)
  };
}

function resolveImageUrl(source?: ImageProps['src']): string | null {
  if (!source) {
    return null;
  }

  if (typeof source === 'string') {
    return source;
  }

  if ('src' in source) {
    return source.src;
  }

  return source.default.src;
}

// ============================================================
// IMAGE PALETTE EXTRACTION
// ============================================================

function averageRegionColour(
  imageData: Uint8ClampedArray,
  width: number,
  height: number,
  startX: number,
  endX: number
): string | null {
  let red = 0;
  let green = 0;
  let blue = 0;
  let count = 0;

  for (let y = 0; y < height; y += 2) {
    for (let x = startX; x < endX; x += 2) {
      const index = (y * width + x) * 4;

      const r = imageData[index];

      const g = imageData[index + 1];

      const b = imageData[index + 2];

      const alpha = imageData[index + 3];

      if (alpha < 180) {
        continue;
      }

      const brightness = (r + g + b) / 3;

      if (brightness < 20 || brightness > 240) {
        continue;
      }

      red += r;
      green += g;
      blue += b;
      count += 1;
    }
  }

  if (count === 0) {
    return null;
  }

  return boostColour(rgbToHex(Math.round(red / count), Math.round(green / count), Math.round(blue / count)));
}

async function extractPaletteFromImage(source: string, fallback: Palette): Promise<Palette> {
  try {
    const image = new window.Image();

    image.crossOrigin = 'anonymous';

    image.decoding = 'async';

    image.src = source;

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();

      image.onerror = () => {
        reject(new Error('Unable to extract product colours.'));
      };
    });

    const canvas = document.createElement('canvas');

    const context = canvas.getContext('2d');

    if (!context) {
      return fallback;
    }

    const width = 48;
    const height = 48;

    canvas.width = width;

    canvas.height = height;

    context.drawImage(image, 0, 0, width, height);

    const { data } = context.getImageData(0, 0, width, height);

    const midpoint = Math.floor(width / 2);

    const primary = averageRegionColour(data, width, height, 0, midpoint);

    const secondary = averageRegionColour(data, width, height, midpoint, width);

    return {
      primary: primary ?? fallback.primary,

      secondary: secondary ?? fallback.secondary
    };
  } catch {
    return fallback;
  }
}

// ============================================================
// COMPONENT
// ============================================================

export default function ProductExperienceBanner({ module, actions }: ProductExperienceBannerProps) {
  const {
    product,
    category,
    initialVariantId,
    eyebrow,
    title,
    description,
    locale,
    currency,
    showCommerceActions,
    showViewDetailsAction
  } = module.data;

  // ============================================================
  // CART STATE
  // ============================================================

  const { items: cartItems, mutating: cartMutating } = useCart();

  // ============================================================
  // WISHLIST STATE
  // ============================================================

  const {
    productIds: wishlistProductIds,

    toggleWishlist,

    isMutating: isWishlistMutating
  } = useWishlist();

  const productId = String(product.id);

  const saved = wishlistProductIds.some(wishlistProductId => String(wishlistProductId) === productId);

  const wishlistMutating = isWishlistMutating(productId);

  const handleToggleWishlist = (): void => {
    if (wishlistMutating) {
      return;
    }

    void toggleWishlist({
      id: productId,
      name: product.name
    });
  };

  // ============================================================
  // VARIANT STATE
  // ============================================================

  const firstVariantId = product.variants[0]?.id;

  const defaultVariantId = initialVariantId ?? firstVariantId;

  const variantSelectionKey = `${product.id}:${initialVariantId ?? ''}`;

  const [variantSelection, setVariantSelection] = useState<{
    key: string;
    variantId: string;
  } | null>(null);

  const selectedVariantId =
    variantSelection?.key === variantSelectionKey ? variantSelection.variantId : defaultVariantId;

  const selectedVariant = useMemo(
    () => product.variants.find(variant => variant.id === selectedVariantId) ?? product.variants[0],

    [product.variants, selectedVariantId]
  );

  // ============================================================
  // ARTWORK AND PALETTE
  // ============================================================

  const productArtwork = selectedVariant?.image ?? product.variants[0]?.image ?? category.coverImage;

  const artworkUrl = resolveImageUrl(productArtwork);

  const fallbackPalette = useMemo(
    () => getFallbackPalette(category.accentColor),

    [category.accentColor]
  );

  const paletteKey = `${artworkUrl ?? 'fallback'}:${category.accentColor ?? ''}`;

  const [resolvedPalette, setResolvedPalette] = useState<{
    key: string;
    value: Palette;
  } | null>(null);

  const palette = resolvedPalette?.key === paletteKey ? resolvedPalette.value : fallbackPalette;

  useEffect(() => {
    if (!artworkUrl) {
      return;
    }

    let active = true;

    void extractPaletteFromImage(artworkUrl, fallbackPalette).then(extractedPalette => {
      if (!active) {
        return;
      }

      setResolvedPalette({
        key: paletteKey,
        value: extractedPalette
      });
    });

    return () => {
      active = false;
    };
  }, [artworkUrl, fallbackPalette, paletteKey]);

  // ============================================================
  // PRICE FORMATTING
  // ============================================================

  const priceFormatter = useMemo(() => {
    try {
      return new Intl.NumberFormat(locale || 'en-NG', {
        style: 'currency',
        currency: currency || 'NGN',
        maximumFractionDigits: 0
      });
    } catch {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        maximumFractionDigits: 0
      });
    }
  }, [currency, locale]);

  // ============================================================
  // COMMERCE STATE
  // ============================================================

  const selectedVariantCartQuantity =
    cartItems.find(item => String(item.variantId) === String(selectedVariant?.id))?.quantity ?? 0;

  const totalProductCartQuantity = cartItems
    .filter(item => String(item.productId) === productId)
    .reduce(
      (total, item) => total + item.quantity,

      0
    );

  const isOutOfStock = !selectedVariant || selectedVariant.stockLeft <= 0;

  const handleAddToCart = (): void => {
    if (!selectedVariant || isOutOfStock || cartMutating) {
      return;
    }

    actions.addToCart(product, selectedVariant);
  };

  // ============================================================
  // SHARED WISHLIST APPEARANCE
  // ============================================================

  const wishlistButtonClassName = cn(
    'rounded-full border',
    'backdrop-blur-xl transition',
    'disabled:cursor-wait',
    'disabled:opacity-60',

    saved
      ? [
          'border-rose-300/60',
          'bg-rose-500/20',
          'text-rose-300',
          'hover:bg-rose-500/30',
          'hover:text-rose-200'
        ]
      : ['border-white/15', 'bg-white/10', 'text-white', 'hover:bg-white/15', 'hover:text-white']
  );

  const wishlistButtonStyle = saved
    ? {
        color: '#fda4af',

        borderColor: 'rgba(253, 164, 175, 0.6)',

        backgroundColor: 'rgba(244, 63, 94, 0.2)',

        boxShadow: '0 0 20px rgba(244, 63, 94, 0.18)'
      }
    : undefined;

  return (
    <>
      {/* ========================================================
          MOBILE PRODUCT EXPERIENCE
      ======================================================== */}

      <section
        className="
          relative isolate h-50
          overflow-hidden rounded-lg
          border border-white/10
          bg-[#07101e] text-white
          shadow-lg
          md:hidden
        ">
        {category.coverImage ? (
          <Image
            src={category.coverImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="
              scale-105 object-cover
              object-center opacity-30
              saturate-150 contrast-110
            "
          />
        ) : null}

        <div
          className="
            absolute inset-0
          "
          style={{
            background: `
              radial-gradient(
                circle at 8% 18%,
                ${toRgba(palette.primary, 0.78)} 0%,
                ${toRgba(palette.primary, 0.28)} 34%,
                transparent 62%
              ),

              radial-gradient(
                circle at 88% 100%,
                ${toRgba(palette.secondary, 0.48)} 0%,
                transparent 58%
              ),

              linear-gradient(
                104deg,
                ${toRgba(palette.primary, 0.34)} 0%,
                rgba(7,16,30,0.7) 46%,
                rgba(7,16,30,0.96) 100%
              )
            `
          }}
        />

        <div
          className="
            absolute inset-0
            bg-gradient-to-r
            from-black/5 via-black/15
            to-[#07101e]/85
          "
        />

        <div
          className="
            absolute inset-0
            bg-gradient-to-t
            from-black/45
            via-transparent
            to-white/[0.03]
          "
        />

        <div
          className="
            relative z-10 grid h-full
            grid-cols-[40%_minmax(0,1fr)]
          ">
          {/* Mobile artwork */}

          <button
            type="button"
            onClick={() => actions.previewProduct(product)}
            aria-label={`View ${product.name}`}
            className="
              relative min-w-0
              overflow-hidden
              text-left
            ">
            {productArtwork ? (
              <Image
                src={productArtwork}
                alt={product.name}
                fill
                priority
                quality={92}
                sizes="40vw"
                className="
                  object-cover
                  object-center
                "
              />
            ) : (
              <div
                className="
                  grid size-full
                  place-items-center
                  bg-white/5
                  text-xs text-white/50
                ">
                No image
              </div>
            )}

            <div
              className="
                absolute inset-0
                bg-gradient-to-r
                from-transparent
                via-transparent
                to-[#07101e]/60
              "
            />

            <div
              className="
                absolute inset-x-0
                bottom-0 h-20
                bg-gradient-to-t
                from-black/65
                to-transparent
              "
            />

            <span
              className="
                absolute bottom-2 left-2
                max-w-[calc(100%-1rem)]
                truncate rounded-full
                border border-white/15
                bg-black/45 px-2 py-1
                text-[8px] font-semibold
                uppercase tracking-wider
                text-white/80
                backdrop-blur-md
              ">
              {category.label}
            </span>
          </button>

          {/* Mobile details */}

          <div
            className="
              flex min-w-0 flex-col
              px-3 py-2.5
            ">
            <div
              className="
                flex min-w-0
                items-start
                justify-between
                gap-2
              ">
              <div
                className="
                  min-w-0 flex-1
                ">
                <p
                  className="
                    truncate text-[8px]
                    font-semibold uppercase
                    tracking-[0.18em]
                    text-white/55
                  ">
                  {eyebrow ?? 'Featured product'}
                </p>

                <button
                  type="button"
                  onClick={() => actions.previewProduct(product)}
                  className="
                    mt-0.5 block
                    max-w-full
                    text-left
                  ">
                  <h1
                    className="
                      line-clamp-2
                      text-base font-bold
                      leading-[1.1]
                      tracking-tight
                      text-white
                    ">
                    {title}
                  </h1>
                </button>
              </div>

              <span
                className="
                  inline-flex shrink-0
                  items-center gap-1
                  rounded-full
                  border border-white/15
                  bg-black/35 px-2 py-1
                  text-[8px] font-semibold
                  text-white
                  backdrop-blur-md
                ">
                <ShoppingCart className="size-3" />

                {totalProductCartQuantity}
              </span>
            </div>

            {description ? (
              <p
                className="
                  mt-1 line-clamp-2
                  text-[9px]
                  leading-3.5
                  text-white/60
                ">
                {description}
              </p>
            ) : null}

            <div
              className="
                mt-1.5 flex min-w-0
                flex-wrap items-center
                gap-x-1.5 gap-y-1
                text-[9px]
              ">
              <span
                className="
                  inline-flex
                  items-center gap-1
                  text-white/65
                ">
                <Star
                  className="
                    size-3 fill-current
                    text-amber-300
                  "
                />

                <strong
                  className="
                    text-white
                  ">
                  {product.rating}
                </strong>

                <span>({product.reviews})</span>
              </span>

              {selectedVariant ? (
                <>
                  <span
                    className="
                      size-0.5
                      rounded-full
                      bg-white/30
                    "
                  />

                  <span
                    className="
                      font-bold
                      text-white
                    ">
                    {priceFormatter.format(Number(selectedVariant.price))}
                  </span>

                  <span
                    className="
                      size-0.5
                      rounded-full
                      bg-white/30
                    "
                  />

                  <span
                    className={cn(
                      'font-medium',

                      isOutOfStock ? 'text-red-300' : 'text-emerald-300'
                    )}>
                    {isOutOfStock ? 'Out' : `${selectedVariant.stockLeft} left`}
                  </span>
                </>
              ) : null}
            </div>

            {product.variants.length > 1 ? (
              <div
                className="
                  mt-1.5 overflow-x-auto
                  scrollbar-hide
                ">
                <div
                  className="
                    flex min-w-max
                    gap-1
                  ">
                  {product.variants.map(variant => {
                    const isSelected = variant.id === selectedVariant?.id;

                    const unavailable = variant.stockLeft <= 0;

                    return (
                      <button
                        key={variant.id}
                        type="button"
                        disabled={unavailable}
                        aria-pressed={isSelected}
                        onClick={() =>
                          setVariantSelection({
                            key: variantSelectionKey,

                            variantId: variant.id
                          })
                        }
                        className={cn(
                          'shrink-0 rounded-full border px-2 py-1 text-[8px] font-medium transition',

                          isSelected
                            ? 'border-white bg-white text-black'
                            : 'border-white/15 bg-white/5 text-white/70',

                          unavailable && 'cursor-not-allowed opacity-35'
                        )}>
                        {variant.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : selectedVariant ? (
              <div
                className="
                  mt-1.5
                ">
                <span
                  className="
                    inline-flex rounded-full
                    border border-white/10
                    bg-white/[0.07]
                    px-2 py-1
                    text-[8px] font-medium
                    text-white/65
                  ">
                  {selectedVariant.label}
                </span>
              </div>
            ) : null}

            <div
              className="
                mt-auto flex
                items-center gap-1.5
                pt-1.5
              ">
              {showCommerceActions ? (
                <Button
                  type="button"
                  disabled={isOutOfStock || cartMutating}
                  onClick={handleAddToCart}
                  className="
                    h-8 min-w-0 flex-1
                    rounded-full bg-white
                    px-3 text-[9px]
                    font-semibold text-black
                    shadow-md
                    hover:bg-white/90
                  ">
                  {cartMutating ? (
                    <LoaderCircle
                      className="
                        size-3.5
                        animate-spin
                      "
                    />
                  ) : (
                    <ShoppingCart
                      className="
                        size-3.5
                      "
                    />
                  )}

                  <span
                    className="
                      truncate
                    ">
                    {cartMutating
                      ? 'Adding'
                      : selectedVariantCartQuantity > 0
                        ? 'Add another'
                        : 'Add to cart'}
                  </span>
                </Button>
              ) : null}

              {showViewDetailsAction ? (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => actions.previewProduct(product)}
                  aria-label="View product details"
                  className="
                    size-8 shrink-0
                    rounded-full
                    border border-white/15
                    bg-white/10 text-white
                    backdrop-blur-md
                    hover:bg-white/15
                    hover:text-white
                  ">
                  <Eye
                    className="
                      size-3.5
                    "
                  />
                </Button>
              ) : null}

              {showCommerceActions ? (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  disabled={wishlistMutating}
                  aria-busy={wishlistMutating}
                  aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
                  aria-pressed={saved}
                  onClick={handleToggleWishlist}
                  className={cn(
                    'size-8 shrink-0',

                    wishlistButtonClassName
                  )}
                  style={wishlistButtonStyle}>
                  {wishlistMutating ? (
                    <LoaderCircle
                      className="
                        size-3.5
                        animate-spin
                      "
                    />
                  ) : (
                    <Heart
                      className={cn(
                        'size-3.5 transition',

                        saved && 'fill-current'
                      )}
                    />
                  )}
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        <div
          className="
            absolute inset-x-0
            bottom-0 z-20 h-px
          "
          style={{
            background: `
              linear-gradient(
                90deg,
                ${palette.primary},
                ${palette.secondary},
                transparent
              )
            `
          }}
        />
      </section>

      {/* ========================================================
          DESKTOP PRODUCT EXPERIENCE
      ======================================================== */}

      <section
        className="
          relative isolate hidden
          overflow-hidden rounded-3xl
          border border-white/10
          bg-[#07101e] text-white
          shadow-[0_24px_70px_rgba(0,0,0,0.38)]
          md:block
        ">
        {category.coverImage ? (
          <Image
            src={category.coverImage}
            alt=""
            fill
            priority
            sizes="75vw"
            className="
              scale-105 object-cover
              object-center opacity-35
              saturate-125 contrast-110
            "
          />
        ) : null}

        <div
          className="
            absolute inset-0
          "
          style={{
            background: `
              radial-gradient(
                circle at 10% 22%,
                ${toRgba(palette.primary, 0.76)} 0%,
                ${toRgba(palette.primary, 0.3)} 28%,
                transparent 52%
              ),

              radial-gradient(
                circle at 42% 94%,
                ${toRgba(palette.secondary, 0.58)} 0%,
                ${toRgba(palette.secondary, 0.2)} 30%,
                transparent 55%
              ),

              linear-gradient(
                102deg,
                ${toRgba(palette.primary, 0.38)} 0%,
                ${toRgba(palette.secondary, 0.24)} 30%,
                rgba(7,16,30,0.42) 58%,
                rgba(7,16,30,0.84) 100%
              )
            `
          }}
        />

        <div
          className="
            absolute inset-0
            bg-gradient-to-r
            from-black/5 via-black/10
            to-[#07101e]/70
          "
        />

        <div
          className="
            absolute inset-0
            bg-gradient-to-t
            from-[#07101e]/55
            via-transparent
            to-black/5
          "
        />

        <div
          className="
            absolute right-5
            top-5 z-30
          ">
          <div
            className="
              inline-flex items-center
              gap-2 rounded-full
              border border-white/15
              bg-black/35
              py-1.5 pl-1.5 pr-3
              shadow-xl
              backdrop-blur-xl
            ">
            <span
              className="
                grid size-8
                place-items-center
                rounded-full
                text-white
              "
              style={{
                background: `
                  linear-gradient(
                    135deg,
                    ${palette.primary},
                    ${palette.secondary}
                  )
                `
              }}>
              <ShoppingCart
                className="
                  size-3.5
                "
              />
            </span>

            <div
              className="
                leading-none
              ">
              <p
                className="
                  text-[8px] font-semibold
                  uppercase tracking-[0.18em]
                  text-white/55
                ">
                In cart
              </p>

              <p
                className="
                  mt-1 text-xs
                  font-bold text-white
                ">
                {totalProductCartQuantity > 0
                  ? `${totalProductCartQuantity} item${totalProductCartQuantity > 1 ? 's' : ''}`
                  : 'Empty'}
              </p>
            </div>
          </div>
        </div>

        <div
          className="
            relative z-10 grid
            min-h-[22rem]
            grid-cols-[19rem_minmax(0,1fr)]
            items-stretch
          ">
          {/* Desktop artwork */}

          <div
            className="
              relative h-auto
              min-h-0 p-4
            ">
            <div
              className="
                relative h-full
                overflow-hidden
                rounded-2xl p-0.5
                shadow-[0_20px_55px_rgba(0,0,0,0.4)]
              "
              style={{
                background: `
                  linear-gradient(
                    145deg,
                    ${palette.primary} 0%,
                    ${palette.secondary} 56%,
                    rgba(255,255,255,0.22) 100%
                  )
                `
              }}>
              <div
                className="
                  relative h-full
                  overflow-hidden
                  rounded-[calc(1rem-2px)]
                  bg-black/25
                ">
                {productArtwork ? (
                  <Image
                    src={productArtwork}
                    alt={product.name}
                    fill
                    priority
                    quality={95}
                    sizes="304px"
                    className="
                      object-cover
                    "
                  />
                ) : (
                  <div
                    className="
                      flex size-full
                      items-center
                      justify-center
                      text-sm
                      text-white/55
                    ">
                    Product image unavailable
                  </div>
                )}

                <div
                  className="
                    absolute inset-0
                    bg-gradient-to-t
                    from-black/35
                    via-transparent
                    to-transparent
                  "
                />

                <div
                  className="
                    absolute inset-x-0
                    bottom-0 h-24
                    opacity-45
                  "
                  style={{
                    background: `
                      linear-gradient(
                        to top,
                        ${toRgba(palette.secondary, 0.7)},
                        transparent
                      )
                    `
                  }}
                />
              </div>
            </div>
          </div>

          {/* Desktop details */}

          <div
            className="
              flex h-full min-w-0
              flex-col justify-center
              px-7 pb-6 pr-6 pt-14
            ">
            <div
              className="
                max-w-3xl
              ">
              <p
                className="
                  text-[10px]
                  font-semibold uppercase
                  tracking-[0.22em]
                  text-white/65
                ">
                {eyebrow ?? category.label}
              </p>

              <h1
                className="
                  mt-1 line-clamp-2
                  text-4xl font-bold
                  leading-tight
                  tracking-tight
                ">
                {title}
              </h1>

              {description ? (
                <p
                  className="
                    mt-2 line-clamp-2
                    max-w-2xl
                    text-sm leading-6
                    text-white/72
                  ">
                  {description}
                </p>
              ) : null}

              <div
                className="
                  mt-4 flex flex-wrap
                  items-center
                  gap-x-4 gap-y-2
                  text-xs text-white/65
                ">
                <span
                  className="
                    flex items-center
                    gap-1.5
                  ">
                  <Star
                    className="
                      size-3.5 fill-current
                      text-amber-300
                    "
                  />

                  <span
                    className="
                      font-semibold
                      text-white
                    ">
                    {product.rating}
                  </span>

                  <span>({product.reviews})</span>
                </span>

                {selectedVariant ? (
                  <>
                    <span
                      className="
                        size-1 rounded-full
                        bg-white/25
                      "
                    />

                    <span
                      className="
                        font-semibold
                        text-white
                      ">
                      {priceFormatter.format(Number(selectedVariant.price))}
                    </span>

                    <span
                      className="
                        size-1 rounded-full
                        bg-white/25
                      "
                    />

                    <span
                      className={cn(
                        'font-medium',

                        isOutOfStock ? 'text-red-300' : 'text-emerald-300'
                      )}>
                      {isOutOfStock ? 'Out of stock' : `${selectedVariant.stockLeft} available`}
                    </span>
                  </>
                ) : null}

                {selectedVariantCartQuantity > 0 ? (
                  <>
                    <span
                      className="
                        size-1 rounded-full
                        bg-white/25
                      "
                    />

                    <span
                      className="
                        font-medium
                        text-sky-300
                      ">
                      {selectedVariantCartQuantity} in this option
                    </span>
                  </>
                ) : null}
              </div>

              {product.variants.length > 1 ? (
                <div
                  className="
                    mt-4 flex flex-wrap
                    gap-2
                  ">
                  {product.variants.map(variant => {
                    const isSelected = variant.id === selectedVariant?.id;

                    const unavailable = variant.stockLeft <= 0;

                    return (
                      <button
                        key={variant.id}
                        type="button"
                        disabled={unavailable}
                        aria-pressed={isSelected}
                        onClick={() =>
                          setVariantSelection({
                            key: variantSelectionKey,

                            variantId: variant.id
                          })
                        }
                        className={cn(
                          'rounded-full border px-3 py-1.5 text-xs font-medium transition',

                          isSelected
                            ? 'border-white bg-white text-black shadow-md'
                            : 'border-white/15 bg-white/5 text-white/80 backdrop-blur-md hover:border-white/25 hover:bg-white/10',

                          unavailable && 'cursor-not-allowed opacity-35'
                        )}>
                        {variant.label}
                      </button>
                    );
                  })}
                </div>
              ) : null}

              <div
                className="
                  mt-5 flex flex-wrap
                  items-center gap-3
                ">
                {showCommerceActions ? (
                  <Button
                    type="button"
                    size="lg"
                    disabled={isOutOfStock || cartMutating}
                    onClick={handleAddToCart}
                    className="
                      h-10 rounded-full
                      bg-white px-5
                      font-semibold text-black
                      shadow-lg
                      hover:bg-white/90
                    ">
                    {cartMutating ? (
                      <LoaderCircle
                        className="
                          size-4
                          animate-spin
                        "
                      />
                    ) : (
                      <ShoppingCart
                        className="
                          size-4
                        "
                      />
                    )}

                    {cartMutating
                      ? 'Adding...'
                      : selectedVariantCartQuantity > 0
                        ? 'Add another'
                        : 'Add to cart'}
                  </Button>
                ) : null}

                {showViewDetailsAction ? (
                  <Button
                    type="button"
                    size="lg"
                    variant="ghost"
                    onClick={() => actions.previewProduct(product)}
                    className="
                      h-10 rounded-full
                      border border-white/15
                      bg-white/10 px-4
                      text-white
                      backdrop-blur-xl
                      hover:bg-white/15
                      hover:text-white
                    ">
                    <Eye
                      className="
                        size-4
                      "
                    />
                    View details
                  </Button>
                ) : null}

                {showCommerceActions ? (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    disabled={wishlistMutating}
                    aria-busy={wishlistMutating}
                    aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
                    aria-pressed={saved}
                    onClick={handleToggleWishlist}
                    className={cn(
                      'size-10',

                      wishlistButtonClassName
                    )}
                    style={wishlistButtonStyle}>
                    {wishlistMutating ? (
                      <LoaderCircle
                        className="
                          size-4
                          animate-spin
                        "
                      />
                    ) : (
                      <Heart
                        className={cn(
                          'size-4 transition',

                          saved && 'fill-current'
                        )}
                      />
                    )}
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
