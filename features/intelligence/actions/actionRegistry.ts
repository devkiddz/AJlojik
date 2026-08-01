import type {
  AIAssistantBridgeActionType
} from '@/features/ai-assistance/contracts';

import type {
  IntelligenceActionDefinition,
  IntelligenceActionPrepareInput,
  IntelligenceActionValidationResult
} from './actionContracts';

import {
  executeLegacyAssistantBridge
} from './legacyBridgeExecutor';

function basicValidation(
  input:
    IntelligenceActionPrepareInput
): IntelligenceActionValidationResult {
  const errors:
    string[] = [];

  if (
    !input.messageId.trim()
  ) {
    errors.push(
      'A source Assistant message is required.'
    );
  }

  if (
    !input.label.trim()
  ) {
    errors.push(
      'An action label is required.'
    );
  }

  if (
    !input.description.trim()
  ) {
    errors.push(
      'An action description is required.'
    );
  }

  return {
    valid:
      errors.length ===
      0,
    warnings:
      [],
    errors
  };
}

const definitions:
  IntelligenceActionDefinition[] = [
    {
      actionType:
        'SHOPPING_LIST_CREATE',
      authorityClass:
        'APPLY_REVERSIBLE',
      supportedAudiences: [
        'customer'
      ],
      validate:
        (
          access,
          input
        ) => {
          const result =
            basicValidation(
              input
            );

          if (
            access.audience !==
            'customer'
          ) {
            result.errors.push(
              'Shopping Lists may be created only in Customer Intelligence.'
            );
          }

          result.valid =
            result.errors.length ===
            0;

          return result;
        },
      preview:
        input => ({
          actionType:
            input.actionType,
          options:
            input.options
        }),
      execute:
        executeLegacyAssistantBridge
    },
    {
      actionType:
        'ADMIN_TODO_CREATE',
      authorityClass:
        'APPLY_REVERSIBLE',
      supportedAudiences: [
        'admin'
      ],
      validate:
        (
          access,
          input
        ) => {
          const result =
            basicValidation(
              input
            );

          if (
            access.audience !==
            'admin'
          ) {
            result.errors.push(
              'Administrative todos require Admin Intelligence.'
            );
          }

          result.valid =
            result.errors.length ===
            0;

          return result;
        },
      preview:
        input => ({
          actionType:
            input.actionType,
          options:
            input.options
        }),
      execute:
        executeLegacyAssistantBridge
    },
    {
      actionType:
        'PRODUCT_DRAFT_CREATE',
      authorityClass:
        'PREPARE',
      supportedAudiences: [
        'admin',
        'vendor'
      ],
      validate:
        (
          access,
          input
        ) => {
          const result =
            basicValidation(
              input
            );

          if (
            access.audience ===
            'customer'
          ) {
            result.errors.push(
              'Product drafts require Admin or Vendor Intelligence.'
            );
          }

          result.valid =
            result.errors.length ===
            0;

          return result;
        },
      preview:
        input => ({
          actionType:
            input.actionType,
          options:
            input.options
        }),
      execute:
        executeLegacyAssistantBridge
    },
    {
      actionType:
        'PRODUCT_REVISION_SUBMIT',
      authorityClass:
        'REQUIRE_APPROVAL',
      supportedAudiences: [
        'vendor'
      ],
      validate:
        (
          access,
          input
        ) => {
          const result =
            basicValidation(
              input
            );

          if (
            access.audience !==
            'vendor'
          ) {
            result.errors.push(
              'Product revision submissions require Vendor Intelligence.'
            );
          }

          result.valid =
            result.errors.length ===
            0;

          return result;
        },
      preview:
        input => ({
          actionType:
            input.actionType,
          options:
            input.options,
          governance:
            'The revision enters the existing approval workflow.'
        }),
      execute:
        executeLegacyAssistantBridge
    },
    {
      actionType:
        'CAMPAIGN_DRAFT_CREATE',
      authorityClass:
        'PREPARE',
      supportedAudiences: [
        'admin',
        'vendor'
      ],
      validate:
        (
          access,
          input
        ) => {
          const result =
            basicValidation(
              input
            );

          if (
            access.audience ===
            'customer'
          ) {
            result.errors.push(
              'Campaign drafts require Admin or Vendor Intelligence.'
            );
          }

          result.valid =
            result.errors.length ===
            0;

          return result;
        },
      preview:
        input => ({
          actionType:
            input.actionType,
          options:
            input.options
        }),
      execute:
        executeLegacyAssistantBridge
    }
  ];

const registry =
  new Map<
    AIAssistantBridgeActionType,
    IntelligenceActionDefinition
  >(
    definitions.map(
      definition => [
        definition.actionType,
        definition
      ]
    )
  );

export function getIntelligenceActionDefinition(
  actionType:
    AIAssistantBridgeActionType
): IntelligenceActionDefinition {
  const definition =
    registry.get(
      actionType
    );

  if (!definition) {
    throw new Error(
      `Unsupported Intelligence action: ${actionType}`
    );
  }

  return definition;
}

export function listIntelligenceActionDefinitions(): readonly IntelligenceActionDefinition[] {
  return definitions;
}
