import 'server-only';

import type {
  Prisma,
  SupportCaseStatus
} from '@/lib/generated/prisma/client';
import { prisma } from '@/lib/prisma';

import {
  getCommunicationConversationForWorkspaceOperator
} from '@/features/communication/server/communicationRepository';

import type {
  SupportAssignmentItem,
  SupportCaseDetail,
  SupportCaseListSnapshot,
  SupportCaseSummary,
  SupportDeliveryContext,
  SupportEscalationItem,
  SupportFeedbackItem,
  SupportIdentity,
  SupportNoteItem,
  SupportOrderContext,
  SupportQueueSnapshot,
  SupportResolutionItem,
  SupportStatusHistoryItem,
  SupportVendorIdentity
} from '../supportTypes';
import {
  SUPPORT_CASE_STATUSES
} from '../supportTypes';

const supportInclude = {
  customer: {
    select: {
      id: true,
      name: true,
      email: true,
      image: true
    }
  },
  vendorProfile: {
    select: {
      id: true,
      name: true,
      slug: true
    }
  },
  order: {
    select: {
      id: true,
      orderNumber: true,
      status: true,
      total: true
    }
  },
  delivery: {
    select: {
      id: true,
      trackingCode: true,
      status: true
    }
  },
  assignedAgent: {
    select: {
      id: true,
      name: true,
      email: true,
      image: true
    }
  }
} satisfies Prisma.SupportCaseInclude;

const supportDetailInclude = {
  ...supportInclude,
  assignments: {
    orderBy: {
      assignedAt: 'desc'
    },
    include: {
      agent: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true
        }
      },
      assignedBy: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true
        }
      }
    }
  },
  notes: {
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true
        }
      }
    }
  },
  escalations: {
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      actor: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true
        }
      }
    }
  },
  statusHistory: {
    orderBy: {
      createdAt: 'asc'
    },
    include: {
      actor: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true
        }
      }
    }
  },
  resolutions: {
    orderBy: {
      proposedAt: 'desc'
    },
    include: {
      proposedBy: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true
        }
      },
      approvedBy: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true
        }
      }
    }
  },
  feedback: true
} satisfies Prisma.SupportCaseInclude;

type SummaryRecord =
  Prisma.SupportCaseGetPayload<{
    include: typeof supportInclude;
  }>;

type DetailRecord =
  Prisma.SupportCaseGetPayload<{
    include: typeof supportDetailInclude;
  }>;

function identity(
  value: {
    id: string;
    name: string;
    email: string | null;
    image: string | null;
  } | null
): SupportIdentity | null {
  if (!value) return null;

  return {
    id: value.id,
    name: value.name,
    email: value.email,
    image: value.image
  };
}

function vendor(
  value: SummaryRecord['vendorProfile']
): SupportVendorIdentity | null {
  if (!value) return null;

  return {
    id: value.id,
    name: value.name,
    slug: value.slug
  };
}

function order(
  value: SummaryRecord['order']
): SupportOrderContext | null {
  if (!value) return null;

  return {
    id: value.id,
    orderNumber: value.orderNumber,
    status: value.status,
    total: Number(value.total)
  };
}

function delivery(
  value: SummaryRecord['delivery']
): SupportDeliveryContext | null {
  if (!value) return null;

  return {
    id: value.id,
    trackingCode: value.trackingCode,
    status: value.status
  };
}

function mapSummary(
  record: SummaryRecord
): SupportCaseSummary {
  return {
    id: record.id,
    caseNumber: record.caseNumber,
    category: record.category,
    priority: record.priority,
    status: record.status,
    subject: record.subject,
    description: record.description,
    customer: identity(record.customer)!,
    vendor: vendor(record.vendorProfile),
    order: order(record.order),
    delivery: delivery(record.delivery),
    assignedAgent:
      identity(record.assignedAgent),
    conversationId: record.conversationId,
    dueAt:
      record.dueAt?.toISOString() ?? null,
    firstResponseAt:
      record.firstResponseAt?.toISOString() ??
      null,
    resolvedAt:
      record.resolvedAt?.toISOString() ??
      null,
    closedAt:
      record.closedAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString()
  };
}

function assignment(
  value: DetailRecord['assignments'][number]
): SupportAssignmentItem {
  return {
    id: value.id,
    agent: identity(value.agent)!,
    assignedBy: identity(value.assignedBy),
    active: value.active,
    reason: value.reason,
    assignedAt: value.assignedAt.toISOString(),
    releasedAt:
      value.releasedAt?.toISOString() ?? null
  };
}

function note(
  value: DetailRecord['notes'][number]
): SupportNoteItem {
  return {
    id: value.id,
    author: identity(value.author),
    body: value.body,
    internal: value.internal,
    createdAt: value.createdAt.toISOString()
  };
}

function escalation(
  value: DetailRecord['escalations'][number]
): SupportEscalationItem {
  return {
    id: value.id,
    actor: identity(value.actor),
    fromPriority: value.fromPriority,
    toPriority: value.toPriority,
    status: value.status,
    reason: value.reason,
    createdAt: value.createdAt.toISOString(),
    resolvedAt:
      value.resolvedAt?.toISOString() ?? null
  };
}

function statusHistory(
  value:
    DetailRecord['statusHistory'][number]
): SupportStatusHistoryItem {
  return {
    id: value.id,
    actor: identity(value.actor),
    fromStatus: value.fromStatus,
    toStatus: value.toStatus,
    note: value.note,
    createdAt: value.createdAt.toISOString()
  };
}

function resolution(
  value: DetailRecord['resolutions'][number]
): SupportResolutionItem {
  return {
    id: value.id,
    type: value.type,
    status: value.status,
    summary: value.summary,
    proposedBy: identity(value.proposedBy),
    approvedBy: identity(value.approvedBy),
    proposedAt: value.proposedAt.toISOString(),
    approvedAt:
      value.approvedAt?.toISOString() ?? null,
    appliedAt:
      value.appliedAt?.toISOString() ?? null,
    failedAt:
      value.failedAt?.toISOString() ?? null
  };
}

function feedback(
  value: DetailRecord['feedback']
): SupportFeedbackItem | null {
  if (!value) return null;

  return {
    rating: value.rating,
    comment: value.comment,
    createdAt: value.createdAt.toISOString()
  };
}

function safeTake(
  take: number
) {
  return Math.min(
    200,
    Math.max(1, Math.trunc(take))
  );
}

export async function getCustomerSupportCases(
  userId: string,
  workspaceId: string,
  take = 100
): Promise<SupportCaseListSnapshot> {
  const records =
    await prisma.supportCase.findMany({
      where: {
        customerId: userId,
        workspaceId
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: safeTake(take),
      include: supportInclude
    });

  return {
    workspaceId,
    generatedAt: new Date().toISOString(),
    totalCount: records.length,
    cases: records.map(mapSummary)
  };
}

export async function getCustomerSupportCase(
  caseId: string,
  userId: string,
  workspaceId: string
): Promise<SupportCaseDetail | null> {
  const record =
    await prisma.supportCase.findFirst({
      where: {
        id: caseId,
        customerId: userId,
        workspaceId
      },
      include: supportDetailInclude
    });

  if (!record) return null;

  const conversation =
    await getCommunicationConversationForWorkspaceOperator(
      record.conversationId,
      workspaceId
    );

  if (!conversation) return null;

  return {
    ...mapSummary(record),
    resolutionSummary:
      record.resolutionSummary,
    assignments:
      record.assignments.map(assignment),
    notes: [],
    escalations:
      record.escalations.map(escalation),
    statusHistory:
      record.statusHistory.map(
        statusHistory
      ),
    resolutions:
      record.resolutions.map(resolution),
    feedback: feedback(record.feedback),
    conversation
  };
}

export async function getAgentSupportQueue(
  workspaceId: string,
  take = 100,
  statuses?: SupportCaseStatus[]
): Promise<SupportQueueSnapshot> {
  const records =
    await prisma.supportCase.findMany({
      where: {
        workspaceId,
        status: statuses?.length
          ? {
              in: statuses
            }
          : {
              not: 'CLOSED'
            }
      },
      orderBy: [
        {
          priority: 'desc'
        },
        {
          dueAt: {
            sort: 'asc',
            nulls: 'last'
          }
        },
        {
          updatedAt: 'desc'
        }
      ],
      take: safeTake(take),
      include: supportInclude
    });

  const grouped =
    await prisma.supportCase.groupBy({
      by: ['status'],
      where: {
        workspaceId
      },
      _count: {
        _all: true
      }
    });

  const counts = Object.fromEntries(
    SUPPORT_CASE_STATUSES.map(status => [
      status,
      grouped.find(
        item => item.status === status
      )?._count._all ?? 0
    ])
  ) as SupportQueueSnapshot['counts'];

  return {
    workspaceId,
    generatedAt: new Date().toISOString(),
    counts,
    cases: records.map(mapSummary)
  };
}

export async function getAgentSupportCase(
  caseId: string,
  workspaceId: string
): Promise<SupportCaseDetail | null> {
  const record =
    await prisma.supportCase.findFirst({
      where: {
        id: caseId,
        workspaceId
      },
      include: supportDetailInclude
    });

  if (!record) return null;

  const conversation =
    await getCommunicationConversationForWorkspaceOperator(
      record.conversationId,
      workspaceId
    );

  if (!conversation) return null;

  return {
    ...mapSummary(record),
    resolutionSummary:
      record.resolutionSummary,
    assignments:
      record.assignments.map(assignment),
    notes: record.notes.map(note),
    escalations:
      record.escalations.map(escalation),
    statusHistory:
      record.statusHistory.map(
        statusHistory
      ),
    resolutions:
      record.resolutions.map(resolution),
    feedback: feedback(record.feedback),
    conversation
  };
}
