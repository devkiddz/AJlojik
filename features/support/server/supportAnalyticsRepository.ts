import 'server-only';

import { prisma } from '@/lib/prisma';

import type {
  SupportAnalyticsSnapshot,
  SupportAuditTimelineItem
} from '../supportAnalyticsTypes';

const CLOSED_STATUSES = [
  'RESOLVED',
  'CUSTOMER_CONFIRMED',
  'CLOSED'
] as const;

function rounded(value: number) {
  return Number.isFinite(value)
    ? Math.round(value * 10) / 10
    : 0;
}

export async function getSupportAnalyticsSnapshot(
  workspaceId: string
): Promise<SupportAnalyticsSnapshot> {
  const now = new Date();

  const [
    cases,
    statusEvents,
    assignments,
    escalations,
    resolutions,
    commerceActions,
    feedback,
    supportNotifications,
    communicationNotifications
  ] = await Promise.all([
    prisma.supportCase.findMany({
      where: {
        workspaceId
      },
      select: {
        id: true,
        category: true,
        priority: true,
        status: true,
        createdAt: true,
        firstResponseAt: true,
        resolvedAt: true,
        closedAt: true,
        dueAt: true
      }
    }),
    prisma.supportStatusHistory.findMany({
      where: {
        case: {
          workspaceId
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50,
      select: {
        id: true,
        fromStatus: true,
        toStatus: true,
        note: true,
        createdAt: true,
        actor: {
          select: {
            name: true
          }
        },
        case: {
          select: {
            id: true,
            caseNumber: true
          }
        }
      }
    }),
    prisma.supportAssignment.findMany({
      where: {
        case: {
          workspaceId
        }
      },
      orderBy: {
        assignedAt: 'desc'
      },
      take: 30,
      select: {
        id: true,
        assignedAt: true,
        reason: true,
        assignedBy: {
          select: {
            name: true
          }
        },
        agent: {
          select: {
            name: true
          }
        },
        case: {
          select: {
            id: true,
            caseNumber: true
          }
        }
      }
    }),
    prisma.supportEscalation.findMany({
      where: {
        case: {
          workspaceId
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 30,
      select: {
        id: true,
        fromPriority: true,
        toPriority: true,
        reason: true,
        createdAt: true,
        actor: {
          select: {
            name: true
          }
        },
        case: {
          select: {
            id: true,
            caseNumber: true
          }
        }
      }
    }),
    prisma.supportResolution.findMany({
      where: {
        case: {
          workspaceId
        }
      },
      orderBy: {
        proposedAt: 'desc'
      },
      take: 30,
      select: {
        id: true,
        type: true,
        status: true,
        summary: true,
        proposedAt: true,
        proposedBy: {
          select: {
            name: true
          }
        },
        case: {
          select: {
            id: true,
            caseNumber: true
          }
        }
      }
    }),
    prisma.supportCommerceAction.findMany({
      where: {
        case: {
          workspaceId
        }
      },
      orderBy: {
        preparedAt: 'desc'
      },
      take: 30,
      select: {
        id: true,
        type: true,
        status: true,
        reason: true,
        preparedAt: true,
        requestedBy: {
          select: {
            name: true
          }
        },
        case: {
          select: {
            id: true,
            caseNumber: true
          }
        }
      }
    }),
    prisma.supportFeedback.findMany({
      where: {
        case: {
          workspaceId
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 30,
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        user: {
          select: {
            name: true
          }
        },
        case: {
          select: {
            id: true,
            caseNumber: true
          }
        }
      }
    }),
    prisma.notification.count({
      where: {
        workspaceId,
        topic: 'SUPPORT'
      }
    }),
    prisma.notification.count({
      where: {
        workspaceId,
        topic: 'COMMUNICATION'
      }
    })
  ]);

  const firstResponseValues =
    cases.flatMap(item =>
      item.firstResponseAt
        ? [
            (item.firstResponseAt.getTime() -
              item.createdAt.getTime()) /
              60_000
          ]
        : []
    );
  const resolutionValues =
    cases.flatMap(item => {
      const completed =
        item.resolvedAt ??
        item.closedAt;

      return completed
        ? [
            (completed.getTime() -
              item.createdAt.getTime()) /
              3_600_000
          ]
        : [];
    });

  const byCategory:
    Record<string, number> = {};
  const byPriority:
    Record<string, number> = {};

  for (const item of cases) {
    byCategory[item.category] =
      (byCategory[item.category] ?? 0) +
      1;
    byPriority[item.priority] =
      (byPriority[item.priority] ?? 0) +
      1;
  }

  const timeline:
    SupportAuditTimelineItem[] = [
      ...statusEvents.map(item => ({
        id: `status:${item.id}`,
        type: 'STATUS' as const,
        caseId: item.case.id,
        caseNumber:
          item.case.caseNumber,
        summary:
          `${item.fromStatus ?? 'START'} → ${item.toStatus}${item.note ? ` · ${item.note}` : ''}`,
        actorName:
          item.actor?.name ?? null,
        createdAt:
          item.createdAt.toISOString()
      })),
      ...assignments.map(item => ({
        id: `assignment:${item.id}`,
        type: 'ASSIGNMENT' as const,
        caseId: item.case.id,
        caseNumber:
          item.case.caseNumber,
        summary:
          `Assigned to ${item.agent.name}${item.reason ? ` · ${item.reason}` : ''}`,
        actorName:
          item.assignedBy?.name ??
          null,
        createdAt:
          item.assignedAt.toISOString()
      })),
      ...escalations.map(item => ({
        id: `escalation:${item.id}`,
        type: 'ESCALATION' as const,
        caseId: item.case.id,
        caseNumber:
          item.case.caseNumber,
        summary:
          `${item.fromPriority} → ${item.toPriority} · ${item.reason}`,
        actorName:
          item.actor?.name ?? null,
        createdAt:
          item.createdAt.toISOString()
      })),
      ...resolutions.map(item => ({
        id: `resolution:${item.id}`,
        type: 'RESOLUTION' as const,
        caseId: item.case.id,
        caseNumber:
          item.case.caseNumber,
        summary:
          `${item.type} · ${item.status} · ${item.summary}`,
        actorName:
          item.proposedBy?.name ??
          null,
        createdAt:
          item.proposedAt.toISOString()
      })),
      ...commerceActions.map(item => ({
        id: `commerce:${item.id}`,
        type:
          'COMMERCE_ACTION' as const,
        caseId: item.case.id,
        caseNumber:
          item.case.caseNumber,
        summary:
          `${item.type} · ${item.status} · ${item.reason}`,
        actorName:
          item.requestedBy?.name ??
          null,
        createdAt:
          item.preparedAt.toISOString()
      })),
      ...feedback.map(item => ({
        id: `feedback:${item.id}`,
        type: 'FEEDBACK' as const,
        caseId: item.case.id,
        caseNumber:
          item.case.caseNumber,
        summary:
          `${item.rating}/5${item.comment ? ` · ${item.comment}` : ''}`,
        actorName:
          item.user.name,
        createdAt:
          item.createdAt.toISOString()
      }))
    ]
      .sort(
        (left, right) =>
          new Date(
            right.createdAt
          ).getTime() -
          new Date(
            left.createdAt
          ).getTime()
      )
      .slice(0, 100);

  const openCases = cases.filter(
    item =>
      !CLOSED_STATUSES.includes(
        item.status as
          (typeof CLOSED_STATUSES)[number]
      )
  );

  return {
    workspaceId,
    generatedAt: now.toISOString(),
    metrics: {
      totalCases: cases.length,
      openCases: openCases.length,
      resolvedCases:
        cases.length -
        openCases.length,
      overdueCases:
        openCases.filter(
          item =>
            item.dueAt !== null &&
            item.dueAt < now
        ).length,
      averageFirstResponseMinutes:
        firstResponseValues.length
          ? rounded(
              firstResponseValues.reduce(
                (sum, value) =>
                  sum + value,
                0
              ) /
                firstResponseValues.length
            )
          : 0,
      averageResolutionHours:
        resolutionValues.length
          ? rounded(
              resolutionValues.reduce(
                (sum, value) =>
                  sum + value,
                0
              ) /
                resolutionValues.length
            )
          : 0,
      averageRating:
        feedback.length
          ? rounded(
              feedback.reduce(
                (sum, item) =>
                  sum + item.rating,
                0
              ) / feedback.length
            )
          : 0,
      supportNotifications,
      communicationNotifications
    },
    byCategory,
    byPriority,
    auditTimeline: timeline
  };
}
