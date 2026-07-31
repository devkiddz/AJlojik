'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { AlertTriangle, Search, ShieldCheck } from 'lucide-react';

import type {
  ApprovalOperationsItem,
  ApprovalReviewerOption
} from '@/features/admin/approvals/approvalTypes';

import { StudioSelectField } from '@/features/studio-controls';

import { ApprovalInspectionDialog } from './ApprovalInspectionDialog';

const statuses = ['ALL', 'PENDING', 'IN_INSPECTION', 'ON_HOLD', 'CHANGES_REQUESTED', 'APPROVED', 'EXECUTED', 'PAUSED', 'REJECTED', 'EXPIRED', 'REVERTED', 'CANCELLED'] as const;
const sources = ['ALL', 'CUSTOMER', 'VENDOR', 'ADMIN', 'SYSTEM'] as const;

export function ApprovalOperationsDashboard({
  items,
  reviewers,
  canReview,
  nowTimestamp
}: {
  items: ApprovalOperationsItem[];
  reviewers: ApprovalReviewerOption[];
  canReview: boolean;
  nowTimestamp: number;
}) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<(typeof statuses)[number]>('ALL');
  const [source, setSource] = useState<(typeof sources)[number]>('ALL');

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return items.filter(item => {
      if (status !== 'ALL' && item.status !== status) return false;
      if (source !== 'ALL' && item.source !== source) return false;
      if (!normalized) return true;
      return [item.reason, item.inspection.title, item.targetType, item.action, item.requestedBy.name, item.requestedBy.email]
        .join(' ')
        .toLowerCase()
        .includes(normalized);
    });
  }, [items, query, source, status]);

  return (
    <section className="space-y-4">
      <div className="rounded-[1.75rem] border border-border/60 bg-card/75 p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto]">
          <label className="flex h-11 items-center gap-2 rounded-xl border border-border/70 bg-background px-3">
            <Search className="size-4 text-muted-foreground" />
            <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search requester, target, action or reason" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
          </label>
          <StudioSelectField
            value={status}
            onValueChange={value => setStatus(value as typeof status)}
            options={statuses.map(value => ({
              value,
              label: value.replaceAll('_', ' ')
            }))}
            className="min-w-48 text-xs font-bold"
          />
          <StudioSelectField
            value={source}
            onValueChange={value => setSource(value as typeof source)}
            options={sources.map(value => ({ value, label: value }))}
            className="min-w-40 text-xs font-bold"
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {filtered.map(item => {
          const overdue = item.dueAt ? new Date(item.dueAt).getTime() < nowTimestamp && !['EXECUTED', 'REJECTED', 'CANCELLED', 'EXPIRED', 'REVERTED'].includes(item.status) : false;
          return (
            <article key={item.id} className="overflow-hidden rounded-[1.75rem] border border-border/60 bg-card/75 shadow-sm">
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-primary">{item.source} · {item.targetType} · {item.action.replaceAll('_', ' ')}</p>
                    <h2 className="mt-2 truncate text-lg font-black">{item.inspection.title}</h2>
                    <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted-foreground">{item.reason}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <div className="flex -space-x-3">
                    {item.inspection.images.slice(0, 4).map((src, index) => (
                      <div key={`${src}-${index}`} className="relative size-12 overflow-hidden rounded-xl border-2 border-card bg-muted"><Image src={src} alt="" fill unoptimized className="object-cover" /></div>
                    ))}
                    {!item.inspection.images.length ? <div className="grid size-12 place-items-center rounded-xl border bg-muted text-muted-foreground"><ShieldCheck className="size-4" /></div> : null}
                  </div>
                  <div className="min-w-0 text-xs text-muted-foreground"><p>{item.inspection.products.length} linked product{item.inspection.products.length === 1 ? '' : 's'}</p><p className="mt-1">Requested by {item.requestedBy.name}</p></div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-[0.1em]">
                  <span className="rounded-full border px-2.5 py-1">{item.priority}</span>
                  <span className="rounded-full border px-2.5 py-1">Revision {item.revision}</span>
                  <span className={`rounded-full border px-2.5 py-1 ${overdue ? 'border-destructive/30 bg-destructive/5 text-destructive' : ''}`}>{item.dueAt ? `${overdue ? 'Overdue · ' : 'Due · '}${new Date(item.dueAt).toLocaleString('en-NG')}` : 'No deadline'}</span>
                </div>

                {item.inspection.warnings.length ? <p className="mt-4 flex items-center gap-2 rounded-xl bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300"><AlertTriangle className="size-4 shrink-0" />{item.inspection.warnings[0]}</p> : null}

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-muted-foreground">Reviewer: {item.assignedReviewer?.name ?? 'Unassigned'}</p><ApprovalInspectionDialog item={item} reviewers={reviewers} canReview={canReview} /></div>
              </div>
            </article>
          );
        })}
      </div>

      {!filtered.length ? <div className="grid min-h-52 place-items-center rounded-[1.75rem] border border-dashed p-8 text-center"><div><ShieldCheck className="mx-auto size-7 text-muted-foreground" /><p className="mt-3 font-black">No matching approval requests</p><p className="mt-1 text-sm text-muted-foreground">Adjust the queue filters or search phrase.</p></div></div> : null}
    </section>
  );
}

function StatusBadge({ status }: { status: string }) {
  const className =
    status === 'PENDING' || status === 'IN_INSPECTION'
      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
      : status === 'REJECTED' || status === 'EXPIRED'
        ? 'bg-destructive/10 text-destructive'
        : status === 'ON_HOLD' || status === 'PAUSED' || status === 'CHANGES_REQUESTED'
          ? 'bg-orange-500/10 text-orange-700 dark:text-orange-300'
          : status === 'CANCELLED' || status === 'REVERTED'
            ? 'bg-muted text-muted-foreground'
            : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300';

  return (
    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black ${className}`}>
      {status.replaceAll('_', ' ')}
    </span>
  );
}
