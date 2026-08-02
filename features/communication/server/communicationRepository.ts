import 'server-only';

import type {
  Prisma
} from '@/lib/generated/prisma/client';
import { prisma } from '@/lib/prisma';

import type {
  CommunicationContextItem,
  CommunicationConversationDetail,
  CommunicationConversationSummary,
  CommunicationIdentity,
  CommunicationInboxSnapshot,
  CommunicationMessageItem,
  CommunicationParticipantItem,
  CommunicationVendorIdentity
} from '../communicationTypes';

const summaryInclude = {
  vendorProfile: {
    select: {
      id: true,
      name: true,
      slug: true,
      logoMediaAsset: {
        select: {
          secureUrl: true
        }
      }
    }
  },
  context: {
    select: {
      orderId: true,
      orderItemIds: true,
      productId: true,
      source: true,
      order: {
        select: {
          orderNumber: true
        }
      },
      product: {
        select: {
          name: true
        }
      }
    }
  },
  participants: {
    select: {
      id: true,
      userId: true,
      vendorProfileId: true,
      role: true,
      status: true,
      unreadCount: true,
      lastReadAt: true,
      archivedAt: true,
      joinedAt: true,
      user: {
        select: {
          id: true,
          name: true,
          image: true
        }
      }
    }
  },
  messages: {
    where: {
      removedAt: null
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 1,
    select: {
      id: true,
      type: true,
      body: true,
      senderRole: true,
      replyToMessageId: true,
      editedAt: true,
      removedAt: true,
      createdAt: true,
      sender: {
        select: {
          id: true,
          name: true,
          image: true
        }
      },
      attachments: {
        where: {
          status: {
            not: 'REMOVED'
          }
        },
        orderBy: {
          createdAt: 'asc'
        },
        select: {
          id: true,
          fileName: true,
          mimeType: true,
          byteSize: true,
          status: true,
          createdAt: true
        }
      }
    }
  }
} satisfies Prisma.CommunicationConversationInclude;

const detailInclude = {
  ...summaryInclude,
  messages: {
    where: {
      removedAt: null
    },
    orderBy: {
      createdAt: 'asc'
    },
    take: 200,
    select: {
      id: true,
      type: true,
      body: true,
      senderRole: true,
      replyToMessageId: true,
      editedAt: true,
      removedAt: true,
      createdAt: true,
      sender: {
        select: {
          id: true,
          name: true,
          image: true
        }
      },
      attachments: {
        where: {
          status: {
            not: 'REMOVED'
          }
        },
        orderBy: {
          createdAt: 'asc'
        },
        select: {
          id: true,
          fileName: true,
          mimeType: true,
          byteSize: true,
          status: true,
          createdAt: true
        }
      }
    }
  }
} satisfies Prisma.CommunicationConversationInclude;

type SummaryRecord =
  Prisma.CommunicationConversationGetPayload<{
    include: typeof summaryInclude;
  }>;

type DetailRecord =
  Prisma.CommunicationConversationGetPayload<{
    include: typeof detailInclude;
  }>;

function mapIdentity(
  value: {
    id: string;
    name: string;
    image: string | null;
  } | null
): CommunicationIdentity | null {
  if (!value) return null;

  return {
    id: value.id,
    name: value.name,
    image: value.image
  };
}

function mapVendor(
  value: SummaryRecord['vendorProfile']
): CommunicationVendorIdentity | null {
  if (!value) return null;

  return {
    id: value.id,
    name: value.name,
    slug: value.slug,
    logoUrl: value.logoMediaAsset?.secureUrl ?? null
  };
}

function mapContext(
  value: SummaryRecord['context']
): CommunicationContextItem | null {
  if (!value) return null;

  return {
    orderId: value.orderId,
    orderNumber: value.order?.orderNumber ?? null,
    orderItemIds: value.orderItemIds,
    productId: value.productId,
    productName: value.product?.name ?? null,
    source: value.source
  };
}

function mapMessage(
  value: DetailRecord['messages'][number]
): CommunicationMessageItem {
  return {
    id: value.id,
    type: value.type,
    body: value.body,
    sender: mapIdentity(value.sender),
    senderRole: value.senderRole,
    replyToMessageId: value.replyToMessageId,
    attachments: value.attachments.map(attachment => ({
      id: attachment.id,
      fileName: attachment.fileName,
      mimeType: attachment.mimeType,
      byteSize: attachment.byteSize,
      status: attachment.status,
      createdAt: attachment.createdAt.toISOString()
    })),
    editedAt: value.editedAt?.toISOString() ?? null,
    removedAt: value.removedAt?.toISOString() ?? null,
    createdAt: value.createdAt.toISOString()
  };
}

function mapParticipant(
  value: DetailRecord['participants'][number]
): CommunicationParticipantItem {
  return {
    id: value.id,
    role: value.role,
    status: value.status,
    user: mapIdentity(value.user),
    vendorProfileId: value.vendorProfileId,
    unreadCount: value.unreadCount,
    lastReadAt: value.lastReadAt?.toISOString() ?? null,
    archivedAt: value.archivedAt?.toISOString() ?? null,
    joinedAt: value.joinedAt.toISOString()
  };
}

function unreadForUser(
  record: SummaryRecord,
  userId: string
): number {
  return record.participants
    .filter(
      participant =>
        participant.userId === userId &&
        participant.status === 'ACTIVE'
    )
    .reduce(
      (total, participant) =>
        total + participant.unreadCount,
      0
    );
}

function unreadForVendor(
  record: SummaryRecord,
  vendorProfileId: string
): number {
  return record.participants
    .filter(
      participant =>
        participant.vendorProfileId === vendorProfileId &&
        participant.role === 'VENDOR_MEMBER' &&
        participant.status === 'ACTIVE'
    )
    .reduce(
      (total, participant) =>
        total + participant.unreadCount,
      0
    );
}

function mapSummary(
  record: SummaryRecord,
  unreadCount: number
): CommunicationConversationSummary {
  const lastMessage = record.messages[0] ?? null;

  return {
    id: record.id,
    type: record.type,
    status: record.status,
    subject: record.subject,
    vendor: mapVendor(record.vendorProfile),
    context: mapContext(record.context),
    lastMessage: lastMessage
      ? mapMessage(lastMessage)
      : null,
    unreadCount,
    lastMessageAt:
      record.lastMessageAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString()
  };
}

function mapDetail(
  record: DetailRecord,
  unreadCount: number
): CommunicationConversationDetail {
  return {
    ...mapSummary(
      record as unknown as SummaryRecord,
      unreadCount
    ),
    participants: record.participants.map(mapParticipant),
    messages: record.messages.map(mapMessage)
  };
}

function safeTake(
  take: number,
  maximum = 100
): number {
  return Math.min(
    maximum,
    Math.max(1, Math.trunc(take))
  );
}

export async function getCustomerCommunicationInbox(
  userId: string,
  workspaceId: string,
  take = 30
): Promise<CommunicationInboxSnapshot> {
  const participantRecords =
    await prisma.communicationParticipant.findMany({
      where: {
        userId,
        status: 'ACTIVE',
        conversation: {
          workspaceId
        }
      },
      orderBy: {
        conversation: {
          lastMessageAt: 'desc'
        }
      },
      take: safeTake(take),
      include: {
        conversation: {
          include: summaryInclude
        }
      }
    });

  const conversations = participantRecords.map(record =>
    mapSummary(
      record.conversation,
      unreadForUser(record.conversation, userId)
    )
  );

  return {
    workspaceId,
    generatedAt: new Date().toISOString(),
    unreadCount: conversations.reduce(
      (total, conversation) =>
        total + conversation.unreadCount,
      0
    ),
    conversations
  };
}

export async function getVendorCommunicationInbox(
  vendorProfileId: string,
  workspaceId: string,
  take = 30
): Promise<CommunicationInboxSnapshot> {
  const records =
    await prisma.communicationConversation.findMany({
      where: {
        workspaceId,
        vendorProfileId
      },
      orderBy: [
        {
          lastMessageAt: {
            sort: 'desc',
            nulls: 'last'
          }
        },
        {
          updatedAt: 'desc'
        }
      ],
      take: safeTake(take),
      include: summaryInclude
    });

  const conversations = records.map(record =>
    mapSummary(
      record,
      unreadForVendor(record, vendorProfileId)
    )
  );

  return {
    workspaceId,
    generatedAt: new Date().toISOString(),
    unreadCount: conversations.reduce(
      (total, conversation) =>
        total + conversation.unreadCount,
      0
    ),
    conversations
  };
}

export async function getCommunicationConversationForUser(
  conversationId: string,
  userId: string,
  workspaceId: string
): Promise<CommunicationConversationDetail | null> {
  const record =
    await prisma.communicationConversation.findFirst({
      where: {
        id: conversationId,
        workspaceId,
        participants: {
          some: {
            userId,
            status: 'ACTIVE'
          }
        }
      },
      include: detailInclude
    });

  if (!record) return null;

  return mapDetail(
    record,
    unreadForUser(record, userId)
  );
}

export async function getCommunicationConversationForVendor(
  conversationId: string,
  vendorProfileId: string,
  workspaceId: string
): Promise<CommunicationConversationDetail | null> {
  const record =
    await prisma.communicationConversation.findFirst({
      where: {
        id: conversationId,
        workspaceId,
        vendorProfileId,
        participants: {
          some: {
            vendorProfileId,
            role: 'VENDOR_MEMBER',
            status: 'ACTIVE'
          }
        }
      },
      include: detailInclude
    });

  if (!record) return null;

  return mapDetail(
    record,
    unreadForVendor(record, vendorProfileId)
  );
}
export async function getCommunicationConversationForWorkspaceOperator(
  conversationId: string,
  workspaceId: string
): Promise<CommunicationConversationDetail | null> {
  const record =
    await prisma.communicationConversation.findFirst({
      where: {
        id: conversationId,
        workspaceId
      },
      include: detailInclude
    });

  if (!record) return null;

  return mapDetail(record, 0);
}
