import Link from 'next/link';
import {
  Activity,
  BellRing,
  Clock3,
  Headphones,
  MessageCircle,
  ShieldCheck,
  Star
} from 'lucide-react';

import type {
  SupportAnalyticsSnapshot
} from '../supportAnalyticsTypes';

const dateFormatter =
  new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

export function SupportAnalyticsDashboard({
  snapshot
}: {
  snapshot: SupportAnalyticsSnapshot;
}) {
  const metrics = [
    {
      label: 'Total cases',
      value:
        snapshot.metrics.totalCases,
      icon: Headphones
    },
    {
      label: 'Open cases',
      value:
        snapshot.metrics.openCases,
      icon: Activity
    },
    {
      label: 'Overdue',
      value:
        snapshot.metrics.overdueCases,
      icon: Clock3
    },
    {
      label: 'First response',
      value:
        `${snapshot.metrics.averageFirstResponseMinutes}m`,
      icon: Clock3
    },
    {
      label: 'Resolution',
      value:
        `${snapshot.metrics.averageResolutionHours}h`,
      icon: ShieldCheck
    },
    {
      label: 'Rating',
      value:
        `${snapshot.metrics.averageRating}/5`,
      icon: Star
    },
    {
      label: 'Support alerts',
      value:
        snapshot.metrics.supportNotifications,
      icon: BellRing
    },
    {
      label: 'Inbox alerts',
      value:
        snapshot.metrics.communicationNotifications,
      icon: MessageCircle
    }
  ];

  return (
    <main className="min-h-dvh px-3 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[96rem] space-y-5">
        <header className="rounded-[2rem] border border-border/60 bg-slate-950 p-5 text-white shadow-xl sm:p-8">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-200">
            Production observability
          </p>
          <h1 className="mt-3 text-3xl font-black sm:text-5xl">
            Support analytics & audit
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">
            Metrics are derived from persistent
            Support, Communication and Notification
            records. The timeline preserves the
            operational actor and case boundary.
          </p>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map(item => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="rounded-[1.5rem] border border-border/60 bg-card p-4 shadow-sm">
                <Icon className="size-4 text-primary" />
                <p className="mt-4 text-2xl font-black">
                  {item.value}
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  {item.label}
                </p>
              </div>
            );
          })}
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
          <div className="space-y-5">
            <Distribution
              title="By category"
              values={snapshot.byCategory}
            />
            <Distribution
              title="By priority"
              values={snapshot.byPriority}
            />
            <Link
              href="/admin/support/operations"
              className="flex h-12 items-center justify-center rounded-full bg-foreground px-5 text-xs font-black text-background">
              Open operations overview
            </Link>
          </div>

          <div className="rounded-[2rem] border border-border/60 bg-card p-4 shadow-sm sm:p-5">
            <h2 className="font-black">
              Audit timeline
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Status, assignment, escalation,
              resolution, commerce-action and
              feedback records.
            </p>

            <div className="mt-4 space-y-2">
              {snapshot.auditTimeline.map(
                item => (
                  <Link
                    key={item.id}
                    href={`/admin/support/${encodeURIComponent(
                      item.caseId
                    )}`}
                    className="block rounded-2xl border border-border/60 bg-background/50 p-3 transition hover:bg-muted/60">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-black">
                          {item.caseNumber} · {item.type.replaceAll('_', ' ')}
                        </p>
                        <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-muted-foreground">
                          {item.summary}
                        </p>
                      </div>
                      <span className="shrink-0 text-[9px] text-muted-foreground">
                        {dateFormatter.format(
                          new Date(
                            item.createdAt
                          )
                        )}
                      </span>
                    </div>
                    <p className="mt-2 text-[9px] font-bold text-muted-foreground">
                      {item.actorName ??
                        'System'}
                    </p>
                  </Link>
                )
              )}

              {!snapshot.auditTimeline.length ? (
                <p className="rounded-2xl border border-dashed border-border/70 p-5 text-center text-xs text-muted-foreground">
                  No Support audit records yet.
                </p>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Distribution({
  title,
  values
}: {
  title: string;
  values: Record<string, number>;
}) {
  return (
    <section className="rounded-[2rem] border border-border/60 bg-card p-5 shadow-sm">
      <h2 className="font-black">
        {title}
      </h2>
      <div className="mt-4 space-y-2">
        {Object.entries(values).map(
          ([label, value]) => (
            <div
              key={label}
              className="flex items-center justify-between rounded-2xl bg-muted/45 px-3 py-2.5">
              <span className="text-xs text-muted-foreground">
                {label.replaceAll(
                  '_',
                  ' '
                )}
              </span>
              <strong className="text-xs">
                {value}
              </strong>
            </div>
          )
        )}
      </div>
    </section>
  );
}
