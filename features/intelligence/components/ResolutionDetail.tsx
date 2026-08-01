'use client';

import {
  Archive,
  CheckCircle2,
  CircleAlert,
  ExternalLink,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
  ThumbsDown
} from 'lucide-react';

import type {
  IntelligencePreparedAction,
  IntelligenceResolution
} from '../domain';

import {
  ResolutionStatusBadge
} from './ResolutionStatusBadge';

type ResolutionDetailProps = {
  resolution:
    IntelligenceResolution;
  mutating:
    boolean;
  onAction(
    actionId:
      string,
    operation:
      'approve' |
      'apply'
  ): void;
  onDismiss(): void;
  onArchive(): void;
};

export function ResolutionDetail({
  resolution,
  mutating,
  onAction,
  onDismiss,
  onArchive
}: ResolutionDetailProps) {
  return (
    <article className="space-y-4">
      <header className="rounded-[1.75rem] border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <ResolutionStatusBadge
              status={
                resolution.status
              }
            />

            <h2 className="mt-3 text-xl font-black tracking-tight sm:text-2xl">
              {
                resolution.title
              }
            </h2>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {
                resolution.objective
              }
            </p>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-3xl font-black text-primary">
              {
                resolution.completion
              }%
            </p>

            <p className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
              resolved
            </p>
          </div>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{
              width:
                `${resolution.completion}%`
            }}
          />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Metric
            label="Confidence"
            value={
              `${Math.round(
                resolution.confidence *
                100
              )}%`
            }
          />

          <Metric
            label="Risk"
            value={
              resolution.riskLevel
            }
          />

          <Metric
            label="Expected outcome"
            value={
              resolution.expectedOutcome
            }
          />
        </div>
      </header>

      {resolution.blockedReason ? (
        <section className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4">
          <p className="flex items-center gap-2 text-xs font-black text-destructive">
            <CircleAlert className="size-4" />

            Resolution blocked
          </p>

          <p className="mt-2 text-xs leading-5 text-destructive/80">
            {
              resolution.blockedReason
            }
          </p>
        </section>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="Plan"
          icon={
            Sparkles
          }>
          <p className="text-xs leading-5 text-muted-foreground">
            {
              resolution.plan.summary
            }
          </p>

          <ol className="mt-3 space-y-2">
            {resolution.plan.steps.map(
              step => (
                <li
                  key={
                    step.id
                  }
                  className="flex gap-3 rounded-xl border border-border/50 bg-background/50 p-3">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-[9px] font-black text-primary">
                    {
                      step.order
                    }
                  </span>

                  <div>
                    <p className="text-[11px] font-black">
                      {
                        step.title
                      }
                    </p>

                    {step.description ? (
                      <p className="mt-1 text-[9px] leading-4 text-muted-foreground">
                        {
                          step.description
                        }
                      </p>
                    ) : null}
                  </div>
                </li>
              )
            )}
          </ol>
        </Panel>

        <Panel
          title="Recommendations"
          icon={
            CheckCircle2
          }>
          <div className="space-y-2">
            {resolution.recommendations.length ? (
              resolution.recommendations.map(
                recommendation => (
                  <div
                    key={
                      recommendation.id
                    }
                    className="rounded-xl border border-border/50 bg-background/50 p-3">
                    <p className="text-[11px] font-black">
                      {
                        recommendation.title
                      }
                    </p>

                    <p className="mt-1 text-[9px] leading-4 text-muted-foreground">
                      {
                        recommendation.rationale
                      }
                    </p>
                  </div>
                )
              )
            ) : (
              <p className="text-[10px] text-muted-foreground">
                Recommendations will appear as context is resolved.
              </p>
            )}
          </div>
        </Panel>
      </section>

      {resolution.preparedActions.length ? (
        <Panel
          title="Prepared actions"
          icon={
            ShieldCheck
          }>
          <div className="grid gap-3 lg:grid-cols-2">
            {resolution.preparedActions.map(
              action => (
                <PreparedActionCard
                  key={
                    action.id
                  }
                  action={
                    action
                  }
                  mutating={
                    mutating
                  }
                  onAction={
                    onAction
                  }
                />
              )
            )}
          </div>
        </Panel>
      ) : null}

      <Panel
        title="Resolution updates"
        icon={
          CheckCircle2
        }>
        <div className="space-y-3">
          {[...resolution.updates]
            .reverse()
            .map(
              update => (
                <div
                  key={
                    update.id
                  }
                  className="flex gap-3">
                  <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />

                  <div className="min-w-0">
                    <p className="text-[11px] font-black">
                      {
                        update.title
                      }
                    </p>

                    {update.detail ? (
                      <p className="mt-1 text-[9px] leading-4 text-muted-foreground">
                        {
                          update.detail
                        }
                      </p>
                    ) : null}

                    <p className="mt-1 text-[8px] text-muted-foreground">
                      {new Date(
                        update.createdAt
                      ).toLocaleString(
                        'en-NG'
                      )}
                    </p>
                  </div>
                </div>
              )
            )}
        </div>
      </Panel>

      <footer className="flex flex-wrap justify-end gap-2">
        {resolution.status !==
          'DISMISSED' &&
        resolution.status !==
          'ARCHIVED' &&
        resolution.status !==
          'APPLIED' ? (
          <button
            type="button"
            disabled={
              mutating
            }
            onClick={
              onDismiss
            }
            className="inline-flex h-10 items-center gap-2 rounded-full border px-4 text-[10px] font-black">
            <ThumbsDown className="size-3.5" />

            Dismiss
          </button>
        ) : null}

        {resolution.status ===
          'APPLIED' ||
        resolution.status ===
          'DISMISSED' ? (
          <button
            type="button"
            disabled={
              mutating
            }
            onClick={
              onArchive
            }
            className="inline-flex h-10 items-center gap-2 rounded-full border px-4 text-[10px] font-black">
            <Archive className="size-3.5" />

            Archive
          </button>
        ) : null}
      </footer>
    </article>
  );
}

function Metric({
  label,
  value
}: {
  label:
    string;
  value:
    string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/55 p-3">
      <p className="text-[8px] font-black uppercase tracking-[0.14em] text-muted-foreground">
        {
          label
        }
      </p>

      <p className="mt-1 line-clamp-3 text-[11px] font-black leading-5">
        {
          value
        }
      </p>
    </div>
  );
}

function Panel({
  title,
  icon:
    Icon,
  children
}: {
  title:
    string;
  icon:
    typeof Sparkles;
  children:
    React.ReactNode;
}) {
  return (
    <section className="rounded-[1.75rem] border bg-card p-4 shadow-sm sm:p-5">
      <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-primary">
        <Icon className="size-4" />

        {
          title
        }
      </p>

      <div className="mt-4">
        {
          children
        }
      </div>
    </section>
  );
}

function PreparedActionCard({
  action,
  mutating,
  onAction
}: {
  action:
    IntelligencePreparedAction;
  mutating:
    boolean;
  onAction(
    actionId:
      string,
    operation:
      'approve' |
      'apply'
  ): void;
}) {
  const needsApproval =
    action.status ===
      'AWAITING_APPROVAL' ||
    action.status ===
      'AWAITING_CONFIRMATION';

  const canApply =
    action.status ===
      'APPROVED' ||
    action.status ===
      'PREPARED';

  return (
    <div className="rounded-2xl border border-border/60 bg-background/55 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black">
            {
              action.label
            }
          </p>

          <p className="mt-1 text-[9px] leading-4 text-muted-foreground">
            {
              action.description
            }
          </p>
        </div>

        <span className="rounded-full border px-2 py-1 text-[8px] font-black">
          {
            action.status
          }
        </span>
      </div>

      {action.error ? (
        <p className="mt-3 rounded-xl bg-destructive/8 p-2 text-[9px] text-destructive">
          {
            action.error
          }
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        {needsApproval ? (
          <button
            type="button"
            disabled={
              mutating
            }
            onClick={() =>
              onAction(
                action.id,
                'approve'
              )
            }
            className="inline-flex h-9 items-center gap-2 rounded-full bg-primary px-3 text-[9px] font-black text-primary-foreground">
            {mutating ? (
              <LoaderCircle className="size-3 animate-spin" />
            ) : (
              <ShieldCheck className="size-3" />
            )}

            {action.status ===
            'AWAITING_APPROVAL'
              ? 'Approve'
              : 'Confirm'}
          </button>
        ) : null}

        {canApply ? (
          <button
            type="button"
            disabled={
              mutating
            }
            onClick={() =>
              onAction(
                action.id,
                'apply'
              )
            }
            className="inline-flex h-9 items-center gap-2 rounded-full border px-3 text-[9px] font-black">
            <ExternalLink className="size-3" />

            Apply
          </button>
        ) : null}
      </div>
    </div>
  );
}
