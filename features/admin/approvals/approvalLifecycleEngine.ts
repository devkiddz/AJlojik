import 'server-only';

import { Prisma } from '@/lib/generated/prisma/client';
import type {
  AdminApprovalEventType,
  AdminApprovalStatus,
  AdminApprovalSource,
  AdminApprovalPriority,
  AdminTargetType
} from '@/lib/generated/prisma/client';
import {
  completeOperationalTodos,
  upsertOperationalTodo
} from '@/features/admin/todos/adminTodoRepository';
import { notifySystemUpdate } from '@/features/notifications/server/notificationEngine';

import {
  captureApprovalTargetSnapshot,
  executeApprovalTarget,
  pauseApprovalTarget,
  reactivateApprovalTarget,
  requestChangesForApprovalTarget,
  revertApprovalTarget
} from './approvalTargetHandlers';
import type { ApprovalLifecycleOperation } from './approvalTypes';

type LifecycleInput = {
  workspaceId: string;
  actorId: string;
  requestId: string;
  operation: ApprovalLifecycleOperation;
  note?: string | null;
  assignedReviewerId?: string | null;
  priority?: AdminApprovalPriority | null;
  dueAt?: Date | null;
  holdUntil?: Date | null;
  allowSelfReview?: boolean;
};

const TERMINAL_STATUSES: AdminApprovalStatus[] = [
  'EXECUTED',
  'REJECTED',
  'CANCELLED',
  'EXPIRED',
  'REVERTED'
];

function label(value: string) {
  return value
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/^./, character => character.toUpperCase());
}

function requestHref(targetType: string, targetId: string) {
  if (targetType === 'PRODUCT') return `/products/${targetId}`;
  if (targetType === 'SHOPPING_LIST') return `/account/lists/${targetId}`;
  if (targetType === 'ORDER' || targetType === 'DELIVERY') return '/orders';
  if (targetType === 'CAMPAIGN' || targetType === 'EXPERIENCE') return '/store';
  return '/notifications';
}


function jsonObject(value: Prisma.InputJsonValue | undefined) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as Prisma.InputJsonObject;
}

function todoPriority(priority: AdminApprovalPriority) {
  if (priority === 'URGENT') return 'URGENT' as const;
  if (priority === 'HIGH') return 'HIGH' as const;
  if (priority === 'LOW') return 'LOW' as const;
  return 'MEDIUM' as const;
}

function defaultDueAt(priority: AdminApprovalPriority, from = new Date()) {
  const hours = priority === 'URGENT' ? 4 : priority === 'HIGH' ? 12 : priority === 'LOW' ? 96 : 48;
  return new Date(from.getTime() + hours * 60 * 60 * 1000);
}

function nullableJson(value: Prisma.InputJsonValue | null) {
  return value === null ? Prisma.DbNull : value;
}

async function createEvent(
  transaction: Prisma.TransactionClient,
  input: {
    workspaceId: string;
    requestId: string;
    actorId: string | null;
    type: AdminApprovalEventType;
    fromStatus: AdminApprovalStatus | null;
    toStatus: AdminApprovalStatus | null;
    note?: string | null;
    metadata?: Prisma.InputJsonValue;
  }
) {
  return transaction.adminApprovalEvent.create({
    data: {
      workspaceId: input.workspaceId,
      requestId: input.requestId,
      actorId: input.actorId,
      type: input.type,
      fromStatus: input.fromStatus,
      toStatus: input.toStatus,
      note: input.note?.trim() || null,
      metadata: input.metadata
    }
  });
}

async function audit(
  transaction: Prisma.TransactionClient,
  input: {
    workspaceId: string;
    actorId: string;
    requestId: string;
    targetType: AdminTargetType;
    targetId: string;
    action: string;
    summary: string;
    metadata?: Prisma.InputJsonValue;
  }
) {
  await transaction.adminAuditEvent.create({
    data: {
      workspaceId: input.workspaceId,
      actorId: input.actorId,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      summary: input.summary,
      metadata: {
        requestId: input.requestId,
        ...jsonObject(input.metadata)
      }
    }
  });
}

async function notifyRequester(
  transaction: Prisma.TransactionClient,
  input: {
    workspaceId: string;
    userId: string;
    requestId: string;
    targetType: AdminTargetType;
    targetId: string;
    title: string;
    message: string;
    priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
    revision: number;
  }
) {
  await notifySystemUpdate(transaction, {
    workspaceId: input.workspaceId,
    userId: input.userId,
    title: input.title,
    message: input.message,
    eventKey: `approval:${input.requestId}:revision:${input.revision}:${input.title.toLowerCase().replaceAll(' ', '-')}`,
    href: requestHref(input.targetType, input.targetId),
    targetType: input.targetType,
    targetId: input.targetId,
    scopeKey: `approval:${input.requestId}`,
    priority: input.priority
  });
}

export async function expireOverdueApprovals(
  transaction: Prisma.TransactionClient,
  workspaceId: string
) {
  const now = new Date();
  const overdue = await transaction.adminApprovalRequest.findMany({
    where: {
      workspaceId,
      dueAt: { lt: now },
      status: {
        in: ['PENDING', 'IN_INSPECTION', 'ON_HOLD', 'CHANGES_REQUESTED']
      }
    },
    select: {
      id: true,
      status: true,
      targetType: true,
      targetId: true,
      requestedById: true,
      revision: true
    },
    take: 100
  });

  for (const request of overdue) {
    await transaction.adminApprovalRequest.update({
      where: { id: request.id },
      data: {
        status: 'EXPIRED',
        expiredAt: now
      }
    });
    await createEvent(transaction, {
      workspaceId,
      requestId: request.id,
      actorId: null,
      type: 'EXPIRED',
      fromStatus: request.status,
      toStatus: 'EXPIRED',
      note: 'The review deadline elapsed before completion.'
    });
    await completeOperationalTodos(transaction, {
      workspaceId,
      source: 'APPROVAL',
      targetType: request.targetType,
      targetId: request.targetId
    });
    await notifyRequester(transaction, {
      workspaceId,
      userId: request.requestedById,
      requestId: request.id,
      targetType: request.targetType,
      targetId: request.targetId,
      title: 'Approval request expired',
      message: 'The review deadline elapsed. Edit or resubmit the request when it is ready.',
      priority: 'HIGH',
      revision: request.revision
    });
  }
}

export async function operateApprovalLifecycle(input: LifecycleInput) {
  return prismaTransaction(input);
}

async function prismaTransaction(input: LifecycleInput) {
  const { prisma } = await import('@/lib/prisma');

  return prisma.$transaction(async transaction => {
    const request = await transaction.adminApprovalRequest.findFirst({
      where: {
        id: input.requestId,
        workspaceId: input.workspaceId
      }
    });

    if (!request) throw new Error('The approval request no longer exists.');

    const now = new Date();
    const note = input.note?.trim() || null;
    const previousStatus = request.status;

    if (
      TERMINAL_STATUSES.includes(previousStatus) &&
      !['reactivate', 'pause', 'revert'].includes(input.operation)
    ) {
      throw new Error(`This request is already ${label(previousStatus).toLowerCase()}.`);
    }

    if (input.operation === 'inspect') {
      const nextStatus = previousStatus === 'PENDING' ? 'IN_INSPECTION' : previousStatus;
      const updated = await transaction.adminApprovalRequest.update({
        where: { id: request.id },
        data: {
          status: nextStatus,
          inspectionStartedAt: request.inspectionStartedAt ?? now,
          assignedReviewerId: request.assignedReviewerId ?? input.actorId
        }
      });
      await createEvent(transaction, {
        workspaceId: input.workspaceId,
        requestId: request.id,
        actorId: input.actorId,
        type: 'INSPECTION_STARTED',
        fromStatus: previousStatus,
        toStatus: nextStatus,
        note
      });
      return updated;
    }

    if (input.operation === 'assign') {
      const updated = await transaction.adminApprovalRequest.update({
        where: { id: request.id },
        data: { assignedReviewerId: input.assignedReviewerId ?? null }
      });
      await createEvent(transaction, {
        workspaceId: input.workspaceId,
        requestId: request.id,
        actorId: input.actorId,
        type: 'ASSIGNED',
        fromStatus: previousStatus,
        toStatus: previousStatus,
        note,
        metadata: { assignedReviewerId: input.assignedReviewerId ?? null }
      });
      return updated;
    }

    if (input.operation === 'update-administration') {
      const updated = await transaction.adminApprovalRequest.update({
        where: { id: request.id },
        data: {
          priority: input.priority ?? request.priority,
          dueAt: input.dueAt,
          internalNote: note,
          assignedReviewerId:
            input.assignedReviewerId === undefined
              ? request.assignedReviewerId
              : input.assignedReviewerId
        }
      });
      await createEvent(transaction, {
        workspaceId: input.workspaceId,
        requestId: request.id,
        actorId: input.actorId,
        type:
          input.dueAt?.getTime() !== request.dueAt?.getTime()
            ? 'DEADLINE_CHANGED'
            : 'NOTE_UPDATED',
        fromStatus: previousStatus,
        toStatus: previousStatus,
        note,
        metadata: {
          priority: input.priority ?? request.priority,
          dueAt: input.dueAt?.toISOString() ?? null,
          assignedReviewerId: input.assignedReviewerId ?? request.assignedReviewerId
        }
      });
      await upsertOperationalTodo(transaction, {
        workspaceId: input.workspaceId,
        title: `Approval required: ${label(request.action)}`,
        description: request.reason,
        source: 'APPROVAL',
        priority: todoPriority(input.priority ?? request.priority),
        targetType: request.targetType,
        targetId: request.targetId,
        dedupeKey: `approval:${request.id}`,
        dueAt: input.dueAt,
        metadata: { requestId: request.id },
        createdById: request.requestedById
      });
      return updated;
    }

    if (input.operation === 'hold') {
      if (input.holdUntil && input.holdUntil <= now) {
        throw new Error('The hold-until time must be in the future.');
      }
      const updated = await transaction.adminApprovalRequest.update({
        where: { id: request.id },
        data: {
          status: 'ON_HOLD',
          holdUntil: input.holdUntil,
          reviewNote: note,
          reviewedById: input.actorId,
          reviewedAt: now
        }
      });
      await createEvent(transaction, {
        workspaceId: input.workspaceId,
        requestId: request.id,
        actorId: input.actorId,
        type: 'HELD',
        fromStatus: previousStatus,
        toStatus: 'ON_HOLD',
        note,
        metadata: { holdUntil: input.holdUntil?.toISOString() ?? null }
      });
      await transaction.adminTodo.updateMany({
        where: {
          workspaceId: input.workspaceId,
          source: 'APPROVAL',
          dedupeKey: `approval:${request.id}`,
          status: { in: ['OPEN', 'IN_PROGRESS', 'BLOCKED'] }
        },
        data: {
          status: 'BLOCKED',
          snoozedUntil: input.holdUntil ?? null
        }
      });
      await notifyRequester(transaction, {
        workspaceId: input.workspaceId,
        userId: request.requestedById,
        requestId: request.id,
        targetType: request.targetType,
        targetId: request.targetId,
        title: 'Approval request placed on hold',
        message: note ?? 'The request is temporarily on hold while more information is reviewed.',
        priority: 'NORMAL',
        revision: request.revision
      });
      return updated;
    }

    if (input.operation === 'reactivate') {
      if (!['ON_HOLD', 'PAUSED', 'REJECTED', 'EXPIRED', 'CHANGES_REQUESTED'].includes(previousStatus)) {
        throw new Error('Only held, paused, rejected, expired, or revision requests can be reactivated.');
      }

      if (previousStatus === 'PAUSED') {
        const reactivated = await reactivateApprovalTarget(transaction, {
          workspaceId: input.workspaceId,
          targetType: request.targetType,
          targetId: request.targetId
        });
        if (!reactivated) throw new Error('This target does not support reactivation.');

        const updated = await transaction.adminApprovalRequest.update({
          where: { id: request.id },
          data: {
            status: request.executedAt ? 'EXECUTED' : 'APPROVED',
            pausedAt: null,
            reactivatedAt: now,
            reviewNote: note
          }
        });
        await createEvent(transaction, {
          workspaceId: input.workspaceId,
          requestId: request.id,
          actorId: input.actorId,
          type: 'REACTIVATED',
          fromStatus: previousStatus,
          toStatus: request.executedAt ? 'EXECUTED' : 'APPROVED',
          note
        });
        await notifyRequester(transaction, {
          workspaceId: input.workspaceId,
          userId: request.requestedById,
          requestId: request.id,
          targetType: request.targetType,
          targetId: request.targetId,
          title: 'Approved content reactivated',
          message: note ?? 'The paused target is active again.',
          revision: request.revision
        });
        return updated;
      }

      const revisionChange = ['REJECTED', 'EXPIRED', 'CHANGES_REQUESTED'].includes(previousStatus);
      const dueAt = request.dueAt && request.dueAt > now
        ? request.dueAt
        : defaultDueAt(request.priority, now);
      const updated = await transaction.adminApprovalRequest.update({
        where: { id: request.id },
        data: {
          status: 'PENDING',
          dueAt,
          holdUntil: null,
          expiredAt: null,
          reactivatedAt: now,
          reviewedById: null,
          reviewedAt: null,
          reviewNote: note,
          ...(revisionChange ? { revision: { increment: 1 } } : {})
        }
      });
      await createEvent(transaction, {
        workspaceId: input.workspaceId,
        requestId: request.id,
        actorId: input.actorId,
        type: 'REACTIVATED',
        fromStatus: previousStatus,
        toStatus: 'PENDING',
        note,
        metadata: { revisionChanged: revisionChange, dueAt: dueAt.toISOString() }
      });
      await upsertOperationalTodo(transaction, {
        workspaceId: input.workspaceId,
        title: `Approval reactivated: ${label(request.targetType)}`,
        description: note ?? request.reason,
        source: 'APPROVAL',
        priority: todoPriority(request.priority),
        targetType: request.targetType,
        targetId: request.targetId,
        dedupeKey: `approval:${request.id}`,
        dueAt,
        metadata: { requestId: request.id },
        createdById: request.requestedById
      });
      await transaction.adminTodo.updateMany({
        where: {
          workspaceId: input.workspaceId,
          source: 'APPROVAL',
          dedupeKey: `approval:${request.id}`,
          status: { in: ['OPEN', 'IN_PROGRESS', 'BLOCKED'] }
        },
        data: { status: 'OPEN', snoozedUntil: null }
      });
      return updated;
    }

    if (input.operation === 'request-changes') {
      if (!note) throw new Error('Describe the changes required before returning the request.');
      await requestChangesForApprovalTarget(transaction, {
        workspaceId: input.workspaceId,
        targetType: request.targetType,
        targetId: request.targetId,
        note
      });
      const updated = await transaction.adminApprovalRequest.update({
        where: { id: request.id },
        data: {
          status: 'CHANGES_REQUESTED',
          changesRequestedAt: now,
          reviewedAt: now,
          reviewedById: input.actorId,
          reviewNote: note
        }
      });
      await createEvent(transaction, {
        workspaceId: input.workspaceId,
        requestId: request.id,
        actorId: input.actorId,
        type: 'CHANGES_REQUESTED',
        fromStatus: previousStatus,
        toStatus: 'CHANGES_REQUESTED',
        note
      });
      await completeOperationalTodos(transaction, {
        workspaceId: input.workspaceId,
        source: 'APPROVAL',
        targetType: request.targetType,
        targetId: request.targetId
      });
      await notifyRequester(transaction, {
        workspaceId: input.workspaceId,
        userId: request.requestedById,
        requestId: request.id,
        targetType: request.targetType,
        targetId: request.targetId,
        title: 'Changes requested',
        message: note,
        priority: 'HIGH',
        revision: request.revision
      });
      return updated;
    }

    if (input.operation === 'approve') {
      if (request.requestedById === input.actorId && !input.allowSelfReview) {
        throw new Error('A submission must be reviewed by a different administrator.');
      }
      const snapshot =
        request.targetSnapshot ??
        (await captureApprovalTargetSnapshot(transaction, {
          workspaceId: input.workspaceId,
          targetType: request.targetType,
          targetId: request.targetId
        }));
      const execution = await executeApprovalTarget(transaction, {
        workspaceId: input.workspaceId,
        actorId: input.actorId,
        request,
        reviewNote: note
      });
      const nextStatus: AdminApprovalStatus = execution.executed ? 'EXECUTED' : 'APPROVED';
      const updated = await transaction.adminApprovalRequest.update({
        where: { id: request.id },
        data: {
          status: nextStatus,
          reviewedById: input.actorId,
          reviewedAt: now,
          executedAt: execution.executed ? now : null,
          reviewNote: note,
          targetSnapshot: nullableJson(snapshot),
          resultSnapshot: nullableJson(execution.result)
        }
      });
      await createEvent(transaction, {
        workspaceId: input.workspaceId,
        requestId: request.id,
        actorId: input.actorId,
        type: 'APPROVED',
        fromStatus: previousStatus,
        toStatus: execution.executed ? 'APPROVED' : nextStatus,
        note
      });
      if (execution.executed) {
        await createEvent(transaction, {
          workspaceId: input.workspaceId,
          requestId: request.id,
          actorId: input.actorId,
          type: 'EXECUTED',
          fromStatus: 'APPROVED',
          toStatus: 'EXECUTED',
          note
        });
      }
      await completeOperationalTodos(transaction, {
        workspaceId: input.workspaceId,
        source: 'APPROVAL',
        targetType: request.targetType,
        targetId: request.targetId
      });
      await notifyRequester(transaction, {
        workspaceId: input.workspaceId,
        userId: request.requestedById,
        requestId: request.id,
        targetType: request.targetType,
        targetId: request.targetId,
        title: execution.executed ? 'Request approved and executed' : 'Request approved',
        message: note ?? `${label(request.targetType)} approval completed successfully.`,
        revision: request.revision
      });
      await audit(transaction, {
        workspaceId: input.workspaceId,
        actorId: input.actorId,
        requestId: request.id,
        targetType: request.targetType,
        targetId: request.targetId,
        action: execution.executed ? 'APPROVAL_EXECUTED' : 'APPROVAL_APPROVED',
        summary: note ?? `${label(request.targetType)} request approved.`
      });
      return updated;
    }

    if (input.operation === 'reject') {
      if (!note) throw new Error('A rejection reason is required.');
      await requestChangesForApprovalTarget(transaction, {
        workspaceId: input.workspaceId,
        targetType: request.targetType,
        targetId: request.targetId,
        note
      });
      const updated = await transaction.adminApprovalRequest.update({
        where: { id: request.id },
        data: {
          status: 'REJECTED',
          reviewedById: input.actorId,
          reviewedAt: now,
          reviewNote: note
        }
      });
      await createEvent(transaction, {
        workspaceId: input.workspaceId,
        requestId: request.id,
        actorId: input.actorId,
        type: 'REJECTED',
        fromStatus: previousStatus,
        toStatus: 'REJECTED',
        note
      });
      await completeOperationalTodos(transaction, {
        workspaceId: input.workspaceId,
        source: 'APPROVAL',
        targetType: request.targetType,
        targetId: request.targetId
      });
      await notifyRequester(transaction, {
        workspaceId: input.workspaceId,
        userId: request.requestedById,
        requestId: request.id,
        targetType: request.targetType,
        targetId: request.targetId,
        title: 'Approval request rejected',
        message: note,
        priority: 'HIGH',
        revision: request.revision
      });
      return updated;
    }

    if (input.operation === 'pause') {
      if (!['APPROVED', 'EXECUTED'].includes(previousStatus)) {
        throw new Error('Only approved or executed targets can be paused.');
      }
      const snapshot =
        request.targetSnapshot ??
        (await captureApprovalTargetSnapshot(transaction, {
          workspaceId: input.workspaceId,
          targetType: request.targetType,
          targetId: request.targetId
        }));
      const paused = await pauseApprovalTarget(transaction, {
        workspaceId: input.workspaceId,
        targetType: request.targetType,
        targetId: request.targetId
      });
      if (!paused) throw new Error('This target does not support pausing.');
      const updated = await transaction.adminApprovalRequest.update({
        where: { id: request.id },
        data: {
          status: 'PAUSED',
          pausedAt: now,
          reviewedById: input.actorId,
          reviewedAt: now,
          reviewNote: note,
          targetSnapshot: nullableJson(snapshot)
        }
      });
      await createEvent(transaction, {
        workspaceId: input.workspaceId,
        requestId: request.id,
        actorId: input.actorId,
        type: 'PAUSED',
        fromStatus: previousStatus,
        toStatus: 'PAUSED',
        note
      });
      await notifyRequester(transaction, {
        workspaceId: input.workspaceId,
        userId: request.requestedById,
        requestId: request.id,
        targetType: request.targetType,
        targetId: request.targetId,
        title: 'Approved content paused',
        message: note ?? 'The approved target has been paused and removed from active presentation.',
        priority: 'HIGH',
        revision: request.revision
      });
      return updated;
    }

    if (input.operation === 'revert') {
      if (!['EXECUTED', 'PAUSED'].includes(previousStatus)) {
        throw new Error('Only executed or paused operations can be reverted.');
      }
      const reverted = await revertApprovalTarget(transaction, {
        workspaceId: input.workspaceId,
        targetType: request.targetType,
        targetId: request.targetId,
        snapshot: request.targetSnapshot
      });
      if (!reverted) throw new Error('This target does not support safe reversion.');
      const updated = await transaction.adminApprovalRequest.update({
        where: { id: request.id },
        data: {
          status: 'REVERTED',
          revertedAt: now,
          reviewedById: input.actorId,
          reviewedAt: now,
          reviewNote: note
        }
      });
      await createEvent(transaction, {
        workspaceId: input.workspaceId,
        requestId: request.id,
        actorId: input.actorId,
        type: 'REVERTED',
        fromStatus: previousStatus,
        toStatus: 'REVERTED',
        note
      });
      await notifyRequester(transaction, {
        workspaceId: input.workspaceId,
        userId: request.requestedById,
        requestId: request.id,
        targetType: request.targetType,
        targetId: request.targetId,
        title: 'Approval execution reverted',
        message: note ?? 'The previous target state has been restored.',
        priority: 'HIGH',
        revision: request.revision
      });
      return updated;
    }

    if (input.operation === 'cancel') {
      const updated = await transaction.adminApprovalRequest.update({
        where: { id: request.id },
        data: {
          status: 'CANCELLED',
          reviewedById: input.actorId,
          reviewedAt: now,
          reviewNote: note
        }
      });
      await createEvent(transaction, {
        workspaceId: input.workspaceId,
        requestId: request.id,
        actorId: input.actorId,
        type: 'CANCELLED',
        fromStatus: previousStatus,
        toStatus: 'CANCELLED',
        note
      });
      await completeOperationalTodos(transaction, {
        workspaceId: input.workspaceId,
        source: 'APPROVAL',
        targetType: request.targetType,
        targetId: request.targetId
      });
      return updated;
    }

    throw new Error('Unsupported approval lifecycle operation.');
  });
}

export function approvalSourceFromTarget(input: {
  explicitSource?: AdminApprovalSource | null;
  hasVendorOwner?: boolean;
  targetType: string;
}) {
  if (input.explicitSource) return input.explicitSource;
  if (input.targetType === 'SHOPPING_LIST') return 'CUSTOMER' as const;
  if (input.targetType === 'VENDOR' || input.hasVendorOwner) return 'VENDOR' as const;
  return 'ADMIN' as const;
}
