import 'server-only';

import type {
  Prisma
} from '@/lib/generated/prisma/client';

import type {
  AIAssistantApplicationView,
  AIAssistantAudience,
  AIAssistantResponsePayload,
  AIAssistantSessionSummary,
  AIAssistantSessionView,
  AIAssistantJourneyStage,
  AIAssistantJourneyState,
  AIAssistantJourneyTransition
} from '../contracts';

export const assistantSessionInclude = {
  messages: {
    orderBy: {
      createdAt: 'asc'
    },
    include: {
      applications: {
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  }
} satisfies Prisma.AiAssistantSessionInclude;

export type AssistantSessionRecord =
  Prisma.AiAssistantSessionGetPayload<{
    include: typeof assistantSessionInclude;
  }>;

function audienceValue(
  audience: 'CUSTOMER' | 'ADMIN' | 'VENDOR'
): AIAssistantAudience {
  return audience.toLowerCase() as AIAssistantAudience;
}

function responsePayload(
  value: Prisma.JsonValue | null
): AIAssistantResponsePayload | null {
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value)
  ) {
    return null;
  }

  return value as unknown as AIAssistantResponsePayload;
}

function journeyStateValue(
  value:
    Prisma.JsonValue |
    null
): AIAssistantJourneyState | null {
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
    AIAssistantJourneyState;
}

function journeyTransitionValue(
  value:
    Prisma.JsonValue |
    null
): AIAssistantJourneyTransition | null {
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
    AIAssistantJourneyTransition;
}

function applicationHref(
  value: Prisma.JsonValue | null
): string | null {
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value)
  ) {
    return null;
  }

  const href =
    (value as Record<string, unknown>).href;

  return typeof href ===
    'string'
    ? href
    : null;
}

function applicationLabel(
  value: Prisma.JsonValue | null,
  actionType: string
): string {
  if (
    value &&
    typeof value === 'object' &&
    !Array.isArray(value)
  ) {
    const label =
      (value as Record<string, unknown>).label;

    if (
      typeof label ===
      'string' &&
      label.trim()
    ) {
      return label;
    }
  }

  return actionType
    .replaceAll(
      '_',
      ' '
    )
    .toLowerCase()
    .replace(
      /(^|\s)\S/g,
      character =>
        character.toUpperCase()
    );
}

function mapApplication(
  application: {
    id: string;
    actionType:
      | 'SHOPPING_LIST_CREATE'
      | 'ADMIN_TODO_CREATE'
      | 'PRODUCT_DRAFT_CREATE'
      | 'PRODUCT_REVISION_SUBMIT'
      | 'CAMPAIGN_DRAFT_CREATE';
    status:
      | 'PENDING'
      | 'APPLIED'
      | 'FAILED';
    targetType: string | null;
    targetId: string | null;
    resultPayload: Prisma.JsonValue | null;
    error: string | null;
    createdAt: Date;
    appliedAt: Date | null;
  }
): AIAssistantApplicationView {
  return {
    id:
      application.id,
    actionType:
      application.actionType,
    status:
      application.status,
    targetType:
      application.targetType,
    targetId:
      application.targetId,
    href:
      applicationHref(
        application.resultPayload
      ),
    label:
      applicationLabel(
        application.resultPayload,
        application.actionType
      ),
    error:
      application.error,
    createdAt:
      application.createdAt.toISOString(),
    appliedAt:
      application.appliedAt?.toISOString() ??
      null
  };
}

export function mapAssistantSession(
  session: AssistantSessionRecord
): AIAssistantSessionView {
  const lastMessage =
    session.messages.at(-1) ?? null;

  return {
    id: session.id,
    title: session.title,
    audience: audienceValue(
      session.audience
    ),
    status: session.status,
    journeyStage:
      session.journeyStage as
        AIAssistantJourneyStage,
    journeyStateVersion:
      session.journeyStateVersion,
    journeyState:
      journeyStateValue(
        session.journeyState
      ),
    journeyLastTransition:
      journeyTransitionValue(
        session.journeyLastTransition
      ),
    journeyGoal:
      session.journeyGoal ??
      session.title,
    activePlanMessageId:
      session.activePlanMessageId,
    currentPlanVersion:
      session.currentPlanVersion,
    lastRefinedAt:
      session.lastRefinedAt?.toISOString() ??
      null,
    messageCount:
      session.messages.length,
    lastMessage:
      lastMessage?.content ?? null,
    contextSnapshot:
      session.contextSnapshot &&
      typeof session.contextSnapshot ===
        'object' &&
      !Array.isArray(
        session.contextSnapshot
      )
        ? session.contextSnapshot as Record<string, unknown>
        : null,
    messages:
      session.messages.map(
        message => ({
          id: message.id,
          role: message.role,
          content: message.content,
          outputType:
            message.outputType,
          payload:
            responsePayload(
              message.payload
            ),
          provider:
            message.provider,
          confidence:
            message.confidence,
          feedback:
            message.feedback,
          journeyVersion:
            message.journeyVersion,
          previousPlanMessageId:
            message.previousPlanMessageId,
          isPlanSnapshot:
            message.isPlanSnapshot,
          journeyStateSnapshot:
            journeyStateValue(
              message.journeyStateSnapshot
            ),
          journeyStageSnapshot:
            message.journeyStageSnapshot as
              AIAssistantJourneyStage |
              null,
          journeyStateVersionSnapshot:
            message.journeyStateVersionSnapshot,
          journeyTransition:
            journeyTransitionValue(
              message.journeyTransition
            ),
          applications:
            message.applications.map(
              mapApplication
            ),
          createdAt:
            message.createdAt.toISOString()
        })
      ),
    createdAt:
      session.createdAt.toISOString(),
    updatedAt:
      session.updatedAt.toISOString()
  };
}

export function mapAssistantSessionSummary(
  session: AssistantSessionRecord
): AIAssistantSessionSummary {
  const mapped =
    mapAssistantSession(
      session
    );

  return {
    id: mapped.id,
    title: mapped.title,
    audience: mapped.audience,
    status: mapped.status,
    journeyStage:
      mapped.journeyStage,
    journeyStateVersion:
      mapped.journeyStateVersion,
    journeyState:
      mapped.journeyState,
    journeyLastTransition:
      mapped.journeyLastTransition,
    journeyGoal:
      mapped.journeyGoal,
    activePlanMessageId:
      mapped.activePlanMessageId,
    currentPlanVersion:
      mapped.currentPlanVersion,
    lastRefinedAt:
      mapped.lastRefinedAt,
    messageCount:
      mapped.messageCount,
    lastMessage:
      mapped.lastMessage,
    createdAt:
      mapped.createdAt,
    updatedAt:
      mapped.updatedAt
  };
}

export {
  mapApplication
};
