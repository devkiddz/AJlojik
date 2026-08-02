import 'server-only';

import type {
  SupportCaseStatus
} from '@/lib/generated/prisma/client';

import {
  prisma
} from '@/lib/prisma';

import type {
  QuickSupportCaseContinuity,
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
              take:
                1,
              select: {
                id: true,
                body: true,
                createdAt:
                  true,
                sender: {
                  select: {
                    id: true,
                    name: true,
                    email:
                      true,
                    image:
                      true
                  }
                }
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

          return {
            id:
              record.id,
            caseNumber:
              record.caseNumber,
            subject:
              record.subject,
            status:
              record.status,
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
        reusableStatuses.includes(
          item.status
        )
    ) ??
    null;

  const replyCandidates =
    records
      .flatMap(
        record => {
          const message =
            record
              .conversation
              .messages[
                0
              ];

          if (!message) {
            return [];
          }

          const preview:
            QuickSupportReplyPreview = {
              caseId:
                record.id,
              caseNumber:
                record.caseNumber,
              messageId:
                message.id,
              bodyPreview:
                messagePreview(
                  message.body
                ),
              sender:
                message.sender
                  ? {
                      id:
                        message
                          .sender
                          .id,
                      name:
                        message
                          .sender
                          .name,
                      email:
                        message
                          .sender
                          .email,
                      image:
                        message
                          .sender
                          .image
                    }
                  : null,
              createdAt:
                message
                  .createdAt
                  .toISOString()
            };

          return [
            preview
          ];
        }
      )
      .sort(
        (
          left,
          right
        ) =>
          Date.parse(
            right.createdAt
          ) -
          Date.parse(
            left.createdAt
          )
      );

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
    latestAgentReply:
      replyCandidates[
        0
      ] ??
      null
  };
}
