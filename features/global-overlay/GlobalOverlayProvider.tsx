'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from 'react';

import {
  Dialog as DialogPrimitive
} from '@base-ui/react/dialog';

import {
  ArrowLeft,
  X
} from 'lucide-react';

import {
  cn
} from '@/lib/utils';

import type {
  GlobalOverlayConfig,
  GlobalOverlayContextValue,
  GlobalOverlayEntry,
  GlobalOverlayManagerSize,
  GlobalOverlayRegistration,
  GlobalOverlayVariant
} from './contracts';

const GlobalOverlayContext =
  createContext<
    GlobalOverlayContextValue |
    null
  >(
    null
  );

const sizeClasses:
  Record<
    GlobalOverlayManagerSize,
    string
  > = {
    sm:
      'w-[min(96vw,30rem)]',

    md:
      'w-[min(96vw,44rem)]',

    lg:
      'w-[min(97vw,60rem)]',

    xl:
      'w-[min(97vw,76rem)]'
  };

function stageClasses(
  variant:
    GlobalOverlayVariant
) {
  switch (
    variant
  ) {
    case 'panel':
      return 'items-stretch justify-end';

    case 'sheet':
      return 'items-end justify-center';

    default:
      return 'items-center justify-center';
  }
}

function surfaceClasses(
  variant:
    GlobalOverlayVariant,
  size:
    GlobalOverlayManagerSize
) {
  switch (
    variant
  ) {
    case 'workspace':
      return [
        'h-dvh w-screen rounded-none',
        'sm:h-[min(92dvh,64rem)] sm:w-[min(96vw,90rem)] sm:rounded-[var(--overlay-radius)]'
      ];

    case 'panel':
      return [
        'h-dvh w-full max-w-none rounded-none',
        sizeClasses[
          size
        ],
        'sm:rounded-l-[var(--overlay-radius)]'
      ];

    case 'sheet':
      return [
        'max-h-[92dvh] w-full max-w-none rounded-t-[var(--overlay-radius)]'
      ];

    case 'fullscreen':
      return [
        'h-dvh w-screen max-w-none rounded-none'
      ];

    default:
      return [
        'max-h-[min(92dvh,68rem)] rounded-[var(--overlay-radius)]',
        sizeClasses[
          size
        ]
      ];
  }
}

export function GlobalOverlayProvider({
  children
}: {
  children:
    ReactNode;
}) {
  const [
    stack,
    setStack
  ] =
    useState<
      GlobalOverlayEntry[]
    >(
      []
    );

  const [
    registeredDialogs,
    setRegisteredDialogs
  ] =
    useState<
      GlobalOverlayRegistration[]
    >(
      []
    );

  const sequenceRef =
    useRef(
      0
    );

  const activeOverlay =
    stack.at(
      -1
    ) ??
    null;

  const createEntry =
    useCallback(
      (
        config:
          GlobalOverlayConfig
      ): GlobalOverlayEntry => {
        sequenceRef.current +=
          1;

        return {
          ...config,

          id:
            config.id ??
            `global-overlay-${sequenceRef.current}`,

          variant:
            config.variant ??
            'dialog',

          size:
            config.size ??
            'md',

          dismissible:
            config.dismissible ??
            true
        };
      },
      []
    );

  const openOverlay =
    useCallback(
      (
        config:
          GlobalOverlayConfig
      ) => {
        const entry =
          createEntry(
            config
          );

        setStack(
          current => [
            ...current.filter(
              item =>
                item.id !==
                entry.id
            ),
            entry
          ]
        );

        return entry.id;
      },
      [
        createEntry
      ]
    );

  const replaceOverlay =
    useCallback(
      (
        config:
          GlobalOverlayConfig
      ) => {
        const entry =
          createEntry(
            config
          );

        setStack(
          current =>
            current.length
              ? [
                  ...current.slice(
                    0,
                    -1
                  ),
                  entry
                ]
              : [
                  entry
                ]
        );

        return entry.id;
      },
      [
        createEntry
      ]
    );

  const closeOverlay =
    useCallback(
      (
        id?:
          string
      ) => {
        setStack(
          current => {
            if (
              !current.length
            ) {
              return current;
            }

            if (!id) {
              return current.slice(
                0,
                -1
              );
            }

            return current.filter(
              entry =>
                entry.id !==
                id
            );
          }
        );
      },
      []
    );

  const backOverlay =
    useCallback(
      () => {
        setStack(
          current =>
            current.slice(
              0,
              -1
            )
        );
      },
      []
    );

  const closeAllOverlays =
    useCallback(
      () => {
        setStack(
          []
        );
      },
      []
    );

  const registerOverlay =
    useCallback(
      (
        registration:
          GlobalOverlayRegistration
      ) => {
        setRegisteredDialogs(
          current => [
            ...current.filter(
              item =>
                item.id !==
                registration.id
            ),
            registration
          ]
        );
      },
      []
    );

  const unregisterOverlay =
    useCallback(
      (
        overlayId:
          string
      ) => {
        setRegisteredDialogs(
          current =>
            current.filter(
              item =>
                item.id !==
                overlayId
            )
        );
      },
      []
    );

  const bringOverlayToFront =
    useCallback(
      (
        overlayId:
          string
      ) => {
        setRegisteredDialogs(
          current => {
            const existing =
              current.find(
                item =>
                  item.id ===
                  overlayId
              );

            if (
              !existing ||
              current.at(
                -1
              )?.id ===
                overlayId
            ) {
              return current;
            }

            return [
              ...current.filter(
                item =>
                  item.id !==
                  overlayId
              ),
              existing
            ];
          }
        );
      },
      []
    );

  const topOverlayId =
    activeOverlay?.id ??
    registeredDialogs.at(
      -1
    )?.id ??
    null;

  const getOverlayLayer =
    useCallback(
      (
        overlayId:
          string
      ) =>
        Math.max(
          0,
          registeredDialogs.findIndex(
            item =>
              item.id ===
              overlayId
          )
        ),
      [
        registeredDialogs
      ]
    );

  const isTopOverlay =
    useCallback(
      (
        overlayId:
          string
      ) =>
        !activeOverlay &&
        topOverlayId ===
          overlayId,
      [
        activeOverlay,
        topOverlayId
      ]
    );

  const hasOpenOverlay =
    Boolean(
      activeOverlay
    ) ||
    registeredDialogs.length >
      0;

  useEffect(
    () => {
      if (
        !stack.length
      ) {
        return;
      }

      const body =
        document.body;

      const previousOverflow =
        body.style.overflow;

      const previousPaddingRight =
        body.style.paddingRight;

      const scrollbarWidth =
        window.innerWidth -
        document.documentElement
          .clientWidth;

      body.style.overflow =
        'hidden';

      if (
        scrollbarWidth >
        0
      ) {
        body.style.paddingRight =
          `${scrollbarWidth}px`;
      }

      return () => {
        body.style.overflow =
          previousOverflow;

        body.style.paddingRight =
          previousPaddingRight;
      };
    },
    [
      stack.length
    ]
  );

  const value =
    useMemo<
      GlobalOverlayContextValue
    >(
      () => ({
        stack,
        activeOverlay,
        openOverlay,
        replaceOverlay,
        closeOverlay,
        backOverlay,
        closeAllOverlays,
        registeredDialogs,
        topOverlayId,
        registerOverlay,
        unregisterOverlay,
        bringOverlayToFront,
        getOverlayLayer,
        isTopOverlay,
        hasOpenOverlay
      }),
      [
        stack,
        activeOverlay,
        openOverlay,
        replaceOverlay,
        closeOverlay,
        backOverlay,
        closeAllOverlays,
        registeredDialogs,
        topOverlayId,
        registerOverlay,
        unregisterOverlay,
        bringOverlayToFront,
        getOverlayLayer,
        isTopOverlay,
        hasOpenOverlay
      ]
    );

  const activeVariant =
    activeOverlay?.variant ??
    'dialog';

  const activeSize =
    activeOverlay?.size ??
    'md';

  const dismissible =
    activeOverlay?.dismissible ??
    true;

  return (
    <GlobalOverlayContext.Provider
      value={
        value
      }>
      {
        children
      }

      <DialogPrimitive.Root
        open={
          Boolean(
            activeOverlay
          )
        }
        onOpenChange={
          open => {
            if (
              !open &&
              dismissible
            ) {
              closeOverlay();
            }
          }
        }>
        {activeOverlay ? (
          <DialogPrimitive.Portal>
            <DialogPrimitive.Backdrop
              className="fixed inset-0 z-[400] bg-black/55 backdrop-blur-[3px] duration-150 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
            />

            <div
              data-global-overlay-stage
              className={cn(
                'pointer-events-none fixed inset-0 z-[420] flex min-h-0 min-w-0 overflow-hidden',
                activeVariant ===
                  'workspace' ||
                activeVariant ===
                  'fullscreen' ||
                activeVariant ===
                  'panel' ||
                activeVariant ===
                  'sheet'
                  ? 'p-0'
                  : 'p-3 sm:p-6',
                activeVariant ===
                  'workspace'
                  ? 'sm:p-5'
                  : null,
                stageClasses(
                  activeVariant
                )
              )}>
              <DialogPrimitive.Popup
                key={
                  activeOverlay.id
                }
                data-global-overlay-surface
                data-overlay-id={
                  activeOverlay.id
                }
                className={cn(
                  'rcentz-overlay-canvas pointer-events-auto relative grid min-h-0 min-w-0 grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden',
                  'border border-border/70 bg-popover/96 text-popover-foreground shadow-2xl ring-1 ring-foreground/[0.07] backdrop-blur-3xl outline-none',
                  'duration-150 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
                  surfaceClasses(
                    activeVariant,
                    activeSize
                  ),
                  activeOverlay.surfaceClassName
                )}>
                <header className="relative z-10 border-b border-border/60 bg-popover/92 px-4 py-3.5 backdrop-blur-xl sm:px-6 sm:py-4">
                  <div className="flex min-w-0 items-start gap-3">
                    {stack.length >
                    1 ? (
                      <button
                        type="button"
                        onClick={
                          backOverlay
                        }
                        className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full border border-border/70 bg-background/55 transition hover:bg-muted"
                        aria-label="Return to previous overlay">
                        <ArrowLeft className="size-4" />
                      </button>
                    ) : null}

                    <div className="min-w-0 flex-1">
                      {activeOverlay.eyebrow ? (
                        <div className="mb-1 text-[var(--overlay-eyebrow)] font-black uppercase tracking-[0.15em] text-muted-foreground">
                          {
                            activeOverlay.eyebrow
                          }
                        </div>
                      ) : null}

                      <DialogPrimitive.Title className="pr-10 text-[var(--overlay-title)] font-black leading-tight">
                        {
                          activeOverlay.title
                        }
                      </DialogPrimitive.Title>

                      {activeOverlay.description ? (
                        <DialogPrimitive.Description className="mt-1.5 max-w-5xl text-[var(--overlay-description)] leading-[var(--overlay-description-leading)] text-muted-foreground">
                          {
                            activeOverlay.description
                          }
                        </DialogPrimitive.Description>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      onClick={
                        closeAllOverlays
                      }
                      disabled={
                        !dismissible
                      }
                      className="grid size-9 shrink-0 place-items-center rounded-full border border-border/70 bg-background/55 transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-45"
                      aria-label={
                        activeOverlay.closeLabel ??
                        'Close overlay'
                      }>
                      <X className="size-4" />
                    </button>
                  </div>
                </header>

                <div
                  className={cn(
                    'rcentz-overlay-body min-h-0 min-w-0 overflow-x-hidden overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5 lg:px-7',
                    activeOverlay.bodyClassName
                  )}>
                  {
                    activeOverlay.content
                  }
                </div>

                {activeOverlay.footer ? (
                  <footer className="relative z-10 border-t border-border/60 bg-background/55 px-4 py-3 backdrop-blur-xl sm:px-6">
                    {
                      activeOverlay.footer
                    }
                  </footer>
                ) : null}
              </DialogPrimitive.Popup>
            </div>
          </DialogPrimitive.Portal>
        ) : null}
      </DialogPrimitive.Root>
    </GlobalOverlayContext.Provider>
  );
}

export function useGlobalOverlay() {
  const context =
    useContext(
      GlobalOverlayContext
    );

  if (!context) {
    throw new Error(
      'useGlobalOverlay must be used inside GlobalOverlayProvider.'
    );
  }

  return context;
}
