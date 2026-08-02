import 'server-only';

import type {
  SupportCaseStatus
} from '@/lib/generated/prisma/client';
import { prisma } from '@/lib/prisma';

import {
  createCustomerNotification
} from '@/features/notifications/server/notificationRepository';

async function caseTarget(
  caseId: string,
  workspaceId: string
) {
  return prisma.supportCase.findFirst({
    where: {
      id: caseId,
      workspaceId
    },
    select: {
      id: true,
      caseNumber: true,
      subject: true,
      customerId: true
    }
  });
}

export async function notifySupportStatusChange(
  input: {
    caseId: string;
    workspaceId: string;
    status: SupportCaseStatus;
  }
) {
  const [supportCase, history] =
    await Promise.all([
      caseTarget(
        input.caseId,
        input.workspaceId
      ),
      prisma.supportStatusHistory.findFirst({
        where: {
          caseId: input.caseId,
          toStatus: input.status
        },
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true
        }
      })
    ]);

  if (!supportCase || !history) return;

  await createCustomerNotification(
    prisma,
    {
      workspaceId:
        input.workspaceId,
      userId:
        supportCase.customerId,
      topic: 'SUPPORT',
      priority:
        input.status === 'RESOLVED' ||
        input.status === 'CLOSED'
          ? 'HIGH'
          : 'NORMAL',
      title:
        `Support Case ${supportCase.caseNumber}`,
      message:
        `Status changed to ${input.status.replaceAll('_', ' ').toLowerCase()}.`,
      href:
        `/support/${encodeURIComponent(
          supportCase.id
        )}`,
      targetType: 'OTHER',
      targetId:
        supportCase.id,
      scopeKey:
        `support:${supportCase.id}`,
      dedupeKey:
        `support-status:${history.id}`,
      metadata: {
        supportCaseId:
          supportCase.id,
        status: input.status
      }
    }
  );
}

export async function notifySupportResolutionProposed(
  input: {
    caseId: string;
    workspaceId: string;
  }
) {
  const [supportCase, resolution] =
    await Promise.all([
      caseTarget(
        input.caseId,
        input.workspaceId
      ),
      prisma.supportResolution.findFirst({
        where: {
          caseId: input.caseId
        },
        orderBy: {
          proposedAt: 'desc'
        },
        select: {
          id: true,
          summary: true
        }
      })
    ]);

  if (!supportCase || !resolution) {
    return;
  }

  await createCustomerNotification(
    prisma,
    {
      workspaceId:
        input.workspaceId,
      userId:
        supportCase.customerId,
      topic: 'SUPPORT',
      priority: 'HIGH',
      title:
        `Resolution proposed · ${supportCase.caseNumber}`,
      message:
        resolution.summary.slice(
          0,
          180
        ),
      href:
        `/support/${encodeURIComponent(
          supportCase.id
        )}`,
      targetType: 'OTHER',
      targetId:
        supportCase.id,
      scopeKey:
        `support:${supportCase.id}`,
      dedupeKey:
        `support-resolution:${resolution.id}`,
      metadata: {
        supportCaseId:
          supportCase.id,
        resolutionId:
          resolution.id
      }
    }
  );
}
