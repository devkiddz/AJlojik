'use client';

import { useState } from 'react';

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

type ExperienceNavigationControlsProps = {
  compact?: boolean;
};

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

export function ExperienceNavigationControls({
  compact = false
}: ExperienceNavigationControlsProps) {
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

  const [historyOpen, setHistoryOpen] = useState(false);

  if (compact) {
    return (
      <button
        type="button"
        disabled={!canGoBack || loading}
        onClick={() => void goBack()}
        aria-label="Go back to the previous experience"
        title={canGoBack ? 'Go back' : 'No previous experience'}
        className="grid size-9 place-items-center rounded-xl border border-border/70 bg-background/80 text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40">
        {loading ? <LoaderCircle className="size-4 animate-spin" /> : <ArrowLeft className="size-4" />}
      </button>
    );
  }

  return (
    <div className="relative mt-4">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
        <button
          type="button"
          disabled={!canGoBack || loading}
          onClick={() => void goBack()}
          className="inline-flex min-w-0 items-center justify-center gap-2 rounded-xl border border-border/70 bg-background/80 px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40">
          {loading ? <LoaderCircle className="size-3.5 animate-spin" /> : <ArrowLeft className="size-3.5" />}
          Go back
        </button>

        <button
          type="button"
          aria-expanded={historyOpen}
          aria-label="Open experience history"
          onClick={() => setHistoryOpen(current => !current)}
          className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-background/80 px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-muted">
          <History className="size-3.5" />
          <span className="hidden sm:inline">History</span>
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px]">{entries.length}</span>
          <ChevronDown className={cn('size-3 transition', historyOpen && 'rotate-180')} />
        </button>
      </div>

      {error ? <p className="mt-2 text-[10px] leading-4 text-destructive">{error}</p> : null}

      {historyOpen ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-[90] overflow-hidden rounded-2xl border border-border/70 bg-background shadow-2xl">
          <div className="max-h-72 overflow-y-auto p-2">
            {entries.length > 0 ? (
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
                    <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-[10px] font-black text-primary">
                      {index + 1}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-semibold text-foreground">
                        {entry.label}
                      </span>
                      <span className="mt-0.5 block truncate text-[10px] text-muted-foreground">
                        {entry.subtitle ?? entry.categorySlug.replaceAll('-', ' ')}
                      </span>
                    </span>

                    <span className="shrink-0 text-[9px] text-muted-foreground">
                      {formatVisitedAt(entry.visitedAt)}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center">
                <History className="mx-auto size-5 text-muted-foreground" />
                <p className="mt-2 text-xs font-semibold">No experience history yet</p>
                <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
                  Meaningful pages and Store experiences will appear here as you move around AJ Logik.
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 border-t border-border/60 p-2">
            <button
              type="button"
              disabled={entries.length === 0 || loading}
              onClick={() => {
                setHistoryOpen(false);
                void startFresh();
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-[10px] font-semibold transition hover:bg-muted disabled:opacity-40">
              <RotateCcw className="size-3.5" />
              Start fresh
            </button>

            <button
              type="button"
              disabled={entries.length === 0 || loading}
              onClick={() => {
                setHistoryOpen(false);
                void clearHistory();
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-[10px] font-semibold text-destructive transition hover:bg-destructive/10 disabled:opacity-40">
              <Trash2 className="size-3.5" />
              Clear history
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
