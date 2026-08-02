import 'server-only';

import { prisma } from '@/lib/prisma';

import {
  createCustomerNotification
} from '@/features/notifications/server/notificationRepository';

export async function notifyCommunicationRecipients(
  input: {
    workspaceId: string;
    conversationId: string;
    messageId: string;
    senderUserId: string;
    body: string;
  }
) {
  const conversation =
    await prisma.communicationConversation.findFirst({
      where: {
        id: input.conversationId,
        workspaceId: input.workspaceId
      },
      select: {
        id: true,
        subject: true,
        supportCase: {
          select: {
            id: true,
            caseNumber: true
          }
        },
        participants: {
          where: {
            status: 'ACTIVE',
            userId: {
              not: null
            }
          },
          select: {
            userId: true
          }
        }
      }
    });

  if (!conversation) return;

  const recipients = Array.from(
    new Set(
      conversation.participants
        .map(item => item.userId)
        .filter(
          (userId): userId is string =>
            Boolean(
              userId &&
              userId !== input.senderUserId
            )
        )
    )
  );

  if (!recipients.length) return;

  const supportCase =
    conversation.supportCase;

  const activeSupportRecipients =
    supportCase
      ? await prisma.supportLivePresence.findMany({
          where: {
            caseId:
              supportCase.id,
            userId: {
              in: recipients
            },
            active: true,
            expiresAt: {
              gt: new Date()
            }
          },
          select: {
            userId: true
          }
        })
      : [];

  const activeRecipientIds =
    new Set(
      activeSupportRecipients.map(
        item => item.userId
      )
    );

  const notificationRecipients =
    recipients.filter(
      userId =>
        !activeRecipientIds.has(
          userId
        )
    );

  if (
    !notificationRecipients.length
  ) {
    return;
  }
  const topic = supportCase
    ? 'SUPPORT'
    : 'COMMUNICATION';
  const href = supportCase
    ? `/support/${encodeURIComponent(
        supportCase.id
      )}`
    : `/inbox/${encodeURIComponent(
        conversation.id
      )}`;
  const title = supportCase
    ? `Support update · ${supportCase.caseNumber}`
    : conversation.subject?.trim() ||
      'New Inbox message';
  const preview =
    input.body.trim().slice(0, 180) ||
    'A new message is available.';

  await Promise.all(
    notificationRecipients.map(userId =>
      createCustomerNotification(
        prisma,
        {
          workspaceId:
            input.workspaceId,
          userId,
          topic,
          priority: 'NORMAL',
          title,
          message: preview,
          href,
          targetType: 'OTHER',
          targetId:
            conversation.id,
          scopeKey:
            `conversation:${conversation.id}`,
          dedupeKey:
            `communication-message:${input.messageId}:${userId}`,
          metadata: {
            conversationId:
              conversation.id,
            messageId:
              input.messageId,
            supportCaseId:
              supportCase?.id ?? null
          }
        }
      )
    )
  );
}
