'use client';

import Image from 'next/image';

import Link from 'next/link';

import {
  AlertTriangle,
  Boxes,
  ExternalLink,
  Eye,
  FileText,
  ImageIcon,
  LayoutDashboard,
  PackageSearch,
  ShieldCheck,
  UserRound
} from 'lucide-react';

import {
  Button
} from '@/components/ui/button';

import type {
  ApprovalOperationsItem,
  ApprovalReviewerOption
} from '@/features/admin/approvals/approvalTypes';

import {
  GlobalWorkspaceSection,
  useGlobalOverlay
} from '@/features/global-overlay';

import {
  ApprovalActionButton
} from './ApprovalActionForm';

import {
  ApprovalTimeline
} from './ApprovalTimeline';

export function ApprovalInspectionDialog({
  item,
  reviewers,
  canReview
}: {
  item:
    ApprovalOperationsItem;
  reviewers:
    ApprovalReviewerOption[];
  canReview:
    boolean;
}) {
  const {
    openOverlay
  } =
    useGlobalOverlay();

  const {
    inspection
  } =
    item;

  function inspect() {
    openOverlay({
      id:
        `approval-inspection-${item.id}`,
      eyebrow: (
        <span>
          {item.source}{' '}
          ·{' '}
          {item.targetType}{' '}
          · Revision{' '}
          {item.revision}
        </span>
      ),
      title:
        inspection.title,
      description:
        inspection.subtitle ??
        item.reason,
      variant:
        'workspace',
      content: (
        <ApprovalInspectionContent
          item={
            item
          }
          reviewers={
            reviewers
          }
          canReview={
            canReview
          }
        />
      )
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={
        inspect
      }>
      <Eye />

      Inspect
    </Button>
  );
}

function ApprovalInspectionContent({
  item,
  reviewers,
  canReview
}: {
  item:
    ApprovalOperationsItem;
  reviewers:
    ApprovalReviewerOption[];
  canReview:
    boolean;
}) {
  const {
    inspection
  } =
    item;

  return (
    <div className="min-w-0 space-y-5">
      <section className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <CompactMetric
          label="Status"
          value={
            item.status.replaceAll(
              '_',
              ' '
            )
          }
        />

        <CompactMetric
          label="Priority"
          value={
            item.priority
          }
        />

        <CompactMetric
          label="Requested by"
          value={
            item.requestedBy.name
          }
        />

        <CompactMetric
          label="Deadline"
          value={
            item.dueAt
              ? new Date(
                  item.dueAt
                ).toLocaleString(
                  'en-NG'
                )
              : 'No deadline'
          }
        />

        {inspection.metrics.map(
          metric => (
            <CompactMetric
              key={
                metric.label
              }
              label={
                metric.label
              }
              value={
                metric.value
              }
            />
          )
        )}
      </section>

      <div className="grid min-w-0 gap-5 2xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-5">
          <GlobalWorkspaceSection
            title="Visual inspection"
            description="Primary media supplied with this approval request."
            icon={
              <ImageIcon />
            }>
            {inspection.images.length ? (
              <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {inspection.images
                  .slice(
                    0,
                    6
                  )
                  .map(
                    (
                      src,
                      index
                    ) => (
                      <div
                        key={`${src}-${index}`}
                        className="relative aspect-[16/10] min-w-0 overflow-hidden rounded-2xl border bg-muted">
                        <Image
                          src={
                            src
                          }
                          alt={`${inspection.title} preview ${index + 1}`}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                    )
                  )}
              </div>
            ) : (
              <div className="grid min-h-36 place-items-center rounded-2xl border border-dashed text-muted-foreground">
                <div className="text-center">
                  <ImageIcon className="mx-auto size-6" />

                  <p className="mt-2 text-xs">
                    No inspection
                    media supplied.
                  </p>
                </div>
              </div>
            )}
          </GlobalWorkspaceSection>

          <GlobalWorkspaceSection
            title="Target details"
            description="Compact operational facts about the submitted target."
            icon={
              <FileText />
            }
            action={
              inspection.href ? (
                <Button
                  nativeButton={
                    false
                  }
                  render={
                    <Link
                      href={
                        inspection.href
                      }
                      target="_blank"
                    />
                  }
                  variant="outline"
                  size="sm">
                  Open editor

                  <ExternalLink />
                </Button>
              ) : null
            }>
            <dl className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {inspection.fields.map(
                field => (
                  <div
                    key={
                      field.label
                    }
                    className="min-w-0 rounded-2xl border border-border/60 bg-muted/20 p-3">
                    <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      {
                        field.label
                      }
                    </dt>

                    <dd className="mt-1 break-words text-sm font-semibold leading-5">
                      {
                        field.value
                      }
                    </dd>
                  </div>
                )
              )}
            </dl>
          </GlobalWorkspaceSection>

          {inspection.products.length ? (
            <GlobalWorkspaceSection
              title={
                <>
                  Linked products
                  {' · '}
                  {
                    inspection.products.length
                  }
                </>
              }
              description="Products connected to this approval request."
              icon={
                <PackageSearch />
              }>
              <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {inspection.products.map(
                  product => (
                    <article
                      key={
                        product.id
                      }
                      className="flex min-w-0 items-center gap-3 rounded-2xl border border-border/60 bg-muted/20 p-3">
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-muted">
                        {product.imageUrl ? (
                          <Image
                            src={
                              product.imageUrl
                            }
                            alt={
                              product.name
                            }
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        ) : null}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold">
                          {
                            product.name
                          }
                        </p>

                        <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
                          {
                            product.status
                          }
                          {' · '}
                          {
                            product.available
                          }{' '}
                          available
                          {product.quantity
                            ? ` · Qty ${product.quantity}`
                            : ''}
                        </p>
                      </div>
                    </article>
                  )
                )}
              </div>
            </GlobalWorkspaceSection>
          ) : null}

          {inspection.warnings.length ||
          inspection.unsupportedReason ? (
            <GlobalWorkspaceSection
              title="Inspection warnings"
              description="Items requiring special attention before execution."
              icon={
                <AlertTriangle />
              }
              className="border-amber-500/25 bg-amber-500/5">
              <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
                {inspection.unsupportedReason ? (
                  <li>
                    {
                      inspection.unsupportedReason
                    }
                  </li>
                ) : null}

                {inspection.warnings.map(
                  warning => (
                    <li
                      key={
                        warning
                      }>
                      •{' '}
                      {
                        warning
                      }
                    </li>
                  )
                )}
              </ul>
            </GlobalWorkspaceSection>
          ) : null}

          <GlobalWorkspaceSection
            title="Lifecycle timeline"
            description="Every meaningful action recorded for this approval."
            icon={
              <LayoutDashboard />
            }>
            <ApprovalTimeline
              events={
                item.events
              }
            />
          </GlobalWorkspaceSection>
        </div>

        <aside className="min-w-0 space-y-5 2xl:sticky 2xl:top-0 2xl:self-start">
          <GlobalWorkspaceSection
            title="Review operations"
            description="Available actions follow the current approval state."
            icon={
              <ShieldCheck />
            }>
            <div className="flex flex-wrap gap-2">
              {canReview &&
              item.status ===
                'PENDING' ? (
                <ApprovalActionButton
                  item={
                    item
                  }
                  operation="inspect"
                  reviewers={
                    reviewers
                  }
                  compact
                />
              ) : null}

              {canReview &&
              ![
                'CANCELLED',
                'REVERTED'
              ].includes(
                item.status
              ) ? (
                <ApprovalActionButton
                  item={
                    item
                  }
                  operation="update-administration"
                  reviewers={
                    reviewers
                  }
                  compact
                />
              ) : null}

              {canReview &&
              [
                'PENDING',
                'IN_INSPECTION'
              ].includes(
                item.status
              ) ? (
                <>
                  <ApprovalActionButton
                    item={
                      item
                    }
                    operation="hold"
                    reviewers={
                      reviewers
                    }
                    compact
                  />

                  <ApprovalActionButton
                    item={
                      item
                    }
                    operation="request-changes"
                    reviewers={
                      reviewers
                    }
                    compact
                  />
                </>
              ) : null}

              {canReview &&
              [
                'ON_HOLD',
                'PAUSED',
                'REJECTED',
                'EXPIRED',
                'CHANGES_REQUESTED'
              ].includes(
                item.status
              ) ? (
                <ApprovalActionButton
                  item={
                    item
                  }
                  operation="reactivate"
                  reviewers={
                    reviewers
                  }
                  compact
                />
              ) : null}

              {canReview &&
              inspection.canExecute &&
              [
                'PENDING',
                'IN_INSPECTION'
              ].includes(
                item.status
              ) ? (
                <ApprovalActionButton
                  item={
                    item
                  }
                  operation="approve"
                  reviewers={
                    reviewers
                  }
                  compact
                />
              ) : null}

              {canReview &&
              [
                'PENDING',
                'IN_INSPECTION'
              ].includes(
                item.status
              ) ? (
                <ApprovalActionButton
                  item={
                    item
                  }
                  operation="reject"
                  reviewers={
                    reviewers
                  }
                  compact
                />
              ) : null}

              {canReview &&
              [
                'APPROVED',
                'EXECUTED'
              ].includes(
                item.status
              ) ? (
                <ApprovalActionButton
                  item={
                    item
                  }
                  operation="pause"
                  reviewers={
                    reviewers
                  }
                  compact
                />
              ) : null}

              {canReview &&
              [
                'EXECUTED',
                'PAUSED'
              ].includes(
                item.status
              ) ? (
                <ApprovalActionButton
                  item={
                    item
                  }
                  operation="revert"
                  reviewers={
                    reviewers
                  }
                  compact
                />
              ) : null}

              {canReview &&
              [
                'PENDING',
                'IN_INSPECTION',
                'ON_HOLD',
                'CHANGES_REQUESTED',
                'APPROVED'
              ].includes(
                item.status
              ) ? (
                <ApprovalActionButton
                  item={
                    item
                  }
                  operation="cancel"
                  reviewers={
                    reviewers
                  }
                  compact
                />
              ) : null}
            </div>
          </GlobalWorkspaceSection>

          <GlobalWorkspaceSection
            title="Request administration"
            description="Ownership, routing and review context."
            icon={
              <UserRound />
            }>
            <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-1">
              <Meta
                label="Requested by"
                value={`${item.requestedBy.name} · ${item.requestedBy.email}`}
              />

              <Meta
                label="Assigned reviewer"
                value={
                  item.assignedReviewer?.name ??
                  'Unassigned'
                }
              />

              <Meta
                label="Source"
                value={
                  item.source
                }
              />

              <Meta
                label="Target"
                value={
                  item.targetType
                }
              />

              <Meta
                label="Reason"
                value={
                  item.reason
                }
              />

              {item.reviewNote ? (
                <Meta
                  label="Review note"
                  value={
                    item.reviewNote
                  }
                />
              ) : null}

              {item.internalNote ? (
                <Meta
                  label="Internal note"
                  value={
                    item.internalNote
                  }
                />
              ) : null}
            </div>
          </GlobalWorkspaceSection>

          <GlobalWorkspaceSection
            title="Approval summary"
            description="A compact reference for the current request."
            icon={
              <Boxes />
            }>
            <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-1">
              <Meta
                label="Revision"
                value={String(
                  item.revision
                )}
              />

              <Meta
                label="Products"
                value={String(
                  inspection.products.length
                )}
              />

              <Meta
                label="Media"
                value={String(
                  inspection.images.length
                )}
              />

              <Meta
                label="Warnings"
                value={String(
                  inspection.warnings.length +
                  (inspection.unsupportedReason
                    ? 1
                    : 0)
                )}
              />
            </div>
          </GlobalWorkspaceSection>
        </aside>
      </div>
    </div>
  );
}

function CompactMetric({
  label,
  value
}: {
  label:
    string;
  value:
    string;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-border/60 bg-background/65 p-3">
      <p className="text-[9px] font-black uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-black leading-5">
        {value}
      </p>
    </div>
  );
}

function Meta({
  label,
  value
}: {
  label:
    string;
  value:
    string;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-border/60 bg-muted/20 p-3">
      <p className="text-[9px] font-black uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 break-words text-xs font-semibold leading-5">
        {value}
      </p>
    </div>
  );
}
