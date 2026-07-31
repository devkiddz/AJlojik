'use client';

import Image from 'next/image';

import {
  ArrowRight,
  Compass,
  PackageSearch
} from 'lucide-react';

import {
  useMemo
} from 'react';

import {
  useFeedExperience
} from '@/features/feed-experience';

import {
  ProductActionTray
} from '@/features/products/cards/ProductActionTray';

type ContinuationReason =
  | 'Recently viewed'
  | 'In your cart'
  | 'Saved to wishlist';

export default function ContinueShoppingWidget() {
  const {
    actions,
    context
  } = useFeedExperience();

  const continuation =
    useMemo(() => {
      const products =
        context.catalog.products;

      const productById =
        new Map(
          products.map(
            product => [
              String(
                product.id
              ),
              product
            ]
          )
        );

      const candidates: Array<{
        productId: string;
        reason: ContinuationReason;
        priority: number;
      }> = [];

      context.user
        .recentProductIds
        .forEach(
          (
            productId,
            index
          ) => {
            candidates.push({
              productId,
              reason:
                'Recently viewed',
              priority:
                300 - index
            });
          }
        );

      context.activity
        .viewedProductIds
        .forEach(
          (
            productId,
            index
          ) => {
            candidates.push({
              productId,
              reason:
                'Recently viewed',
              priority:
                260 - index
            });
          }
        );

      context.user
        .cartProductIds
        .forEach(
          (
            productId,
            index
          ) => {
            candidates.push({
              productId,
              reason:
                'In your cart',
              priority:
                220 - index
            });
          }
        );

      context.user
        .wishlistProductIds
        .forEach(
          (
            productId,
            index
          ) => {
            candidates.push({
              productId,
              reason:
                'Saved to wishlist',
              priority:
                180 - index
            });
          }
        );

      const seen =
        new Set<string>();

      return candidates
        .sort(
          (
            first,
            second
          ) =>
            second.priority -
            first.priority
        )
        .map(
          candidate => {
            if (
              seen.has(
                candidate.productId
              )
            ) {
              return null;
            }

            seen.add(
              candidate.productId
            );

            const product =
              productById.get(
                String(
                  candidate.productId
                )
              );

            if (!product) {
              return null;
            }

            const variant =
              product.variants.find(
                item =>
                  item.stockLeft >
                  0
              ) ??
              product.variants[0];

            if (!variant) {
              return null;
            }

            return {
              product,
              variant,
              reason:
                candidate.reason
            };
          }
        )
        .filter(
          (
            item
          ): item is NonNullable<
            typeof item
          > =>
            Boolean(
              item
            )
        )
        .slice(
          0,
          3
        );
    }, [
      context.activity
        .viewedProductIds,
      context.catalog.products,
      context.user
        .cartProductIds,
      context.user
        .recentProductIds,
      context.user
        .wishlistProductIds
    ]);

  const primary =
    continuation[0];

  return (
    <section
      className="
        overflow-hidden rounded-3xl
        border border-primary/12
        bg-card/40 p-5
        shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_20px_60px_rgba(0,0,0,0.25)]
      ">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className="
              text-[11px] font-semibold
              uppercase tracking-[0.2em]
              text-primary/45
            ">
            Intent continuity
          </p>

          <h3
            className="
              mt-1 text-base
              font-bold tracking-tight
              text-primary
            ">
            Continue Shopping
          </h3>

          <p
            className="
              mt-1 text-xs leading-5
              text-primary/50
            ">
            Resume the strongest unfinished shopping signal in your current experience.
          </p>
        </div>

        <span
          className="
            grid size-11 shrink-0
            place-items-center
            rounded-2xl
            bg-primary/10
            text-primary
          ">
          <Compass className="size-5" />
        </span>
      </header>

      {!primary ? (
        <div
          className="
            mt-5 rounded-2xl
            border border-dashed
            border-primary/15
            bg-background/30
            p-5 text-center
          ">
          <PackageSearch
            className="
              mx-auto size-7
              text-primary/35
            "
          />

          <p
            className="
              mt-3 text-sm
              font-semibold text-primary
            ">
            Your next intent starts here
          </p>

          <p
            className="
              mt-1 text-xs leading-5
              text-primary/50
            ">
            Open products, save favourites or add items to Cart to build a continuation path.
          </p>

          <button
            type="button"
            onClick={() =>
              actions.openExperience({
                type:
                  'category',

                categorySlug:
                  'all'
              })
            }
            className="
              mt-4 inline-flex
              items-center gap-2
              rounded-full border
              border-primary/15
              bg-background/50
              px-4 py-2
              text-xs font-semibold
              text-primary transition
              hover:bg-primary
              hover:text-background
            ">
            Start discovering

            <ArrowRight className="size-3.5" />
          </button>
        </div>
      ) : (
        <>
          <article
            className="
              group mt-5
              overflow-hidden
              rounded-2xl border
              border-primary/10
              bg-background/40
            ">
            <button
              type="button"
              onClick={() =>
                actions.openExperience({
                  type:
                    'product',

                  productId:
                    primary.product.id
                })
              }
              className="
                flex w-full
                items-center gap-3
                p-3 text-left
              ">
              <div
                className="
                  relative size-20
                  shrink-0 overflow-hidden
                  rounded-2xl bg-muted
                ">
                <Image
                  src={
                    primary.variant.image
                  }
                  alt={
                    primary.product.name
                  }
                  fill
                  sizes="80px"
                  className="
                    object-cover
                    transition duration-500
                    group-hover:scale-105
                  "
                />
              </div>

              <div className="min-w-0 flex-1">
                <span
                  className="
                    inline-flex rounded-full
                    bg-primary/10
                    px-2 py-1
                    text-[9px] font-bold
                    uppercase tracking-wide
                    text-primary
                  ">
                  {
                    primary.reason
                  }
                </span>

                <h4
                  className="
                    mt-2 line-clamp-2
                    text-sm font-bold
                    leading-5 text-primary
                  ">
                  {
                    primary.product.name
                  }
                </h4>

                <p
                  className="
                    mt-1 truncate
                    text-[11px]
                    text-primary/45
                  ">
                  {
                    primary.variant.label
                  }
                </p>
              </div>

              <ArrowRight
                className="
                  size-4 shrink-0
                  text-primary/40
                  transition
                  group-hover:translate-x-1
                "
              />
            </button>

            <div
              className="
                border-t
                border-primary/10
                px-3 py-3
              ">
              <ProductActionTray
                product={
                  primary.product
                }
                variant={
                  primary.variant
                }
                presentation="inline"
                showLabels
                className="
                  w-fit max-w-full
                  border-primary/10
                  bg-background/70
                "
              />
            </div>
          </article>

          {continuation.length >
          1 ? (
            <div className="mt-3 space-y-2">
              {continuation
                .slice(
                  1
                )
                .map(
                  item => (
                    <button
                      key={
                        item.product.id
                      }
                      type="button"
                      onClick={() =>
                        actions.openExperience({
                          type:
                            'product',

                          productId:
                            item.product.id
                        })
                      }
                      className="
                        flex w-full
                        items-center gap-3
                        rounded-2xl border
                        border-primary/10
                        bg-background/30
                        p-2.5 text-left
                        transition
                        hover:border-primary/20
                        hover:bg-background/50
                      ">
                      <div
                        className="
                          relative size-11
                          shrink-0 overflow-hidden
                          rounded-xl bg-muted
                        ">
                        <Image
                          src={
                            item.variant.image
                          }
                          alt={
                            item.product.name
                          }
                          fill
                          sizes="44px"
                          className="object-cover"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p
                          className="
                            truncate text-xs
                            font-semibold
                            text-primary
                          ">
                          {
                            item.product.name
                          }
                        </p>

                        <p
                          className="
                            mt-0.5 text-[10px]
                            text-primary/45
                          ">
                          {
                            item.reason
                          }
                        </p>
                      </div>

                      <ArrowRight className="size-3.5 shrink-0 text-primary/35" />
                    </button>
                  )
                )}
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
