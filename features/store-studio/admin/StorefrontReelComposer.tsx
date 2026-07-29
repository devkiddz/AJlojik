'use client';

import {
  useEffect,
  useMemo,
  useState,
  useTransition
} from 'react';

import Image from 'next/image';

import {
  Check,
  Clapperboard,
  LoaderCircle,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Video
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle
} from '@/components/ui/dialog';
import { MediaChoiceGrid, type MediaChoiceAsset } from '@/features/admin/media/MediaChoiceGrid';
import { cn } from '@/lib/utils';
import type { ProductType } from '@/types/types';

import { requestStoreStudioRefresh } from '../client';
import { createProductReels } from './actions';

type StorefrontReelComposerProps = {
  products: ProductType[];
};

type ReelDraft = {
  productId: string;
  title: string;
  caption: string;
  videoMediaAssetId: string;
  posterMediaAssetId: string;
  externalVideoUrl: string;
  externalPosterUrl: string;
  autoplay: boolean;
};

const MAX_REELS_PER_BATCH = 6;

function getProductImage(product: ProductType): string {
  return (
    product.variants.find(variant => Boolean(variant.image))
      ?.image ?? '/placeholder.svg'
  );
}

export function StorefrontReelComposer({
  products
}: StorefrontReelComposerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [campaignTitle, setCampaignTitle] = useState('');
  const [drafts, setDrafts] = useState<ReelDraft[]>([]);
  const [media, setMedia] = useState<MediaChoiceAsset[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(
    null
  );
  const [pending, startTransition] = useTransition();

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return products.slice(0, 40);
    }

    return products
      .filter(product =>
        [
          product.name,
          product.category,
          product.subcategory ?? '',
          ...product.tags
        ]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery)
      )
      .slice(0, 40);
  }, [products, query]);

  const selectedProductIds = useMemo(
    () => new Set(drafts.map(draft => draft.productId)),
    [drafts]
  );

  useEffect(() => {
    if (!open || media.length || mediaLoading) {
      return;
    }

    const controller = new AbortController();

    setMediaLoading(true);
    setMediaError(null);

    void fetch('/api/admin/media/assets?scope=workspace', {
      signal: controller.signal
    })
      .then(async response => {
        const result = (await response.json()) as {
          assets?: MediaChoiceAsset[];
          error?: string;
        };

        if (!response.ok) {
          throw new Error(result.error ?? 'Unable to load Media Studio.');
        }

        setMedia(result.assets ?? []);
      })
      .catch(error => {
        if (controller.signal.aborted) {
          return;
        }

        setMediaError(
          error instanceof Error
            ? error.message
            : 'Unable to load Media Studio.'
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setMediaLoading(false);
        }
      });

    return () => controller.abort();
  }, [media.length, mediaLoading, open]);

  const addMedia = (asset: MediaChoiceAsset) => {
    setMedia(current => [
      asset,
      ...current.filter(item => item.id !== asset.id)
    ]);
  };

  const addProduct = (product: ProductType) => {
    if (
      selectedProductIds.has(product.id) ||
      drafts.length >= MAX_REELS_PER_BATCH
    ) {
      return;
    }

    setDrafts(current => [
      ...current,
      {
        productId: product.id,
        title: product.name,
        caption: product.shortDescription,
        videoMediaAssetId: '',
        posterMediaAssetId: '',
        externalVideoUrl: '',
        externalPosterUrl: '',
        autoplay: true
      }
    ]);
  };

  const updateDraft = <Key extends keyof ReelDraft>(
    productId: string,
    key: Key,
    value: ReelDraft[Key]
  ) => {
    setDrafts(current =>
      current.map(draft =>
        draft.productId === productId
          ? {
              ...draft,
              [key]: value
            }
          : draft
      )
    );
  };

  const removeDraft = (productId: string) => {
    setDrafts(current =>
      current.filter(draft => draft.productId !== productId)
    );
  };

  const submit = () => {
    setErrorMessage(null);
    setResultMessage(null);

    if (!drafts.length) {
      setErrorMessage('Select at least one product.');
      return;
    }

    const incompleteDraft = drafts.find(
      draft =>
        !draft.title.trim() ||
        (!draft.videoMediaAssetId && !draft.externalVideoUrl.trim())
    );

    if (incompleteDraft) {
      setErrorMessage(
        'Every selected product needs a Reel title and a video selected from Media Studio.'
      );
      return;
    }

    const formData = new FormData();
    formData.set('campaignTitle', campaignTitle);
    formData.set('entries', JSON.stringify(drafts));

    startTransition(() => {
      void createProductReels(formData)
        .then(result => {
          setResultMessage(result.message);
          requestStoreStudioRefresh();
          setDrafts([]);
          setCampaignTitle('');
        })
        .catch(error => {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Unable to create the Reel campaign.'
          );
        });
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-40 inline-flex h-12 items-center gap-2 rounded-full border border-white/15 bg-zinc-950 px-4 text-xs font-bold text-white shadow-2xl transition hover:-translate-y-0.5 hover:bg-zinc-900 lg:bottom-6 lg:right-6"
      >
        <Clapperboard className="size-4 text-amber-300" />
        Create Reels
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="h-[min(92dvh,56rem)] max-h-none w-[min(96vw,76rem)] max-w-none gap-0 overflow-hidden rounded-3xl border-border/70 bg-background p-0">
          <DialogTitle className="sr-only">
            Create product Reels
          </DialogTitle>

          <DialogDescription className="sr-only">
            Select products and create several Store Studio Reels in one campaign.
          </DialogDescription>

          <div className="grid size-full min-h-0 lg:grid-cols-[minmax(18rem,.8fr)_minmax(0,1.2fr)]">
            <aside className="min-h-0 border-b border-border/60 bg-muted/20 p-4 lg:border-b-0 lg:border-r sm:p-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                  Storefront quick studio
                </p>

                <h2 className="mt-2 text-xl font-black tracking-tight">
                  Choose products
                </h2>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  One selected product becomes one Reel. Add up to {MAX_REELS_PER_BATCH} in this batch.
                </p>
              </div>

              <label className="mt-4 flex h-10 items-center gap-2 rounded-full border border-border/70 bg-background px-3">
                <Search className="size-4 text-muted-foreground" />
                <input
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  placeholder="Search products"
                  className="min-w-0 flex-1 bg-transparent text-xs outline-none"
                />
              </label>

              <div className="mt-4 h-[calc(100%-10.5rem)] space-y-2 overflow-y-auto pr-1 scrollbar-hide">
                {filteredProducts.map(product => {
                  const selected = selectedProductIds.has(product.id);
                  const disabled =
                    !selected && drafts.length >= MAX_REELS_PER_BATCH;

                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => addProduct(product)}
                      disabled={selected || disabled}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-2xl border p-2.5 text-left transition',
                        selected
                          ? 'border-primary/40 bg-primary/8'
                          : 'border-border/60 bg-background/70 hover:border-primary/30 hover:bg-background',
                        disabled && 'opacity-45'
                      )}
                    >
                      <span className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-muted">
                        <Image
                          src={getProductImage(product)}
                          alt={product.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-bold">
                          {product.name}
                        </span>
                        <span className="mt-1 block truncate text-[9px] text-muted-foreground">
                          {product.category}
                        </span>
                      </span>

                      <span
                        className={cn(
                          'grid size-7 shrink-0 place-items-center rounded-full border',
                          selected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border'
                        )}
                      >
                        {selected ? (
                          <Check className="size-3.5" />
                        ) : (
                          <Plus className="size-3.5" />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </aside>

            <section className="min-h-0 overflow-y-auto p-4 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600">
                    Reel campaign
                  </p>
                  <h2 className="mt-2 text-xl font-black tracking-tight sm:text-2xl">
                    Build multiple product Reels
                  </h2>
                </div>

                <span className="w-fit rounded-full bg-muted px-3 py-2 text-[10px] font-bold">
                  {drafts.length}/{MAX_REELS_PER_BATCH} selected
                </span>
              </div>

              <label className="mt-5 block">
                <span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  Campaign name
                </span>
                <input
                  value={campaignTitle}
                  onChange={event => setCampaignTitle(event.target.value)}
                  placeholder="Weekend product Reels"
                  className="h-11 w-full rounded-2xl border border-border/70 bg-background px-3 text-sm outline-none focus:border-primary"
                />
              </label>

              {mediaLoading ? (
                <p className="mt-4 rounded-2xl bg-muted px-4 py-3 text-xs text-muted-foreground">
                  Loading the workspace Media Studio…
                </p>
              ) : null}

              {mediaError ? (
                <p className="mt-4 rounded-2xl bg-destructive/10 px-4 py-3 text-xs font-semibold text-destructive">
                  {mediaError}
                </p>
              ) : null}

              <div className="mt-5 space-y-4">
                {drafts.map((draft, index) => {
                  const product = products.find(
                    item => item.id === draft.productId
                  );

                  if (!product) {
                    return null;
                  }

                  return (
                    <article
                      key={draft.productId}
                      className="rounded-3xl border border-border/60 bg-card/70 p-4 shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <span className="relative size-14 shrink-0 overflow-hidden rounded-2xl bg-muted">
                          <Image
                            src={getProductImage(product)}
                            alt={product.name}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        </span>

                        <div className="min-w-0 flex-1">
                          <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                            Reel {index + 1}
                          </p>
                          <h3 className="mt-1 truncate text-sm font-black">
                            {product.name}
                          </h3>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeDraft(draft.productId)}
                          aria-label={`Remove ${product.name}`}
                          className="grid size-9 place-items-center rounded-full border border-border/70 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <Field label="Reel title">
                          <input
                            value={draft.title}
                            onChange={event =>
                              updateDraft(
                                draft.productId,
                                'title',
                                event.target.value
                              )
                            }
                            className="h-10 w-full rounded-xl border border-border/70 bg-background px-3 text-xs outline-none focus:border-primary"
                          />
                        </Field>

                        <Field label="Caption">
                          <input
                            value={draft.caption}
                            onChange={event =>
                              updateDraft(
                                draft.productId,
                                'caption',
                                event.target.value
                              )
                            }
                            className="h-10 w-full rounded-xl border border-border/70 bg-background px-3 text-xs outline-none focus:border-primary"
                          />
                        </Field>
                      </div>

                      <div className="mt-4 grid gap-3 lg:grid-cols-2">
                        <details className="rounded-2xl border border-border/60 bg-background/55 p-3">
                          <summary className="cursor-pointer text-[9px] font-black uppercase tracking-[0.14em] text-muted-foreground">
                            {draft.videoMediaAssetId
                              ? 'Reel video selected'
                              : 'Choose or upload Reel video'}
                          </summary>

                          <div className="mt-3">
                            <MediaChoiceGrid
                              media={media}
                              name={`reelVideo-${draft.productId}`}
                              initialIds={
                                draft.videoMediaAssetId
                                  ? [draft.videoMediaAssetId]
                                  : []
                              }
                              emptyLabel="No Reel video selected"
                              purpose="reels"
                              uploadAccept="video"
                              acceptedResourceTypes={['VIDEO']}
                              onSelectionChange={ids =>
                                updateDraft(
                                  draft.productId,
                                  'videoMediaAssetId',
                                  ids[0] ?? ''
                                )
                              }
                              onAssetUploaded={addMedia}
                            />
                          </div>
                        </details>

                        <details className="rounded-2xl border border-border/60 bg-background/55 p-3">
                          <summary className="cursor-pointer text-[9px] font-black uppercase tracking-[0.14em] text-muted-foreground">
                            {draft.posterMediaAssetId
                              ? 'Poster selected'
                              : 'Choose optional Reel poster'}
                          </summary>

                          <div className="mt-3">
                            <MediaChoiceGrid
                              media={media}
                              name={`reelPoster-${draft.productId}`}
                              initialIds={
                                draft.posterMediaAssetId
                                  ? [draft.posterMediaAssetId]
                                  : []
                              }
                              emptyLabel="Use the product image as poster"
                              purpose="reels"
                              uploadAccept="image"
                              acceptedResourceTypes={['IMAGE']}
                              onSelectionChange={ids =>
                                updateDraft(
                                  draft.productId,
                                  'posterMediaAssetId',
                                  ids[0] ?? ''
                                )
                              }
                              onAssetUploaded={addMedia}
                            />
                          </div>
                        </details>
                      </div>

                      <details className="mt-3 rounded-2xl border border-dashed border-border/60 px-3 py-2">
                        <summary className="cursor-pointer text-[9px] font-bold text-muted-foreground">
                          Advanced external media fallback
                        </summary>

                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          <Field label="External video URL">
                            <input
                              value={draft.externalVideoUrl}
                              onChange={event =>
                                updateDraft(
                                  draft.productId,
                                  'externalVideoUrl',
                                  event.target.value
                                )
                              }
                              placeholder="Used only when no gallery video is selected"
                              className="h-10 w-full rounded-xl border border-border/70 bg-background px-3 text-xs outline-none focus:border-primary"
                            />
                          </Field>

                          <Field label="External poster URL">
                            <input
                              value={draft.externalPosterUrl}
                              onChange={event =>
                                updateDraft(
                                  draft.productId,
                                  'externalPosterUrl',
                                  event.target.value
                                )
                              }
                              placeholder="Optional poster fallback"
                              className="h-10 w-full rounded-xl border border-border/70 bg-background px-3 text-xs outline-none focus:border-primary"
                            />
                          </Field>
                        </div>
                      </details>

                      <label className="mt-3 inline-flex items-center gap-2 text-[10px] font-semibold text-muted-foreground">
                        <input
                          type="checkbox"
                          checked={draft.autoplay}
                          onChange={event =>
                            updateDraft(
                              draft.productId,
                              'autoplay',
                              event.target.checked
                            )
                          }
                        />
                        Allow controlled autoplay when visible
                      </label>
                    </article>
                  );
                })}

                {!drafts.length ? (
                  <div className="grid min-h-64 place-items-center rounded-3xl border border-dashed border-border/70 bg-muted/20 p-8 text-center">
                    <div>
                      <Video className="mx-auto size-7 text-muted-foreground" />
                      <p className="mt-3 text-sm font-bold">
                        No products selected
                      </p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        Select products from the left to prepare a multi-Reel campaign.
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>

              {errorMessage ? (
                <p className="mt-4 rounded-2xl bg-destructive/10 px-4 py-3 text-xs font-semibold text-destructive">
                  {errorMessage}
                </p>
              ) : null}

              {resultMessage ? (
                <p className="mt-4 rounded-2xl bg-emerald-500/10 px-4 py-3 text-xs font-semibold text-emerald-600">
                  {resultMessage}
                </p>
              ) : null}

              <div className="mt-5 flex flex-col gap-2 border-t border-border/60 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[10px] leading-5 text-muted-foreground">
                  Authorized Store Studio administrators publish immediately.
                </p>

                <button
                  type="button"
                  onClick={submit}
                  disabled={pending || !drafts.length}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-foreground px-5 text-xs font-bold text-background transition hover:opacity-90 disabled:opacity-40"
                >
                  {pending ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <Sparkles className="size-4" />
                  )}
                  Create {drafts.length || ''} Reel{drafts.length === 1 ? '' : 's'}
                </button>
              </div>
            </section>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Field({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label>
      <span className="mb-1.5 block text-[8px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
