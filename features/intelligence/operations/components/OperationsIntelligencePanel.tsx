'use client';

import Link from 'next/link';

import {
  ArrowRight,
  BrainCircuit,
  CircleAlert,
  LoaderCircle,
  RefreshCw,
  Sparkles
} from 'lucide-react';

import type {
  IntelligenceResolutionType
} from '../../domain';

import type {
  IntelligenceClientScope
} from '../../client';

import {
  useOperationsIntelligence
} from '../client/useOperationsIntelligence';

type OperationsIntelligencePanelProps = {
  scope:
    IntelligenceClientScope;
  mutating:
    boolean;
  onStart(
    input: {
      type:
        IntelligenceResolutionType;
      title:
        string;
      objective:
        string;
      expectedOutcome:
        string;
    }
  ): void;
};

export function OperationsIntelligencePanel({
  scope,
  mutating,
  onStart
}: OperationsIntelligencePanelProps) {
  const {
    snapshot,
    loading,
    error,
    refresh
  } =
    useOperationsIntelligence(
      scope
    );

  if (
    scope.audience ===
    'customer'
  ) {
    return null;
  }

  return (
    <section className="mb-4 rounded-[1.75rem] border border-primary/15 bg-gradient-to-br from-primary/8 via-card to-background p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <BrainCircuit className="size-4" />
          </span>

          <div>
            <p className="text-sm font-black">
              {
                snapshot?.headline ??
                (
                  scope.audience ===
                  'admin'
                    ? 'Workspace operations'
                    : 'Vendor operations'
                )
              }
            </p>

            <p className="mt-0.5 max-w-2xl text-[10px] leading-4 text-muted-foreground">
              {
                snapshot?.summary ??
                'RCENTZ Intelligence is reading the current operational state.'
              }
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={
            loading
          }
          onClick={() =>
            void refresh()
          }
          className="grid size-9 shrink-0 place-items-center rounded-full border disabled:opacity-40"
          aria-label="Refresh operational intelligence">
          <RefreshCw className={`size-3.5 ${
            loading
              ? 'animate-spin'
              : ''
          }`} />
        </button>
      </div>

      {error ? (
        <div className="mt-4 flex items-start gap-2 rounded-2xl border border-destructive/20 bg-destructive/5 p-3 text-[10px] text-destructive">
          <CircleAlert className="mt-0.5 size-3.5 shrink-0" />

          {
            error
          }
        </div>
      ) : null}

      {loading &&
      !snapshot ? (
        <div className="grid min-h-32 place-items-center">
          <LoaderCircle className="size-5 animate-spin text-primary" />
        </div>
      ) : null}

      {snapshot ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
          {snapshot.signals.map(
            signal => (
              <article
                key={
                  signal.id
                }
                className="rounded-2xl border border-border/60 bg-background/65 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black">
                      {
                        signal.title
                      }
                    </p>

                    <p className="mt-1 text-[9px] leading-4 text-muted-foreground">
                      {
                        signal.description
                      }
                    </p>
                  </div>

                  <span className={`grid size-9 shrink-0 place-items-center rounded-2xl text-sm font-black ${
                    signal.tone ===
                    'critical'
                      ? 'bg-destructive/10 text-destructive'
                      : signal.tone ===
                          'attention'
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                        : signal.tone ===
                            'positive'
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                          : 'bg-primary/10 text-primary'
                  }`}>
                    {
                      signal.count
                    }
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={
                      mutating
                    }
                    onClick={() =>
                      onStart({
                        type:
                          signal.resolutionType,
                        title:
                          signal.resolutionTitle,
                        objective:
                          signal.resolutionObjective,
                        expectedOutcome:
                          signal.expectedOutcome
                      })
                    }
                    className="inline-flex h-9 items-center gap-2 rounded-full bg-primary px-3 text-[9px] font-black text-primary-foreground disabled:opacity-40">
                    <Sparkles className="size-3" />

                    Resolve
                  </button>

                  <Link
                    href={
                      signal.href
                    }
                    className="inline-flex h-9 items-center gap-2 rounded-full border px-3 text-[9px] font-black">
                    Open workspace

                    <ArrowRight className="size-3" />
                  </Link>
                </div>
              </article>
            )
          )}
        </div>
      ) : null}
    </section>
  );
}
