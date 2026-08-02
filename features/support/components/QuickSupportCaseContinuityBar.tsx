'use client';

import Link from 'next/link';

import {
  ArrowRight,
  ChevronDown,
  History,
  MessageSquareText,
  Plus
} from 'lucide-react';

import {
  useMemo,
  useState
} from 'react';

import {
  cn
} from '@/lib/utils';

import {
  useQuickSupportSummary
} from '../client/useQuickSupportSummary';

import type {
  QuickSupportCaseContinuity
} from '../quickSupportTypes';

type QuickSupportCaseContinuityBarProps = {
  selectedCaseId:
    string |
    null;
  startingNew:
    boolean;
  onSelectCase:
    (
      caseId: string
    ) => void;
  onStartNew:
    () => void;
};

const relativeFormatter =
  new Intl.RelativeTimeFormat(
    'en',
    {
      numeric:
        'auto'
    }
  );

function activityLabel(
  value: string
): string {
  const milliseconds =
    Date.now() -
    new Date(
      value
    ).getTime();

  const minutes =
    Math.round(
      milliseconds /
        60_000
    );

  if (
    Math.abs(
      minutes
    ) <
    60
  ) {
    return relativeFormatter.format(
      -minutes,
      'minute'
    );
  }

  const hours =
    Math.round(
      minutes /
        60
    );

  if (
    Math.abs(
      hours
    ) <
    24
  ) {
    return relativeFormatter.format(
      -hours,
      'hour'
    );
  }

  const days =
    Math.round(
      hours /
        24
    );

  return relativeFormatter.format(
    -days,
    'day'
  );
}

function CaseButton({
  item,
  selected,
  onSelect
}: {
  item:
    QuickSupportCaseContinuity;
  selected:
    boolean;
  onSelect:
    () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onSelect
      }
      className={cn(
        'flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition',
        selected
          ? 'border-primary/35 bg-primary/8'
          : 'border-border/60 bg-background hover:border-primary/20 hover:bg-muted/30'
      )}>
      <span
        className={cn(
          'mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl',
          selected
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground'
        )}>
        <MessageSquareText className="size-3.5" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-[9px] font-black uppercase tracking-[0.12em] text-primary">
            {
              item.caseNumber
            }
          </span>

          {item.unreadCount >
          0 ? (
            <span className="grid min-h-4 min-w-4 shrink-0 place-items-center rounded-full bg-emerald-500 px-1 text-[8px] font-black text-white">
              {
                item.unreadCount >
                99
                  ? '99+'
                  : item.unreadCount
              }
            </span>
          ) : null}
        </span>

        <span className="mt-1 block truncate text-[11px] font-bold text-foreground">
          {
            item.subject
          }
        </span>

        <span className="mt-1 flex items-center justify-between gap-2 text-[8px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
          <span>
            {
              item.status.replaceAll(
                '_',
                ' '
              )
            }
          </span>

          <span className="normal-case tracking-normal">
            {
              activityLabel(
                item.lastMessageAt ??
                  item.updatedAt
              )
            }
          </span>
        </span>

        {item.lastMessagePreview ? (
          <span className="mt-1.5 line-clamp-1 block text-[9px] leading-4 text-muted-foreground">
            {
              item.lastMessagePreview
            }
          </span>
        ) : null}
      </span>
    </button>
  );
}

export function QuickSupportCaseContinuityBar({
  selectedCaseId,
  startingNew,
  onSelectCase,
  onStartNew
}: QuickSupportCaseContinuityBarProps) {
  const [
    open,
    setOpen
  ] =
    useState(false);

  const {
    summary,
    loading
  } =
    useQuickSupportSummary();

  const {
    activeCases,
    historyCases
  } =
    useMemo(
      () => ({
        activeCases:
          summary
            ?.recentCases
            .filter(
              item =>
                item.reusable
            ) ??
          [],
        historyCases:
          summary
            ?.recentCases
            .filter(
              item =>
                !item.reusable
            ) ??
          []
      }),
      [
        summary
      ]
    );

  if (
    loading &&
    !summary
  ) {
    return null;
  }

  if (
    !summary ||
    summary.totalCaseCount ===
      0
  ) {
    return null;
  }

  return (
    <section className="border-b border-border/60 bg-muted/15">
      <div className="flex items-center gap-2 p-2.5">
        <button
          type="button"
          aria-expanded={
            open
          }
          onClick={() =>
            setOpen(
              current =>
                !current
            )
          }
          className="inline-flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-border/60 bg-background px-3 py-2 text-left transition hover:border-primary/25">
          <History className="size-3.5 shrink-0 text-primary" />

          <span className="min-w-0 flex-1">
            <span className="block text-[8px] font-black uppercase tracking-[0.13em] text-muted-foreground">
              Support conversations
            </span>

            <span className="mt-0.5 block truncate text-[10px] font-bold">
              {
                startingNew
                  ? 'Preparing another conversation'
                  : selectedCaseId
                    ? 'Switch or review a case'
                    : `${summary.totalCaseCount} saved ${summary.totalCaseCount === 1 ? 'case' : 'cases'}`
              }
            </span>
          </span>

          {summary.unreadCount >
          0 ? (
            <span className="grid min-h-5 min-w-5 shrink-0 place-items-center rounded-full bg-emerald-500 px-1 text-[8px] font-black text-white">
              {
                summary.unreadCount >
                99
                  ? '99+'
                  : summary.unreadCount
              }
            </span>
          ) : null}

          <ChevronDown
            className={cn(
              'size-3.5 shrink-0 transition',
              open &&
                'rotate-180'
            )}
          />
        </button>

        <button
          type="button"
          title="Start another Support conversation"
          aria-label="Start another Support conversation"
          onClick={() => {
            onStartNew();

            setOpen(
              false
            );
          }}
          className={cn(
            'grid size-10 shrink-0 place-items-center rounded-xl border transition',
            startingNew
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border/60 bg-background text-primary hover:border-primary/30 hover:bg-primary/5'
          )}>
          <Plus className="size-4" />
        </button>
      </div>

      {open ? (
        <div className="space-y-4 border-t border-border/50 p-3">
          {activeCases.length >
          0 ? (
            <div>
              <p className="mb-2 text-[8px] font-black uppercase tracking-[0.14em] text-muted-foreground">
                Active cases
              </p>

              <div className="space-y-2">
                {
                  activeCases.map(
                    item => (
                      <CaseButton
                        key={
                          item.id
                        }
                        item={
                          item
                        }
                        selected={
                          item.id ===
                            selectedCaseId &&
                          !startingNew
                        }
                        onSelect={() => {
                          onSelectCase(
                            item.id
                          );

                          setOpen(
                            false
                          );
                        }}
                      />
                    )
                  )
                }
              </div>
            </div>
          ) : null}

          {historyCases.length >
          0 ? (
            <div>
              <p className="mb-2 text-[8px] font-black uppercase tracking-[0.14em] text-muted-foreground">
                Resolution history
              </p>

              <div className="space-y-2">
                {
                  historyCases.map(
                    item => (
                      <CaseButton
                        key={
                          item.id
                        }
                        item={
                          item
                        }
                        selected={
                          item.id ===
                            selectedCaseId &&
                          !startingNew
                        }
                        onSelect={() => {
                          onSelectCase(
                            item.id
                          );

                          setOpen(
                            false
                          );
                        }}
                      />
                    )
                  )
                }
              </div>
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-3 border-t border-border/50 pt-3">
            <span className="text-[9px] text-muted-foreground">
              Showing {
                summary
                  .recentCases
                  .length
              } recent of {
                summary.totalCaseCount
              }
            </span>

            <Link
              href="/support"
              className="inline-flex items-center gap-1.5 text-[9px] font-black text-primary">
              Full Support history
              <ArrowRight className="size-3" />
            </Link>
          </div>
        </div>
      ) : null}
    </section>
  );
}
