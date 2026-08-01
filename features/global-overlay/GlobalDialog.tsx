'use client';

import {
  useEffect,
  useId,
  useMemo,
  type CSSProperties
} from 'react';

import {
  Dialog as DialogPrimitive
} from '@base-ui/react/dialog';

import {
  X
} from 'lucide-react';

import {
  cn
} from '@/lib/utils';

import type {
  GlobalDialogProps,
  GlobalOverlayPadding,
  GlobalOverlayPresentation,
  GlobalOverlayScrollMode,
  GlobalDialogSize
} from './contracts';

import {
  useGlobalOverlay
} from './GlobalOverlayProvider';

const SIZE_CLASSES:
  Record<
    GlobalDialogSize,
    string
  > = {
    compact:
      'sm:max-w-[28rem] lg:max-w-[30rem]',

    standard:
      'sm:max-w-[36rem] lg:max-w-[40rem]',

    wide:
      'sm:max-w-[46rem] lg:max-w-[54rem]',

    gallery:
      'sm:max-w-[min(68rem,calc(100vw-2rem))] lg:max-w-[min(72rem,calc(100vw-3rem))]',

    workspace:
      'sm:max-w-[min(76rem,calc(100vw-2rem))] lg:max-w-[min(84rem,calc(100vw-3rem))]'
  };

const PADDING_CLASSES:
  Record<
    GlobalOverlayPadding,
    string
  > = {
    none:
      'p-0',

    compact:
      'p-3 sm:p-4',

    comfortable:
      'p-4 sm:p-5 lg:p-6'
  };

const BODY_SCROLL_CLASSES:
  Record<
    GlobalOverlayScrollMode,
    string
  > = {
    body:
      'overflow-y-auto overscroll-contain',

    canvas:
      'overflow-hidden',

    none:
      'overflow-visible'
  };

function presentationClasses(
  presentation:
    GlobalOverlayPresentation
) {
  switch (
    presentation
  ) {
    case 'fullscreen':
      return cn(
        'inset-0 h-dvh w-screen max-w-none rounded-none',
        'translate-x-0 translate-y-0'
      );

    case 'centered':
      return cn(
        'left-1/2 top-1/2',
        'max-h-[calc(100dvh-1rem)]',
        'w-[calc(100vw-1rem)]',
        '-translate-x-1/2 -translate-y-1/2',
        'rounded-[var(--overlay-radius)]'
      );

    default:
      return cn(
        'inset-x-0 bottom-0',
        'max-h-[calc(100dvh-0.5rem)]',
        'w-full rounded-t-[var(--overlay-radius)]',
        'sm:left-1/2 sm:top-1/2 sm:bottom-auto',
        'sm:w-[calc(100vw-2rem)]',
        'sm:-translate-x-1/2 sm:-translate-y-1/2',
        'sm:rounded-[var(--overlay-radius)]'
      );
  }
}

export function GlobalDialog({
  id,
  open,
  onOpenChange,
  title,
  description,
  eyebrow,
  children,
  footer,
  presentation = 'adaptive',
  size = 'standard',
  padding = 'comfortable',
  scrollMode = 'body',
  chrome = 'standard',
  closeLabel = 'Close dialog',
  showCloseButton = true,
  dismissible = true,
  className,
  bodyClassName,
  headerClassName,
  footerClassName
}: GlobalDialogProps) {
  const generatedId =
    useId();

  const overlayId =
    useMemo(
      () =>
        id ??
        `rcentz-overlay-${generatedId.replaceAll(
          ':',
          ''
        )}`,
      [
        generatedId,
        id
      ]
    );

  const {
    registerOverlay,
    unregisterOverlay,
    bringOverlayToFront,
    getOverlayLayer,
    isTopOverlay
  } =
    useGlobalOverlay();

  useEffect(
    () => {
      if (!open) {
        unregisterOverlay(
          overlayId
        );

        return;
      }

      registerOverlay({
        id:
          overlayId,

        label:
          typeof title ===
            'string'
            ? title
            : 'Dialog'
      });

      return () => {
        unregisterOverlay(
          overlayId
        );
      };
    },
    [
      open,
      overlayId,
      title,
      registerOverlay,
      unregisterOverlay
    ]
  );

  const layer =
    getOverlayLayer(
      overlayId
    );

  const top =
    isTopOverlay(
      overlayId
    );

  const baseZIndex =
    300 +
    layer *
      20;

  const overlayStyle = {
    zIndex:
      baseZIndex
  } satisfies
    CSSProperties;

  const popupStyle = {
    zIndex:
      baseZIndex +
      10
  } satisfies
    CSSProperties;

  function handleOpenChange(
    nextOpen:
      boolean
  ) {
    if (
      !nextOpen &&
      !dismissible
    ) {
      return;
    }

    onOpenChange(
      nextOpen
    );
  }

  const standardChrome =
    chrome ===
    'standard';

  return (
    <DialogPrimitive.Root
      open={
        open
      }
      onOpenChange={
        handleOpenChange
      }>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop
          data-rcentz-overlay-backdrop
          data-overlay-id={
            overlayId
          }
          data-overlay-top={
            top
              ? 'true'
              : 'false'
          }
          style={
            overlayStyle
          }
          className={cn(
            'fixed inset-0 isolate',
            'bg-black/55 backdrop-blur-[3px]',
            'duration-150',
            'data-open:animate-in data-open:fade-in-0',
            'data-closed:animate-out data-closed:fade-out-0',
            !top &&
              'pointer-events-none opacity-0'
          )}
        />

        <DialogPrimitive.Popup
          data-rcentz-overlay-canvas
          data-overlay-id={
            overlayId
          }
          data-overlay-layer={
            layer
          }
          data-overlay-top={
            top
              ? 'true'
              : 'false'
          }
          onPointerDown={() =>
            bringOverlayToFront(
              overlayId
            )
          }
          style={
            popupStyle
          }
          className={cn(
            'rcentz-overlay-canvas fixed isolate flex min-w-0 flex-col overflow-hidden',
            'border border-border/75 bg-popover/96 text-popover-foreground',
            'shadow-[0_30px_100px_-28px_rgba(0,0,0,0.72)]',
            'ring-1 ring-foreground/[0.07]',
            'backdrop-blur-3xl',
            'outline-none',
            'duration-150',
            'data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95',
            'data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
            presentationClasses(
              presentation
            ),
            presentation !==
              'fullscreen' &&
              SIZE_CLASSES[
                size
              ],
            !top &&
              'pointer-events-none',
            className
          )}>
          <DialogPrimitive.Title className="sr-only">
            {
              title
            }
          </DialogPrimitive.Title>

          {description ? (
            <DialogPrimitive.Description className="sr-only">
              {
                description
              }
            </DialogPrimitive.Description>
          ) : null}

          {chrome !==
          'none' ? (
            <header
              className={cn(
                'relative shrink-0 border-b border-border/60',
                standardChrome
                  ? 'px-4 py-3.5 sm:px-5 sm:py-4'
                  : 'px-3 py-3 sm:px-4',
                headerClassName
              )}>
              <div className="min-w-0 pr-11">
                {eyebrow ? (
                  <p className="rcentz-overlay-eyebrow mb-1 text-[var(--overlay-eyebrow)] font-black uppercase tracking-[0.15em] text-muted-foreground">
                    {
                      eyebrow
                    }
                  </p>
                ) : null}

                <div
                  aria-hidden="true"
                  className={cn(
                    'min-w-0 font-black tracking-tight',
                    standardChrome
                      ? 'text-[var(--overlay-title)]'
                      : 'text-[var(--overlay-title-compact)]'
                  )}>
                  {
                    title
                  }
                </div>

                {description ? (
                  <div
                    aria-hidden="true"
                    className="mt-1 max-w-3xl text-[var(--overlay-description)] leading-[var(--overlay-description-leading)] text-muted-foreground">
                    {
                      description
                    }
                  </div>
                ) : null}
              </div>

              {showCloseButton ? (
                <DialogPrimitive.Close
                  aria-label={
                    closeLabel
                  }
                  disabled={
                    !dismissible
                  }
                  className={cn(
                    'absolute right-3 top-3 grid size-9 place-items-center rounded-full',
                    'border border-border/70 bg-background/65 text-muted-foreground',
                    'shadow-sm backdrop-blur-xl transition',
                    'hover:bg-muted hover:text-foreground',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    'disabled:cursor-not-allowed disabled:opacity-45',
                    standardChrome &&
                      'sm:right-4 sm:top-4'
                  )}>
                  <X className="size-4" />
                </DialogPrimitive.Close>
              ) : null}
            </header>
          ) : showCloseButton ? (
            <DialogPrimitive.Close
              aria-label={
                closeLabel
              }
              disabled={
                !dismissible
              }
              className={cn(
                'absolute right-3 top-3 z-50 grid size-9 place-items-center rounded-full',
                'border border-white/15 bg-black/25 text-white',
                'shadow-lg backdrop-blur-xl transition',
                'hover:bg-black/45',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70',
                'disabled:cursor-not-allowed disabled:opacity-45'
              )}>
              <X className="size-4" />
            </DialogPrimitive.Close>
          ) : null}

          <div
            className={cn(
              'rcentz-overlay-body min-h-0 min-w-0 flex-1',
              PADDING_CLASSES[
                padding
              ],
              BODY_SCROLL_CLASSES[
                scrollMode
              ],
              bodyClassName
            )}>
            {
              children
            }
          </div>

          {footer &&
          chrome !==
            'none' ? (
            <footer
              className={cn(
                'rcentz-overlay-footer shrink-0 border-t border-border/60',
                'bg-background/55 px-4 py-3 backdrop-blur-xl',
                'sm:px-5',
                footerClassName
              )}>
              {
                footer
              }
            </footer>
          ) : null}
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
