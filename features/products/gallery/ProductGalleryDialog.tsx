'use client';

import Image from 'next/image';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type TouchEvent
} from 'react';

import {
  ChevronLeft,
  ChevronRight,
  Expand,
  Images,
  Minimize,
  X
} from 'lucide-react';

import {
  Button
} from '@/components/ui/button';

import {
  GlobalDialog
} from '@/features/global-overlay';

import {
  cn
} from '@/lib/utils';

import type {
  ProductGalleryImage
} from './resolveProductGallery';

type ProductGalleryDialogProps = {
  open:
    boolean;

  onOpenChange: (
    open: boolean
  ) => void;

  productName:
    string;

  images:
    ProductGalleryImage[];

  initialImageId?:
    string;
};

const SWIPE_THRESHOLD =
  48;

export function ProductGalleryDialog({
  open,
  onOpenChange,
  productName,
  images,
  initialImageId
}: ProductGalleryDialogProps) {
  const thumbnailContainerRef =
    useRef<
      HTMLDivElement
    >(
      null
    );

  const touchStartXRef =
    useRef<
      number |
      null
    >(
      null
    );

  const [
    activeIndex,
    setActiveIndex
  ] =
    useState(
      0
    );

  const [
    fullscreen,
    setFullscreen
  ] =
    useState(
      false
    );

  const initialIndex =
    useMemo(
      () => {
        if (
          !initialImageId
        ) {
          return 0;
        }

        const index =
          images.findIndex(
            image =>
              image.id ===
              initialImageId
          );

        return index >=
          0
          ? index
          : 0;
      },
      [
        images,
        initialImageId
      ]
    );

  useEffect(
    () => {
      if (!open) {
        return;
      }

      const frameId =
        window.requestAnimationFrame(
          () =>
            setActiveIndex(
              initialIndex
            )
        );

      return () =>
        window.cancelAnimationFrame(
          frameId
        );
    },
    [
      initialIndex,
      open
    ]
  );

  useEffect(
    () => {
      if (open) {
        return;
      }

      const frameId =
        window.requestAnimationFrame(
          () =>
            setFullscreen(
              false
            )
        );

      return () =>
        window.cancelAnimationFrame(
          frameId
        );
    },
    [
      open
    ]
  );

  const activeImage =
    images[
      activeIndex
    ];

  const hasMultipleImages =
    images.length >
    1;

  const showPrevious =
    useCallback(
      () => {
        if (
          images.length ===
          0
        ) {
          return;
        }

        setActiveIndex(
          currentIndex =>
            currentIndex ===
            0
              ? images.length -
                1
              : currentIndex -
                1
        );
      },
      [
        images.length
      ]
    );

  const showNext =
    useCallback(
      () => {
        if (
          images.length ===
          0
        ) {
          return;
        }

        setActiveIndex(
          currentIndex =>
            currentIndex ===
            images.length -
              1
              ? 0
              : currentIndex +
                1
        );
      },
      [
        images.length
      ]
    );

  useEffect(
    () => {
      if (!open) {
        return;
      }

      const handleKeyDown =
        (
          event:
            KeyboardEvent
        ): void => {
          if (
            event.key ===
            'ArrowLeft'
          ) {
            event.preventDefault();

            showPrevious();
          }

          if (
            event.key ===
            'ArrowRight'
          ) {
            event.preventDefault();

            showNext();
          }

          if (
            event.key.toLowerCase() ===
            'f'
          ) {
            event.preventDefault();

            setFullscreen(
              current =>
                !current
            );
          }
        };

      window.addEventListener(
        'keydown',
        handleKeyDown
      );

      return () => {
        window.removeEventListener(
          'keydown',
          handleKeyDown
        );
      };
    },
    [
      open,
      showNext,
      showPrevious
    ]
  );

  useEffect(
    () => {
      const activeThumbnail =
        thumbnailContainerRef.current
          ?.querySelector<
            HTMLElement
          >(
            `[data-gallery-index="${activeIndex}"]`
          );

      activeThumbnail
        ?.scrollIntoView({
          behavior:
            'smooth',

          block:
            'nearest',

          inline:
            'center'
        });
    },
    [
      activeIndex
    ]
  );

  const handleTouchStart =
    (
      event:
        TouchEvent<HTMLElement>
    ): void => {
      touchStartXRef.current =
        event.touches[0]
          ?.clientX ??
        null;
    };

  const handleTouchEnd =
    (
      event:
        TouchEvent<HTMLElement>
    ): void => {
      const startX =
        touchStartXRef.current;

      const endX =
        event.changedTouches[0]
          ?.clientX;

      touchStartXRef.current =
        null;

      if (
        startX ===
          null ||
        endX ===
          undefined
      ) {
        return;
      }

      const difference =
        endX -
        startX;

      if (
        Math.abs(
          difference
        ) <
        SWIPE_THRESHOLD
      ) {
        return;
      }

      if (
        difference >
        0
      ) {
        showPrevious();

        return;
      }

      showNext();
    };

  if (
    images.length ===
    0
  ) {
    return null;
  }

  return (
    <GlobalDialog
      id="product-gallery"
      open={
        open
      }
      onOpenChange={
        onOpenChange
      }
      title={`${productName} gallery`}
      description={`Browse ${images.length} product image${images.length === 1 ? '' : 's'}.`}
      size="gallery"
      presentation={
        fullscreen
          ? 'fullscreen'
          : 'centered'
      }
      padding="none"
      scrollMode="canvas"
      chrome="none"
      showCloseButton={
        false
      }
      className={cn(
        'border-white/15 bg-slate-950/55 text-white ring-white/10',
        'supports-[backdrop-filter]:bg-slate-950/45',
        !fullscreen &&
          'h-[min(82dvh,38rem)] sm:h-[min(80dvh,42rem)]'
      )}
      bodyClassName="h-full">
      <section className="relative h-full min-h-0 overflow-hidden">
        <div
          className="absolute inset-0 overflow-hidden bg-white/[0.025] backdrop-blur-xl"
          onTouchStart={
            handleTouchStart
          }
          onTouchEnd={
            handleTouchEnd
          }>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),transparent_65%)]" />

          <div className="pointer-events-none absolute -left-24 -top-24 size-64 rounded-full bg-primary/15 blur-3xl sm:size-80" />

          <div className="pointer-events-none absolute -bottom-24 -right-24 size-64 rounded-full bg-white/10 blur-3xl sm:size-80" />

          {activeImage ? (
            <Image
              key={
                activeImage.id
              }
              src={
                activeImage.src
              }
              alt={
                activeImage.alt
              }
              fill
              priority
              quality={
                90
              }
              sizes={
                fullscreen
                  ? '100vw'
                  : '(max-width: 640px) calc(100vw - 1rem), min(72rem, calc(100vw - 3rem))'
              }
              className="object-contain px-3 pb-16 pt-14 drop-shadow-[0_28px_45px_rgba(0,0,0,0.35)] sm:px-6 sm:pb-20 sm:pt-16 lg:px-10"
            />
          ) : null}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/25" />
        </div>

        <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between gap-3 border-b border-white/10 bg-slate-950/25 px-3 py-2.5 backdrop-blur-2xl sm:px-4 sm:py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-full border border-white/15 bg-white/10 shadow-sm backdrop-blur-xl sm:size-9">
              <Images className="size-4" />
            </span>

            <div className="min-w-0">
              <p className="max-w-[54vw] truncate text-sm font-bold sm:max-w-md">
                {
                  productName
                }
              </p>

              <p className="mt-0.5 text-xs text-white/55">
                {
                  activeIndex +
                  1
                }{' '}
                of{' '}
                {
                  images.length
                }
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() =>
                setFullscreen(
                  current =>
                    !current
                )
              }
              aria-label={
                fullscreen
                  ? 'Exit fullscreen'
                  : 'Enter fullscreen'
              }
              className="size-8 rounded-full border border-white/15 bg-white/10 text-white shadow-sm backdrop-blur-xl hover:bg-white/20 hover:text-white sm:size-9">
              {fullscreen ? (
                <Minimize className="size-4" />
              ) : (
                <Expand className="size-4" />
              )}
            </Button>

            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() =>
                onOpenChange(
                  false
                )
              }
              aria-label="Close gallery"
              className="size-8 rounded-full border border-white/15 bg-white/10 text-white shadow-sm backdrop-blur-xl hover:bg-white/20 hover:text-white sm:size-9">
              <X className="size-4" />
            </Button>
          </div>
        </header>

        {activeImage
          ?.label ? (
          <span className="absolute bottom-[4.65rem] left-1/2 z-20 max-w-[calc(100%-6rem)] -translate-x-1/2 truncate rounded-full border border-white/15 bg-slate-950/40 px-3 py-1 text-xs font-medium text-white shadow-md backdrop-blur-2xl sm:bottom-[5.25rem]">
            {
              activeImage.label
            }
          </span>
        ) : null}

        {hasMultipleImages ? (
          <>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={
                showPrevious
              }
              aria-label="Previous image"
              className="absolute left-2 top-1/2 z-30 size-9 -translate-y-1/2 rounded-full border border-white/15 bg-slate-950/35 text-white shadow-xl backdrop-blur-2xl hover:bg-slate-950/65 hover:text-white sm:left-4 sm:size-10">
              <ChevronLeft className="size-5" />
            </Button>

            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={
                showNext
              }
              aria-label="Next image"
              className="absolute right-2 top-1/2 z-30 size-9 -translate-y-1/2 rounded-full border border-white/15 bg-slate-950/35 text-white shadow-xl backdrop-blur-2xl hover:bg-slate-950/65 hover:text-white sm:right-4 sm:size-10">
              <ChevronRight className="size-5" />
            </Button>
          </>
        ) : null}

        {hasMultipleImages ? (
          <footer className="absolute inset-x-0 bottom-0 z-30 border-t border-white/10 bg-slate-950/25 px-3 py-2.5 backdrop-blur-2xl sm:px-4 sm:py-3">
            <div
              ref={
                thumbnailContainerRef
              }
              className="mx-auto flex max-w-3xl justify-start gap-2 overflow-x-auto scrollbar-none sm:justify-center">
              {images.map(
                (
                  image,
                  index
                ) => {
                  const active =
                    index ===
                    activeIndex;

                  return (
                    <button
                      key={
                        image.id
                      }
                      type="button"
                      data-gallery-index={
                        index
                      }
                      aria-label={`View image ${index + 1}`}
                      aria-pressed={
                        active
                      }
                      onClick={() =>
                        setActiveIndex(
                          index
                        )
                      }
                      className={cn(
                        'rcentz-overlay-thumbnail relative shrink-0 overflow-hidden rounded-xl border bg-white/5 shadow-sm backdrop-blur-xl transition',
                        active
                          ? 'border-white/80 opacity-100 ring-2 ring-white/25'
                          : 'border-white/15 opacity-60 hover:border-white/40 hover:opacity-100'
                      )}>
                      <Image
                        src={
                          image.src
                        }
                        alt=""
                        fill
                        sizes="60px"
                        className="object-cover"
                      />

                      <span className="absolute inset-0 bg-black/5" />
                    </button>
                  );
                }
              )}
            </div>
          </footer>
        ) : null}
      </section>
    </GlobalDialog>
  );
}
