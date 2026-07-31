'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import {
  AlertTriangle,
  ExternalLink,
  Eye,
  ImageIcon,
  PackageSearch
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import type {
  ApprovalOperationsItem,
  ApprovalReviewerOption
} from '@/features/admin/approvals/approvalTypes';

import { ApprovalActionButton } from './ApprovalActionForm';
import { ApprovalTimeline } from './ApprovalTimeline';

export function ApprovalInspectionDialog({
  item,
  reviewers,
  canReview
}: {
  item: ApprovalOperationsItem;
  reviewers: ApprovalReviewerOption[];
  canReview: boolean;
}) {
  const [open, setOpen] = useState(false);
  const { inspection } = item;

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Eye /> Inspect
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="h-[min(94dvh,66rem)] w-[min(97vw,88rem)] max-w-none overflow-hidden p-0">
          <div className="grid h-full min-h-0 lg:grid-cols-[minmax(0,1.25fr)_minmax(22rem,0.75fr)]">
            <div className="min-h-0 overflow-y-auto p-5 sm:p-7">
              <DialogHeader>
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-primary">
                  <span>{item.source}</span><span>·</span><span>{item.targetType}</span><span>·</span><span>Revision {item.revision}</span>
                </div>
                <DialogTitle className="text-2xl font-black sm:text-3xl">{inspection.title}</DialogTitle>
                <DialogDescription>{inspection.subtitle ?? item.reason}</DialogDescription>
              </DialogHeader>

              {inspection.images.length ? (
                <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {inspection.images.slice(0, 6).map((src, index) => (
                    <div key={`${src}-${index}`} className="relative aspect-[4/3] overflow-hidden rounded-2xl border bg-muted">
                      <Image src={src} alt={`${inspection.title} preview ${index + 1}`} fill unoptimized className="object-cover" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-6 grid min-h-44 place-items-center rounded-2xl border border-dashed text-muted-foreground">
                  <div className="text-center"><ImageIcon className="mx-auto size-6" /><p className="mt-2 text-xs">No inspection media supplied.</p></div>
                </div>
              )}

              <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {inspection.metrics.map(metric => (
                  <div key={metric.label} className="rounded-2xl border bg-background/65 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{metric.label}</p>
                    <p className="mt-2 text-lg font-black">{metric.value}</p>
                  </div>
                ))}
              </section>

              <section className="mt-6 rounded-3xl border bg-background/55 p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-black">Target details</h3>
                  {inspection.href ? (
                    <Button
                      render={<Link href={inspection.href} target="_blank" />}
                      nativeButton={false}
                      variant="outline"
                      size="sm"
                    >
                      Open editor <ExternalLink />
                    </Button>
                  ) : null}
                </div>
                <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                  {inspection.fields.map(field => (
                    <div key={field.label} className="rounded-2xl border border-border/60 p-3">
                      <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{field.label}</dt>
                      <dd className="mt-1 break-words text-sm font-semibold">{field.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              {inspection.products.length ? (
                <section className="mt-6 rounded-3xl border bg-background/55 p-5">
                  <div className="flex items-center gap-2"><PackageSearch className="size-5 text-primary" /><h3 className="font-black">Linked products · {inspection.products.length}</h3></div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {inspection.products.map(product => (
                      <article key={product.id} className="flex items-center gap-3 rounded-2xl border border-border/60 p-3">
                        <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                          {product.imageUrl ? <Image src={product.imageUrl} alt={product.name} fill unoptimized className="object-cover" /> : null}
                        </div>
                        <div className="min-w-0"><p className="truncate text-sm font-bold">{product.name}</p><p className="mt-1 text-[11px] text-muted-foreground">{product.status} · {product.available} available{product.quantity ? ` · Qty ${product.quantity}` : ''}</p></div>
                      </article>
                    ))}
                  </div>
                </section>
              ) : null}

              {inspection.warnings.length || inspection.unsupportedReason ? (
                <section className="mt-6 rounded-3xl border border-amber-500/25 bg-amber-500/5 p-5">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300"><AlertTriangle className="size-5" /><h3 className="font-black">Inspection warnings</h3></div>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {inspection.unsupportedReason ? <li>{inspection.unsupportedReason}</li> : null}
                    {inspection.warnings.map(warning => <li key={warning}>• {warning}</li>)}
                  </ul>
                </section>
              ) : null}
            </div>

            <aside className="min-h-0 overflow-y-auto border-l border-border/60 bg-muted/20 p-5 sm:p-6">
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-primary">Operations</p>
                <div className="flex flex-wrap gap-2">
                  {canReview && item.status === 'PENDING' ? (
                    <ApprovalActionButton item={item} operation="inspect" reviewers={reviewers} compact />
                  ) : null}
                  {canReview && !['CANCELLED', 'REVERTED'].includes(item.status) ? (
                    <ApprovalActionButton item={item} operation="update-administration" reviewers={reviewers} compact />
                  ) : null}
                  {canReview && ['PENDING', 'IN_INSPECTION'].includes(item.status) ? (
                    <ApprovalActionButton item={item} operation="hold" reviewers={reviewers} compact />
                  ) : null}
                  {canReview && ['ON_HOLD', 'PAUSED', 'REJECTED', 'EXPIRED', 'CHANGES_REQUESTED'].includes(item.status) ? (
                    <ApprovalActionButton item={item} operation="reactivate" reviewers={reviewers} compact />
                  ) : null}
                  {canReview && ['PENDING', 'IN_INSPECTION'].includes(item.status) ? (
                    <ApprovalActionButton item={item} operation="request-changes" reviewers={reviewers} compact />
                  ) : null}
                  {canReview && inspection.canExecute && ['PENDING', 'IN_INSPECTION'].includes(item.status) ? (
                    <ApprovalActionButton item={item} operation="approve" reviewers={reviewers} compact />
                  ) : null}
                  {canReview && ['PENDING', 'IN_INSPECTION'].includes(item.status) ? (
                    <ApprovalActionButton item={item} operation="reject" reviewers={reviewers} compact />
                  ) : null}
                  {canReview && ['APPROVED', 'EXECUTED'].includes(item.status) ? (
                    <ApprovalActionButton item={item} operation="pause" reviewers={reviewers} compact />
                  ) : null}
                  {canReview && ['EXECUTED', 'PAUSED'].includes(item.status) ? (
                    <ApprovalActionButton item={item} operation="revert" reviewers={reviewers} compact />
                  ) : null}
                  {canReview && ['PENDING', 'IN_INSPECTION', 'ON_HOLD', 'CHANGES_REQUESTED', 'APPROVED'].includes(item.status) ? (
                    <ApprovalActionButton item={item} operation="cancel" reviewers={reviewers} compact />
                  ) : null}
                </div>
              </div>

              <div className="mt-6 grid gap-3 text-xs">
                <Meta label="Requested by" value={`${item.requestedBy.name} · ${item.requestedBy.email}`} />
                <Meta label="Assigned reviewer" value={item.assignedReviewer?.name ?? 'Unassigned'} />
                <Meta label="Priority" value={item.priority} />
                <Meta label="Deadline" value={item.dueAt ? new Date(item.dueAt).toLocaleString('en-NG') : 'No deadline'} />
                <Meta label="Reason" value={item.reason} />
                {item.reviewNote ? <Meta label="Review note" value={item.reviewNote} /> : null}
                {item.internalNote ? <Meta label="Internal note" value={item.internalNote} /> : null}
              </div>

              <div className="mt-7"><h3 className="mb-3 font-black">Lifecycle timeline</h3><ApprovalTimeline events={item.events} /></div>
            </aside>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-border/60 bg-background/55 p-3"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{label}</p><p className="mt-1 break-words font-semibold leading-5">{value}</p></div>;
}
