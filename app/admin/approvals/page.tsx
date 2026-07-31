import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  PauseCircle,
  ShieldCheck,
  UsersRound
} from 'lucide-react';

import { resolveApprovalInspection } from '@/features/admin/approvals/approvalInspectionResolver';
import { ApprovalOperationsDashboard } from '@/features/admin/approvals/components/ApprovalOperationsDashboard';
import type {
  ApprovalOperationsItem,
  ApprovalReviewerOption
} from '@/features/admin/approvals/approvalTypes';
import { getAdminAccess } from '@/features/admin/auth/adminPermissions';
import { AdminMetric, AdminPage, AdminPageHeader } from '@/features/admin/components';
import { prisma } from '@/lib/prisma';

const REVIEWER_ROLES = ['SUPPORT', 'MANAGER', 'ADMIN', 'OWNER', 'SUPER_ADMIN'] as const;

async function resolveInspectionsInBatches<T, TResult>(
  items: T[],
  resolver: (item: T) => Promise<TResult>,
  batchSize = 12
): Promise<TResult[]> {
  const resolved: TResult[] = [];

  for (let index = 0; index < items.length; index += batchSize) {
    const batch = items.slice(index, index + batchSize);
    resolved.push(...(await Promise.all(batch.map(resolver))));
  }

  return resolved;
}

export default async function AdminApprovalsPage() {
  const access = await getAdminAccess();
  if (!access.permissions.has('approval:view')) {
    throw new Error('Approval access is required.');
  }

  const now = new Date();

  const [requests, memberships] = await Promise.all([
    prisma.adminApprovalRequest.findMany({
      where: { workspaceId: access.membership.workspaceId },
      include: {
        requestedBy: { select: { id: true, name: true, email: true } },
        reviewedBy: { select: { id: true, name: true } },
        assignedReviewer: { select: { id: true, name: true, email: true } },
        events: {
          include: { actor: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 100
        }
      },
      orderBy: [{ priority: 'desc' }, { dueAt: 'asc' }, { createdAt: 'desc' }],
      take: 120
    }),
    prisma.workspaceMembership.findMany({
      where: {
        workspaceId: access.membership.workspaceId,
        active: true,
        role: { in: [...REVIEWER_ROLES] },
        user: { accountState: 'ACTIVE' }
      },
      select: {
        role: true,
        user: { select: { id: true, name: true, email: true } }
      },
      orderBy: [{ role: 'desc' }, { user: { name: 'asc' } }]
    })
  ]);

  const inspections = await resolveInspectionsInBatches(
    requests,
    request =>
      resolveApprovalInspection(prisma, {
        workspaceId: access.membership.workspaceId,
        targetType: request.targetType,
        targetId: request.targetId
      })
  );

  const items: ApprovalOperationsItem[] = requests.map((request, index) => ({
    id: request.id,
    source: request.source,
    priority: request.priority,
    action: request.action,
    targetType: request.targetType,
    targetId: request.targetId,
    reason: request.reason,
    payload: request.payload,
    status: request.status,
    reviewNote: request.reviewNote,
    internalNote: request.internalNote,
    revision: request.revision,
    dueAt: request.dueAt?.toISOString() ?? null,
    holdUntil: request.holdUntil?.toISOString() ?? null,
    inspectionStartedAt: request.inspectionStartedAt?.toISOString() ?? null,
    reviewedAt: request.reviewedAt?.toISOString() ?? null,
    executedAt: request.executedAt?.toISOString() ?? null,
    pausedAt: request.pausedAt?.toISOString() ?? null,
    reactivatedAt: request.reactivatedAt?.toISOString() ?? null,
    revertedAt: request.revertedAt?.toISOString() ?? null,
    expiredAt: request.expiredAt?.toISOString() ?? null,
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt.toISOString(),
    requestedBy: request.requestedBy,
    reviewedBy: request.reviewedBy,
    assignedReviewer: request.assignedReviewer,
    inspection: inspections[index]!,
    events: request.events.map(event => ({
      id: event.id,
      type: event.type,
      fromStatus: event.fromStatus,
      toStatus: event.toStatus,
      note: event.note,
      createdAt: event.createdAt.toISOString(),
      actor: event.actor
    }))
  }));

  const reviewers: ApprovalReviewerOption[] = memberships.map(membership => ({
    id: membership.user.id,
    name: membership.user.name,
    email: membership.user.email,
    role: membership.role
  }));

  const active = requests.filter(request => ['PENDING', 'IN_INSPECTION', 'ON_HOLD', 'CHANGES_REQUESTED'].includes(request.status));
  const overdue = active.filter(request => request.dueAt && request.dueAt < now).length;
  const completed = requests.filter(request => ['APPROVED', 'EXECUTED'].includes(request.status)).length;
  const paused = requests.filter(request => ['ON_HOLD', 'PAUSED', 'CHANGES_REQUESTED'].includes(request.status)).length;

  return (
    <AdminPage>
      <div className="space-y-5">
        <AdminPageHeader
          eyebrow="Operations governance"
          title="Approval Operations Studio"
          description="Inspect, assign, deadline, hold, revise, approve, pause, reactivate, reject and safely revert Customer, Vendor and administrative requests from one lifecycle authority."
        />

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <AdminMetric icon={Clock3} label="Active queue" value={active.length} />
          <AdminMetric icon={AlertTriangle} label="Overdue" value={overdue} />
          <AdminMetric icon={CheckCircle2} label="Approved or executed" value={completed} />
          <AdminMetric icon={PauseCircle} label="Held or paused" value={paused} />
          <AdminMetric icon={UsersRound} label="Reviewers" value={reviewers.length} />
          <AdminMetric icon={ShieldCheck} label="All requests" value={requests.length} />
        </section>

        <ApprovalOperationsDashboard
          items={items}
          reviewers={reviewers}
          canReview={access.permissions.has('approval:review')}
          nowTimestamp={now.getTime()}
        />
      </div>
    </AdminPage>
  );
}
