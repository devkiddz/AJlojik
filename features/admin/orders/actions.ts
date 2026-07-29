'use server';

import { revalidatePath } from 'next/cache';

import { requireAdminPermission } from '@/features/admin/auth/adminPermissions';
import { prisma } from '@/lib/prisma';

const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'READY',
  'DISPATCHED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED'
] as const;

type OrderStatusValue = (typeof ORDER_STATUSES)[number];

const ORDER_TRANSITIONS: Record<OrderStatusValue, readonly OrderStatusValue[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED', 'REFUNDED'],
  PROCESSING: ['READY', 'CANCELLED', 'REFUNDED'],
  READY: ['DISPATCHED', 'CANCELLED', 'REFUNDED'],
  DISPATCHED: ['DELIVERED', 'REFUNDED'],
  DELIVERED: ['REFUNDED'],
  CANCELLED: ['REFUNDED'],
  REFUNDED: []
};

function isOrderStatus(value: string): value is OrderStatusValue {
  return ORDER_STATUSES.includes(value as OrderStatusValue);
}

export async function updateOrderStatus(formData: FormData): Promise<void> {
  const access = await requireAdminPermission('order:manage');
  const id = String(formData.get('id') ?? '').trim();
  const requestedStatus = String(formData.get('status') ?? '').trim();

  if (!id || !isOrderStatus(requestedStatus)) {
    throw new Error('A valid order and status are required.');
  }

  const existing = await prisma.order.findFirst({
    where: {
      id,
      workspaceId: access.membership.workspaceId
    },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      paymentStatus: true
    }
  });

  if (!existing) {
    throw new Error('The selected order was not found in this workspace.');
  }

  if (existing.status === requestedStatus) {
    return;
  }

  const allowedTransitions = ORDER_TRANSITIONS[existing.status];

  if (!allowedTransitions.includes(requestedStatus)) {
    throw new Error(
      `${existing.orderNumber} cannot move directly from ${existing.status.replaceAll('_', ' ')} to ${requestedStatus.replaceAll('_', ' ')}.`
    );
  }

  if (requestedStatus === 'REFUNDED' && existing.paymentStatus !== 'PAID') {
    throw new Error('Only a paid order can be marked as refunded.');
  }

  await prisma.$transaction(async transaction => {
    await transaction.order.update({
      where: { id },
      data: {
        status: requestedStatus,
        ...(requestedStatus === 'REFUNDED'
          ? { paymentStatus: 'REFUNDED' as const }
          : {})
      }
    });

    await transaction.adminAuditEvent.create({
      data: {
        workspaceId: access.membership.workspaceId,
        actorId: access.session.user.id,
        action: 'ORDER_STATUS_UPDATED',
        targetType: 'ORDER',
        targetId: id,
        summary: `${existing.orderNumber} moved from ${existing.status.replaceAll('_', ' ')} to ${requestedStatus.replaceAll('_', ' ')}.`,
        metadata: {
          previousStatus: existing.status,
          nextStatus: requestedStatus,
          previousPaymentStatus: existing.paymentStatus,
          nextPaymentStatus:
            requestedStatus === 'REFUNDED' ? 'REFUNDED' : existing.paymentStatus
        }
      }
    });
  });

  revalidatePath('/admin/orders');
  revalidatePath('/admin/deliveries');
  revalidatePath('/admin/analytics');
  revalidatePath('/admin/customers');
}
