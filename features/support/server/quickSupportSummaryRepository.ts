import 'server-only';

import type {
  CommunicationParticipantRole,
  SupportCaseStatus
} from '@/lib/generated/prisma/client';

import {
  prisma
} from '@/lib/prisma';

import type {
  QuickSupportCaseContinuity,
  QuickSupportMessageDirection,
  QuickSupportReplyPreview,
  QuickSupportSummary
} from '../quickSupportTypes';

const reusableStatuses:
  readonly SupportCaseStatus[] = [
    'NEW',
    'TRIAGED',
    'ASSIGNED',
    'IN_PROGRESS',
    'WAITING_CUSTOMER',
    'WAITING_VENDOR',
    'WAITING_INTERNAL'
  ];

const recentCaseLimit =
  20;

function messagePreview(
  body: string
): string {
  const normalized =
    body
      .replace(
        /\s+/g,
        ' '
      )
      .trim();

  return normalized.length >
    160
    ? `${normalized.slice(
        0,
        157
      )}…`
    : normalized;
}

function messageDirection(
  role:
    CommunicationParticipantRole
): QuickSupportMessageDirection {
  if (
    role ===
    'CUSTOMER'
  ) {
    return 'CUSTOMER';
  }

  if (
    role ===
      'SUPPORT_AGENT' ||
    role ===
      'ADMIN'
  ) {
    return 'SUPPORT';
  }

  return 'SYSTEM';
}

export async function getCustomerQuickSupportSummary(
  userId: string,
  workspaceId: string
): Promise<QuickSupportSummary> {
  const records =
    await prisma.supportCase.findMany({
      where: {
        customerId:
          userId,
        workspaceId
      },
      select: {
        id: true,
        caseNumber: true,
        conversationId:
          true,
        subject: true,
        status: true,
        updatedAt: true,
        conversation: {
          select: {
            lastMessageAt:
              true,
            participants: {
              where: {
                userId,
                role:
                  'CUSTOMER'
              },
              select: {
                unreadCount:
                  true,
                lastReadAt:
                  true
              },
              take:
                1
            },
            messages: {
              where: {
                removedAt:
                  null
              },
              orderBy: {
                createdAt:
                  'desc'
              },
              take:
                1,
              select: {
                id:
                  true,
                body:
                  true,
                senderRole:
                  true,
                createdAt:
                  true
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt:
          'desc'
      },
      take:
        100
    });

  const conversationIds =
    records.map(
      item =>
        item.conversationId
    );

  const latestAgentMessage =
    conversationIds.length >
      0
      ? await prisma.communicationMessage.findFirst({
          where: {
            conversationId: {
              in:
                conversationIds
            },
            removedAt:
              null,
            senderRole: {
              in: [
                'SUPPORT_AGENT',
                'ADMIN'
              ]
            }
          },
          orderBy: {
            createdAt:
              'desc'
          },
          select: {
            id:
              true,
            conversationId:
              true,
            body:
              true,
            createdAt:
              true,
            sender: {
              select: {
                id:
                  true,
                name:
                  true,
                email:
                  true,
                image:
                  true
              }
            }
          }
        })
      : null;

  const continuity =
    records
      .map(
        (
          record
        ): QuickSupportCaseContinuity => {
          const participant =
            record
              .conversation
              .participants[
                0
              ];

          const latestMessage =
            record
              .conversation
              .messages[
                0
              ];

          return {
            id:
              record.id,
            caseNumber:
              record.caseNumber,
            subject:
              record.subject,
            status:
              record.status,
            reusable:
              reusableStatuses.includes(
                record.status
              ),
            unreadCount:
              participant
                ?.unreadCount ??
              0,
            lastReadAt:
              participant
                ?.lastReadAt
                ?.toISOString() ??
              null,
            lastMessageAt:
              record
                .conversation
                .lastMessageAt
                ?.toISOString() ??
              null,
            lastMessagePreview:
              latestMessage
                ? messagePreview(
                    latestMessage.body
                  )
                : null,
            lastMessageDirection:
              latestMessage
                ? messageDirection(
                    latestMessage
                      .senderRole
                  )
                : null,
            updatedAt:
              record
                .updatedAt
                .toISOString()
          };
        }
      )
      .sort(
        (
          left,
          right
        ) => {
          const leftTime =
            Date.parse(
              left.lastMessageAt ??
                left.updatedAt
            );

          const rightTime =
            Date.parse(
              right.lastMessageAt ??
                right.updatedAt
            );

          return (
            rightTime -
            leftTime
          );
        }
      );

  const activeCase =
    continuity.find(
      item =>
        item.reusable
    ) ??
    null;

  let latestAgentReply:
    QuickSupportReplyPreview |
    null =
      null;

  if (
    latestAgentMessage
  ) {
    const supportCase =
      records.find(
        item =>
          item.conversationId ===
          latestAgentMessage
            .conversationId
      );

    if (
      supportCase
    ) {
      latestAgentReply = {
        caseId:
          supportCase.id,
        caseNumber:
          supportCase.caseNumber,
        messageId:
          latestAgentMessage.id,
        bodyPreview:
          messagePreview(
            latestAgentMessage.body
          ),
        sender:
          latestAgentMessage.sender
            ? {
                id:
                  latestAgentMessage
                    .sender
                    .id,
                name:
                  latestAgentMessage
                    .sender
                    .name,
                email:
                  latestAgentMessage
                    .sender
                    .email,
                image:
                  latestAgentMessage
                    .sender
                    .image
              }
            : null,
        createdAt:
          latestAgentMessage
            .createdAt
            .toISOString()
      };
    }
  }

  return {
    workspaceId,
    generatedAt:
      new Date()
        .toISOString(),
    totalCaseCount:
      continuity.length,
    openCaseCount:
      continuity.filter(
        item =>
          item.status !==
          'CLOSED'
      ).length,
    historyCount:
      continuity.filter(
        item =>
          !item.reusable
      ).length,
    unreadCount:
      continuity.reduce(
        (
          total,
          item
        ) =>
          total +
          item.unreadCount,
        0
      ),
    activeCase,
    recentCases:
      continuity.slice(
        0,
        recentCaseLimit
      ),
    latestAgentReply
  };
}
