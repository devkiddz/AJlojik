import 'server-only';

import { randomBytes } from 'node:crypto';

import type {
  Prisma,
  SupportCaseCategory,
  SupportCasePriority,
  SupportCaseStatus,
  SupportResolutionType
} from '@/lib/generated/prisma/client';
import { prisma } from '@/lib/prisma';

import {
  completeOperationalTodos,
  upsertOperationalTodo
} from '@/features/admin/todos/adminTodoRepository';

import {
  sendCommunicationMessage
} from '@/features/communication/server/communicationService';

import type {
  SupportCaseDetail
} from '../supportTypes';
import {
  getAgentSupportCase,
  getCustomerSupportCase
} from './supportRepository';
import {
  notifySupportResolutionProposed,
  notifySupportStatusChange
} from './supportNotificationService';

import {
  publishSupportLiveEvent
} from './supportLiveRepository';

const MAX_SUBJECT_LENGTH = 180;
const MAX_DESCRIPTION_LENGTH = 6000;
const MAX_NOTE_LENGTH = 6000;

type SupportLivePublishInput =
  Parameters<
    typeof publishSupportLiveEvent
  >[0];

async function publishSupportLiveEventSoft(
  input: SupportLivePublishInput
): Promise<void> {
  try {
    await publishSupportLiveEvent(
      input
    );
  } catch (cause) {
    console.error(
      'Support live event publication failed.',
      cause
    );
  }
}

export type SupportServiceErrorCode =
  | 'INVALID_INPUT'
  | 'ACCESS_DENIED'
  | 'CONTEXT_NOT_FOUND'
  | 'CASE_NOT_FOUND'
  | 'INVALID_TRANSITION'
  | 'CASE_UNAVAILABLE';

export class SupportServiceError extends Error {
  readonly code: SupportServiceErrorCode;

  constructor(
    code: SupportServiceErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'SupportServiceError';
    this.code = code;
  }
}

type CreateSupportCaseInput = {
  workspaceId: string;
  customerId: string;
  category: SupportCaseCategory;
  priority?: SupportCasePriority;
  subject: string;
  description: string;
  orderId?: string | null;
  deliveryId?: string | null;
  vendorProfileId?: string | null;
  metadata?: Prisma.InputJsonValue;
};

type AssignSupportCaseInput = {
  workspaceId: string;
  caseId: string;
  agentId: string;
  assignedById: string;
  reason?: string | null;
};

type ChangeSupportStatusInput = {
  workspaceId: string;
  caseId: string;
  actorId: string;
  status: SupportCaseStatus;
  note?: string | null;
};

type SendSupportMessageInput = {
  workspaceId: string;
  caseId: string;
  senderUserId: string;
  body: string;
};

function requiredText(
  value: string,
  label: string,
  maximum: number
) {
  const normalized = value.trim();

  if (!normalized) {
    throw new SupportServiceError(
      'INVALID_INPUT',
      `${label} is required.`
    );
  }

  if (normalized.length > maximum) {
    throw new SupportServiceError(
      'INVALID_INPUT',
      `${label} must not exceed ${maximum} characters.`
    );
  }

  return normalized;
}

function optionalText(
  value: string | null | undefined,
  maximum: number
) {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const normalized = value.trim();

  if (!normalized) return null;

  if (normalized.length > maximum) {
    throw new SupportServiceError(
      'INVALID_INPUT',
      `Text must not exceed ${maximum} characters.`
    );
  }

  return normalized;
}

function caseNumber() {
  const year = new Date().getFullYear();
  const token = randomBytes(4)
    .toString('hex')
    .toUpperCase();

  return `AJ-${year}-${token}`;
}

function supportTodoPriority(
  priority: SupportCasePriority
): 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' {
  if (priority === 'URGENT') {
    return 'URGENT';
  }

  if (priority === 'HIGH') {
    return 'HIGH';
  }

  if (priority === 'LOW') {
    return 'LOW';
  }

  return 'MEDIUM';
}

const transitions:
  Record<
    SupportCaseStatus,
    readonly SupportCaseStatus[]
  > = {
    NEW: [
      'TRIAGED',
      'ASSIGNED',
      'CLOSED'
    ],
    TRIAGED: [
      'ASSIGNED',
      'IN_PROGRESS',
      'CLOSED'
    ],
    ASSIGNED: [
      'IN_PROGRESS',
      'WAITING_CUSTOMER',
      'WAITING_VENDOR',
      'WAITING_INTERNAL',
      'RESOLVED',
      'CLOSED'
    ],
    IN_PROGRESS: [
      'WAITING_CUSTOMER',
      'WAITING_VENDOR',
      'WAITING_INTERNAL',
      'RESOLVED',
      'CLOSED'
    ],
    WAITING_CUSTOMER: [
      'IN_PROGRESS',
      'RESOLVED',
      'CLOSED'
    ],
    WAITING_VENDOR: [
      'IN_PROGRESS',
      'RESOLVED',
      'CLOSED'
    ],
    WAITING_INTERNAL: [
      'IN_PROGRESS',
      'RESOLVED',
      'CLOSED'
    ],
    RESOLVED: [
      'CUSTOMER_CONFIRMED',
      'IN_PROGRESS',
      'CLOSED'
    ],
    CUSTOMER_CONFIRMED: [
      'CLOSED',
      'IN_PROGRESS'
    ],
    CLOSED: ['IN_PROGRESS']
  };

async function resolveDueAt(
  workspaceId: string,
  category: SupportCaseCategory,
  priority: SupportCasePriority
) {
  const specific =
    await prisma.supportSLA.findFirst({
      where: {
        workspaceId,
        category,
        priority,
        active: true
      },
      orderBy: {
        updatedAt: 'desc'
      },
      select: {
        resolutionMinutes: true
      }
    });

  const fallback = specific
    ? null
    : await prisma.supportSLA.findFirst({
        where: {
          workspaceId,
          category: null,
          priority,
          active: true
        },
        orderBy: {
          updatedAt: 'desc'
        },
        select: {
          resolutionMinutes: true
        }
      });

  const minutes =
    specific?.resolutionMinutes ??
    fallback?.resolutionMinutes ??
    (priority === 'URGENT'
      ? 240
      : priority === 'HIGH'
        ? 720
        : priority === 'NORMAL'
          ? 1440
          : 2880);

  return new Date(
    Date.now() + minutes * 60_000
  );
}

export async function createSupportCase(
  input: CreateSupportCaseInput
): Promise<SupportCaseDetail> {
  const subject = requiredText(
    input.subject,
    'Subject',
    MAX_SUBJECT_LENGTH
  );
  const description = requiredText(
    input.description,
    'Description',
    MAX_DESCRIPTION_LENGTH
  );
  const priority =
    input.priority ?? 'NORMAL';
  const orderId = optionalText(
    input.orderId,
    240
  );
  const deliveryId = optionalText(
    input.deliveryId,
    240
  );
  const vendorProfileId = optionalText(
    input.vendorProfileId,
    240
  );

  const membership =
    await prisma.workspaceMembership.findFirst({
      where: {
        workspaceId: input.workspaceId,
        userId: input.customerId,
        active: true,
        workspace: {
          active: true
        }
      },
      select: {
        id: true
      }
    });

  if (!membership) {
    throw new SupportServiceError(
      'ACCESS_DENIED',
      'An active customer workspace is required.'
    );
  }

  if (orderId) {
    const order =
      await prisma.order.findFirst({
        where: {
          id: orderId,
          workspaceId: input.workspaceId,
          userId: input.customerId
        },
        select: {
          id: true
        }
      });

    if (!order) {
      throw new SupportServiceError(
        'CONTEXT_NOT_FOUND',
        'The selected order is unavailable.'
      );
    }
  }

  if (deliveryId) {
    const delivery =
      await prisma.delivery.findFirst({
        where: {
          id: deliveryId,
          workspaceId: input.workspaceId,
          order: {
            userId: input.customerId
          }
        },
        select: {
          id: true
        }
      });

    if (!delivery) {
      throw new SupportServiceError(
        'CONTEXT_NOT_FOUND',
        'The selected delivery is unavailable.'
      );
    }
  }

  if (vendorProfileId) {
    const vendor =
      await prisma.vendorProfile.findFirst({
        where: {
          id: vendorProfileId,
          workspaceId: input.workspaceId,
          active: true,
          status: 'ACTIVE'
        },
        select: {
          id: true
        }
      });

    if (!vendor) {
      throw new SupportServiceError(
        'CONTEXT_NOT_FOUND',
        'The selected vendor is unavailable.'
      );
    }
  }

  const dueAt = await resolveDueAt(
    input.workspaceId,
    input.category,
    priority
  );

  const created =
    await prisma.$transaction(
      async transaction => {
        const conversation =
          await transaction.communicationConversation.create({
            data: {
              workspaceId: input.workspaceId,
              type: 'SUPPORT_CASE',
              status: 'OPEN',
              subject,
              vendorProfileId,
              createdById: input.customerId,
              metadata: input.metadata,
              lastMessageAt: new Date(),
              participants: {
                create: {
                  userId: input.customerId,
                  role: 'CUSTOMER',
                  status: 'ACTIVE',
                  unreadCount: 0,
                  lastReadAt: new Date()
                }
              },
              context: {
                create: {
                  orderId,
                  source:
                    'CUSTOMER_SUPPORT',
                  metadata: input.metadata
                }
              },
              messages: {
                create: {
                  senderId: input.customerId,
                  senderRole: 'CUSTOMER',
                  type: 'TEXT',
                  body: description,
                  metadata: input.metadata
                }
              },
              statusHistory: {
                create: {
                  actorId: input.customerId,
                  toStatus: 'OPEN',
                  reason:
                    'Customer opened a Support Case.'
                }
              }
            },
            select: {
              id: true
            }
          });

        const supportCase =
          await transaction.supportCase.create({
            data: {
              caseNumber: caseNumber(),
              workspaceId: input.workspaceId,
              conversationId:
                conversation.id,
              customerId: input.customerId,
              vendorProfileId,
              orderId,
              deliveryId,
              category: input.category,
              priority,
              status: 'NEW',
              subject,
              description,
              dueAt,
              metadata: input.metadata,
              statusHistory: {
                create: {
                  actorId: input.customerId,
                  toStatus: 'NEW',
                  note:
                    'Customer submitted the Support Case.'
                }
              }
            },
            select: {
              id: true,
              caseNumber: true
            }
          });

        await upsertOperationalTodo(
          transaction,
          {
            workspaceId:
              input.workspaceId,
            title:
              `Review new Support Case ${supportCase.caseNumber}`,
            description:
              `${input.category.replaceAll('_', ' ')} · ${subject}`,
            source:
              'SUPPORT',
            priority:
              supportTodoPriority(
                priority
              ),
            targetId:
              supportCase.id,
            dedupeKey:
              `support:case:${supportCase.id}:new`,
            metadata: {
              caseNumber:
                supportCase.caseNumber,
              category:
                input.category,
              priority
            },
            createdById:
              input.customerId
          }
        );

        return supportCase.id;
      }
    );

  const result =
    await getCustomerSupportCase(
      created,
      input.customerId,
      input.workspaceId
    );

  if (!result) {
    throw new SupportServiceError(
      'CASE_NOT_FOUND',
      'The Support Case was created but could not be reloaded.'
    );
  }

  return result;
}

export async function assignSupportCase(
  input: AssignSupportCaseInput
): Promise<SupportCaseDetail> {
  const reason = optionalText(
    input.reason,
    1000
  );
  const current =
    await prisma.supportCase.findFirst({
      where: {
        id: input.caseId,
        workspaceId: input.workspaceId
      },
      select: {
        id: true,
        status: true,
        conversationId: true
      }
    });

  if (!current) {
    throw new SupportServiceError(
      'CASE_NOT_FOUND',
      'The Support Case could not be found.'
    );
  }

  const agent =
    await prisma.workspaceMembership.findFirst({
      where: {
        workspaceId: input.workspaceId,
        userId: input.agentId,
        active: true,
        role: {
          in: [
            'SUPPORT',
            'MANAGER',
            'ADMIN',
            'OWNER',
            'SUPER_ADMIN'
          ]
        }
      },
      select: {
        id: true
      }
    });

  if (!agent) {
    throw new SupportServiceError(
      'ACCESS_DENIED',
      'The selected agent does not have Support access.'
    );
  }

  const now = new Date();

  await prisma.$transaction(
    async transaction => {
      await transaction.supportAssignment.updateMany({
        where: {
          caseId: input.caseId,
          active: true
        },
        data: {
          active: false,
          releasedAt: now
        }
      });

      await transaction.supportAssignment.create({
        data: {
          caseId: input.caseId,
          agentId: input.agentId,
          assignedById:
            input.assignedById,
          reason,
          active: true,
          assignedAt: now
        }
      });

      await transaction.communicationParticipant.upsert({
        where: {
          conversationId_userId_role: {
            conversationId:
              current.conversationId,
            userId: input.agentId,
            role: 'SUPPORT_AGENT'
          }
        },
        create: {
          conversationId:
            current.conversationId,
          userId: input.agentId,
          role: 'SUPPORT_AGENT',
          status: 'ACTIVE',
          unreadCount: 0,
          lastReadAt: now
        },
        update: {
          status: 'ACTIVE',
          leftAt: null,
          archivedAt: null
        }
      });

      await transaction.supportCase.update({
        where: {
          id: input.caseId
        },
        data: {
          assignedAgentId:
            input.agentId,
          assignedAt: now,
          status: 'ASSIGNED'
        }
      });

      await transaction.supportStatusHistory.create({
        data: {
          caseId: input.caseId,
          actorId:
            input.assignedById,
          fromStatus: current.status,
          toStatus: 'ASSIGNED',
          note:
            reason ??
            'Support Case assigned.'
        }
      });

      await completeOperationalTodos(
        transaction,
        {
          workspaceId:
            input.workspaceId,
          source:
            'SUPPORT',
          targetId:
            input.caseId,
          dedupeKey:
            `support:case:${input.caseId}:new`
        }
      );
    }
  );

  await publishSupportLiveEventSoft({
    workspaceId: input.workspaceId,
    caseId: input.caseId,
    conversationId:
      current.conversationId,
    type: 'CASE_UPDATED',
    actorId:
      input.assignedById,
    payload: {
      reason: 'ASSIGNED',
      assignedAgentId:
        input.agentId,
      status: 'ASSIGNED'
    }
  });

  const result =
    await getAgentSupportCase(
      input.caseId,
      input.workspaceId
    );

  if (!result) {
    throw new SupportServiceError(
      'CASE_NOT_FOUND',
      'The assigned Support Case could not be reloaded.'
    );
  }

  return result;
}

export async function changeSupportCaseStatus(
  input: ChangeSupportStatusInput
): Promise<SupportCaseDetail> {
  const note = optionalText(
    input.note,
    1000
  );
  const current =
    await prisma.supportCase.findFirst({
      where: {
        id: input.caseId,
        workspaceId: input.workspaceId
      },
      select: {
        status: true,
        conversationId: true
      }
    });

  if (!current) {
    throw new SupportServiceError(
      'CASE_NOT_FOUND',
      'The Support Case could not be found.'
    );
  }

  if (current.status === input.status) {
    const existing =
      await getAgentSupportCase(
        input.caseId,
        input.workspaceId
      );

    if (!existing) {
      throw new SupportServiceError(
        'CASE_NOT_FOUND',
        'The Support Case could not be reloaded.'
      );
    }

    return existing;
  }

  if (
    !transitions[current.status].includes(
      input.status
    )
  ) {
    throw new SupportServiceError(
      'INVALID_TRANSITION',
      `${current.status} cannot move directly to ${input.status}.`
    );
  }

  const now = new Date();
  const data:
    Prisma.SupportCaseUpdateInput = {
      status: input.status
    };

  if (input.status === 'RESOLVED') {
    data.resolvedAt = now;
  }

  if (
    input.status ===
    'CUSTOMER_CONFIRMED'
  ) {
    data.customerConfirmedAt = now;
  }

  if (input.status === 'CLOSED') {
    data.closedAt = now;
  }

  if (input.status === 'IN_PROGRESS') {
    data.closedAt = null;
  }

  await prisma.$transaction(
    async transaction => {
      await transaction.supportCase.update({
        where: {
          id: input.caseId
        },
        data
      });

      await transaction.supportStatusHistory.create({
        data: {
          caseId: input.caseId,
          actorId: input.actorId,
          fromStatus: current.status,
          toStatus: input.status,
          note
        }
      });

      if (
        input.status !==
        'NEW'
      ) {
        await completeOperationalTodos(
          transaction,
          {
            workspaceId:
              input.workspaceId,
            source:
              'SUPPORT',
            targetId:
              input.caseId,
            dedupeKey:
              `support:case:${input.caseId}:new`
          }
        );
      }
    }
  );

  await publishSupportLiveEventSoft({
    workspaceId: input.workspaceId,
    caseId: input.caseId,
    conversationId:
      current.conversationId,
    type: 'CASE_UPDATED',
    actorId: input.actorId,
    payload: {
      reason: 'STATUS_CHANGED',
      status: input.status
    }
  });

  const result =
    await getAgentSupportCase(
      input.caseId,
      input.workspaceId
    );

  if (!result) {
    throw new SupportServiceError(
      'CASE_NOT_FOUND',
      'The updated Support Case could not be reloaded.'
    );
  }

  try {
    await notifySupportStatusChange({
      caseId: input.caseId,
      workspaceId: input.workspaceId,
      status: input.status
    });
  } catch (cause) {
    console.error(
      'Support status notification delivery failed.',
      cause
    );
  }

  return result;
}

export async function addSupportInternalNote(
  input: {
    workspaceId: string;
    caseId: string;
    authorId: string;
    body: string;
  }
): Promise<SupportCaseDetail> {
  const body = requiredText(
    input.body,
    'Internal note',
    MAX_NOTE_LENGTH
  );

  const record =
    await prisma.supportCase.findFirst({
      where: {
        id: input.caseId,
        workspaceId: input.workspaceId
      },
      select: {
        id: true,
        conversationId: true
      }
    });

  if (!record) {
    throw new SupportServiceError(
      'CASE_NOT_FOUND',
      'The Support Case could not be found.'
    );
  }

  await prisma.supportNote.create({
    data: {
      caseId: input.caseId,
      authorId: input.authorId,
      body,
      internal: true
    }
  });

  await publishSupportLiveEventSoft({
    workspaceId: input.workspaceId,
    caseId: input.caseId,
    conversationId:
      record.conversationId,
    type: 'CASE_UPDATED',
    actorId:
      input.authorId,
    payload: {
      reason:
        'INTERNAL_NOTE_CREATED'
    }
  });

  const result =
    await getAgentSupportCase(
      input.caseId,
      input.workspaceId
    );

  if (!result) {
    throw new SupportServiceError(
      'CASE_NOT_FOUND',
      'The Support Case could not be reloaded.'
    );
  }

  return result;
}

export async function escalateSupportCase(
  input: {
    workspaceId: string;
    caseId: string;
    actorId: string;
    priority: SupportCasePriority;
    reason: string;
  }
): Promise<SupportCaseDetail> {
  const reason = requiredText(
    input.reason,
    'Escalation reason',
    1000
  );
  const current =
    await prisma.supportCase.findFirst({
      where: {
        id: input.caseId,
        workspaceId: input.workspaceId
      },
      select: {
        priority: true,
        conversationId: true
      }
    });

  if (!current) {
    throw new SupportServiceError(
      'CASE_NOT_FOUND',
      'The Support Case could not be found.'
    );
  }

  await prisma.$transaction([
    prisma.supportEscalation.create({
      data: {
        caseId: input.caseId,
        actorId: input.actorId,
        fromPriority: current.priority,
        toPriority: input.priority,
        status: 'OPEN',
        reason
      }
    }),
    prisma.supportCase.update({
      where: {
        id: input.caseId
      },
      data: {
        priority: input.priority
      }
    })
  ]);

  await publishSupportLiveEventSoft({
    workspaceId: input.workspaceId,
    caseId: input.caseId,
    conversationId:
      current.conversationId,
    type: 'CASE_UPDATED',
    actorId: input.actorId,
    payload: {
      reason: 'PRIORITY_CHANGED',
      priority: input.priority
    }
  });

  const result =
    await getAgentSupportCase(
      input.caseId,
      input.workspaceId
    );

  if (!result) {
    throw new SupportServiceError(
      'CASE_NOT_FOUND',
      'The escalated Support Case could not be reloaded.'
    );
  }

  return result;
}

export async function proposeSupportResolution(
  input: {
    workspaceId: string;
    caseId: string;
    proposedById: string;
    type: SupportResolutionType;
    summary: string;
    actionPayload?: Prisma.InputJsonValue;
  }
): Promise<SupportCaseDetail> {
  const summary = requiredText(
    input.summary,
    'Resolution summary',
    4000
  );

  const record =
    await prisma.supportCase.findFirst({
      where: {
        id: input.caseId,
        workspaceId: input.workspaceId
      },
      select: {
        id: true,
        conversationId: true
      }
    });

  if (!record) {
    throw new SupportServiceError(
      'CASE_NOT_FOUND',
      'The Support Case could not be found.'
    );
  }

  await prisma.supportResolution.create({
    data: {
      caseId: input.caseId,
      proposedById:
        input.proposedById,
      type: input.type,
      status: 'PROPOSED',
      summary,
      actionPayload:
        input.actionPayload
    }
  });

  await publishSupportLiveEventSoft({
    workspaceId: input.workspaceId,
    caseId: input.caseId,
    conversationId:
      record.conversationId,
    type: 'CASE_UPDATED',
    actorId:
      input.proposedById,
    payload: {
      reason:
        'RESOLUTION_PROPOSED',
      resolutionType:
        input.type
    }
  });

  const result =
    await getAgentSupportCase(
      input.caseId,
      input.workspaceId
    );

  if (!result) {
    throw new SupportServiceError(
      'CASE_NOT_FOUND',
      'The Support Case could not be reloaded.'
    );
  }

  try {
    await notifySupportResolutionProposed({
      caseId: input.caseId,
      workspaceId: input.workspaceId
    });
  } catch (cause) {
    console.error(
      'Support resolution notification delivery failed.',
      cause
    );
  }

  return result;
}

export async function sendSupportCaseMessage(
  input: SendSupportMessageInput
): Promise<SupportCaseDetail> {
  const record =
    await prisma.supportCase.findFirst({
      where: {
        id: input.caseId,
        workspaceId: input.workspaceId
      },
      select: {
        customerId: true,
        conversationId: true,
        status: true,
        firstResponseAt: true
      }
    });

  if (!record) {
    throw new SupportServiceError(
      'CASE_NOT_FOUND',
      'The Support Case could not be found.'
    );
  }

  const conversation =
    await sendCommunicationMessage({
    workspaceId: input.workspaceId,
    conversationId:
      record.conversationId,
    senderUserId: input.senderUserId,
    body: input.body
  });

  const customerMessage =
    input.senderUserId === record.customerId;
  const now = new Date();

  if (
    customerMessage &&
    record.status ===
      'WAITING_CUSTOMER'
  ) {
    await prisma.supportCase.update({
      where: {
        id: input.caseId
      },
      data: {
        status: 'IN_PROGRESS'
      }
    });
  }

  if (
    !customerMessage &&
    !record.firstResponseAt
  ) {
    await prisma.supportCase.update({
      where: {
        id: input.caseId
      },
      data: {
        firstResponseAt: now,
        status:
          record.status === 'NEW' ||
          record.status === 'TRIAGED' ||
          record.status === 'ASSIGNED'
            ? 'IN_PROGRESS'
            : record.status
      }
    });
  }

  const sentMessage =
    conversation.messages.at(-1);

  await publishSupportLiveEventSoft({
    workspaceId: input.workspaceId,
    caseId: input.caseId,
    conversationId:
      record.conversationId,
    type: 'MESSAGE_CREATED',
    actorId:
      input.senderUserId,
    payload: {
      messageId:
        sentMessage?.id ?? null,
      senderRole:
        sentMessage?.senderRole ??
        null
    }
  });

  const result = customerMessage
    ? await getCustomerSupportCase(
        input.caseId,
        input.senderUserId,
        input.workspaceId
      )
    : await getAgentSupportCase(
        input.caseId,
        input.workspaceId
      );

  if (!result) {
    throw new SupportServiceError(
      'CASE_NOT_FOUND',
      'The Support Case could not be reloaded.'
    );
  }

  return result;
}

export async function confirmSupportResolution(
  input: {
    workspaceId: string;
    caseId: string;
    customerId: string;
    confirmed: boolean;
    note?: string | null;
  }
): Promise<SupportCaseDetail> {
  const record =
    await prisma.supportCase.findFirst({
      where: {
        id: input.caseId,
        workspaceId: input.workspaceId,
        customerId: input.customerId
      },
      select: {
        status: true,
        conversationId: true
      }
    });

  if (!record) {
    throw new SupportServiceError(
      'CASE_NOT_FOUND',
      'The Support Case could not be found.'
    );
  }

  if (record.status !== 'RESOLVED') {
    throw new SupportServiceError(
      'INVALID_TRANSITION',
      'Only a resolved Support Case can be confirmed.'
    );
  }

  const nextStatus:
    SupportCaseStatus =
    input.confirmed
      ? 'CUSTOMER_CONFIRMED'
      : 'IN_PROGRESS';

  await prisma.$transaction([
    prisma.supportCase.update({
      where: {
        id: input.caseId
      },
      data: {
        status: nextStatus,
        customerConfirmedAt:
          input.confirmed
            ? new Date()
            : null,
        resolvedAt:
          input.confirmed
            ? undefined
            : null
      }
    }),
    prisma.supportStatusHistory.create({
      data: {
        caseId: input.caseId,
        actorId: input.customerId,
        fromStatus: 'RESOLVED',
        toStatus: nextStatus,
        note:
          optionalText(
            input.note,
            1000
          ) ??
          (input.confirmed
            ? 'Customer confirmed the resolution.'
            : 'Customer requested continued support.')
      }
    })
  ]);

  await publishSupportLiveEventSoft({
    workspaceId: input.workspaceId,
    caseId: input.caseId,
    conversationId:
      record.conversationId,
    type: 'CASE_UPDATED',
    actorId:
      input.customerId,
    payload: {
      reason:
        'RESOLUTION_CONFIRMED',
      confirmed:
        input.confirmed,
      status: nextStatus
    }
  });

  const result =
    await getCustomerSupportCase(
      input.caseId,
      input.customerId,
      input.workspaceId
    );

  if (!result) {
    throw new SupportServiceError(
      'CASE_NOT_FOUND',
      'The Support Case could not be reloaded.'
    );
  }

  return result;
}
