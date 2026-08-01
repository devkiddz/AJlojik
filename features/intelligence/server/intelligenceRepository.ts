import 'server-only';

import type {
  AiAssistantAudience,
  IntelligencePreparedActionStatus,
  IntelligenceResolutionStatus,
  Prisma
} from '@/lib/generated/prisma/client';

import {
  prisma
} from '@/lib/prisma';

import type {
  AssistantAccess
} from '@/features/ai-assistance/server/assistantAccess';

import type {
  IntelligencePreparedAction,
  IntelligenceResolution,
  IntelligenceResolutionStatus as DomainResolutionStatus,
  IntelligenceResolutionUpdate
} from '../domain';

import {
  canTransitionResolution,
  completionForResolutionStatus,
  validateResolution
} from '../domain';

import {
  intelligenceResolutionInclude,
  mapIntelligenceResolution,
  mapIntelligenceResolutionSummary
} from './intelligenceMapper';

function prismaAudience(
  audience:
    AssistantAccess['audience']
): AiAssistantAudience {
  return audience.toUpperCase() as
    AiAssistantAudience;
}

function scope(
  access:
    AssistantAccess
): Prisma.IntelligenceResolutionWhereInput {
  return {
    workspaceId:
      access.workspaceId,
    ownerUserId:
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

async function ownedRecord(
  access:
    AssistantAccess,
  resolutionId:
    string,
  client:
    Prisma.TransactionClient |
    typeof prisma =
      prisma
) {
  const record =
    await client.intelligenceResolution.findFirst({
      where: {
        id:
          resolutionId,
        ...scope(
          access
        )
      },
      include:
        intelligenceResolutionInclude
    });

  if (!record) {
    throw new Error(
      'The selected intelligence resolution was not found.'
    );
  }

  return record;
}

function json(
  value: unknown
): Prisma.InputJsonValue {
  return value as
    Prisma.InputJsonValue;
}

function actionData(
  action:
    IntelligencePreparedAction
): Prisma.IntelligencePreparedActionUncheckedCreateWithoutResolutionInput {
  return {
    id:
      action.id,
    applicationId:
      action.applicationId,
    approvedByUserId:
      action.approvedByUserId,
    actionType:
      action.actionType,
    authorityClass:
      action.authorityClass,
    status:
      action.status as
        IntelligencePreparedActionStatus,
    label:
      action.label,
    description:
      action.description,
    targetType:
      action.targetType,
    targetId:
      action.targetId,
    input:
      json(
        action.input
      ),
    preview:
      json(
        action.preview
      ),
    validation:
      json(
        action.validation
      ),
    idempotencyKey:
      action.idempotencyKey,
    approvedAt:
      action.approvedAt
        ? new Date(
            action.approvedAt
          )
        : null,
    appliedAt:
      action.appliedAt
        ? new Date(
            action.appliedAt
          )
        : null,
    error:
      action.error
  };
}

export const IntelligenceRepository = {
  async list(
    access:
      AssistantAccess,
    options: {
      statuses?:
        DomainResolutionStatus[];
      take?:
        number;
    } = {}
  ) {
    const records =
      await prisma.intelligenceResolution.findMany({
        where: {
          ...scope(
            access
          ),
          ...(options.statuses?.length
            ? {
                status: {
                  in:
                    options.statuses as
                      IntelligenceResolutionStatus[]
                }
              }
            : {})
        },
        include:
          intelligenceResolutionInclude,
        orderBy: {
          updatedAt:
            'desc'
        },
        take:
          Math.min(
            Math.max(
              options.take ??
                50,
              1
            ),
            100
          )
      });

    return records.map(
      mapIntelligenceResolutionSummary
    );
  },

  async read(
    access:
      AssistantAccess,
    resolutionId:
      string
  ) {
    return mapIntelligenceResolution(
      await ownedRecord(
        access,
        resolutionId
      )
    );
  },

  async create(
    access:
      AssistantAccess,
    resolution:
      IntelligenceResolution,
    options: {
      sessionId?:
        string |
        null;
    } = {}
  ) {
    if (
      resolution.workspaceId !==
        access.workspaceId ||
      resolution.ownerUserId !==
        access.userId ||
      resolution.audience !==
        access.audience ||
      (
        access.audience ===
          'vendor' &&
        resolution.vendorProfileId !==
          access.vendorProfileId
      )
    ) {
      throw new Error(
        'The intelligence resolution does not match the active access scope.'
      );
    }

    const validation =
      validateResolution(
        resolution
      );

    if (!validation.valid) {
      throw new Error(
        validation.issues
          .filter(
            issue =>
              issue.severity ===
              'ERROR'
          )
          .map(
            issue =>
              `${issue.path}: ${issue.message}`
          )
          .join('; ')
      );
    }

    const created =
      await prisma.$transaction(
        async transaction => {
          if (
            options.sessionId
          ) {
            const session =
              await transaction.aiAssistantSession.findFirst({
                where: {
                  id:
                    options.sessionId,
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
                },
                select: {
                  id:
                    true
                }
              });

            if (!session) {
              throw new Error(
                'The selected Assistant session is outside the active intelligence scope.'
              );
            }
          }

          return transaction.intelligenceResolution.create({
            data: {
              id:
                resolution.id,
              workspaceId:
                resolution.workspaceId,
              ownerUserId:
                resolution.ownerUserId,
              vendorProfileId:
                resolution.vendorProfileId,
              audience:
                prismaAudience(
                  resolution.audience
                ),
              type:
                resolution.type,
              status:
                resolution.status,
              title:
                resolution.title,
              objective:
                resolution.objective,
              expectedOutcome:
                resolution.expectedOutcome,
              contextSnapshot:
                json(
                  resolution.contextSnapshot
                ),
              constraints:
                json(
                  resolution.constraints
                ),
              assumptions:
                json(
                  resolution.assumptions
                ),
              evidence:
                json(
                  resolution.evidence
                ),
              recommendations:
                json(
                  resolution.recommendations
                ),
              plan:
                json(
                  resolution.plan
                ),
              confidence:
                resolution.confidence,
              riskLevel:
                resolution.riskLevel,
              completion:
                resolution.completion,
              blockedReason:
                resolution.blockedReason,
              expiresAt:
                resolution.expiresAt
                  ? new Date(
                      resolution.expiresAt
                    )
                  : null,
              resolvedAt:
                resolution.resolvedAt
                  ? new Date(
                      resolution.resolvedAt
                    )
                  : null,
              createdAt:
                new Date(
                  resolution.createdAt
                ),
              updates: {
                create:
                  resolution.updates.map(
                    update => ({
                      id:
                        update.id,
                      type:
                        update.type,
                      title:
                        update.title,
                      detail:
                        update.detail,
                      metadata:
                        update.metadata
                          ? json(
                              update.metadata
                            )
                          : undefined,
                      createdAt:
                        new Date(
                          update.createdAt
                        )
                    })
                  )
              },
              actions: {
                create:
                  resolution.preparedActions.map(
                    actionData
                  )
              },
              ...(options.sessionId
                ? {
                    sessions: {
                      create: {
                        sessionId:
                          options.sessionId
                      }
                    }
                  }
                : {})
            },
            include:
              intelligenceResolutionInclude
          });
        }
      );

    return mapIntelligenceResolution(
      created
    );
  },

  async attachSession(
    access:
      AssistantAccess,
    resolutionId:
      string,
    sessionId:
      string
  ) {
    await prisma.$transaction(
      async transaction => {
        await ownedRecord(
          access,
          resolutionId,
          transaction
        );

        const session =
          await transaction.aiAssistantSession.findFirst({
            where: {
              id:
                sessionId,
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
            },
            select: {
              id:
                true
            }
          });

        if (!session) {
          throw new Error(
            'The selected Assistant session is outside the active intelligence scope.'
          );
        }

        await transaction.intelligenceResolutionSession.upsert({
          where: {
            resolutionId_sessionId: {
              resolutionId,
              sessionId
            }
          },
          create: {
            resolutionId,
            sessionId
          },
          update: {}
        });
      }
    );
  },

  async appendUpdate(
    access:
      AssistantAccess,
    resolutionId:
      string,
    update:
      IntelligenceResolutionUpdate
  ) {
    await ownedRecord(
      access,
      resolutionId
    );

    await prisma.intelligenceResolutionUpdate.upsert({
      where: {
        id:
          update.id
      },
      create: {
        id:
          update.id,
        resolutionId,
        type:
          update.type,
        title:
          update.title,
        detail:
          update.detail,
        metadata:
          update.metadata
            ? json(
                update.metadata
              )
            : undefined,
        createdAt:
          new Date(
            update.createdAt
          )
      },
      update: {}
    });

    return this.read(
      access,
      resolutionId
    );
  },

  async putPreparedAction(
    access:
      AssistantAccess,
    resolutionId:
      string,
    action:
      IntelligencePreparedAction
  ) {
    await ownedRecord(
      access,
      resolutionId
    );

    await prisma.intelligencePreparedAction.upsert({
      where: {
        idempotencyKey:
          action.idempotencyKey
      },
      create: {
        resolutionId,
        ...actionData(
          action
        )
      },
      update: {
        label:
          action.label,
        description:
          action.description,
        targetType:
          action.targetType,
        targetId:
          action.targetId,
        input:
          json(
            action.input
          ),
        preview:
          json(
            action.preview
          ),
        validation:
          json(
            action.validation
          ),
        applicationId:
          action.applicationId,
        approvedByUserId:
          action.approvedByUserId,
        approvedAt:
          action.approvedAt
            ? new Date(
                action.approvedAt
              )
            : null,
        appliedAt:
          action.appliedAt
            ? new Date(
                action.appliedAt
              )
            : null,
        error:
          action.error,
        status:
          action.status as
            IntelligencePreparedActionStatus
      }
    });

    return this.read(
      access,
      resolutionId
    );
  },

  async transition(
    access:
      AssistantAccess,
    resolutionId:
      string,
    to:
      DomainResolutionStatus,
    options: {
      detail?:
        string;
      blockedReason?:
        string |
        null;
      now?:
        string;
    } = {}
  ) {
    const now =
      options.now ??
      new Date().toISOString();

    await prisma.$transaction(
      async transaction => {
        const current =
          await ownedRecord(
            access,
            resolutionId,
            transaction
          );

        if (
          !canTransitionResolution(
            current.status,
            to
          )
        ) {
          throw new Error(
            `Invalid intelligence resolution transition: ${current.status} → ${to}`
          );
        }

        await transaction.intelligenceResolution.update({
          where: {
            id:
              resolutionId
          },
          data: {
            status:
              to as
                IntelligenceResolutionStatus,
            completion:
              completionForResolutionStatus(
                to
              ),
            blockedReason:
              to ===
              'BLOCKED'
                ? options.blockedReason ??
                  options.detail ??
                  'The resolution is blocked.'
                : null,
            resolvedAt:
              to ===
                'APPLIED' ||
              to ===
                'DISMISSED'
                ? new Date(
                    now
                  )
                : current.resolvedAt
          }
        });
      }
    );

    return this.read(
      access,
      resolutionId
    );
  }
};
