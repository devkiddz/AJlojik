'use client';

/* AJ_HUB_DISCOVERY_CARDS_PREVIEW_ONLY_V2I */

/* AJ_HUB_PRODUCT_PAGE_AUTHORITY_V2D */
/* AJ_HUB_CONTINUITY_TO_PRODUCT_PAGE_V1 */

import Image from 'next/image';

import {
  ArrowLeft,
  ArrowRight,
  Sparkles
} from 'lucide-react';

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState
} from 'react';

import {
  useFeedExperience
} from '@/features/feed-experience';

import {
  previewProductInHub,
  useHubProductPreview
} from '@/features/product-experience-state/hubProductPreviewBridge';

import {
  selectProductVariant
} from '@/features/product-experience-state';


import {
  ProductActionTray
} from '@/features/products/cards/ProductActionTray';

import {
  useOptionalShoppingLists
} from '@/features/shopping-lists';

import {
  resolveContinuityProducts
} from '../continuity/resolveContinuityProducts';

/* MS9_04_COMPACT_CONTINUITY_CARDS */
export function DiscoveryContinuityCarousel() {
  const hubProductPreview =
    useHubProductPreview();

  const stableSeed =
    useId();

  const railRef =
    useRef<
      HTMLDivElement |
      null
    >(
      null
    );

  const [
    canScrollBackward,
    setCanScrollBackward
  ] =
    useState(
      false
    );

  const [
    canScrollForward,
    setCanScrollForward
  ] =
    useState(
      false
    );

  const {
    context
  } = useFeedExperience();

  const shoppingLists =
    useOptionalShoppingLists();

  const currentProductId =
    hubProductPreview?.productId ??
    null;

  const previewContinuityProduct =
    (
      productId:
        string,
      variantId:
        string
    ): void => {
      selectProductVariant({
        productId,
        variantId,
        source:
          'hub'
      });

      previewProductInHub({
        productId,
        variantId,
        source:
          'hub',
        reveal:
          true
      });
    };

  const shoppingListProductIds =
    useMemo(
      () =>
        shoppingLists?.lists.flatMap(
          list =>
            list.items.map(
              item =>
                String(
                  item.productId
                )
            )
        ) ??
        [],
      [
        shoppingLists?.lists
      ]
    );

  const continuityProducts =
    useMemo(
      () =>
        resolveContinuityProducts({
          products:
            context.catalog.products,

          currentProductId,

          recentProductIds:
            context.user
              .recentProductIds.map(
                String
              ),

          activityProductIds:
            context.activity
              .viewedProductIds.map(
                String
              ),

          wishlistProductIds:
            context.user
              .wishlistProductIds.map(
                String
              ),

          shoppingListProductIds,

          stableSeed,

          limit:
            10
        }),
      [
        context.activity
          .viewedProductIds,
        context.catalog.products,
        context.user
          .recentProductIds,
        context.user
          .wishlistProductIds,
        currentProductId,
        shoppingListProductIds,
        stableSeed
      ]
    );

  const updateScrollState =
    useCallback(
      () => {
        const rail =
          railRef.current;

        if (!rail) {
          return;
        }

        const maximum =
          Math.max(
            0,
            rail.scrollWidth -
              rail.clientWidth
          );

        setCanScrollBackward(
          rail.scrollLeft >
            8
        );

        setCanScrollForward(
          rail.scrollLeft <
            maximum -
              8
        );
      },
      []
    );

  useEffect(
    () => {
      const rail =
        railRef.current;

      if (!rail) {
        return;
      }

      updateScrollState();

      rail.addEventListener(
        'scroll',
        updateScrollState,
        {
          passive:
            true
        }
      );

      const observer =
        new ResizeObserver(
          updateScrollState
        );

      observer.observe(
        rail
      );

      return () => {
        rail.removeEventListener(
          'scroll',
          updateScrollState
        );

        observer.disconnect();
      };
    },
    [
      continuityProducts.length,
      updateScrollState
    ]
  );

  const scrollContinuity =
    useCallback(
      (
        direction:
          'backward' |
          'forward'
      ) => {
        const rail =
          railRef.current;

        if (!rail) {
          return;
        }

        const distance =
          Math.max(
            rail.clientWidth *
              0.78,
            220
          );

        rail.scrollBy({
          left:
            direction ===
            'forward'
              ? distance
              : -distance,
          behavior:
            'smooth'
        });
      },
      []
    );

  if (
    continuityProducts.length <
    3
  ) {
    return null;
  }

  return (
    <section
      className="
        overflow-hidden rounded-3xl
        border border-primary/12
        bg-card/40 py-5
        shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_20px_60px_rgba(0,0,0,0.25)]
      ">
      <header className="flex items-start justify-between gap-3 px-5">
        <div className="min-w-0">
          <p
            className="
              flex items-center gap-2
              text-[10px] font-semibold
              uppercase tracking-[0.2em]
              text-primary/45
            ">
            <Sparkles className="size-3.5" />

            Continuity
          </p>

          <h3
            className="
              mt-1 text-base
              font-bold tracking-tight
              text-primary
            ">
            Keep discovering
          </h3>

          <p
            className="
              mt-1 max-w-sm
              text-xs leading-5
              text-primary/50
            ">
            A session-stable mix from what you viewed, saved, planned and may want next.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            aria-label="Scroll continuity products backward"
            disabled={
              !canScrollBackward
            }
            onClick={() =>
              scrollContinuity(
                'backward'
              )
            }
            className="
              grid size-10
              place-items-center
              rounded-full border
              border-primary/12
              bg-background/70
              text-primary
              shadow-sm
              transition
              hover:bg-muted
              disabled:cursor-not-allowed
              disabled:opacity-35
            ">
            <ArrowLeft className="size-4" />
          </button>

          <button
            type="button"
            aria-label="Scroll continuity products forward"
            disabled={
              !canScrollForward
            }
            onClick={() =>
              scrollContinuity(
                'forward'
              )
            }
            className="
              grid size-10
              place-items-center
              rounded-full border
              border-primary/12
              bg-primary
              text-primary-foreground
              shadow-sm
              transition
              hover:bg-primary/90
              disabled:cursor-not-allowed
              disabled:opacity-35
            ">
            <ArrowRight className="size-4" />
          </button>
        </div>
      </header>

      <div
        ref={
          railRef
        }
        className="
          mt-5 flex gap-3
          overflow-x-auto px-5 pb-2
          snap-x snap-mandatory
          overscroll-x-contain
          scrollbar-none
        ">
        {continuityProducts.map(
          item => {
            const variant =
              item.product.variants.find(
                candidate =>
                  candidate.stockLeft >
                  0
              );

            if (!variant) {
              return null;
            }

            return (
              <article
                key={
                  item.product.id
                }
                className="
                  group w-[58%]
                  max-w-[180px]
                  shrink-0 snap-start
                  overflow-hidden
                  rounded-2xl border
                  border-primary/10
                  bg-background/45
                  sm:w-[170px]
                ">
                <button
                  type="button"
                  onClick={() =>
                    previewContinuityProduct(
                      item.product.id,
                      variant.id
                    )
                  }
                  className="
                    block w-full
                    text-left
                  ">
                  <div
                    className="
                      relative aspect-square
                      overflow-hidden
                      bg-muted
                    ">
                    <Image
                      src={
                        variant.image
                      }
                      alt={
                        item.product.name
                      }
                      fill
                      sizes="230px"
                      className="
                        object-cover
                        transition
                        duration-500
                        group-hover:scale-105
                      "
                    />

                    <span
                      className="
                        absolute left-2.5
                        top-2.5 rounded-full
                        border border-white/15
                        bg-black/60 px-2.5
                        py-1 text-[9px]
                        font-semibold
                        text-white
                        backdrop-blur-md
                      ">
                      {
                        item.sourceLabel
                      }
                    </span>
                  </div>

                  <div className="p-2.5">
                    <p
                      className="
                        line-clamp-2
                        min-h-9 text-[11px]
                        font-semibold
                        leading-5 text-primary
                      ">
                      {
                        item.product.name
                      }
                    </p>

                    <div
                      className="
                        mt-1.5 flex
                        items-center
                        justify-between gap-2
                      ">
                      <p
                        className="
                          truncate text-[10px]
                          text-primary/45
                        ">
                        {
                          item.product.category
                        }
                      </p>

                      <ArrowRight
                        className="
                          size-3.5 shrink-0
                          text-primary/45
                          transition
                          group-hover:translate-x-0.5
                          group-hover:text-primary
                        "
                      />
                    </div>
                  </div>
                </button>

                <div className="px-2.5 pb-2.5">
                  <ProductActionTray
                    product={
                      item.product
                    }
                    variant={
                      variant
                    }
                    presentation="inline"
                    compact
                    className="
                      w-fit max-w-full
                      border-primary/10
                      bg-background/75
                    "
                  />
                </div>
              </article>
            );
          }
        )}
      </div>
    </section>
  );
}
