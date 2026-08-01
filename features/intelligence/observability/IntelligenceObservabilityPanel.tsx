'use client';

import { Activity, CheckCircle2, Clock3, RefreshCw, RotateCcw, TriangleAlert } from 'lucide-react';
import type { IntelligenceClientScope } from '../client';
import { useIntelligenceObservability } from './useIntelligenceObservability';

export function IntelligenceObservabilityPanel({ scope }: { scope: IntelligenceClientScope }) {
  const { summary, loading, refresh } = useIntelligenceObservability(scope);
  if (scope.audience !== 'admin') return null;
  return (
    <section className="mb-4 rounded-[1.75rem] border bg-card p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div><p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-primary"><Activity className="size-4" />Intelligence health</p><p className="mt-1 text-[9px] text-muted-foreground">Provider and Resolution performance during the last 24 hours.</p></div>
        <button type="button" disabled={loading} onClick={() => void refresh()} className="grid size-9 place-items-center rounded-full border disabled:opacity-40"><RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} /></button>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
        <Metric icon={Activity} label="Provider runs" value={summary?.providerRuns ?? 0} />
        <Metric icon={CheckCircle2} label="Successful" value={summary?.successfulRuns ?? 0} />
        <Metric icon={TriangleAlert} label="Failed" value={summary?.failedRuns ?? 0} />
        <Metric icon={RotateCcw} label="Fallbacks" value={summary?.fallbackRuns ?? 0} />
        <Metric icon={Clock3} label="Avg latency" value={`${summary?.averageLatencyMs ?? 0}ms`} />
        <Metric icon={CheckCircle2} label="Resolved" value={summary?.resolutionsCompleted ?? 0} />
      </div>
    </section>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Activity; label: string; value: string | number }) {
  return <div className="rounded-2xl border border-border/60 bg-background/55 p-3"><Icon className="size-3.5 text-primary" /><p className="mt-2 text-lg font-black">{value}</p><p className="text-[8px] font-black uppercase tracking-[0.12em] text-muted-foreground">{label}</p></div>;
}
