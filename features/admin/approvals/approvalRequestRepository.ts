import 'server-only';

import { Prisma } from '@/lib/generated/prisma/client';
import type {
  AdminApprovalAction,
  AdminApprovalEventType,
  AdminApprovalPriority,
  AdminApprovalSource,
  AdminApprovalStatus,
  AdminTargetType
} from '@/lib/generated/prisma/client';
import {
  completeOperationalTodos,
  upsertOperationalTodo
} from '@/features/admin/todos/adminTodoRepository';
import { notifySystemUpdate } from '@/features/notifications/server/notificationEngine';

const REUSABLE_STATUSES: AdminApprovalStatus[] = [
  'PENDING',
  'IN_INSPECTION',
  'ON_HOLD',
  'CHANGES_REQUESTED',
  'APPROVED',
  'PAUSED',
  'REJECTED',
  'CANCELLED',
  'EXPIRED'
];

const CANCELLABLE_STATUSES: AdminApprovalStatus[] = [
  'PENDING',
  'IN_INSPECTION',
  'ON_HOLD',
  'CHANGES_REQUESTED',
  'APPROVED',
  'PAUSED'
];

function defaultDueAt(priority: AdminApprovalPriority) {
  const hours =
    priority === 'URGENT'
      ? 4
      : priority === 'HIGH'
        ? 12
        : priority === 'LOW'
          ? 96
          : 48;

  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

function todoPriority(priority: AdminApprovalPriority) {
  return priority === 'NORMAL' ? ('MEDIUM' as const) : priority;
}

function actionLabel(action: AdminApprovalAction) {
  return action.replaceAll('_', ' ').toLowerCase();
}

function targetHref(targetType: AdminTargetType, targetId: string) {
  if (targetType === 'SHOPPING_LIST') return `/account/lists/${targetId}`;
  if (targetType === 'ORDER' || targetType === 'DELIVERY') return '/orders';
  if (targetType === 'PRODUCT') return `/products/${targetId}`;
  if (targetType === 'PROMOTION') return '/promos';
  if (targetType === 'CAMPAIGN' || targetType === 'EXPERIENCE') return '/store';
  if (targetType === 'VENDOR') return '/vendor/submissions';
  if (targetType === 'MEDIA') return '/vendor/media';
  return '/notifications';
}

function directDecisionPresentation(status: AdminApprovalStatus) {
  if (status === 'EXECUTED') {
    return {
      title: 'Approval request completed',
      priority: 'NORMAL' as const
    };
  }
  if (status === 'PAUSED') {
    return {
      title: 'Approved content paused',
      priority: 'HIGH' as const
    };
  }
  if (status === 'REJECTED') {
    return {
      title: 'Approval request rejected',
      priority: 'HIGH' as const
    };
  }
  if (status === 'EXPIRED') {
    return {
      title: 'Approval request expired',
      priority: 'HIGH' as const
    };
  }
  if (status === 'REVERTED') {
    return {
      title: 'Approval execution reverted',
      priority: 'HIGH' as const
    };
  }
  return {
    title: 'Approval request updated',
    priority: 'NORMAL' as const
  };
}

export async function createOrResubmitApprovalRequest(
  transaction: Prisma.TransactionClient,
  input: {
    workspaceId: string;
    requestedById: string;
    source: AdminApprovalSource;
    action: AdminApprovalAction;
    targetType: AdminTargetType;
    targetId: string;
    reason: string;
    payload?: Prisma.InputJsonValue;
    priority?: AdminApprovalPriority;
    dueAt?: Date | null;
  }
) {
  const priority = input.priority ?? 'NORMAL';
  const reason = input.reason.trim();

  if (!reason) {
    throw new Error('An approval reason is required.');
  }

  const existing = await transaction.adminApprovalRequest.findFirst({
    where: {
      workspaceId: input.workspaceId,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      status: { in: REUSABLE_STATUSES }
    },
    orderBy: { createdAt: 'desc' }
  });

  const dueAt =
    input.dueAt === undefined
      ? existing?.dueAt ?? defaultDueAt(priority)
      : input.dueAt;

  const request = existing
    ? await transaction.adminApprovalRequest.update({
        where: { id: existing.id },
        data: {
          requestedById: input.requestedById,
          source: input.source,
          priority,
          reason,
          payload: input.payload ?? Prisma.DbNull,
          status: 'PENDING',
          dueAt,
          holdUntil: null,
          inspectionStartedAt: null,
          changesRequestedAt: null,
          reviewedById: null,
          assignedReviewerId: null,
          reviewedAt: null,
          executedAt: null,
          pausedAt: null,
          reactivatedAt: new Date(),
          revertedAt: null,
          expiredAt: null,
          reviewNote: null,
          internalNote: null,
          targetSnapshot: Prisma.DbNull,
          resultSnapshot: Prisma.DbNull,
          revision: { increment: 1 }
        }
      })
    : await transaction.adminApprovalRequest.create({
        data: {
          workspaceId: input.workspaceId,
          requestedById: input.requestedById,
          source: input.source,
          priority,
          action: input.action,
          targetType: input.targetType,
          targetId: input.targetId,
          reason,
          payload: input.payload ?? Prisma.DbNull,
          dueAt
        }
      });

  await transaction.adminApprovalEvent.create({
    data: {
      workspaceId: input.workspaceId,
      requestId: request.id,
      actorId: input.requestedById,
      type: existing ? 'REACTIVATED' : 'CREATED',
      fromStatus: existing?.status ?? null,
      toStatus: 'PENDING',
      note: reason,
      metadata: {
        source: input.source,
        priority,
        revision: request.revision,
        resubmission: Boolean(existing)
      }
    }
  });

  await upsertOperationalTodo(transaction, {
    workspaceId: input.workspaceId,
    title: `Approval required: ${actionLabel(input.action)}`,
    description: reason,
    source: 'APPROVAL',
    priority: todoPriority(priority),
    targetType: input.targetType,
    targetId: input.targetId,
    dedupeKey: `approval:${request.id}`,
    dueAt,
    createdById: input.requestedById,
    metadata: {
      requestId: request.id,
      approvalAction: input.action,
      source: input.source,
      revision: request.revision
    }
  });

  return request;
}

export async function cancelApprovalRequestsForTarget(
  transaction: Prisma.TransactionClient,
  input: {
    workspaceId: string;
    actorId?: string | null;
    targetType: AdminTargetType;
    targetId: string;
    note: string;
  }
) {
  const requests = await transaction.adminApprovalRequest.findMany({
    where: {
      workspaceId: input.workspaceId,
      targetType: input.targetType,
      targetId: input.targetId,
      status: { in: CANCELLABLE_STATUSES }
    },
    select: {
      id: true,
      status: true
    }
  });

  for (const request of requests) {
    await transaction.adminApprovalRequest.update({
      where: { id: request.id },
      data: {
        status: 'CANCELLED',
        reviewedById: input.actorId ?? null,
        reviewedAt: new Date(),
        reviewNote: input.note
      }
    });

    await transaction.adminApprovalEvent.create({
      data: {
        workspaceId: input.workspaceId,
        requestId: request.id,
        actorId: input.actorId ?? null,
        type: 'CANCELLED',
        fromStatus: request.status,
        toStatus: 'CANCELLED',
        note: input.note
      }
    });
  }

  if (requests.length) {
    await completeOperationalTodos(transaction, {
      workspaceId: input.workspaceId,
      source: 'APPROVAL',
      targetType: input.targetType,
      targetId: input.targetId
    });
  }

  return requests.length;
}

export async function synchronizeDirectApprovalDecision(
  transaction: Prisma.TransactionClient,
  input: {
    workspaceId: string;
    actorId: string;
    targetType: AdminTargetType;
    targetId: string;
    status: AdminApprovalStatus;
    note: string;
    targetSnapshot?: Prisma.InputJsonValue | null;
    resultSnapshot?: Prisma.InputJsonValue | null;
  }
) {
  const candidates = await transaction.adminApprovalRequest.findMany({
    where: {
      workspaceId: input.workspaceId,
      targetType: input.targetType,
      targetId: input.targetId,
      status: {
        in: [
          'PENDING',
          'IN_INSPECTION',
          'ON_HOLD',
          'CHANGES_REQUESTED',
          'APPROVED',
          'EXECUTED',
          'PAUSED',
          'REJECTED',
          'EXPIRED'
        ]
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  const now = new Date();

  for (const request of candidates) {
    const eventType: AdminApprovalEventType =
      input.status === 'EXECUTED'
        ? 'EXECUTED'
        : input.status === 'PAUSED'
          ? 'PAUSED'
          : input.status === 'REJECTED'
            ? 'REJECTED'
            : input.status === 'EXPIRED'
              ? 'EXPIRED'
              : input.status === 'REVERTED'
                ? 'REVERTED'
                : 'CANCELLED';

    await transaction.adminApprovalRequest.update({
      where: { id: request.id },
      data: {
        status: input.status,
        reviewedById: input.actorId,
        reviewedAt: now,
        executedAt: input.status === 'EXECUTED' ? request.executedAt ?? now : request.executedAt,
        pausedAt: input.status === 'PAUSED' ? now : input.status === 'EXECUTED' ? null : request.pausedAt,
        expiredAt: input.status === 'EXPIRED' ? now : request.expiredAt,
        revertedAt: input.status === 'REVERTED' ? now : request.revertedAt,
        reviewNote: input.note,
        ...(input.targetSnapshot !== undefined
          ? { targetSnapshot: input.targetSnapshot === null ? Prisma.DbNull : input.targetSnapshot }
          : {}),
        ...(input.resultSnapshot !== undefined
          ? { resultSnapshot: input.resultSnapshot === null ? Prisma.DbNull : input.resultSnapshot }
          : {})
      }
    });

    if (input.status === 'EXECUTED' && !['APPROVED', 'EXECUTED', 'PAUSED'].includes(request.status)) {
      await transaction.adminApprovalEvent.create({
        data: {
          workspaceId: input.workspaceId,
          requestId: request.id,
          actorId: input.actorId,
          type: 'APPROVED',
          fromStatus: request.status,
          toStatus: 'APPROVED',
          note: input.note,
          metadata: { directStudioDecision: true }
        }
      });
    }

    await transaction.adminApprovalEvent.create({
      data: {
        workspaceId: input.workspaceId,
        requestId: request.id,
        actorId: input.actorId,
        type: eventType,
        fromStatus:
          input.status === 'EXECUTED' && !['APPROVED', 'EXECUTED', 'PAUSED'].includes(request.status)
            ? 'APPROVED'
            : request.status,
        toStatus: input.status,
        note: input.note,
        metadata: { directStudioDecision: true }
      }
    });

    const presentation = directDecisionPresentation(input.status);
    await notifySystemUpdate(transaction, {
      workspaceId: input.workspaceId,
      userId: request.requestedById,
      title: presentation.title,
      message: input.note,
      eventKey: `approval-direct:${request.id}:revision:${request.revision}:status:${input.status}`,
      href: targetHref(request.targetType, request.targetId),
      targetType: request.targetType,
      targetId: request.targetId,
      scopeKey: `approval:${request.id}`,
      priority: presentation.priority
    });
  }

  if (candidates.length && !['PAUSED', 'ON_HOLD'].includes(input.status)) {
    await completeOperationalTodos(transaction, {
      workspaceId: input.workspaceId,
      source: 'APPROVAL',
      targetType: input.targetType,
      targetId: input.targetId
    });
  }

  return candidates.length;
}
