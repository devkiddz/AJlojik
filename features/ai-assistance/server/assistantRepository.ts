import 'server-only';

import type {
  AiAssistantAudience as PrismaAssistantAudience,
  AiAssistantFeedback,
  Prisma
} from '@/lib/generated/prisma/client';

import {
  prisma
} from '@/lib/prisma';

import type {
  AIAssistantFeedbackValue,
  AIAssistantRuntimeContext
} from '../contracts';

import type {
  AssistantAccess
} from './assistantAccess';

import {
  assistantSessionInclude,
  mapAssistantSession,
  mapAssistantSessionSummary
} from './assistantMapper';

import {
  AssistantRuntimeError
} from './assistantRouteResponse';

import {
  assistantSessionTitle,
  runLocalAssistant
} from './localAssistantEngine';

function prismaAudience(
  audience:
    AssistantAccess['audience']
): PrismaAssistantAudience {
  return audience.toUpperCase() as
    PrismaAssistantAudience;
}

function sessionWhere(
  access:
    AssistantAccess
): Prisma.AiAssistantSessionWhereInput {
  return {
    workspaceId:
      access.workspaceId,
    userId:
      access.userId,
    audience:
      prismaAudience(
        access.audience
      ),
    vendorProfileId:
      access.audience ===
      'vendor'
        ? access.vendorProfileId
        : null
  };
}

async function ownedSession(
  access:
    AssistantAccess,
  sessionId:
    string
) {
  const session =
    await prisma.aiAssistantSession.findFirst({
      where: {
        id:
          sessionId,
        ...sessionWhere(
          access
        )
      },
      include:
        assistantSessionInclude
    });

  if (!session) {
    throw new AssistantRuntimeError(
      'The selected intelligence session was not found.',
      404
    );
  }

  return session;
}

export const AssistantRepository = {
  async listSessions(
    access:
      AssistantAccess
  ) {
    const sessions =
      await prisma.aiAssistantSession.findMany({
        where: {
          ...sessionWhere(
            access
          ),
          status:
            'ACTIVE'
        },
        include:
          assistantSessionInclude,
        orderBy: {
          updatedAt:
            'desc'
        },
        take:
          30
      });

    return sessions.map(
      mapAssistantSessionSummary
    );
  },

  async readSession(
    access:
      AssistantAccess,
    sessionId:
      string
  ) {
    return mapAssistantSession(
      await ownedSession(
        access,
        sessionId
      )
    );
  },

  async respond(
    access:
      AssistantAccess,
    input: {
      sessionId?:
        string |
        null;
      message:
        string;
      context:
        AIAssistantRuntimeContext;
    }
  ) {
    const message =
      input.message
        .replace(
          /\s+/g,
          ' '
        )
        .trim();

    if (!message) {
      throw new AssistantRuntimeError(
        'Write a question or request first.',
        422
      );
    }

    if (
      message.length >
      2000
    ) {
      throw new AssistantRuntimeError(
        'Assistant requests are limited to 2,000 characters.',
        422
      );
    }

    let sessionId =
      input.sessionId ??
      null;

    if (sessionId) {
      await ownedSession(
        access,
        sessionId
      );
    } else {
      const created =
        await prisma.aiAssistantSession.create({
          data: {
            workspaceId:
              access.workspaceId,
            userId:
              access.userId,
            vendorProfileId:
              access.vendorProfileId,
            audience:
              prismaAudience(
                access.audience
              ),
            title:
              assistantSessionTitle(
                message
              ),
            contextSnapshot:
              input.context as Prisma.InputJsonValue
          }
        });

      sessionId =
        created.id;
    }

    const resolvedSessionId =
      sessionId;

    if (!resolvedSessionId) {
      throw new AssistantRuntimeError(
        'The intelligence session could not be resolved.',
        500
      );
    }

    await prisma.aiAssistantMessage.create({
      data: {
        sessionId:
          resolvedSessionId,
        role:
          'USER',
        content:
          message,
        provider:
          'HUMAN'
      }
    });

    const recentUserMessageRecords =
      await prisma.aiAssistantMessage.findMany({
        where: {
          sessionId:
            resolvedSessionId,
          role:
            'USER'
        },
        orderBy: {
          createdAt:
            'asc'
        },
        take:
          12,
        select: {
          content:
            true
        }
      });

    const recentUserMessages =
      recentUserMessageRecords.map(
        record => record.content
      );

    const payload =
      await runLocalAssistant({
        access,
        prompt:
          message,
        context:
          input.context,
        conversation:
          recentUserMessages
      });

    const assistantMessage =
      await prisma.aiAssistantMessage.create({
        data: {
          sessionId:
            resolvedSessionId,
          role:
            'ASSISTANT',
          content:
            payload.summary,
          outputType:
            payload.outputType,
          payload:
            payload as Prisma.InputJsonValue,
          provider:
            'RCENTZ_LOCAL_V1',
          confidence:
            payload.confidence
        }
      });

    await prisma.aiAssistantSession.update({
      where: {
        id:
          resolvedSessionId
      },
      data: {
        contextSnapshot:
          input.context as Prisma.InputJsonValue,
        updatedAt:
          new Date()
      }
    });

    if (
      access.audience !==
      'customer'
    ) {
      await prisma.adminAuditEvent.create({
        data: {
          workspaceId:
            access.workspaceId,
          actorId:
            access.userId,
          action:
            'AI_ASSISTANT_DRAFT_CREATED',
          targetType:
            access.audience ===
            'vendor'
              ? 'VENDOR'
              : 'WORKSPACE',
          targetId:
            access.audience ===
            'vendor'
              ? access.vendorProfileId
              : access.workspaceId,
          summary:
            `${access.audience === 'vendor' ? 'Vendor' : 'Administrator'} intelligence draft created: ${payload.headline}.`,
          metadata: {
            sessionId:
              resolvedSessionId,
            messageId:
              assistantMessage.id,
            outputType:
              payload.outputType,
            provider:
              'RCENTZ_LOCAL_V1',
            confidence:
              payload.confidence
          }
        }
      });
    }

    return mapAssistantSession(
      await ownedSession(
        access,
        resolvedSessionId
      )
    );
  },

  async archiveSession(
    access:
      AssistantAccess,
    sessionId:
      string
  ) {
    await ownedSession(
      access,
      sessionId
    );

    await prisma.aiAssistantSession.update({
      where: {
        id:
          sessionId
      },
      data: {
        status:
          'ARCHIVED'
      }
    });

    return {
      archived:
        true
    };
  },

  async updateFeedback(
    access:
      AssistantAccess,
    messageId:
      string,
    feedback:
      AIAssistantFeedbackValue
  ) {
    const message =
      await prisma.aiAssistantMessage.findFirst({
        where: {
          id:
            messageId,
          role:
            'ASSISTANT',
          session: {
            ...sessionWhere(
              access
            )
          }
        },
        select: {
          id:
            true,
          sessionId:
            true
        }
      });

    if (!message) {
      throw new AssistantRuntimeError(
        'The selected assistant response was not found.',
        404
      );
    }

    await prisma.aiAssistantMessage.update({
      where: {
        id:
          message.id
      },
      data: {
        feedback:
          feedback as
            AiAssistantFeedback
      }
    });

    await prisma.aiAssistantSession.update({
      where: {
        id:
          message.sessionId
      },
      data: {
        updatedAt:
          new Date()
      }
    });

    if (
      access.audience !==
      'customer'
    ) {
      await prisma.adminAuditEvent.create({
        data: {
          workspaceId:
            access.workspaceId,
          actorId:
            access.userId,
          action:
            'AI_ASSISTANT_FEEDBACK_RECORDED',
          targetType:
            access.audience ===
            'vendor'
              ? 'VENDOR'
              : 'WORKSPACE',
          targetId:
            access.audience ===
            'vendor'
              ? access.vendorProfileId
              : access.workspaceId,
          summary:
            `${feedback.replaceAll('_', ' ')} feedback recorded for an intelligence draft.`,
          metadata: {
            sessionId:
              message.sessionId,
            messageId:
              message.id,
            feedback
          }
        }
      });
    }

    return {
      messageId:
        message.id,
      feedback
    };
  }
};
