'use client';

import {
  useEffect,
  useRef,
  useState
} from 'react';

import {
  ChevronDown,
  History,
  LoaderCircle,
  RotateCcw,
  Trash2,
  Undo2
} from 'lucide-react';

import {
  cn
} from '@/lib/utils';

import {
  useExperienceStack
} from './ExperienceStackProvider';

function formatVisitedAt(
  value: string
): string {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return '';
  }

  return date.toLocaleString(
    'en-NG',
    {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }
  );
}

/**
 * Retained as a compatibility export.
 *
 * The separate floating Back control has intentionally been
 * removed. Previous-experience navigation now lives inside the
 * single global Experience History control.
 */
export function ExperienceBackControl() {
  return null;
}

export function ExperienceHistoryControl() {
  const {
    entries,
    canGoBack,
    loading,
    error,
    goBack,
    jumpTo,
    clearHistory,
    startFresh
  } = useExperienceStack();

  const [
    historyOpen,
    setHistoryOpen
  ] = useState(false);

  const containerRef =
    useRef<HTMLDivElement | null>(
      null
    );

  useEffect(() => {
    if (!historyOpen) {
      return;
    }

    const closeOnOutsidePointer = (
      event: PointerEvent
    ) => {
      if (
        !containerRef.current?.contains(
          event.target as Node
        )
      ) {
        setHistoryOpen(false);
      }
    };

    const closeOnEscape = (
      event: KeyboardEvent
    ) => {
      if (
        event.key ===
        'Escape'
      ) {
        setHistoryOpen(false);
      }
    };

    document.addEventListener(
      'pointerdown',
      closeOnOutsidePointer
    );

    document.addEventListener(
      'keydown',
      closeOnEscape
    );

    return () => {
      document.removeEventListener(
        'pointerdown',
        closeOnOutsidePointer
      );

      document.removeEventListener(
        'keydown',
        closeOnEscape
      );
    };
  }, [
    historyOpen
  ]);

  return (
    <div
      ref={containerRef}
      className="
        relative flex flex-col
        items-center gap-1
      ">
      <button
        type="button"
        aria-expanded={
          historyOpen
        }
        aria-haspopup="dialog"
        aria-label="Open experience history"
        title="Experience history"
        onClick={() =>
          setHistoryOpen(
            current =>
              !current
          )
        }
        className="
          relative grid size-9
          place-items-center
          rounded-full
          border border-border/70
          bg-background/75
          text-muted-foreground
          shadow-sm transition
          hover:bg-muted
          hover:text-foreground
        ">
        <History className="size-4" />

        <span
          className="
            absolute -right-0.5
            -top-0.5 min-w-4
            rounded-full bg-primary
            px-1 text-center
            text-[9px] font-black
            leading-4
            text-primary-foreground
          ">
          {Math.min(
            entries.length,
            99
          )}
        </span>
      </button>

      <span className="hidden text-xs md:inline">
        History
      </span>

      {historyOpen ? (
        <div
          className="
            absolute right-0
            top-[calc(100%+0.65rem)]
            z-[180]
            w-[min(24rem,calc(100vw-1rem))]
            overflow-hidden
            rounded-2xl
            border border-border/70
            bg-background
            shadow-2xl
          ">
          <div
            className="
              flex items-center
              justify-between gap-3
              border-b border-border/60
              px-3 py-2.5
            ">
            <div className="min-w-0">
              <p className="text-xs font-bold">
                Experience history
              </p>

              <p
                className="
                  text-[11px]
                  text-muted-foreground
                ">
                Return or jump without
                losing context.
              </p>
            </div>

            <ChevronDown
              className={cn(
                `
                  size-4 shrink-0
                  transition
                `,
                historyOpen &&
                  'rotate-180'
              )}
            />
          </div>

          <div
            className="
              border-b border-border/60
              p-2
            ">
            <button
              type="button"
              disabled={
                !canGoBack ||
                loading
              }
              onClick={() => {
                setHistoryOpen(false);
                void goBack();
              }}
              className="
                inline-flex h-10
                w-full items-center
                justify-center gap-2
                rounded-xl
                bg-primary/10
                px-3 text-xs
                font-bold text-primary
                transition
                hover:bg-primary
                hover:text-primary-foreground
                disabled:cursor-not-allowed
                disabled:opacity-40
              ">
              {loading ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Undo2 className="size-4" />
              )}

              Previous experience
            </button>
          </div>

          <div
            className="
              max-h-[min(22rem,55dvh)]
              overflow-y-auto
              overscroll-contain p-2
            ">
            {entries.length > 0 ? (
              <div className="space-y-1">
                {entries
                  .slice(
                    0,
                    12
                  )
                  .map(
                    (
                      entry,
                      index
                    ) => (
                      <button
                        key={entry.id}
                        type="button"
                        aria-current={
                          index === 0
                            ? 'page'
                            : undefined
                        }
                        onClick={() => {
                          setHistoryOpen(
                            false
                          );

                          void jumpTo(
                            entry.id
                          );
                        }}
                        className={cn(
                          `
                            flex w-full
                            min-w-0 items-start
                            gap-3 rounded-xl
                            px-3 py-2.5
                            text-left transition
                            hover:bg-muted
                          `,
                          index === 0 &&
                            'bg-muted/60'
                        )}>
                        <span
                          className="
                            grid size-7 shrink-0
                            place-items-center
                            rounded-lg
                            bg-primary/10
                            text-[11px]
                            font-black
                            text-primary
                          ">
                          {index + 1}
                        </span>

                        <span className="min-w-0 flex-1">
                          <span
                            className="
                              flex items-center
                              gap-2
                            ">
                            <span
                              className="
                                block min-w-0
                                flex-1 truncate
                                text-xs font-semibold
                                text-foreground
                              ">
                              {entry.label}
                            </span>

                            {index === 0 ? (
                              <span
                                className="
                                  shrink-0 rounded-full
                                  bg-primary/10
                                  px-1.5 py-0.5
                                  text-[8px] font-black
                                  uppercase
                                  tracking-wide
                                  text-primary
                                ">
                                Current
                              </span>
                            ) : null}
                          </span>

                          <span
                            className="
                              mt-0.5 block
                              truncate text-[11px]
                              text-muted-foreground
                            ">
                            {entry.subtitle ??
                              entry.categorySlug.replaceAll(
                                '-',
                                ' '
                              )}
                          </span>
                        </span>

                        <span
                          className="
                            shrink-0 text-[10px]
                            text-muted-foreground
                          ">
                          {formatVisitedAt(
                            entry.visitedAt
                          )}
                        </span>
                      </button>
                    )
                  )}
              </div>
            ) : (
              <div className="p-4 text-center">
                <History className="mx-auto size-5 text-muted-foreground" />

                <p className="mt-2 text-xs font-semibold">
                  No experience history yet
                </p>

                <p
                  className="
                    mt-1 text-[10px]
                    leading-4
                    text-muted-foreground
                  ">
                  Meaningful pages and Store
                  experiences will appear here
                  as you move around AJ Logik.
                </p>
              </div>
            )}
          </div>

          {error ? (
            <p className="px-3 pb-2 text-[11px] text-destructive">
              {error}
            </p>
          ) : null}

          <div
            className="
              grid grid-cols-2 gap-2
              border-t border-border/60
              p-2
            ">
            <button
              type="button"
              disabled={
                entries.length === 0 ||
                loading
              }
              onClick={() => {
                setHistoryOpen(false);
                void startFresh();
              }}
              className="
                inline-flex items-center
                justify-center gap-2
                rounded-xl px-3 py-2
                text-[11px] font-semibold
                transition hover:bg-muted
                disabled:opacity-40
              ">
              <RotateCcw className="size-3.5" />
              Start fresh
            </button>

            <button
              type="button"
              disabled={
                entries.length === 0 ||
                loading
              }
              onClick={() => {
                setHistoryOpen(false);
                void clearHistory();
              }}
              className="
                inline-flex items-center
                justify-center gap-2
                rounded-xl px-3 py-2
                text-[11px] font-semibold
                text-destructive
                transition
                hover:bg-destructive/10
                disabled:opacity-40
              ">
              <Trash2 className="size-3.5" />
              Clear history
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
