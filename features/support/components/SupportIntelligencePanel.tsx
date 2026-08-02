'use client';

import {
  BrainCircuit,
  Check,
  Clipboard,
  LoaderCircle,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import {
  useCallback,
  useState,
  useTransition
} from 'react';

import { cn } from '@/lib/utils';

import type {
  SupportIntelligenceSnapshot
} from '../supportIntelligenceTypes';

export function SupportIntelligencePanel({
  caseId
}: {
  caseId: string;
}) {
  const [snapshot, setSnapshot] =
    useState<SupportIntelligenceSnapshot | null>(
      null
    );
  const [error, setError] =
    useState<string | null>(null);
  const [copied, setCopied] =
    useState(false);
  const [isPending, startTransition] =
    useTransition();

  const generate = useCallback(() => {
    startTransition(async () => {
      try {
        const response = await fetch(
          `/api/admin/support/cases/${encodeURIComponent(
            caseId
          )}/intelligence`,
          {
            credentials: 'same-origin',
            cache: 'no-store'
          }
        );

        const payload =
          (await response.json()) as
            | SupportIntelligenceSnapshot
            | { error?: string };

        if (
          !response.ok ||
          !('provider' in payload)
        ) {
          throw new Error(
            'error' in payload &&
            payload.error
              ? payload.error
              : 'RCENTZ Support Intelligence could not analyse this case.'
          );
        }

        setSnapshot(payload);
        setError(null);
        setCopied(false);
      } catch (cause) {
        setError(
          cause instanceof Error
            ? cause.message
            : 'RCENTZ Support Intelligence could not analyse this case.'
        );
      }
    });
  }, [caseId]);

  const copyDraft = async () => {
    if (!snapshot) return;

    await navigator.clipboard.writeText(
      snapshot.draftReply
    );
    setCopied(true);
  };

  return (
    <section className="space-y-4 rounded-[1.5rem] border border-violet-500/20 bg-violet-500/[0.035] p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-xl bg-violet-500/15 text-violet-700 dark:text-violet-300">
            <BrainCircuit className="size-4" />
          </span>
          <div>
            <h2 className="text-sm font-black">
              RCENTZ Intelligence
            </h2>
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              Case-scoped assistance only
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={generate}
          disabled={isPending}
          className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-background px-3 text-[10px] font-bold disabled:opacity-40">
          {isPending ? (
            <LoaderCircle className="size-3 animate-spin" />
          ) : (
            <RefreshCw className="size-3" />
          )}
          Analyse
        </button>
      </div>

      {error ? (
        <p className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-[11px] leading-5 text-destructive">
          {error}
        </p>
      ) : null}

      {!snapshot ? (
        <p className="rounded-2xl border border-dashed border-violet-500/25 p-4 text-[11px] leading-5 text-muted-foreground">
          Generate a deterministic summary,
          risk review and draft response from
          the verified case context.
        </p>
      ) : (
        <>
          <div className="rounded-2xl bg-background/65 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">
                Risk
              </p>
              <span
                className={cn(
                  'rounded-full px-2 py-1 text-[9px] font-black',
                  snapshot.risk.level ===
                    'CRITICAL' ||
                    snapshot.risk.level ===
                      'HIGH'
                    ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                    : snapshot.risk.level ===
                        'MEDIUM'
                      ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                      : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                )}>
                {snapshot.risk.level}
              </span>
            </div>
            <p className="mt-3 text-xs font-bold leading-5">
              {snapshot.executiveSummary}
            </p>
            <ul className="mt-3 space-y-1 text-[10px] leading-4 text-muted-foreground">
              {snapshot.risk.reasons.map(
                reason => (
                  <li key={reason}>
                    • {reason}
                  </li>
                )
              )}
            </ul>
          </div>

          <div className="rounded-2xl bg-background/65 p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">
              Draft reply
            </p>
            <p className="mt-3 whitespace-pre-wrap text-[11px] leading-5">
              {snapshot.draftReply}
            </p>
            <button
              type="button"
              onClick={() =>
                void copyDraft()
              }
              className="mt-3 inline-flex h-9 items-center gap-2 rounded-full bg-foreground px-4 text-[10px] font-bold text-background">
              {copied ? (
                <Check className="size-3" />
              ) : (
                <Clipboard className="size-3" />
              )}
              {copied
                ? 'Copied'
                : 'Copy draft'}
            </button>
          </div>

          <div className="rounded-2xl border border-violet-500/20 bg-background/55 p-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-3.5 text-violet-600" />
              <p className="text-[10px] font-black uppercase tracking-[0.14em]">
                Guardrails
              </p>
            </div>
            <ul className="mt-3 space-y-1 text-[10px] leading-4 text-muted-foreground">
              {snapshot.guardrails.map(
                guardrail => (
                  <li key={guardrail}>
                    • {guardrail}
                  </li>
                )
              )}
            </ul>
          </div>
        </>
      )}
    </section>
  );
}
