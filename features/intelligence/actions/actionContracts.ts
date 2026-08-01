import type {
  AIAssistantBridgeActionType,
  AIAssistantBridgeOptions
} from '@/features/ai-assistance/contracts';

import type {
  AssistantAccess
} from '@/features/ai-assistance/server/assistantAccess';

import type {
  IntelligenceAuthorityClass,
  IntelligencePreparedAction
} from '../domain';

export type IntelligenceActionPrepareInput = {
  actionType:
    AIAssistantBridgeActionType;
  messageId: string;
  label: string;
  description: string;
  options:
    AIAssistantBridgeOptions;
};

export type IntelligenceActionValidationResult = {
  valid: boolean;
  warnings: string[];
  errors: string[];
};

export type IntelligenceActionExecutionResult = {
  applicationId: string;
  targetType: string | null;
  targetId: string | null;
  href: string | null;
  label: string;
  appliedAt: string | null;
};

export type IntelligenceActionDefinition = {
  actionType:
    AIAssistantBridgeActionType;
  authorityClass:
    IntelligenceAuthorityClass;
  supportedAudiences:
    readonly AssistantAccess['audience'][];
  validate(
    access:
      AssistantAccess,
    input:
      IntelligenceActionPrepareInput
  ): IntelligenceActionValidationResult;
  preview(
    input:
      IntelligenceActionPrepareInput
  ): Record<string, unknown>;
  execute(
    access:
      AssistantAccess,
    action:
      IntelligencePreparedAction
  ): Promise<IntelligenceActionExecutionResult>;
};
