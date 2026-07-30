'use client';

import { useEffect, useRef, useState } from 'react';

import {
  ArrowLeft,
  ChevronDown,
  History,
  LoaderCircle,
  RotateCcw,
  Trash2
} from 'lucide-react';

import { cn } from '@/lib/utils';

import { useExperienceStack } from './ExperienceStackProvider';

function formatVisitedAt(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleString('en-NG', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

export function ExperienceBackControl() {
  const { canGoBack, loading, goBack } = useExperienceStack();

  if (!canGoBack) {
    return null;
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => void goBack()}
      aria-label="Return to the previous experience"
      title="Back"
      className="pointer-events-auto inline-flex size-8 items-center justify-center rounded-full border border-border/75 bg-background/92 text-foreground shadow-md backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-muted hover:shadow-lg disabled:cursor-wait disabled:opacity-60 sm:size-9">
      {loading ? (
        <LoaderCircle className="size-3.5 animate-spin sm:size-4" />
      ) : (
        <ArrowLeft className="size-3.5 sm:size-4" />
      )}
    </button>
  );
}

export function ExperienceHistoryControl() {
  const {
    entries,
    loading,
    error,
    jumpTo,
    clearHistory,
    startFresh
  } = useExperienceStack();

  const [historyOpen, setHistoryOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!historyOpen) {
      return;
    }

    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setHistoryOpen(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setHistoryOpen(false);
      }
    };

    document.addEventListener('pointerdown', closeOnOutsidePointer);
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointer);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [historyOpen]);

  if (entries.length === 0) {
    return null;
  }

  return (
    <div ref={containerRef} className="relative flex flex-col items-center gap-1">
      <button
        type="button"
        aria-expanded={historyOpen}
        aria-haspopup="dialog"
        aria-label="Open experience history"
        title="Experience history"
        onClick={() => setHistoryOpen(current => !current)}
        className="relative grid size-9 place-items-center rounded-full border border-border/70 bg-background/75 text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground">
        <History className="size-4" />
        <span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-primary px-1 text-center text-[9px] font-black leading-4 text-primary-foreground">
          {Math.min(entries.length, 99)}
        </span>
      </button>

      <span className="hidden text-xs md:inline">History</span>

      {historyOpen ? (
        <div className="absolute right-0 top-[calc(100%+0.65rem)] z-[180] w-[min(24rem,calc(100vw-1rem))] overflow-hidden rounded-2xl border border-border/70 bg-background shadow-2xl">
          <div className="flex items-center justify-between gap-3 border-b border-border/60 px-3 py-2.5">
            <div className="min-w-0">
              <p className="text-xs font-bold">Experience history</p>
              <p className="text-[11px] text-muted-foreground">Jump back without losing context.</p>
            </div>
            <ChevronDown className={cn('size-4 shrink-0 transition', historyOpen && 'rotate-180')} />
          </div>

          <div className="max-h-[min(22rem,55dvh)] overflow-y-auto overscroll-contain p-2">
            <div className="space-y-1">
              {entries.slice(0, 12).map((entry, index) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => {
                    setHistoryOpen(false);
                    void jumpTo(entry.id);
                  }}
                  className="flex w-full min-w-0 items-start gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-muted">
                  <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-[11px] font-black text-primary">
                    {index + 1}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-semibold text-foreground">
                      {entry.label}
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                      {entry.subtitle ?? entry.categorySlug.replaceAll('-', ' ')}
                    </span>
                  </span>

                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    {formatVisitedAt(entry.visitedAt)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {error ? <p className="px-3 pb-2 text-[11px] text-destructive">{error}</p> : null}

          <div className="grid grid-cols-2 gap-2 border-t border-border/60 p-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setHistoryOpen(false);
                void startFresh();
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-[11px] font-semibold transition hover:bg-muted disabled:opacity-40">
              <RotateCcw className="size-3.5" />
              Start fresh
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setHistoryOpen(false);
                void clearHistory();
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-[11px] font-semibold text-destructive transition hover:bg-destructive/10 disabled:opacity-40">
              <Trash2 className="size-3.5" />
              Clear history
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
