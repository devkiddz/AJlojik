import 'server-only';

import type {
  Prisma
} from '@/lib/generated/prisma/client';

import {
  prisma
} from '@/lib/prisma';

import type {
  AIAssistantHubInsight,
  AIAssistantResponsePayload
} from '../contracts';

import type {
  AssistantAccess
} from './assistantAccess';

import {
  mapApplication
} from './assistantMapper';

function payloadValue(
  value:
    Prisma.JsonValue |
    null
): AIAssistantResponsePayload | null {
  if (
    !value ||
    typeof value !==
      'object' ||
    Array.isArray(
      value
    )
  ) {
    return null;
  }

  return value as unknown as
    AIAssistantResponsePayload;
}

export async function getLatestCustomerAssistantInsight(
  access:
    AssistantAccess
): Promise<AIAssistantHubInsight | null> {
  if (
    access.audience !==
    'customer'
  ) {
    return null;
  }

  const session =
    await prisma.aiAssistantSession.findFirst({
      where: {
        workspaceId:
          access.workspaceId,
        userId:
          access.userId,
        audience:
          'CUSTOMER',
        status:
          'ACTIVE'
      },
      orderBy: {
        updatedAt:
          'desc'
      },
      include: {
        messages: {
          where: {
            role:
              'ASSISTANT'
          },
          orderBy: {
            createdAt:
              'desc'
          },
          take:
            1,
          include: {
            applications: {
              orderBy: {
                createdAt:
                  'desc'
              },
              take:
                1
            }
          }
        }
      }
    });

  const message =
    session?.messages[0] ??
    null;

  const payload =
    message
      ? payloadValue(
          message.payload
        )
      : null;

  if (
    !session ||
    !message ||
    !payload
  ) {
    return null;
  }

  return {
    sessionId:
      session.id,
    messageId:
      message.id,
    headline:
      payload.headline,
    summary:
      payload.summary,
    outputType:
      payload.outputType,
    products:
      payload.products.slice(
        0,
        4
      ),
    application:
      message.applications[0]
        ? mapApplication(
            message.applications[0]
          )
        : null,
    updatedAt:
      session.updatedAt.toISOString()
  };
}
