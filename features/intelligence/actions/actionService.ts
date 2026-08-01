import 'server-only';

import {
  createHash,
  randomUUID
} from 'node:crypto';

import type {
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

import {
  evaluateAuthority,
  initialPreparedActionStatus
} from '../domain';

import type {
  IntelligencePreparedAction
} from '../domain';

import {
  IntelligenceRepository
} from '../server';

import type {
  IntelligenceActionPrepareInput
} from './actionContracts';

import {
  getIntelligenceActionDefinition
} from './actionRegistry';

function stableKey(
  resolutionId:
    string,
  input:
    IntelligenceActionPrepareInput
): string {
  return createHash(
    'sha256'
  )
    .update(
      JSON.stringify({
        resolutionId,
        actionType:
          input.actionType,
        messageId:
          input.messageId,
        options:
          input.options
      })
    )
    .digest(
      'hex'
    );
}

export const IntelligenceActionService = {
  async prepare(
    access:
      AssistantAccess,
    resolutionId:
      string,
    input:
      IntelligenceActionPrepareInput
  ) {
    const resolution =
      await IntelligenceRepository.read(
        access,
        resolutionId
      );

    const definition =
      getIntelligenceActionDefinition(
        input.actionType
      );

    const validation =
      definition.validate(
        access,
        input
      );

    const action:
      IntelligencePreparedAction = {
        id:
          randomUUID(),
        resolutionId:
          resolution.id,
        actionType:
          input.actionType,
        authorityClass:
          definition.authorityClass,
        status:
          validation.valid
            ? initialPreparedActionStatus(
                definition.authorityClass
              )
            : 'CANCELLED',
        label:
          input.label.trim(),
        description:
          input.description.trim(),
        input: {
          messageId:
            input.messageId.trim(),
          options:
            input.options
        },
        preview:
          definition.preview(
            input
          ),
        validation,
        idempotencyKey:
          stableKey(
            resolutionId,
            input
          )
      };

    const updated =
      await IntelligenceRepository.putPreparedAction(
        access,
        resolutionId,
        action
      );

    return updated.preparedActions.find(
      candidate =>
        candidate.idempotencyKey ===
        action.idempotencyKey
    ) ??
      action;
  },

  async approve(
    access:
      AssistantAccess,
    resolutionId:
      string,
    actionId:
      string
  ) {
    const resolution =
      await IntelligenceRepository.read(
        access,
        resolutionId
      );

    const action =
      resolution.preparedActions.find(
        candidate =>
          candidate.id ===
          actionId
      );

    if (!action) {
      throw new Error(
        'The selected prepared action was not found.'
      );
    }

    if (
      ![
        'AWAITING_CONFIRMATION',
        'AWAITING_APPROVAL',
        'PREPARED'
      ].includes(
        action.status
      )
    ) {
      return action;
    }

    const decision =
      evaluateAuthority(
        action.authorityClass
      );

    if (!decision.allowed) {
      throw new Error(
        decision.reason
      );
    }

    await prisma.intelligencePreparedAction.update({
      where: {
        id:
          action.id
      },
      data: {
        status:
          'APPROVED',
        approvedByUserId:
          access.userId,
        approvedAt:
          new Date()
      }
    });

    await prisma.intelligenceResolutionUpdate.create({
      data: {
        resolutionId,
        type:
          'ACTION_APPROVED',
        title:
          action.label,
        detail:
          'The prepared action was explicitly approved.',
        metadata: {
          actionId:
            action.id,
          actionType:
            action.actionType,
          approvedByUserId:
            access.userId
        }
      }
    });

    if (
      resolution.status ===
      'AWAITING_REVIEW'
    ) {
      await prisma.intelligenceResolution.update({
        where: {
          id:
            resolutionId
        },
        data: {
          status:
            'APPROVED',
          completion:
            75
        }
      });
    }

    return (
      await IntelligenceRepository.read(
        access,
        resolutionId
      )
    ).preparedActions.find(
      candidate =>
        candidate.id ===
        actionId
    );
  },

  async apply(
    access:
      AssistantAccess,
    resolutionId:
      string,
    actionId:
      string
  ) {
    const resolution =
      await IntelligenceRepository.read(
        access,
        resolutionId
      );

    const action =
      resolution.preparedActions.find(
        candidate =>
          candidate.id ===
          actionId
      );

    if (!action) {
      throw new Error(
        'The selected prepared action was not found.'
      );
    }

    if (
      action.status ===
      'APPLIED'
    ) {
      return action;
    }

    if (
      !action.validation.valid
    ) {
      throw new Error(
        action.validation.errors.join(
          ' '
        ) ||
        'The prepared action is invalid.'
      );
    }

    const definition =
      getIntelligenceActionDefinition(
        action.actionType as
          Parameters<
            typeof getIntelligenceActionDefinition
          >[0]
      );

    const decision =
      evaluateAuthority(
        action.authorityClass
      );

    if (!decision.allowed) {
      throw new Error(
        decision.reason
      );
    }

    if (
      (
        decision.requiresApproval ||
        decision.requiresConfirmation
      ) &&
      action.status !==
        'APPROVED'
    ) {
      throw new Error(
        decision.requiresApproval
          ? 'Approve this governed action before applying it.'
          : 'Confirm this action before applying it.'
      );
    }

    await prisma.$transaction(
      async transaction => {
        await transaction.intelligencePreparedAction.update({
          where: {
            id:
              action.id
          },
          data: {
            status:
              'EXECUTING'
          }
        });

        await transaction.intelligenceResolution.update({
          where: {
            id:
              resolutionId
          },
          data: {
            status:
              'EXECUTING',
            completion:
              75
          }
        });

        await transaction.intelligenceResolutionUpdate.create({
          data: {
            resolutionId,
            type:
              'EXECUTION_STARTED',
            title:
              action.label,
            metadata: {
              actionId:
                action.id,
              actionType:
                action.actionType
            }
          }
        });
      }
    );

    try {
      const result =
        await definition.execute(
          access,
          action
        );

      await prisma.$transaction(
        async transaction => {
          await transaction.intelligencePreparedAction.update({
            where: {
              id:
                action.id
            },
            data: {
              status:
                'APPLIED',
              applicationId:
                result.applicationId,
              targetType:
                result.targetType,
              targetId:
                result.targetId,
              preview: {
                ...action.preview,
                result
              } as
                Prisma.InputJsonValue,
              appliedAt:
                result.appliedAt
                  ? new Date(
                      result.appliedAt
                    )
                  : new Date(),
              error:
                null
            }
          });

          const pending =
            await transaction.intelligencePreparedAction.count({
              where: {
                resolutionId,
                status: {
                  notIn: [
                    'APPLIED',
                    'FAILED',
                    'CANCELLED'
                  ] as
                    IntelligencePreparedActionStatus[]
                }
              }
            });

          const status:
            IntelligenceResolutionStatus =
              pending ===
              0
                ? 'APPLIED'
                : 'PARTIALLY_APPLIED';

          await transaction.intelligenceResolution.update({
            where: {
              id:
                resolutionId
            },
            data: {
              status,
              completion:
                status ===
                'APPLIED'
                  ? 100
                  : 75,
              resolvedAt:
                status ===
                'APPLIED'
                  ? new Date()
                  : null
            }
          });

          await transaction.intelligenceResolutionUpdate.create({
            data: {
              resolutionId,
              type:
                pending ===
                0
                  ? 'RESOLUTION_COMPLETED'
                  : 'ACTION_APPLIED',
              title:
                result.label,
              detail:
                'The application result was verified and linked to the Resolution.',
              metadata: {
                actionId:
                  action.id,
                applicationId:
                  result.applicationId,
                targetType:
                  result.targetType,
                targetId:
                  result.targetId,
                href:
                  result.href
              }
            }
          });
        }
      );
    } catch (
      error
    ) {
      const message =
        error instanceof
        Error
          ? error.message
          : 'The Intelligence action failed.';

      await prisma.$transaction(
        async transaction => {
          await transaction.intelligencePreparedAction.update({
            where: {
              id:
                action.id
            },
            data: {
              status:
                'FAILED',
              error:
                message.slice(
                  0,
                  2000
                )
            }
          });

          await transaction.intelligenceResolution.update({
            where: {
              id:
                resolutionId
            },
            data: {
              status:
                'BLOCKED',
              completion:
                50,
              blockedReason:
                message.slice(
                  0,
                  2000
                )
            }
          });

          await transaction.intelligenceResolutionUpdate.create({
            data: {
              resolutionId,
              type:
                'ACTION_FAILED',
              title:
                action.label,
              detail:
                message,
              metadata: {
                actionId:
                  action.id,
                actionType:
                  action.actionType
              }
            }
          });
        }
      );

      throw error;
    }

    return (
      await IntelligenceRepository.read(
        access,
        resolutionId
      )
    ).preparedActions.find(
      candidate =>
        candidate.id ===
        actionId
    );
  }
};
