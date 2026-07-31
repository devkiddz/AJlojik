'use client';

import Image from 'next/image';

import {
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

import {
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  useFeedExperience
} from '@/features/feed-experience';

import {
  ProductActionTray
} from '@/features/products/cards/ProductActionTray';

import {
  cn
} from '@/lib/utils';

import type {
  HubSlideItem
} from '../discoveryHubTypes';

type HubSliderProps = {
  items: HubSlideItem[];

  autoSlide?: boolean;

  variant?:
    | 'hero'
    | 'strip'
    | 'grid'
    | 'minimal-grid';
};

function formatPrice(
  price?: number
): string | null {
  if (
    price === undefined ||
    price === null
  ) {
    return null;
  }

  return new Intl.NumberFormat(
    'en-NG',
    {
      style:
        'currency',

      currency:
        'NGN',

      maximumFractionDigits:
        0
    }
  ).format(
    price
  );
}

function getTargetProductId(
  target: unknown
): string | null {
  if (
    typeof target !==
      'object' ||
    target === null
  ) {
    return null;
  }

  const candidate =
    target as {
      type?: unknown;
      productId?: unknown;
    };

  if (
    candidate.type !==
      'product' ||
    typeof candidate.productId !==
      'string'
  ) {
    return null;
  }

  return candidate.productId;
}

export default function HubSlider({
  items,
  autoSlide = false,
  variant = 'strip'
}: HubSliderProps) {
  const {
    actions,
    context
  } = useFeedExperience();

  const products =
    context.catalog.products;

  const [
    activeIndex,
    setActiveIndex
  ] = useState(0);

  const safeItems =
    useMemo(
      () =>
        items.filter(
          Boolean
        ),
      [
        items
      ]
    );

  const productById =
    useMemo(
      () =>
        new Map(
          products.map(
            product => [
              String(
                product.id
              ),
              product
            ]
          )
        ),
      [
        products
      ]
    );

  const currentActiveIndex =
    safeItems.length > 0
      ? Math.min(
          activeIndex,
          safeItems.length -
            1
        )
      : 0;

  const activeItem =
    safeItems[
      currentActiveIndex
    ];

  const resolveProduct = (
    item: HubSlideItem
  ) => {
    const targetProductId =
      getTargetProductId(
        item.target
      );

    const productId =
      targetProductId ??
      String(
        item.id
      );

    return productById.get(
      String(
        productId
      )
    );
  };

  const getCommerceState = (
    item: HubSlideItem
  ) => {
    const product =
      resolveProduct(
        item
      );

    const selectedVariant =
      product?.variants.find(
        productVariant =>
          productVariant.stockLeft >
          0
      ) ??
      product?.variants[0] ??
      null;

    return {
      product,
      selectedVariant
    };
  };

  const openItem = (
    item: HubSlideItem
  ): void => {
    const product =
      resolveProduct(
        item
      );

    if (product) {
      actions.openExperience({
        type:
          'product',

        productId:
          product.id
      });

      return;
    }

    if (item.target) {
      actions.openExperience(
        item.target
      );
    }
  };

  const showPrevious =
    (): void => {
      if (
        safeItems.length <= 1
      ) {
        return;
      }

      setActiveIndex(
        currentActiveIndex ===
          0
          ? safeItems.length -
              1
          : currentActiveIndex -
              1
      );
    };

  const showNext =
    (): void => {
      if (
        safeItems.length <= 1
      ) {
        return;
      }

      setActiveIndex(
        (
          currentActiveIndex +
          1
        ) %
          safeItems.length
      );
    };

  useEffect(() => {
    if (
      !autoSlide ||
      safeItems.length <= 1
    ) {
      return;
    }

    const interval =
      window.setInterval(
        () => {
          setActiveIndex(
            currentIndex =>
              (currentIndex +
                1) %
              safeItems.length
          );
        },
        4500
      );

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, [
    autoSlide,
    safeItems.length
  ]);

  if (!safeItems.length) {
    return null;
  }

  if (
    variant === 'hero' &&
    activeItem
  ) {
    const {
      product:
        activeProduct,
      selectedVariant
    } = getCommerceState(
      activeItem
    );

    const activeTitle =
      activeProduct?.name ??
      activeItem.title;

    const activeImage =
      selectedVariant?.image ??
      activeItem.image;

    const activePrice =
      formatPrice(
        selectedVariant?.price ??
          activeItem.price
      );

    return (
      <div>
        <div
          className="
            group relative
            overflow-hidden
            rounded-3xl border
            border-primary/10
            bg-background
            shadow-[0_24px_70px_rgba(0,0,0,0.38)]
          ">
          <div className="grid min-h-66 grid-cols-5">
            <div
              className="
                relative col-span-3
                flex min-w-0
                flex-col justify-between
                overflow-hidden
                p-5 md:p-6
              ">
              <div
                className="
                  absolute inset-0
                  bg-gradient-to-br
                  from-card
                  via-background
                  to-background
                "
              />

              <div
                className="
                  absolute -left-20
                  -top-20 size-52
                  rounded-full
                  bg-primary/5
                  blur-3xl
                "
              />

              <div className="relative">
                <div className="flex items-center gap-2">
                  <span className="h-px w-7 bg-primary/30" />

                  <p
                    className="
                      text-[10px]
                      font-semibold uppercase
                      tracking-[0.24em]
                      text-primary/45
                    ">
                    Featured promotion
                  </p>
                </div>

                <h4
                  className="
                    mt-5 text-xl
                    font-bold leading-tight
                    tracking-tight
                    text-primary
                  ">
                  {activeTitle}
                </h4>

                {activeItem.subtitle ? (
                  <p
                    className="
                      mt-3 line-clamp-3
                      text-sm leading-6
                      text-primary/55
                    ">
                    {
                      activeItem.subtitle
                    }
                  </p>
                ) : null}

                {activePrice ? (
                  <div className="mt-5">
                    <p
                      className="
                        text-[10px]
                        font-semibold uppercase
                        tracking-[0.18em]
                        text-primary/35
                      ">
                      Promotional price
                    </p>

                    <p className="mt-1 text-lg font-bold text-primary">
                      {
                        activePrice
                      }
                    </p>
                  </div>
                ) : null}
              </div>

              <div className="relative mt-6">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      openItem(
                        activeItem
                      )
                    }
                    className="
                      inline-flex items-center
                      gap-2 rounded-full
                      bg-primary px-5 py-2.5
                      text-xs font-semibold
                      text-background transition
                      hover:opacity-90
                    ">
                    {activeProduct
                      ? 'View product'
                      : 'Explore promotion'}

                    <ArrowRight className="size-4" />
                  </button>

                  {activeProduct &&
                  selectedVariant ? (
                    <ProductActionTray
                      product={
                        activeProduct
                      }
                      variant={
                        selectedVariant
                      }
                      presentation="inline"
                      showLabels
                      className="
                        border-primary/12
                        bg-background/55
                      "
                    />
                  ) : null}
                </div>

                {safeItems.length >
                1 ? (
                  <div
                    className="
                      mt-5 flex
                      items-center
                      justify-between
                      gap-3
                    ">
                    <div className="flex gap-1.5">
                      {safeItems.map(
                        (
                          item,
                          index
                        ) => (
                          <button
                            key={
                              item.id
                            }
                            type="button"
                            title={`Show ${item.title}`}
                            aria-label={`Show ${item.title}`}
                            aria-current={
                              index ===
                              currentActiveIndex
                                ? 'true'
                                : undefined
                            }
                            onClick={() =>
                              setActiveIndex(
                                index
                              )
                            }
                            className={cn(
                              `
                                h-1.5 rounded-full
                                transition-all
                                duration-300
                              `,
                              index ===
                                currentActiveIndex
                                ? 'w-7 bg-primary'
                                : 'w-1.5 bg-primary/20 hover:bg-primary/40'
                            )}
                          />
                        )
                      )}
                    </div>

                    <span
                      className="
                        shrink-0
                        text-[10px]
                        font-medium
                        text-primary/35
                      ">
                      {String(
                        currentActiveIndex +
                          1
                      ).padStart(
                        2,
                        '0'
                      )}{' '}
                      /{' '}
                      {String(
                        safeItems.length
                      ).padStart(
                        2,
                        '0'
                      )}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>

            <div
              className="
                relative col-span-2
                min-h-66 overflow-hidden
                border-l
                border-primary/10
                bg-card
              ">
              <button
                type="button"
                onClick={() =>
                  openItem(
                    activeItem
                  )
                }
                aria-label={`Explore ${activeTitle}`}
                className="
                  absolute inset-0
                  block size-full
                  overflow-hidden
                  text-left
                ">
                <Image
                  src={
                    activeImage
                  }
                  alt={
                    activeTitle
                  }
                  fill
                  sizes="(max-width: 1024px) 40vw, 280px"
                  className="
                    object-cover object-center
                    transition duration-700
                    group-hover:scale-105
                  "
                />

                <div className="absolute inset-0 bg-gradient-to-r from-black/15 via-transparent to-transparent" />

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/5" />
              </button>

              {activeItem.badge ? (
                <span
                  className="
                    pointer-events-none
                    absolute right-3 top-3
                    rounded-full border
                    border-white/15
                    bg-black/40
                    px-2.5 py-1
                    text-[9px] font-semibold
                    uppercase tracking-[0.14em]
                    text-white backdrop-blur-xl
                  ">
                  {
                    activeItem.badge
                  }
                </span>
              ) : null}

              <span
                className="
                  pointer-events-none
                  absolute bottom-4 left-3
                  rounded-full border
                  border-white/10
                  bg-black/40
                  px-2.5 py-1
                  text-[9px] font-medium
                  text-white/75
                  backdrop-blur-xl
                ">
                AJ Logik
              </span>

              {safeItems.length >
              1 ? (
                <div className="absolute bottom-4 right-3 flex gap-2">
                  <button
                    type="button"
                    onClick={
                      showPrevious
                    }
                    aria-label="Previous promotion"
                    className="
                      grid size-8
                      place-items-center
                      rounded-full border
                      border-white/10
                      bg-black/45
                      text-white
                      backdrop-blur
                      transition
                      hover:bg-black/70
                    ">
                    <ChevronLeft className="size-4" />
                  </button>

                  <button
                    type="button"
                    onClick={
                      showNext
                    }
                    aria-label="Next promotion"
                    className="
                      grid size-8
                      place-items-center
                      rounded-full border
                      border-white/10
                      bg-black/45
                      text-white
                      backdrop-blur
                      transition
                      hover:bg-black/70
                    ">
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

  if (
    variant === 'grid' ||
    variant ===
      'minimal-grid'
  ) {
    const visibleItems =
      safeItems.slice(
        0,
        2
      );

    return (
      <div className="mt-5 grid grid-cols-2 gap-2.5 sm:gap-3">
        {visibleItems.map(
          item => {
            const {
              product,
              selectedVariant
            } =
              getCommerceState(
                item
              );

            const title =
              product?.name ??
              item.title;

            const image =
              selectedVariant?.image ??
              item.image;

            const price =
              formatPrice(
                selectedVariant?.price ??
                  item.price
              );

            return (
              <article
                key={
                  item.id
                }
                className="
                  group min-w-0
                  overflow-hidden
                  rounded-2xl border
                  border-primary/10
                  bg-background/45
                  text-left
                  shadow-[0_12px_35px_rgba(0,0,0,0.22)]
                  transition duration-300
                  hover:-translate-y-0.5
                  hover:border-primary/20
                  hover:bg-background/60
                ">
                <button
                  type="button"
                  onClick={() =>
                    openItem(
                      item
                    )
                  }
                  className="block w-full text-left">
                  <div
                    className="
                      relative aspect-[3/4]
                      min-h-32 overflow-hidden
                    ">
                    <Image
                      src={
                        image
                      }
                      alt={
                        title
                      }
                      fill
                      sizes="(max-width: 640px) 44vw, 170px"
                      className="
                        object-cover
                        transition duration-500
                        group-hover:scale-105
                      "
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

                    {item.badge ? (
                      <span
                        className="
                          absolute left-2 top-2
                          rounded-full
                          bg-black/50
                          px-2 py-0.5
                          text-[9px] font-semibold
                          text-white backdrop-blur
                        ">
                        {
                          item.badge
                        }
                      </span>
                    ) : null}
                  </div>

                  <div className="p-2.5">
                    <p
                      className="
                        line-clamp-2 min-h-8
                        text-[11px] font-semibold
                        leading-4 text-primary
                      ">
                      {
                        title
                      }
                    </p>

                    {variant ===
                      'grid' &&
                    item.subtitle ? (
                      <p className="mt-1 line-clamp-1 text-[10px] text-primary/50">
                        {
                          item.subtitle
                        }
                      </p>
                    ) : null}

                    {variant ===
                      'grid' &&
                    price ? (
                      <p className="mt-2 truncate text-[11px] font-bold text-primary/80">
                        {
                          price
                        }
                      </p>
                    ) : null}
                  </div>
                </button>

                {product &&
                selectedVariant ? (
                  <div className="px-2.5 pb-2.5">
                    <ProductActionTray
                      product={
                        product
                      }
                      variant={
                        selectedVariant
                      }
                      presentation="inline"
                      compact
                      className="
                        w-fit max-w-full
                        border-primary/10
                        bg-background/70
                      "
                    />
                  </div>
                ) : null}
              </article>
            );
          }
        )}
      </div>
    );
  }

  return (
    <div className="mt-5 flex gap-3 overflow-x-auto pb-2 scrollbar-none">
      {safeItems.map(
        item => {
          const {
            product,
            selectedVariant
          } =
            getCommerceState(
              item
            );

          const title =
            product?.name ??
            item.title;

          const image =
            selectedVariant?.image ??
            item.image;

          const price =
            formatPrice(
              selectedVariant?.price ??
                item.price
            );

          return (
            <article
              key={
                item.id
              }
              className="w-28 shrink-0">
              <button
                type="button"
                onClick={() =>
                  openItem(
                    item
                  )
                }
                className="block w-full text-left">
                <div
                  className="
                    relative aspect-square
                    w-28 overflow-hidden
                    rounded-2xl border
                    border-primary/10
                    bg-background
                    shadow-[0_10px_30px_rgba(0,0,0,0.2)]
                  ">
                  <Image
                    src={
                      image
                    }
                    alt={
                      title
                    }
                    fill
                    sizes="112px"
                    className="
                      object-cover
                      transition duration-500
                      hover:scale-105
                    "
                  />
                </div>

                <p
                  className="
                    mt-2 line-clamp-2
                    text-[11px] font-medium
                    leading-4 text-primary/75
                  ">
                  {
                    title
                  }
                </p>

                {price ? (
                  <p className="mt-1 text-[11px] font-semibold text-primary/45">
                    {
                      price
                    }
                  </p>
                ) : null}
              </button>

              {product &&
              selectedVariant ? (
                <div className="mt-2">
                  <ProductActionTray
                    product={
                      product
                    }
                    variant={
                      selectedVariant
                    }
                    presentation="inline"
                    compact
                    className="
                      w-fit max-w-full
                      border-primary/10
                      bg-background/70
                    "
                  />
                </div>
              ) : null}
            </article>
          );
        }
      )}
    </div>
  );
}
