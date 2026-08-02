import 'server-only';

import type {
  CommunicationParticipantRole,
  Prisma
} from '@/lib/generated/prisma/client';
import { prisma } from '@/lib/prisma';

import type {
  CommunicationConversationDetail
} from '../communicationTypes';

import {
  getCommunicationConversationForUser,
  getCommunicationConversationForVendor
} from './communicationRepository';

const MAX_SUBJECT_LENGTH = 180;
const MAX_MESSAGE_LENGTH = 4000;

export type CommunicationServiceErrorCode =
  | 'INVALID_INPUT'
  | 'ACCESS_DENIED'
  | 'CONTEXT_NOT_FOUND'
  | 'CONVERSATION_NOT_FOUND'
  | 'CONVERSATION_UNAVAILABLE';

export class CommunicationServiceError extends Error {
  readonly code: CommunicationServiceErrorCode;

  constructor(
    code: CommunicationServiceErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'CommunicationServiceError';
    this.code = code;
  }
}

type CreateCustomerVendorConversationInput = {
  workspaceId: string;
  customerId: string;
  vendorProfileId: string;
  subject?: string | null;
  message: string;
  orderId?: string | null;
  productId?: string | null;
  source?: string | null;
  metadata?: Prisma.InputJsonValue;
};

type SendCommunicationMessageInput = {
  workspaceId: string;
  conversationId: string;
  senderUserId: string;
  body: string;
  replyToMessageId?: string | null;
  metadata?: Prisma.InputJsonValue;
};

type MarkCommunicationReadInput = {
  workspaceId: string;
  conversationId: string;
  userId: string;
};

type SenderPrincipal = {
  role: CommunicationParticipantRole;
  participantIds: string[];
  vendorProfileId: string | null;
};

function requiredText(
  value: string,
  label: string,
  maximum: number
): string {
  const normalized = value.trim();

  if (!normalized) {
    throw new CommunicationServiceError(
      'INVALID_INPUT',
      `${label} is required.`
    );
  }

  if (normalized.length > maximum) {
    throw new CommunicationServiceError(
      'INVALID_INPUT',
      `${label} must not exceed ${maximum} characters.`
    );
  }

  return normalized;
}

function optionalText(
  value: string | null | undefined,
  maximum: number
): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const normalized = value.trim();

  if (!normalized) return null;

  if (normalized.length > maximum) {
    throw new CommunicationServiceError(
      'INVALID_INPUT',
      `Text must not exceed ${maximum} characters.`
    );
  }

  return normalized;
}

function conversationDedupeKey(input: {
  customerId: string;
  vendorProfileId: string;
  orderId: string | null;
  productId: string | null;
}) {
  const context =
    input.orderId ??
    input.productId ??
    'general';

  return [
    'customer-vendor',
    input.customerId,
    input.vendorProfileId,
    context
  ].join(':');
}

async function resolveSenderPrincipal(
  input: SendCommunicationMessageInput
): Promise<SenderPrincipal> {
  const conversation =
    await prisma.communicationConversation.findFirst({
      where: {
        id: input.conversationId,
        workspaceId: input.workspaceId
      },
      select: {
        id: true,
        status: true,
        vendorProfileId: true,
        participants: {
          where: {
            status: 'ACTIVE'
          },
          select: {
            id: true,
            userId: true,
            vendorProfileId: true,
            role: true
          }
        }
      }
    });

  if (!conversation) {
    throw new CommunicationServiceError(
      'CONVERSATION_NOT_FOUND',
      'The conversation could not be found.'
    );
  }

  if (conversation.status !== 'OPEN') {
    throw new CommunicationServiceError(
      'CONVERSATION_UNAVAILABLE',
      'This conversation is not open for new messages.'
    );
  }

  const directParticipants =
    conversation.participants.filter(
      participant =>
        participant.userId === input.senderUserId
    );

  if (directParticipants.length) {
    return {
      role: directParticipants[0]!.role,
      participantIds: directParticipants.map(
        participant => participant.id
      ),
      vendorProfileId: null
    };
  }

  if (!conversation.vendorProfileId) {
    throw new CommunicationServiceError(
      'ACCESS_DENIED',
      'You are not a participant in this conversation.'
    );
  }

  const membership =
    await prisma.vendorMembership.findFirst({
      where: {
        userId: input.senderUserId,
        vendorId: conversation.vendorProfileId,
        active: true,
        role: {
          in: [
            'OWNER',
            'MANAGER',
            'EDITOR'
          ]
        },
        vendor: {
          workspaceId: input.workspaceId,
          status: 'ACTIVE',
          active: true
        }
      },
      select: {
        vendorId: true
      }
    });

  if (!membership) {
    throw new CommunicationServiceError(
      'ACCESS_DENIED',
      'Vendor communication access is required.'
    );
  }

  const vendorParticipants =
    conversation.participants.filter(
      participant =>
        participant.vendorProfileId === membership.vendorId &&
        participant.role === 'VENDOR_MEMBER'
    );

  if (!vendorParticipants.length) {
    throw new CommunicationServiceError(
      'ACCESS_DENIED',
      'The vendor is not a participant in this conversation.'
    );
  }

  return {
    role: 'VENDOR_MEMBER',
    participantIds: vendorParticipants.map(
      participant => participant.id
    ),
    vendorProfileId: membership.vendorId
  };
}

export async function createCustomerVendorConversation(
  input: CreateCustomerVendorConversationInput
): Promise<CommunicationConversationDetail> {
  const message = requiredText(
    input.message,
    'Message',
    MAX_MESSAGE_LENGTH
  );
  const subject = optionalText(
    input.subject,
    MAX_SUBJECT_LENGTH
  );
  const orderId = optionalText(input.orderId, 240);
  const productId = optionalText(input.productId, 240);
  const source = optionalText(input.source, 120);

  const [customerMembership, vendor] =
    await Promise.all([
      prisma.workspaceMembership.findFirst({
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
      }),
      prisma.vendorProfile.findFirst({
        where: {
          id: input.vendorProfileId,
          workspaceId: input.workspaceId,
          status: 'ACTIVE',
          active: true
        },
        select: {
          id: true
        }
      })
    ]);

  if (!customerMembership) {
    throw new CommunicationServiceError(
      'ACCESS_DENIED',
      'An active customer workspace is required.'
    );
  }

  if (!vendor) {
    throw new CommunicationServiceError(
      'CONTEXT_NOT_FOUND',
      'The vendor is unavailable.'
    );
  }

  let orderItemIds: string[] = [];

  if (orderId) {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        workspaceId: input.workspaceId,
        userId: input.customerId,
        items: {
          some: {
            product: {
              vendorProfileId: input.vendorProfileId
            }
          }
        }
      },
      select: {
        id: true,
        items: {
          where: {
            product: {
              vendorProfileId: input.vendorProfileId
            }
          },
          select: {
            id: true
          }
        }
      }
    });

    if (!order) {
      throw new CommunicationServiceError(
        'CONTEXT_NOT_FOUND',
        'The vendor does not belong to this customer order.'
      );
    }

    orderItemIds = order.items.map(item => item.id);
  }

  if (productId) {
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        workspaceId: input.workspaceId,
        vendorProfileId: input.vendorProfileId,
        status: 'PUBLISHED',
        active: true
      },
      select: {
        id: true
      }
    });

    if (!product) {
      throw new CommunicationServiceError(
        'CONTEXT_NOT_FOUND',
        'The selected product does not belong to this vendor.'
      );
    }
  }

  const dedupeKey = conversationDedupeKey({
    customerId: input.customerId,
    vendorProfileId: input.vendorProfileId,
    orderId,
    productId
  });

  const conversationId =
    await prisma.$transaction(async transaction => {
      const existing =
        await transaction.communicationConversation.findFirst({
          where: {
            workspaceId: input.workspaceId,
            dedupeKey
          },
          select: {
            id: true
          }
        });

      if (existing) {
        const existingConversation =
          await transaction.communicationConversation.findUnique({
            where: {
              id: existing.id
            },
            select: {
              status: true,
              participants: {
                where: {
                  status: 'ACTIVE'
                },
                select: {
                  id: true,
                  userId: true,
                  vendorProfileId: true,
                  role: true
                }
              }
            }
          });

        if (
          !existingConversation ||
          existingConversation.status !== 'OPEN'
        ) {
          throw new CommunicationServiceError(
            'CONVERSATION_UNAVAILABLE',
            'The existing conversation is not open for new messages.'
          );
        }

        const customerParticipantIds =
          existingConversation.participants
            .filter(
              participant =>
                participant.userId === input.customerId
            )
            .map(participant => participant.id);

        if (!customerParticipantIds.length) {
          throw new CommunicationServiceError(
            'ACCESS_DENIED',
            'The customer is not a participant in this conversation.'
          );
        }

        await transaction.communicationMessage.create({
          data: {
            conversationId: existing.id,
            senderId: input.customerId,
            senderRole: 'CUSTOMER',
            type: 'TEXT',
            body: message,
            metadata: input.metadata
          }
        });

        await transaction.communicationConversation.update({
          where: {
            id: existing.id
          },
          data: {
            lastMessageAt: new Date()
          }
        });

        await transaction.communicationParticipant.updateMany({
          where: {
            conversationId: existing.id,
            status: 'ACTIVE',
            id: {
              notIn: customerParticipantIds
            }
          },
          data: {
            unreadCount: {
              increment: 1
            }
          }
        });

        await transaction.communicationParticipant.updateMany({
          where: {
            id: {
              in: customerParticipantIds
            }
          },
          data: {
            unreadCount: 0,
            lastReadAt: new Date(),
            archivedAt: null
          }
        });

        return existing.id;
      }

      const created =
        await transaction.communicationConversation.create({
          data: {
            workspaceId: input.workspaceId,
            type: 'CUSTOMER_VENDOR',
            status: 'OPEN',
            subject,
            vendorProfileId: input.vendorProfileId,
            createdById: input.customerId,
            dedupeKey,
            metadata: input.metadata,
            lastMessageAt: new Date(),
            participants: {
              create: [
                {
                  userId: input.customerId,
                  role: 'CUSTOMER',
                  status: 'ACTIVE',
                  unreadCount: 0,
                  lastReadAt: new Date()
                },
                {
                  vendorProfileId: input.vendorProfileId,
                  role: 'VENDOR_MEMBER',
                  status: 'ACTIVE',
                  unreadCount: 1
                }
              ]
            },
            context: {
              create: {
                orderId,
                productId,
                orderItemIds,
                source,
                metadata: input.metadata
              }
            },
            messages: {
              create: {
                senderId: input.customerId,
                senderRole: 'CUSTOMER',
                type: 'TEXT',
                body: message,
                metadata: input.metadata
              }
            },
            statusHistory: {
              create: {
                actorId: input.customerId,
                toStatus: 'OPEN',
                reason: 'Customer opened the conversation.'
              }
            }
          },
          select: {
            id: true
          }
        });

      return created.id;
    });

  const conversation =
    await getCommunicationConversationForUser(
      conversationId,
      input.customerId,
      input.workspaceId
    );

  if (!conversation) {
    throw new CommunicationServiceError(
      'CONVERSATION_NOT_FOUND',
      'The conversation was created but could not be reloaded.'
    );
  }

  return conversation;
}

export async function sendCommunicationMessage(
  input: SendCommunicationMessageInput
): Promise<CommunicationConversationDetail> {
  const body = requiredText(
    input.body,
    'Message',
    MAX_MESSAGE_LENGTH
  );
  const replyToMessageId = optionalText(
    input.replyToMessageId,
    240
  );
  const principal = await resolveSenderPrincipal(input);
  const now = new Date();

  await prisma.$transaction(async transaction => {
    if (replyToMessageId) {
      const replyTarget =
        await transaction.communicationMessage.findFirst({
          where: {
            id: replyToMessageId,
            conversationId: input.conversationId,
            removedAt: null
          },
          select: {
            id: true
          }
        });

      if (!replyTarget) {
        throw new CommunicationServiceError(
          'CONTEXT_NOT_FOUND',
          'The message being replied to is unavailable.'
        );
      }
    }

    await transaction.communicationMessage.create({
      data: {
        conversationId: input.conversationId,
        senderId: input.senderUserId,
        senderRole: principal.role,
        type: 'TEXT',
        body,
        replyToMessageId,
        metadata: input.metadata
      }
    });

    await transaction.communicationConversation.update({
      where: {
        id: input.conversationId
      },
      data: {
        lastMessageAt: now
      }
    });

    await transaction.communicationParticipant.updateMany({
      where: {
        conversationId: input.conversationId,
        status: 'ACTIVE',
        id: {
          notIn: principal.participantIds
        }
      },
      data: {
        unreadCount: {
          increment: 1
        }
      }
    });

    await transaction.communicationParticipant.updateMany({
      where: {
        id: {
          in: principal.participantIds
        }
      },
      data: {
        unreadCount: 0,
        lastReadAt: now
      }
    });
  });

  const conversation =
    principal.vendorProfileId
      ? await getCommunicationConversationForVendor(
          input.conversationId,
          principal.vendorProfileId,
          input.workspaceId
        )
      : await getCommunicationConversationForUser(
          input.conversationId,
          input.senderUserId,
          input.workspaceId
        );

  if (!conversation) {
    throw new CommunicationServiceError(
      'CONVERSATION_NOT_FOUND',
      'The updated conversation could not be reloaded.'
    );
  }

  return conversation;
}

export async function markCommunicationConversationRead(
  input: MarkCommunicationReadInput
): Promise<boolean> {
  const conversation =
    await prisma.communicationConversation.findFirst({
      where: {
        id: input.conversationId,
        workspaceId: input.workspaceId
      },
      select: {
        vendorProfileId: true,
        participants: {
          where: {
            status: 'ACTIVE'
          },
          select: {
            id: true,
            userId: true,
            vendorProfileId: true,
            role: true
          }
        }
      }
    });

  if (!conversation) return false;

  const directIds = conversation.participants
    .filter(
      participant =>
        participant.userId === input.userId
    )
    .map(participant => participant.id);

  if (directIds.length) {
    await prisma.communicationParticipant.updateMany({
      where: {
        id: {
          in: directIds
        }
      },
      data: {
        unreadCount: 0,
        lastReadAt: new Date()
      }
    });

    return true;
  }

  if (!conversation.vendorProfileId) return false;

  const membership =
    await prisma.vendorMembership.findFirst({
      where: {
        userId: input.userId,
        vendorId: conversation.vendorProfileId,
        active: true,
        role: {
          in: [
            'OWNER',
            'MANAGER',
            'EDITOR'
          ]
        },
        vendor: {
          workspaceId: input.workspaceId,
          status: 'ACTIVE',
          active: true
        }
      },
      select: {
        vendorId: true
      }
    });

  if (!membership) return false;

  const vendorIds = conversation.participants
    .filter(
      participant =>
        participant.vendorProfileId === membership.vendorId &&
        participant.role === 'VENDOR_MEMBER'
    )
    .map(participant => participant.id);

  if (!vendorIds.length) return false;

  await prisma.communicationParticipant.updateMany({
    where: {
      id: {
        in: vendorIds
      }
    },
    data: {
      unreadCount: 0,
      lastReadAt: new Date()
    }
  });

  return true;
}
