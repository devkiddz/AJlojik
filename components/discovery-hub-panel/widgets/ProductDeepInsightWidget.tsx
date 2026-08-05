'use client';

import Image from 'next/image';

import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BrainCircuit,
  CheckCircle2,
  CircleHelp,
  Eye,
  Images,
  Lightbulb,
  PackageCheck,
  ShoppingCart,
  Sparkles,
  Star,
  TrendingUp
} from 'lucide-react';

import {
  useMemo,
  useState
} from 'react';

import {
  clearProductDeepInsight,
  resolveCatalogProductDeepInsight,
  type ProductDeepInsightRequest
} from '@/features/product-intelligence';

import {
  useFeedExperience
} from '@/features/feed-experience';

/* AJ_HUB_CONSISTENT_PRODUCT_GRID_V1 */

import {
  ProductCard
} from '@/features/products/cards';

import {
  cn
} from '@/lib/utils';

type ProductDeepInsightWidgetProps = {
  request:
    ProductDeepInsightRequest;
};

export default function ProductDeepInsightWidget({
  request
}: ProductDeepInsightWidgetProps) {
  const {
    actions,
    context
  } =
    useFeedExperience();

  const [
    addingToCart,
    setAddingToCart
  ] = useState(false);

  const insight =
    useMemo(
      () =>
        resolveCatalogProductDeepInsight({
          productId:
            request.productId,

          variantId:
            request.variantId,

          products:
            context.catalog.products,

          categories:
            context.catalog.categories
        }),
      [
        context.catalog.categories,
        context.catalog.products,
        request.productId,
        request.variantId
      ]
    );

  const priceFormatter =
    useMemo(
      () => {
        try {
          return new Intl.NumberFormat(
            context.environment.locale ||
              'en-NG',
            {
              style:
                'currency',

              currency:
                context.environment.currency ||
                'NGN',

              maximumFractionDigits:
                0
            }
          );
        } catch {
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
          );
        }
      },
      [
        context.environment.currency,
        context.environment.locale
      ]
    );

  if (
    !insight
  ) {
    return (
      <section
        data-aj-product-deep-insight
        className="
          rounded-3xl border
          border-dashed border-border
          bg-muted/20 p-5
        "
      >
        <BrainCircuit className="size-7 text-muted-foreground" />

        <h3 className="mt-3 text-sm font-black text-foreground">
          Product insight unavailable
        </h3>

        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          The selected product is no longer available in the active catalogue.
        </p>

        <button
          type="button"
          onClick={
            clearProductDeepInsight
          }
          className="
            mt-4 inline-flex h-9
            items-center gap-2 rounded-full
            border border-border
            bg-background px-4
            text-xs font-bold text-foreground
            transition hover:bg-muted
          "
        >
          <ArrowLeft className="size-3.5" />

          Return to AI
        </button>
      </section>
    );
  }

  const {
    product,
    category,
    selectedVariant,
    decisionSignals,
    awarenessSignals,
    faqs,
    suggestions,
    media,
    relatedProducts,
    sourceNote
  } =
    insight;

  const artwork =
    media[0]?.src;

  const selectedPrice =
    selectedVariant
      ? priceFormatter.format(
          Number(
            selectedVariant.price
          )
        )
      : 'Unavailable';

  /* AJ_HUB_PRODUCT_PREVIEW_SEPARATION_HOTFIX_V1 */
  const handleOpenProduct =
    (
      productId:
        string
    ): void => {
      clearProductDeepInsight();

      actions.openExperience({
        type:
          'product',

        productId
      });
    };

  const handleAddToCart =
    async (): Promise<void> => {
      if (
        !selectedVariant ||
        selectedVariant.stockLeft <=
          0 ||
        addingToCart
      ) {
        return;
      }

      setAddingToCart(
        true
      );

      try {
        await actions.addToCart(
          product,
          selectedVariant
        );
      } finally {
        setAddingToCart(
          false
        );
      }
    };

  return (
    <section
      data-aj-product-deep-insight
      className="
        overflow-hidden rounded-3xl
        border border-primary/15
        bg-background
        shadow-[0_18px_55px_rgba(0,0,0,0.18)]
      "
    >
      <div className="relative aspect-[16/11] overflow-hidden bg-muted">
        {artwork ? (
          <Image
            src={
              artwork
            }
            alt={
              product.name
            }
            fill
            priority
            sizes="420px"
            className="object-cover"
          />
        ) : (
          <div className="grid size-full place-items-center">
            <Images className="size-8 text-muted-foreground" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/10" />

        <button
          type="button"
          onClick={
            clearProductDeepInsight
          }
          className="
            absolute left-3 top-3
            inline-flex h-9 items-center
            gap-2 rounded-full border
            border-white/20 bg-black/45
            px-3 text-[10px] font-bold
            text-white backdrop-blur-xl
            transition hover:bg-black/65
          "
        >
          <ArrowLeft className="size-3.5" />

          General AI
        </button>

        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          <p className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.18em] text-white/65">
            <BrainCircuit className="size-3.5" />

            Product Deep Insight
          </p>

          <h3 className="mt-2 text-xl font-black leading-tight tracking-tight">
            {
              product.name
            }
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-white/75">
            <span>
              {
                category?.label ??
                product.category
              }
            </span>

            <span aria-hidden="true">
              •
            </span>

            <span>
              {
                selectedVariant?.label ??
                'No option resolved'
              }
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-4">
        <section className="grid grid-cols-3 gap-2">
          <div className="rounded-2xl border border-border/70 bg-muted/25 p-3">
            <p className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground">
              Price
            </p>

            <p className="mt-1 truncate text-xs font-black text-foreground">
              {
                selectedPrice
              }
            </p>
          </div>

          <div className="rounded-2xl border border-border/70 bg-muted/25 p-3">
            <p className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground">
              Rating
            </p>

            <p className="mt-1 flex items-center gap-1 text-xs font-black text-foreground">
              <Star className="size-3 fill-amber-400 text-amber-400" />

              {
                product.rating
              }
            </p>
          </div>

          <div className="rounded-2xl border border-border/70 bg-muted/25 p-3">
            <p className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground">
              Stock
            </p>

            <p
              className={cn(
                'mt-1 text-xs font-black',

                selectedVariant &&
                selectedVariant.stockLeft >
                  0
                  ? 'text-emerald-700 dark:text-emerald-300'
                  : 'text-destructive'
              )}
            >
              {
                selectedVariant
                  ? selectedVariant.stockLeft >
                    0
                    ? selectedVariant.stockLeft
                    : 'Out'
                  : '—'
              }
            </p>
          </div>
        </section>

        <section
          data-aj-product-deep-insight-decision
          className="
            rounded-3xl border
            border-primary/15
            bg-primary/5 p-4
          "
        >
          <div className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
              <Sparkles className="size-4" />
            </span>

            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-primary">
                AJ decision view
              </p>

              <h4 className="mt-1 text-sm font-black text-foreground">
                What the current evidence says
              </h4>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {decisionSignals.map(
              (
                signal,
                index
              ) => (
                <div
                  key={
                    signal
                  }
                  className="
                    flex items-start gap-3
                    rounded-2xl border
                    border-border/60
                    bg-background/70
                    px-3 py-3
                  "
                >
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-[9px] font-black text-primary">
                    {
                      index +
                      1
                    }
                  </span>

                  <p className="text-[10px] leading-5 text-muted-foreground">
                    {
                      signal
                    }
                  </p>
                </div>
              )
            )}
          </div>
        </section>

        <section data-aj-product-deep-insight-awareness>
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-primary" />

            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-muted-foreground">
                Public awareness
              </p>

              <h4 className="mt-0.5 text-sm font-black text-foreground">
                Marketplace evidence we can authenticate
              </h4>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            {awarenessSignals.map(
              signal => (
                <article
                  key={
                    signal.label
                  }
                  className="
                    rounded-2xl border
                    border-border/70
                    bg-muted/20 p-3
                  "
                >
                  <p className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground">
                    {
                      signal.label
                    }
                  </p>

                  <p className="mt-1 text-xs font-black text-foreground">
                    {
                      signal.value
                    }
                  </p>

                  <p className="mt-1.5 text-[9px] leading-4 text-muted-foreground">
                    {
                      signal.detail
                    }
                  </p>
                </article>
              )
            )}
          </div>
        </section>

        {media.length >
        0 ? (
          <section data-aj-product-deep-insight-media>
            <div className="flex items-center gap-2">
              <Images className="size-4 text-primary" />

              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-muted-foreground">
                  Media & lifestyle
                </p>

                <h4 className="mt-0.5 text-sm font-black text-foreground">
                  See the product in context
                </h4>
              </div>
            </div>

            <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
              {media.map(
                item => (
                  <figure
                    key={
                      item.id
                    }
                    className="
                      w-40 shrink-0
                      overflow-hidden rounded-2xl
                      border border-border/70
                      bg-muted/25
                    "
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                      <Image
                        src={
                          item.src
                        }
                        alt={
                          item.alt
                        }
                        fill
                        sizes="160px"
                        className="object-cover"
                      />
                    </div>

                    <figcaption className="p-2.5">
                      <p className="truncate text-[10px] font-bold text-foreground">
                        {
                          item.label
                        }
                      </p>

                      <p className="mt-0.5 text-[8px] uppercase tracking-wider text-muted-foreground">
                        Catalog media
                      </p>
                    </figcaption>
                  </figure>
                )
              )}
            </div>
          </section>
        ) : null}

        <section data-aj-product-deep-insight-suggestions>
          <div className="flex items-center gap-2">
            <Lightbulb className="size-4 text-primary" />

            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-muted-foreground">
                Suggestions
              </p>

              <h4 className="mt-0.5 text-sm font-black text-foreground">
                Useful next moves
              </h4>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            {suggestions.map(
              suggestion => (
                <button
                  key={
                    suggestion.id
                  }
                  type="button"
                  disabled={
                    !suggestion.productId
                  }
                  onClick={() => {
                    if (
                      suggestion.productId
                    ) {
                      handleOpenProduct(
                        suggestion.productId
                      );
                    }
                  }}
                  className={cn(
                    `
                      flex w-full items-start
                      justify-between gap-3
                      rounded-2xl border
                      border-border/70
                      bg-muted/20 p-3
                      text-left
                    `,

                    suggestion.productId
                      ? 'transition hover:border-primary/25 hover:bg-primary/5'
                      : 'cursor-default'
                  )}
                >
                  <span className="min-w-0">
                    <span className="block text-[10px] font-black text-foreground">
                      {
                        suggestion.title
                      }
                    </span>

                    <span className="mt-1 block text-[9px] leading-4 text-muted-foreground">
                      {
                        suggestion.detail
                      }
                    </span>
                  </span>

                  {suggestion.productId ? (
                    <ArrowRight className="mt-0.5 size-3.5 shrink-0 text-primary" />
                  ) : (
                    <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                  )}
                </button>
              )
            )}
          </div>
        </section>

        {relatedProducts.length >
        0 ? (
          <section>
            <div className="flex items-center gap-2">
              <Eye className="size-4 text-primary" />

              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-muted-foreground">
                  Related discovery
                </p>

                <h4 className="mt-0.5 text-sm font-black text-foreground">
                  Products worth comparing
                </h4>
              </div>
            </div>

            <div
              data-aj-consistent-product-grid
              className="mt-3 grid grid-cols-2 items-stretch gap-2 sm:grid-cols-3"
            >
              {relatedProducts.map(
                item => (
                  <div
                    key={
                      item.product.id
                    }
                    className="flex min-w-0 flex-col"
                  >
                    <ProductCard
                      product={
                        item.product
                      }
                      className="h-full"
                      onOpenExperience={
                        candidate =>
                          handleOpenProduct(
                            candidate.id
                          )
                      }
                      onAddToCart={
                        actions.addToCart
                      }
                    />

                    <p
                      data-aj-related-product-reason
                      className="mt-1 line-clamp-2 px-1 text-[7px] leading-3 text-muted-foreground"
                    >
                      {
                        item.reason
                      }
                    </p>
                  </div>
                )
              )}
            </div>
          </section>
        ) : null}

        <section data-aj-product-deep-insight-faqs>
          <div className="flex items-center gap-2">
            <CircleHelp className="size-4 text-primary" />

            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-muted-foreground">
                FAQs
              </p>

              <h4 className="mt-0.5 text-sm font-black text-foreground">
                Common decision questions
              </h4>
            </div>
          </div>

          <div className="mt-3 divide-y divide-border overflow-hidden rounded-2xl border border-border/70">
            {faqs.map(
              faq => (
                <details
                  key={
                    faq.id
                  }
                  className="group bg-background"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-3 text-[10px] font-black text-foreground">
                    <span>
                      {
                        faq.question
                      }
                    </span>

                    <CircleHelp className="size-3.5 shrink-0 text-muted-foreground transition group-open:text-primary" />
                  </summary>

                  <p className="px-3 pb-3 text-[9px] leading-5 text-muted-foreground">
                    {
                      faq.answer
                    }
                  </p>
                </details>
              )
            )}
          </div>
        </section>

        <section
          data-aj-product-deep-insight-source-boundary
          className="
            rounded-2xl border
            border-amber-500/20
            bg-amber-500/5 p-3
          "
        >
          <div className="flex items-start gap-2.5">
            <BadgeCheck className="mt-0.5 size-4 shrink-0 text-amber-700 dark:text-amber-300" />

            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.14em] text-amber-800 dark:text-amber-200">
                Authenticity boundary
              </p>

              <p className="mt-1 text-[9px] leading-5 text-muted-foreground">
                {
                  sourceNote
                }
              </p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
          <button
            type="button"
            disabled={
              !selectedVariant ||
              selectedVariant.stockLeft <=
                0 ||
              addingToCart
            }
            onClick={() => {
              void handleAddToCart();
            }}
            className="
              inline-flex h-11 min-w-0
              items-center justify-center
              gap-2 rounded-xl
              bg-foreground px-4
              text-xs font-black
              text-background
              transition hover:bg-foreground/90
              disabled:cursor-not-allowed
              disabled:opacity-45
            "
          >
            <ShoppingCart className="size-4" />

            <span className="truncate">
              {
                addingToCart
                  ? 'Adding...'
                  : selectedVariant &&
                      selectedVariant.stockLeft >
                        0
                    ? 'Add selected option'
                    : 'Unavailable'
              }
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              handleOpenProduct(
                product.id
              )
            }
            aria-label="Open product details in Discovery Hub"
            className="
              grid size-11 place-items-center
              rounded-xl border
              border-primary/20
              bg-primary/10 text-primary
              transition hover:bg-primary/15
            "
          >
            <PackageCheck className="size-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
