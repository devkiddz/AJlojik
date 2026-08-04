import 'server-only';

/* AJ_MS12_STATE_AWARE_TRANSITIONS */
/* AJ_MS12_STATE_AWARE_TRANSITIONS_TYPE_REPAIR */
/* AJ_MS12_MEANINGFUL_CONSTRAINT_REFINEMENT_V1 */
/* AJ_MS12_4_MIXED_INSTRUCTION_AUTHORITY_V1 */

/* AJ_ASSISTANCE_WORKSPACE_STAGE_3 */

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
  AIAssistantRuntimeContext,
  AIAssistantJourneyStage,
  AIAssistantJourneyState,
  AIAssistantResponsePayload
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

import {
  isPlanExplanationOnlyInstruction
} from './journeyInstructionAuthority';

const genericJourneyPhrases = [
  'help me think this through',
  'help me get started',
  'start a new journey',
  'new journey',
  'help me decide',
  'i need help',
  'show me what you can do'
] as const;

function normalizedJourneyText(
  value:
    string
) {
  return value
    .replace(
      /\s+/g,
      ' '
    )
    .trim();
}

function genericJourneyText(
  value:
    string
) {
  const normalized =
    normalizedJourneyText(
      value
    )
      .toLowerCase()
      .replace(
        /[^a-z0-9\s]/g,
        ''
      );

  return (
    !normalized ||
    genericJourneyPhrases.some(
      phrase =>
        normalized ===
        phrase ||
        normalized.startsWith(
          `${phrase} `
        )
    )
  );
}

function constraintOnlyJourneyText(
  value:
    string
) {
  const normalized =
    normalizedJourneyText(
      value
    ).toLowerCase();

  return /^(my\s+)?budget\b|^under\s+[₦$£€]?\d|^for\s+\d+\s+(people|guests)|^(next|this)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|week|weekend)|^make\s+it\s+(cheaper|premium|better)/i.test(
    normalized
  );
}

function journeyTitleFromConversation(
  messages:
    string[],
  fallbackHeadline:
    string
) {
  const objective =
    messages.find(
      message => {
        const normalized =
          normalizedJourneyText(
            message
          );

        return (
          normalized.split(
            ' '
          ).length >=
            3 &&
          !genericJourneyText(
            normalized
          ) &&
          !constraintOnlyJourneyText(
            normalized
          )
        );
      }
    ) ??
    '';

  const fallback =
    genericJourneyText(
      fallbackHeadline
    ) ||
    /tell me|need more|one more detail/i.test(
      fallbackHeadline
    )
      ? ''
      : fallbackHeadline;

  const source =
    objective ||
    fallback;

  if (!source) {
    return null;
  }

  const cleaned =
    normalizedJourneyText(
      source
    )
      .replace(
        /^(please\s+)?(can|could|would)\s+you\s+/i,
        ''
      )
      .replace(
        /^(please\s+)?help\s+me\s+(to\s+)?/i,
        ''
      )
      .replace(
        /^i\s+(want|need|would like)\s+(to\s+)?/i,
        ''
      )
      .replace(
        /[.!?]+$/g,
        ''
      )
      .trim();

  if (!cleaned) {
    return null;
  }

  const title =
    cleaned
      .charAt(0)
      .toUpperCase() +
    cleaned.slice(1);

  return title.length <=
    68
      ? title
      : `${title.slice(
          0,
          65
        )}…`;
}

import {
  createJourneyRestoreTransition,
  resolveJourneyStateUpdate
} from './journeyStateResolver';

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

/* AJ_MS12_MEANINGFUL_PLAN_VERSION_AUTHORITY */
/* AJ_MS12_PLAN_EXPLANATION_AUTHORITY_V1 */

function isCustomerPlanExplanationPrompt(
  prompt:
    string
) {
  return isPlanExplanationOnlyInstruction(
    prompt
  );
}

function customerPlanPayload(
  value:
    AIAssistantResponsePayload
) {
  return [
    'PAIRING',
    'SHOPPING_PLAN'
  ].includes(
    value.outputType
  ) &&
    value.products.length >
      0;
}

function shouldCreateCustomerPlanSnapshot(
  input: {
    state:
      AIAssistantJourneyState;
    transitionReason:
      string;
    currentPlanVersion:
      number;
    activePlanMessageId:
      string |
      null;
    previousPlan:
      unknown;
    nextPlan:
      AIAssistantResponsePayload;
    prompt:
      string;
  }
) {
  if (
    isCustomerPlanExplanationPrompt(
      input.prompt
    )
  ) {
    return false;
  }

  if (
    input.state
      .unresolvedQuestions
      .length
  ) {
    return false;
  }

  if (
    input.currentPlanVersion ===
      0 ||
    !input.activePlanMessageId
  ) {
    return true;
  }

  if (
    [
      'PLAN_REFINED',
      'REOPENED'
    ].includes(
      input.transitionReason
    )
  ) {
    return true;
  }

  return (
    customerPlanPayload(
      input.nextPlan
    ) &&
    customerPlanMateriallyChanged({
      currentPlanVersion:
        input.currentPlanVersion,
      previousPlan:
        input.previousPlan,
      nextPlan:
        input.nextPlan
    })
  );
}


function planProductSignature(
  value:
    unknown
) {
  if (
    !value ||
    typeof value !==
      'object' ||
    Array.isArray(
      value
    )
  ) {
    return '';
  }

  const record =
    value as
      Partial<AIAssistantResponsePayload>;

  if (
    !Array.isArray(
      record.products
    )
  ) {
    return '';
  }

  return record.products
    .map(
      product =>
        [
          product.id,
          product.variantId ??
            '',
          product.price ??
            ''
        ].join(
          ':'
        )
    )
    .join(
      '|'
    );
}

function planMetricValue(
  value:
    unknown,
  label:
    string
) {
  if (
    !value ||
    typeof value !==
      'object' ||
    Array.isArray(
      value
    )
  ) {
    return '';
  }

  const record =
    value as
      Partial<AIAssistantResponsePayload>;

  const metric =
    Array.isArray(
      record.metrics
    )
      ? record.metrics.find(
          item =>
            item.label ===
            label
        )
      : null;

  return metric?.value ??
    '';
}

function planEstimatedTotal(
  value:
    unknown
) {
  return planMetricValue(
    value,
    'Estimated total'
  );
}

function planBudgetLimit(
  value:
    unknown
) {
  return planMetricValue(
    value,
    'Budget limit'
  );
}


function customerPlanMateriallyChanged(
  input: {
    currentPlanVersion:
      number;
    previousPlan:
      unknown;
    nextPlan:
      AIAssistantResponsePayload;
  }
) {
  if (
    input.currentPlanVersion ===
      0 ||
    !input.previousPlan
  ) {
    return true;
  }

  return (
    planProductSignature(
      input.previousPlan
    ) !==
      planProductSignature(
        input.nextPlan
      ) ||
    planEstimatedTotal(
      input.previousPlan
    ) !==
      planEstimatedTotal(
        input.nextPlan
      ) ||
    planBudgetLimit(
      input.previousPlan
    ) !==
      planBudgetLimit(
        input.nextPlan
      )
  );
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
            journeyGoal:
              message,
            currentPlanVersion:
              0,
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
            'desc'
        },
        take:
          12,
        select: {
          content:
            true
        }
      });

    /* AJ_ASSISTANCE_WORKSPACE_STAGE_2_RECENT_CONTEXT */
    const recentUserMessages =
      recentUserMessageRecords
        .map(
          record =>
            record.content
        )
        .reverse();

    /* AJ_MS12_CONSTRAINT_AWARE_PLAN_COMPOSITION_V1 */
    const journeyStateSource =
      await prisma.aiAssistantSession.findUnique({
        where: {
          id:
            resolvedSessionId
        },
        select: {
          journeyState:
            true,
          journeyStateVersion:
            true,
          currentPlanVersion:
            true,
          activePlanMessageId:
            true
        }
      });

    if (
      !journeyStateSource
    ) {
      throw new AssistantRuntimeError(
        'The Journey state could not be resolved.',
        500
      );
    }

    const activePlanPayload =
      journeyStateSource.activePlanMessageId
        ? await prisma.aiAssistantMessage.findUnique({
            where: {
              id:
                journeyStateSource.activePlanMessageId
            },
            select: {
              payload:
                true
            }
          })
        : null;

    const payload =
      await runLocalAssistant({
        access,
        prompt:
          message,
        context:
          input.context,
        conversation:
          recentUserMessages,
        journeyState:
          journeyStateSource.journeyState as
            unknown as
            AIAssistantJourneyState |
            null,
        previousPlan:
          activePlanPayload?.payload as
            unknown as
            AIAssistantResponsePayload |
            null
      });


    const journeyIdentity =
      await prisma.aiAssistantSession.findUnique({
        where: {
          id:
            resolvedSessionId
        },
        select: {
          title:
            true,
          journeyGoal:
            true
        }
      });

    const resolvedJourneyTitle =
      journeyIdentity &&
      genericJourneyText(
        journeyIdentity.title
      )
        ? journeyTitleFromConversation(
            recentUserMessages,
            payload.headline
          )
        : null;

    const preliminaryJourneyUpdate =
      resolveJourneyStateUpdate({
        previous:
          journeyStateSource.journeyState,
        conversation:
          recentUserMessages,
        prompt:
          message,
        payload,
        planVersion:
          journeyStateSource.currentPlanVersion
      });

    const proposedPlanSnapshot =
      access.audience !==
        'customer' ||
      shouldCreateCustomerPlanSnapshot({
        state:
          preliminaryJourneyUpdate.state,
        transitionReason:
          preliminaryJourneyUpdate
            .transition
            .reason,
        currentPlanVersion:
          journeyStateSource.currentPlanVersion,
        activePlanMessageId:
          journeyStateSource.activePlanMessageId,
        previousPlan:
          activePlanPayload?.payload,
        nextPlan:
          payload,
        prompt:
          message
      });

    const createPlanSnapshot =
      proposedPlanSnapshot &&
      (
        access.audience !==
          'customer' ||
        customerPlanMateriallyChanged({
          currentPlanVersion:
            journeyStateSource.currentPlanVersion,
          previousPlan:
            activePlanPayload?.payload,
          nextPlan:
            payload
        })
      );

    const nextPlanVersion =
      createPlanSnapshot
        ? journeyStateSource
            .currentPlanVersion +
          1
        : journeyStateSource
            .currentPlanVersion;

    const {
      state:
        journeyState,
      transition:
        journeyTransition
    } =
      createPlanSnapshot &&
      nextPlanVersion !==
        journeyStateSource
          .currentPlanVersion
        ? resolveJourneyStateUpdate({
            previous:
              journeyStateSource.journeyState,
            conversation:
              recentUserMessages,
            prompt:
              message,
            payload,
            planVersion:
              nextPlanVersion
          })
        : preliminaryJourneyUpdate;

    const nextJourneyStateVersion =
      journeyStateSource
        .journeyStateVersion +
      1;

    const persistedAt =
      new Date();

    const assistantMessage =
      await prisma.$transaction(
        async transaction => {
          const createdMessage =
            await transaction.aiAssistantMessage.create({
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
                  payload as
                    Prisma.InputJsonValue,
                provider:
                  'RCENTZ_LOCAL_V1',
                confidence:
                  payload.confidence,
                journeyVersion:
                  createPlanSnapshot
                    ? nextPlanVersion
                    : null,
                previousPlanMessageId:
                  createPlanSnapshot
                    ? journeyStateSource
                        .activePlanMessageId
                    : null,
                isPlanSnapshot:
                  createPlanSnapshot,
                journeyStateSnapshot:
                  journeyState as
                    Prisma.InputJsonValue,
                journeyStageSnapshot:
                  journeyState.currentStage,
                journeyStateVersionSnapshot:
                  nextJourneyStateVersion,
                journeyTransition:
                  journeyTransition as
                    Prisma.InputJsonValue
              }
            });

          await transaction.aiAssistantSession.update({
            where: {
              id:
                resolvedSessionId
            },
            data: {
              currentPlanVersion:
                nextPlanVersion,
              ...(createPlanSnapshot
                ? {
                    activePlanMessageId:
                      createdMessage.id,
                    lastRefinedAt:
                      persistedAt
                  }
                : {}),
              ...(resolvedJourneyTitle
                ? {
                    title:
                      resolvedJourneyTitle,
                    journeyGoal:
                      resolvedJourneyTitle
                  }
                : {}),
              contextSnapshot:
                input.context as
                  Prisma.InputJsonValue,
              journeyState:
                journeyState as
                  Prisma.InputJsonValue,
              journeyStateVersion: {
                increment:
                  1
              },
              journeyStage:
                journeyState.currentStage,
              journeyStateUpdatedAt:
                persistedAt,
              journeyLastTransition:
                journeyTransition as
                  Prisma.InputJsonValue,
              updatedAt:
                persistedAt
            }
          });

          return createdMessage;
        }
      );

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

  async renameSession(
    access:
      AssistantAccess,
    sessionId:
      string,
    title:
      string
  ) {
    await ownedSession(
      access,
      sessionId
    );

    const normalizedTitle =
      title
        .replace(
          /\s+/g,
          ' '
        )
        .trim();

    if (!normalizedTitle) {
      throw new AssistantRuntimeError(
        'A Journey name is required.',
        422
      );
    }

    if (
      normalizedTitle.length >
      120
    ) {
      throw new AssistantRuntimeError(
        'Journey names are limited to 120 characters.',
        422
      );
    }

    await prisma.aiAssistantSession.update({
      where: {
        id:
          sessionId
      },
      data: {
        title:
          normalizedTitle,
        journeyGoal:
          normalizedTitle,
        updatedAt:
          new Date()
      }
    });

    return mapAssistantSession(
      await ownedSession(
        access,
        sessionId
      )
    );
  },

  async deleteSession(
    access:
      AssistantAccess,
    sessionId:
      string
  ) {
    await ownedSession(
      access,
      sessionId
    );

    await prisma.aiAssistantSession.delete({
      where: {
        id:
          sessionId
      }
    });

    return {
      deleted:
        true
    };
  },

  async restorePlan(
    access:
      AssistantAccess,
    sessionId:
      string,
    messageId:
      string
  ) {
    const session =
      await ownedSession(
        access,
        sessionId
      );

    const plan =
      await prisma.aiAssistantMessage.findFirst({
        where: {
          id:
            messageId,
          sessionId,
          role:
            'ASSISTANT',
          isPlanSnapshot:
            true
        },
        select: {
          id:
            true,
          journeyVersion:
            true,
          createdAt:
            true,
          payload:
            true,
          journeyStateSnapshot:
            true,
          journeyStageSnapshot:
            true,
          journeyStateVersionSnapshot:
            true
        }
      });

    if (
      !plan ||
      !plan.journeyVersion
    ) {
      throw new AssistantRuntimeError(
        'The selected saved plan was not found in this Journey.',
        404
      );
    }

    const restoredPlanVersion =
      plan.journeyVersion;

    let stateSnapshot =
      plan.journeyStateSnapshot as
        unknown as
        AIAssistantJourneyState |
        null;

    let sourceTransition =
      null as
        ReturnType<
          typeof resolveJourneyStateUpdate
        >['transition'] |
        null;

    if (
      !stateSnapshot
    ) {
      if (
        !plan.payload ||
        typeof plan.payload !==
          'object' ||
        Array.isArray(
          plan.payload
        )
      ) {
        throw new AssistantRuntimeError(
          'The selected plan does not contain enough information to restore its Journey state.',
          422
        );
      }

      const userMessages =
        await prisma.aiAssistantMessage.findMany({
          where: {
            sessionId,
            role:
              'USER',
            createdAt: {
              lte:
                plan.createdAt
            }
          },
          orderBy: {
            createdAt:
              'asc'
          },
          select: {
            content:
              true
          }
        });

      const conversation =
        userMessages.map(
          record =>
            record.content
        );

      const reconstructed =
        resolveJourneyStateUpdate({
          previous:
            null,
          conversation,
          prompt:
            conversation[
              conversation.length -
              1
            ] ??
            'Restore this plan',
          payload:
            plan.payload as
              unknown as
              AIAssistantResponsePayload,
          planVersion:
            plan.journeyVersion
        });

      stateSnapshot =
        reconstructed.state;

      sourceTransition =
        reconstructed.transition;
    }

    const restoredAt =
      new Date();

    const restoredStage =
      plan.journeyStageSnapshot
        ? plan.journeyStageSnapshot as
            AIAssistantJourneyStage
        : stateSnapshot.currentStage;

    const restoredState:
      AIAssistantJourneyState = {
      ...stateSnapshot,
      currentStage:
        restoredStage,
      planVersion:
        plan.journeyVersion,
      updatedAt:
        restoredAt.toISOString()
    };

    const restoreTransition =
      createJourneyRestoreTransition({
        from:
          session.journeyStage as
            AIAssistantJourneyStage,
        to:
          restoredStage,
        planVersion:
          plan.journeyVersion,
        at:
          restoredAt.toISOString()
      });

    await prisma.$transaction(
      async transaction => {
        if (
          !plan.journeyStateSnapshot
        ) {
          await transaction.aiAssistantMessage.update({
            where: {
              id:
                plan.id
            },
            data: {
              journeyStateSnapshot:
                stateSnapshot as
                  Prisma.InputJsonValue,
              journeyStageSnapshot:
                restoredStage,
              journeyStateVersionSnapshot:
                plan.journeyStateVersionSnapshot ??
                Math.max(
                  1,
                  restoredPlanVersion
                ),
              journeyTransition:
                sourceTransition
                  ? sourceTransition as
                      Prisma.InputJsonValue
                  : undefined
            }
          });
        }

        await transaction.aiAssistantSession.update({
          where: {
            id:
              sessionId
          },
          data: {
            activePlanMessageId:
              plan.id,
            journeyState:
              restoredState as
                Prisma.InputJsonValue,
            journeyStage:
              restoredStage,
            journeyStateVersion: {
              increment:
                1
            },
            journeyStateUpdatedAt:
              restoredAt,
            journeyLastTransition:
              restoreTransition as
                Prisma.InputJsonValue,
            lastRefinedAt:
              restoredAt,
            updatedAt:
              restoredAt
          }
        });
      }
    );

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
            'AI_ASSISTANT_PLAN_RESTORED',
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
            `Plan v${plan.journeyVersion} restored with its saved Journey state.`,
          metadata: {
            sessionId,
            messageId:
              plan.id,
            journeyVersion:
              plan.journeyVersion,
            journeyStage:
              restoredStage,
            transitionReason:
              restoreTransition.reason
          }
        }
      });
    }

    return mapAssistantSession(
      await ownedSession(
        access,
        sessionId
      )
    );
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
