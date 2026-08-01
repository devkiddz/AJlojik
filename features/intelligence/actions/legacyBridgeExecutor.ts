import type {
  AIAssistantBridgeActionType,
  AIAssistantBridgeOptions
} from '@/features/ai-assistance/contracts';

import {
  applyAssistantAction
} from '@/features/ai-assistance/server/assistantActionBridge';

import type {
  AssistantAccess
} from '@/features/ai-assistance/server/assistantAccess';

import type {
  IntelligencePreparedAction
} from '../domain';

import type {
  IntelligenceActionExecutionResult
} from './actionContracts';

type LegacyActionInput = {
  messageId: string;
  options:
    AIAssistantBridgeOptions;
};

export async function executeLegacyAssistantBridge(
  access:
    AssistantAccess,
  action:
    IntelligencePreparedAction
): Promise<IntelligenceActionExecutionResult> {
  const input =
    readLegacyInput(
      action
    );

  const application =
    await applyAssistantAction(
      access,
      {
        messageId:
          input.messageId,
        actionType:
          action.actionType as
            AIAssistantBridgeActionType,
        options:
          input.options
      }
    );

  return {
    applicationId:
      application.id,
    targetType:
      application.targetType,
    targetId:
      application.targetId,
    href:
      application.href,
    label:
      application.label,
    appliedAt:
      application.appliedAt
  };
}

function readLegacyInput(
  action:
    IntelligencePreparedAction
): LegacyActionInput {
  const messageId =
    action.input.messageId;

  const options =
    action.input.options;

  if (
    typeof messageId !==
      'string' ||
    !messageId.trim()
  ) {
    throw new Error(
      'The prepared action is missing its source Assistant message.'
    );
  }

  if (
    !options ||
    typeof options !==
      'object' ||
    Array.isArray(
      options
    )
  ) {
    throw new Error(
      'The prepared action is missing valid bridge options.'
    );
  }

  return {
    messageId:
      messageId.trim(),
    options:
      options as
        AIAssistantBridgeOptions
  };
}
