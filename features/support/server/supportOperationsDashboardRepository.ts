import 'server-only';

import { prisma } from '@/lib/prisma';

import type {
  SupportOperationsOverview
} from '../supportIntelligenceTypes';

const ACTIVE_STATUSES = [
  'NEW',
  'TRIAGED',
  'ASSIGNED',
  'IN_PROGRESS',
  'WAITING_CUSTOMER',
  'WAITING_VENDOR',
  'WAITING_INTERNAL'
] as const;

export async function getSupportOperationsOverview(
  workspaceId: string
): Promise<SupportOperationsOverview> {
  const now = new Date();

  const [
    cases,
    preparedActions,
    approvedActions
  ] = await Promise.all([
    prisma.supportCase.findMany({
      where: {
        workspaceId
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 500,
      select: {
        id: true,
        caseNumber: true,
        subject: true,
        status: true,
        priority: true,
        dueAt: true,
        updatedAt: true,
        assignedAgentId: true,
        customer: {
          select: {
            name: true
          }
        },
        assignedAgent: {
          select: {
            name: true
          }
        }
      }
    }),
    prisma.supportCommerceAction.count({
      where: {
        status: 'PREPARED',
        case: {
          workspaceId
        }
      }
    }),
    prisma.supportCommerceAction.count({
      where: {
        status: 'APPROVED',
        case: {
          workspaceId
        }
      }
    })
  ]);

  const byStatus:
    Record<string, number> = {};

  for (const item of cases) {
    byStatus[item.status] =
      (byStatus[item.status] ?? 0) + 1;
  }

  const openCases = cases.filter(
    item =>
      ACTIVE_STATUSES.includes(
        item.status as
          (typeof ACTIVE_STATUSES)[number]
      )
  );
  const agentMap = new Map<
    string,
    {
      agentId: string | null;
      agentName: string;
      activeCases: number;
    }
  >();

  for (const item of openCases) {
    const key =
      item.assignedAgentId ??
      'UNASSIGNED';
    const current =
      agentMap.get(key) ?? {
        agentId:
          item.assignedAgentId,
        agentName:
          item.assignedAgent?.name ??
          'Unassigned',
        activeCases: 0
      };

    current.activeCases += 1;
    agentMap.set(key, current);
  }

  return {
    workspaceId,
    generatedAt: now.toISOString(),
    totals: {
      openCases: openCases.length,
      urgentCases: openCases.filter(
        item =>
          item.priority === 'URGENT'
      ).length,
      overdueCases: openCases.filter(
        item =>
          item.dueAt !== null &&
          item.dueAt < now
      ).length,
      unassignedCases:
        openCases.filter(
          item =>
            item.assignedAgentId === null
        ).length,
      preparedActions,
      approvedActions
    },
    byStatus,
    agentLoad: Array.from(
      agentMap.values()
    ).sort(
      (left, right) =>
        right.activeCases -
        left.activeCases
    ),
    recentCases: cases
      .slice(0, 20)
      .map(item => ({
        id: item.id,
        caseNumber:
          item.caseNumber,
        subject: item.subject,
        status: item.status,
        priority: item.priority,
        customerName:
          item.customer.name,
        assignedAgentName:
          item.assignedAgent?.name ??
          null,
        dueAt:
          item.dueAt?.toISOString() ??
          null,
        updatedAt:
          item.updatedAt.toISOString()
      }))
  };
}
