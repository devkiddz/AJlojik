import 'server-only';

import { prisma } from '@/lib/prisma';

import type {
  SupportCommerceActionItem,
  SupportCommerceContext,
  SupportOperationsSnapshot,
  SupportSLAHealth,
  SupportSLAState
} from '../supportOperationsTypes';

function mapActor(
  value: {
    id: string;
    name: string;
  } | null
) {
  return value
    ? {
        id: value.id,
        name: value.name
      }
    : null;
}

function stateFor(
  dueAt: Date | null,
  completedAt: Date | null,
  now: Date
): SupportSLAState {
  if (!dueAt) return 'NO_TARGET';

  if (completedAt) {
    return completedAt <= dueAt
      ? 'MET'
      : 'BREACHED';
  }

  const remaining =
    dueAt.getTime() - now.getTime();

  if (remaining < 0) return 'BREACHED';

  return remaining <= 4 * 60 * 60 * 1000
    ? 'AT_RISK'
    : 'ON_TRACK';
}

function minutesUntil(
  dueAt: Date | null,
  now: Date
) {
  if (!dueAt) return null;

  return Math.ceil(
    (dueAt.getTime() - now.getTime()) /
      60_000
  );
}

export async function getSupportOperationsSnapshot(
  caseId: string,
  workspaceId: string
): Promise<SupportOperationsSnapshot | null> {
  const supportCase =
    await prisma.supportCase.findFirst({
      where: {
        id: caseId,
        workspaceId
      },
      include: {
        order: {
          include: {
            payments: {
              orderBy: {
                createdAt: 'desc'
              }
            }
          }
        },
        delivery: true,
        vendorProfile: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        commerceActions: {
          orderBy: {
            preparedAt: 'desc'
          },
          include: {
            requestedBy: {
              select: {
                id: true,
                name: true
              }
            },
            approvedBy: {
              select: {
                id: true,
                name: true
              }
            },
            executedBy: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

  if (!supportCase) return null;

  const policy =
    await prisma.supportSLA.findFirst({
      where: {
        workspaceId,
        priority: supportCase.priority,
        active: true,
        OR: [
          {
            category: supportCase.category
          },
          {
            category: null
          }
        ]
      },
      orderBy: [
        {
          category: {
            sort: 'desc',
            nulls: 'last'
          }
        },
        {
          updatedAt: 'desc'
        }
      ]
    });

  const firstResponseDueAt = policy
    ? new Date(
        supportCase.createdAt.getTime() +
          policy.firstResponseMinutes *
            60_000
      )
    : null;

  const resolutionDueAt =
    supportCase.dueAt ??
    (policy
      ? new Date(
          supportCase.createdAt.getTime() +
            policy.resolutionMinutes *
              60_000
        )
      : null);

  const now = new Date();

  const sla: SupportSLAHealth = {
    firstResponseState: stateFor(
      firstResponseDueAt,
      supportCase.firstResponseAt,
      now
    ),
    resolutionState: stateFor(
      resolutionDueAt,
      supportCase.resolvedAt ??
        supportCase.closedAt,
      now
    ),
    firstResponseDueAt:
      firstResponseDueAt?.toISOString() ??
      null,
    resolutionDueAt:
      resolutionDueAt?.toISOString() ??
      null,
    remainingMinutes: minutesUntil(
      resolutionDueAt,
      now
    )
  };

  const commerce: SupportCommerceContext = {
    order: supportCase.order
      ? {
          id: supportCase.order.id,
          orderNumber:
            supportCase.order.orderNumber,
          status: supportCase.order.status,
          paymentStatus:
            supportCase.order.paymentStatus,
          total: Number(
            supportCase.order.total
          ),
          currency: 'NGN',
          payments:
            supportCase.order.payments.map(
              payment => ({
                id: payment.id,
                provider: payment.provider,
                reference:
                  payment.reference,
                amount: Number(
                  payment.amount
                ),
                status: payment.status,
                paidAt:
                  payment.paidAt?.toISOString() ??
                  null
              })
            )
        }
      : null,
    delivery: supportCase.delivery
      ? {
          id: supportCase.delivery.id,
          trackingCode:
            supportCase.delivery.trackingCode,
          status:
            supportCase.delivery.status,
          estimatedArrival:
            supportCase.delivery.estimatedArrival?.toISOString() ??
            null,
          deliveredAt:
            supportCase.delivery.deliveredAt?.toISOString() ??
            null
        }
      : null,
    vendor: supportCase.vendorProfile
      ? {
          id: supportCase.vendorProfile.id,
          name:
            supportCase.vendorProfile.name,
          slug:
            supportCase.vendorProfile.slug
        }
      : null
  };

  const actions: SupportCommerceActionItem[] =
    supportCase.commerceActions.map(
      action => ({
        id: action.id,
        type: action.type,
        status: action.status,
        requestedAmount:
          action.requestedAmount === null
            ? null
            : Number(
                action.requestedAmount
              ),
        currency: action.currency,
        reason: action.reason,
        requestedBy: mapActor(
          action.requestedBy
        ),
        approvedBy: mapActor(
          action.approvedBy
        ),
        executedBy: mapActor(
          action.executedBy
        ),
        preparedAt:
          action.preparedAt.toISOString(),
        approvedAt:
          action.approvedAt?.toISOString() ??
          null,
        rejectedAt:
          action.rejectedAt?.toISOString() ??
          null,
        appliedAt:
          action.appliedAt?.toISOString() ??
          null,
        failedAt:
          action.failedAt?.toISOString() ??
          null,
        cancelledAt:
          action.cancelledAt?.toISOString() ??
          null,
        failureReason:
          action.failureReason
      })
    );

  return {
    workspaceId,
    caseId,
    generatedAt: now.toISOString(),
    sla,
    commerce,
    actions
  };
}
