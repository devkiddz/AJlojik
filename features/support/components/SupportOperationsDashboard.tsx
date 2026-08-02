import Link from 'next/link';
import {
  AlertTriangle,
  BrainCircuit,
  Clock3,
  Headphones,
  ShieldCheck,
  UserRoundX
} from 'lucide-react';

import type {
  SupportOperationsOverview
} from '../supportIntelligenceTypes';

const dateFormatter =
  new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

export function SupportOperationsDashboard({
  snapshot
}: {
  snapshot: SupportOperationsOverview;
}) {
  return (
    <main className="min-h-dvh px-3 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[96rem] space-y-5">
        <header className="rounded-[2rem] border border-border/60 bg-slate-950 p-5 text-white shadow-xl sm:p-8">
          <div className="flex items-start gap-4">
            <span className="grid size-12 place-items-center rounded-2xl bg-white/10 text-violet-200">
              <BrainCircuit className="size-5" />
            </span>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-200">
                Support Intelligence
              </p>
              <h1 className="mt-3 text-3xl font-black sm:text-5xl">
                Operations overview
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">
                Review queue health, SLA pressure,
                assignments and governed commerce
                actions without crossing workspace
                boundaries.
              </p>
            </div>
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <Metric
            icon={Headphones}
            label="Open"
            value={snapshot.totals.openCases}
          />
          <Metric
            icon={AlertTriangle}
            label="Urgent"
            value={snapshot.totals.urgentCases}
          />
          <Metric
            icon={Clock3}
            label="Overdue"
            value={snapshot.totals.overdueCases}
          />
          <Metric
            icon={UserRoundX}
            label="Unassigned"
            value={snapshot.totals.unassignedCases}
          />
          <Metric
            icon={ShieldCheck}
            label="Prepared"
            value={snapshot.totals.preparedActions}
          />
          <Metric
            icon={ShieldCheck}
            label="Approved"
            value={snapshot.totals.approvedActions}
          />
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]">
          <div className="rounded-[2rem] border border-border/60 bg-card p-4 shadow-sm sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-black">
                  Recent Support Cases
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Ordered by latest operational change.
                </p>
              </div>
              <Link
                href="/admin/support"
                className="rounded-full border border-border px-4 py-2 text-[10px] font-bold">
                Open queue
              </Link>
            </div>

            <div className="mt-4 space-y-2">
              {snapshot.recentCases.map(
                item => (
                  <Link
                    key={item.id}
                    href={`/admin/support/${encodeURIComponent(
                      item.id
                    )}`}
                    className="block rounded-2xl border border-border/60 bg-background/50 p-3 transition hover:bg-muted/60">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-black">
                          {item.caseNumber} · {item.subject}
                        </p>
                        <p className="mt-1 truncate text-[10px] text-muted-foreground">
                          {item.customerName} · {item.assignedAgentName ?? 'Unassigned'}
                        </p>
                      </div>
                      <span className="rounded-full bg-muted px-2 py-1 text-[9px] font-black">
                        {item.priority}
                      </span>
                    </div>
                    <p className="mt-2 text-[9px] text-muted-foreground">
                      {item.status.replaceAll('_', ' ')} · {dateFormatter.format(new Date(item.updatedAt))}
                    </p>
                  </Link>
                )
              )}
            </div>
          </div>

          <aside className="space-y-5">
            <section className="rounded-[2rem] border border-border/60 bg-card p-5 shadow-sm">
              <h2 className="font-black">
                Agent load
              </h2>
              <div className="mt-4 space-y-2">
                {snapshot.agentLoad.map(
                  item => (
                    <div
                      key={item.agentId ?? 'UNASSIGNED'}
                      className="flex items-center justify-between rounded-2xl bg-muted/45 px-3 py-2.5">
                      <span className="truncate text-xs font-bold">
                        {item.agentName}
                      </span>
                      <span className="rounded-full bg-background px-2 py-1 text-[9px] font-black">
                        {item.activeCases}
                      </span>
                    </div>
                  )
                )}
              </div>
            </section>

            <section className="rounded-[2rem] border border-border/60 bg-card p-5 shadow-sm">
              <h2 className="font-black">
                Case states
              </h2>
              <div className="mt-4 space-y-2">
                {Object.entries(
                  snapshot.byStatus
                ).map(([status, value]) => (
                  <div
                    key={status}
                    className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {status.replaceAll('_', ' ')}
                    </span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}

function Metric({
  icon: Icon,
  label,
  value
}: {
  icon: typeof Headphones;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-[1.5rem] border border-border/60 bg-card p-4 shadow-sm">
      <Icon className="size-4 text-primary" />
      <p className="mt-4 text-2xl font-black">
        {value}
      </p>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
