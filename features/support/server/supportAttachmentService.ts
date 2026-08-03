import 'server-only';

import {
  del,
  put
} from '@vercel/blob';

import {
  prisma
} from '@/lib/prisma';

import type {
  SupportCaseDetail
} from '../supportTypes';

import {
  getCustomerSupportCase
} from './supportRepository';

import {
  publishSupportLiveEvent
} from './supportLiveRepository';

const MAX_ATTACHMENT_BYTES =
  4 * 1024 * 1024;

const ALLOWED_MIME_TYPES =
  new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]);

type SendCustomerSupportAttachmentInput = {
  workspaceId: string;
  caseId: string;
  customerId: string;
  file: File;
  body?: string | null;
};

export class SupportAttachmentError extends Error {
  readonly status: number;

  constructor(
    status: number,
    message: string
  ) {
    super(message);
    this.name =
      'SupportAttachmentError';
    this.status =
      status;
  }
}

function safeFileName(
  value: string
): string {
  const cleaned =
    value
      .normalize('NFKC')
      .replace(
        /[^a-zA-Z0-9._-]+/g,
        '-'
      )
      .replace(
        /-+/g,
        '-'
      )
      .replace(
        /^[-.]+|[-.]+$/g,
        ''
      )
      .slice(
        0,
        120
      );

  return cleaned ||
    'support-attachment';
}

function attachmentBody(
  value:
    string |
    null |
    undefined,
  fileName: string
): string {
  const normalized =
    value?.trim();

  return normalized ||
    `Shared an attachment: ${fileName}`;
}

export async function sendCustomerSupportAttachment(
  input:
    SendCustomerSupportAttachmentInput
): Promise<SupportCaseDetail> {
  if (
    !(input.file instanceof File)
  ) {
    throw new SupportAttachmentError(
      400,
      'Select a valid attachment.'
    );
  }

  if (
    input.file.size <= 0
  ) {
    throw new SupportAttachmentError(
      400,
      'The selected attachment is empty.'
    );
  }

  if (
    input.file.size >
    MAX_ATTACHMENT_BYTES
  ) {
    throw new SupportAttachmentError(
      413,
      'Attachments must not exceed 4 MB.'
    );
  }

  if (
    !ALLOWED_MIME_TYPES.has(
      input.file.type
    )
  ) {
    throw new SupportAttachmentError(
      415,
      'Use JPG, PNG, WEBP, GIF, PDF, TXT, DOC or DOCX files.'
    );
  }

  const supportCase =
    await prisma.supportCase.findFirst({
      where: {
        id:
          input.caseId,
        workspaceId:
          input.workspaceId,
        customerId:
          input.customerId,
        status: {
          not:
            'CLOSED'
        }
      },
      select: {
        id:
          true,
        conversationId:
          true,
        status:
          true
      }
    });

  if (!supportCase) {
    throw new SupportAttachmentError(
      404,
      'The Support Case is unavailable for attachments.'
    );
  }

  const fileName =
    safeFileName(
      input.file.name
    );

  const blob =
    await put(
      [
        'support',
        input.workspaceId,
        input.caseId,
        fileName
      ].join('/'),
      input.file,
      {
        access:
          'private',
        addRandomSuffix:
          true,
        contentType:
          input.file.type,
        cacheControlMaxAge:
          60
      }
    );

  try {
    const now =
      new Date();

    const message =
      await prisma.$transaction(
        async transaction => {
          const created =
            await transaction
              .communicationMessage
              .create({
                data: {
                  conversationId:
                    supportCase
                      .conversationId,
                  senderId:
                    input.customerId,
                  senderRole:
                    'CUSTOMER',
                  type:
                    'TEXT',
                  body:
                    attachmentBody(
                      input.body,
                      input.file.name
                    ),
                  attachments: {
                    create: {
                      uploadedById:
                        input.customerId,
                      fileName:
                        input.file.name,
                      mimeType:
                        input.file.type,
                      byteSize:
                        input.file.size,
                      storageProvider:
                        'VERCEL_BLOB_PRIVATE',
                      storageKey:
                        blob.url,
                      status:
                        'READY',
                      metadata: {
                        pathname:
                          blob.pathname
                      }
                    }
                  }
                },
                select: {
                  id:
                    true
                }
              });

          await transaction
            .communicationConversation
            .update({
              where: {
                id:
                  supportCase
                    .conversationId
              },
              data: {
                lastMessageAt:
                  now
              }
            });

          const customerParticipants =
            await transaction
              .communicationParticipant
              .findMany({
                where: {
                  conversationId:
                    supportCase
                      .conversationId,
                  userId:
                    input.customerId,
                  status:
                    'ACTIVE'
                },
                select: {
                  id:
                    true
                }
              });

          const participantIds =
            customerParticipants.map(
              item =>
                item.id
            );

          await transaction
            .communicationParticipant
            .updateMany({
              where: {
                conversationId:
                  supportCase
                    .conversationId,
                status:
                  'ACTIVE',
                id: {
                  notIn:
                    participantIds
                }
              },
              data: {
                unreadCount: {
                  increment:
                    1
                }
              }
            });

          if (
            participantIds.length
          ) {
            await transaction
              .communicationParticipant
              .updateMany({
                where: {
                  id: {
                    in:
                      participantIds
                  }
                },
                data: {
                  unreadCount:
                    0,
                  lastReadAt:
                    now,
                  archivedAt:
                    null
                }
              });
          }

          if (
            supportCase.status ===
            'WAITING_CUSTOMER'
          ) {
            await transaction
              .supportCase
              .update({
                where: {
                  id:
                    input.caseId
                },
                data: {
                  status:
                    'IN_PROGRESS'
                }
              });
          }

          return created;
        }
      );

    try {
      await publishSupportLiveEvent({
        workspaceId:
          input.workspaceId,
        caseId:
          input.caseId,
        conversationId:
          supportCase
            .conversationId,
        type:
          'MESSAGE_CREATED',
        actorId:
          input.customerId,
        payload: {
          messageId:
            message.id,
          senderRole:
            'CUSTOMER',
          attachment:
            true
        }
      });
    } catch (cause) {
      console.error(
        'Support attachment live event failed.',
        cause
      );
    }

    const detail =
      await getCustomerSupportCase(
        input.caseId,
        input.customerId,
        input.workspaceId
      );

    if (!detail) {
      throw new SupportAttachmentError(
        404,
        'The attachment was sent but the Support Case could not be reloaded.'
      );
    }

    return detail;
  } catch (cause) {
    try {
      await del(
        blob.url
      );
    } catch (cleanupCause) {
      console.error(
        'Support attachment cleanup failed.',
        cleanupCause
      );
    }

    throw cause;
  }
}
