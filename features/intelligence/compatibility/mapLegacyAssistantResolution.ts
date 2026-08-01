import type {
  AIAssistantApplicationView,
  AIAssistantBridgeActionType,
  AIAssistantMessageView,
  AIAssistantOutputType,
  AIAssistantResponsePayload
} from '@/features/ai-assistance/contracts';

import {
  initialPreparedActionStatus
} from '../domain/authority';

import {
  createEmptyIntelligenceContext,
  normalizeIntelligenceRecord,
  uniqueIntelligenceIds
} from '../domain/context';

import type {
  IntelligenceAuthorityClass,
  IntelligenceEvidence,
  IntelligencePreparedAction,
  IntelligenceRecommendation,
  IntelligenceResolutionDraft,
  IntelligenceResolutionStatus,
  IntelligenceResolutionType,
  IntelligenceRiskLevel
} from '../domain/contracts';

import {
  completionForResolutionStatus
} from '../domain/resolutionStateMachine';

import {
  clampIntelligenceConfidence
} from '../domain/validation';

export type LegacyAssistantResolutionInput = {
  message: AIAssistantMessageView;
  audience:
    | 'customer'
    | 'admin'
    | 'vendor';
  workspaceId?: string;
  ownerUserId?: string;
  vendorProfileId?: string | null;
  sessionId?: string | null;
  contextSnapshot?: Record<string, unknown> | null;
};

export function mapLegacyAssistantMessageToResolutionDraft({
  message,
  audience,
  workspaceId,
  ownerUserId,
  vendorProfileId =
    null,
  sessionId =
    null,
  contextSnapshot =
    null
}: LegacyAssistantResolutionInput): IntelligenceResolutionDraft | null {
  const payload =
    message.payload;

  if (
    message.role !==
      'ASSISTANT' ||
    !payload
  ) {
    return null;
  }

  const resolutionId =
    `legacy:${message.id}`;

  const status =
    inferLegacyStatus(
      message,
      payload
    );

  const capturedAt =
    message.createdAt;

  return {
    id:
      resolutionId,
    ...(workspaceId
      ? {
          workspaceId
        }
      : {}),
    ...(ownerUserId
      ? {
          ownerUserId
        }
      : {}),
    vendorProfileId,
    audience,
    type:
      mapLegacyOutputType(
        payload.outputType
      ),
    status,
    title:
      payload.headline,
    objective:
      payload.summary,
    expectedOutcome:
      inferExpectedOutcome(
        payload
      ),
    contextSnapshot:
      normalizeLegacyContext(
        contextSnapshot,
        capturedAt,
        payload
      ),
    constraints:
      payload.warnings.map(
        (
          warning,
          index
        ) => ({
          id:
            `${resolutionId}:constraint:${index}`,
          kind:
            'CUSTOM',
          label:
            'Legacy warning',
          value:
            warning,
          required:
            true,
          source:
            'CONTEXT'
        })
      ),
    assumptions:
      payload.productDraft?.assumptions.map(
        (
          assumption,
          index
        ) => ({
          id:
            `${resolutionId}:assumption:${index}`,
          statement:
            assumption,
          status:
            'UNCONFIRMED',
          confidence:
            clampIntelligenceConfidence(
              payload.productDraft
                ?.recognitionConfidence ??
                payload.confidence
            ),
          source:
            'MODEL'
        })
      ) ??
      [],
    evidence:
      mapLegacyEvidence(
        resolutionId,
        payload,
        capturedAt
      ),
    recommendations:
      mapLegacyRecommendations(
        resolutionId,
        payload
      ),
    plan: {
      summary:
        payload.summary,
      steps:
        payload.sections.map(
          (
            section,
            index
          ) => ({
            id:
              `${resolutionId}:step:${index}`,
            order:
              index + 1,
            title:
              section.title,
            ...(section.description
              ? {
                  description:
                    section.description
                }
              : {}),
            status:
              'PENDING'
          })
        )
    },
    preparedActions:
      message.applications.map(
        application =>
          mapLegacyApplication(
            resolutionId,
            application
          )
      ),
    updates: [
      {
        id:
          `${resolutionId}:update:captured`,
        resolutionId,
        type:
          'GOAL_CAPTURED',
        title:
          payload.headline,
        detail:
          payload.summary,
        createdAt:
          capturedAt
      }
    ],
    confidence:
      clampIntelligenceConfidence(
        payload.confidence
      ),
    riskLevel:
      inferRiskLevel(
        payload
      ),
    completion:
      completionForResolutionStatus(
        status
      ),
    blockedReason:
      status ===
      'BLOCKED'
        ? payload.warnings[0] ??
          'The legacy application failed.'
        : null,
    expiresAt:
      null,
    resolvedAt:
      status ===
        'APPLIED' ||
      status ===
        'DISMISSED'
        ? capturedAt
        : null,
    createdAt:
      capturedAt,
    updatedAt:
      capturedAt,
    legacySessionId:
      sessionId,
    legacyMessageId:
      message.id
  };
}

export function mapLegacyOutputType(
  outputType: AIAssistantOutputType
): IntelligenceResolutionType {
  switch (outputType) {
    case 'RECOMMENDATION':
      return 'PRODUCT_DISCOVERY';
    case 'COMPARISON':
      return 'PRODUCT_COMPARISON';
    case 'PAIRING':
      return 'PRODUCT_PAIRING';
    case 'SHOPPING_PLAN':
      return 'SHOPPING_PLAN';
    case 'CATALOG_DRAFT':
      return 'PRODUCT_DRAFT';
    case 'CAMPAIGN_DRAFT':
      return 'CAMPAIGN_PLAN';
    case 'OPERATIONS_BRIEF':
      return 'OPERATIONS_BRIEF';
    case 'GOVERNANCE_EXPLANATION':
      return 'GOVERNANCE_EXPLANATION';
  }
}

function inferLegacyStatus(
  message: AIAssistantMessageView,
  payload: AIAssistantResponsePayload
): IntelligenceResolutionStatus {
  if (
    message.feedback ===
      'DISMISSED'
  ) {
    return 'DISMISSED';
  }

  if (
    message.applications.length >
      0 &&
    message.applications.every(
      application =>
        application.status ===
        'APPLIED'
    )
  ) {
    return 'APPLIED';
  }

  if (
    message.applications.some(
      application =>
        application.status ===
        'FAILED'
    )
  ) {
    return 'BLOCKED';
  }

  if (
    message.applications.some(
      application =>
        application.status ===
        'PENDING'
    )
  ) {
    return 'EXECUTING';
  }

  if (
    payload.warnings.length >
      0 ||
    payload.draftFields.length >
      0 ||
    payload.productDraft
  ) {
    return 'AWAITING_REVIEW';
  }

  if (
    payload.products.length >
      0 ||
    payload.actions.length >
      0
  ) {
    return 'READY';
  }

  return 'COLLECTING';
}

function normalizeLegacyContext(
  value: Record<string, unknown> | null,
  capturedAt: string,
  payload: AIAssistantResponsePayload
) {
  const empty =
    createEmptyIntelligenceContext(
      capturedAt
    );

  const productIds =
    uniqueIntelligenceIds(
      payload.products.map(
        product =>
          product.id
      )
    );

  return {
    ...empty,
    identity:
      normalizeIntelligenceRecord(
        value?.identity
      ),
    experience:
      normalizeIntelligenceRecord(
        value?.experience
      ),
    commerce: {
      ...normalizeIntelligenceRecord(
        value?.commerce
      ),
      legacyProducts:
        payload.products
    },
    behaviour:
      normalizeIntelligenceRecord(
        value?.behaviour
      ),
    operations:
      normalizeIntelligenceRecord(
        value?.operations
      ),
    references: {
      ...empty.references,
      productIds
    }
  };
}

function mapLegacyEvidence(
  resolutionId: string,
  payload: AIAssistantResponsePayload,
  capturedAt: string
): IntelligenceEvidence[] {
  const metrics =
    payload.metrics.map(
      (
        metric,
        index
      ) => ({
        id:
          `${resolutionId}:metric:${index}`,
        kind:
          'SYSTEM' as const,
        title:
          `${metric.label}: ${metric.value}`,
        ...(metric.helper
          ? {
              detail:
                metric.helper
            }
          : {}),
        confidence:
          clampIntelligenceConfidence(
            payload.confidence
          ),
        references:
          [],
        capturedAt
      })
    );

  const products =
    payload.products.map(
      (
        product,
        index
      ) => ({
        id:
          `${resolutionId}:product:${index}`,
        kind:
          'CATALOG' as const,
        title:
          product.name,
        detail:
          product.reason,
        confidence:
          clampIntelligenceConfidence(
            payload.confidence
          ),
        references: [
          {
            type:
              'product',
            id:
              product.id,
            label:
              product.name,
            href:
              product.href
          }
        ],
        capturedAt
      })
    );

  return [
    ...metrics,
    ...products
  ];
}

function mapLegacyRecommendations(
  resolutionId: string,
  payload: AIAssistantResponsePayload
): IntelligenceRecommendation[] {
  const productRecommendations =
    payload.products.map(
      (
        product,
        index
      ) => ({
        id:
          `${resolutionId}:recommendation:product:${index}`,
        title:
          product.name,
        rationale:
          product.reason,
        priority:
          'HIGH' as const,
        confidence:
          clampIntelligenceConfidence(
            payload.confidence
          ),
        references: [
          {
            type:
              'product',
            id:
              product.id,
            label:
              product.name,
            href:
              product.href
          }
        ]
      })
    );

  const promptRecommendations =
    payload.suggestedPrompts.map(
      (
        prompt,
        index
      ) => ({
        id:
          `${resolutionId}:recommendation:prompt:${index}`,
        title:
          prompt,
        rationale:
          'Suggested continuation from the legacy Assistant response.',
        priority:
          'MEDIUM' as const,
        confidence:
          clampIntelligenceConfidence(
            payload.confidence
          ),
        references:
          []
      })
    );

  return [
    ...productRecommendations,
    ...promptRecommendations
  ];
}

function mapLegacyApplication(
  resolutionId: string,
  application: AIAssistantApplicationView
): IntelligencePreparedAction {
  const authorityClass =
    authorityForLegacyAction(
      application.actionType
    );

  const derivedStatus =
    application.status ===
      'APPLIED'
      ? 'APPLIED'
      : application.status ===
          'FAILED'
        ? 'FAILED'
        : initialPreparedActionStatus(
            authorityClass
          );

  return {
    id:
      `legacy-application:${application.id}`,
    resolutionId,
    actionType:
      application.actionType,
    authorityClass,
    status:
      derivedStatus,
    label:
      application.label,
    description:
      application.error ??
      `Legacy ${application.actionType} application.`,
    targetType:
      application.targetType,
    targetId:
      application.targetId,
    input:
      {},
    preview: {
      href:
        application.href
    },
    validation: {
      valid:
        application.status !==
          'FAILED',
      warnings:
        [],
      errors:
        application.error
          ? [
              application.error
            ]
          : []
    },
    idempotencyKey:
      `legacy:${application.id}`,
    applicationId:
      application.id,
    appliedAt:
      application.appliedAt,
    error:
      application.error
  };
}

function authorityForLegacyAction(
  actionType: AIAssistantBridgeActionType
): IntelligenceAuthorityClass {
  switch (actionType) {
    case 'SHOPPING_LIST_CREATE':
    case 'ADMIN_TODO_CREATE':
      return 'APPLY_REVERSIBLE';
    case 'PRODUCT_DRAFT_CREATE':
    case 'CAMPAIGN_DRAFT_CREATE':
      return 'PREPARE';
    case 'PRODUCT_REVISION_SUBMIT':
      return 'REQUIRE_APPROVAL';
  }
}

function inferExpectedOutcome(
  payload: AIAssistantResponsePayload
): string {
  const action =
    payload.actions[0];

  if (action) {
    return action.label;
  }

  if (
    payload.products.length >
      0
  ) {
    return `${payload.products.length} relevant product ${
      payload.products.length ===
      1
        ? 'option'
        : 'options'
    } identified.`;
  }

  if (
    payload.draftFields.length >
      0
  ) {
    return `${payload.draftFields.length} draft ${
      payload.draftFields.length ===
      1
        ? 'field'
        : 'fields'
    } prepared for review.`;
  }

  return payload.summary;
}

function inferRiskLevel(
  payload: AIAssistantResponsePayload
): IntelligenceRiskLevel {
  if (
    payload.warnings.length >=
      3
  ) {
    return 'HIGH';
  }

  if (
    payload.warnings.length >
      0 ||
    payload.productDraft
  ) {
    return 'MEDIUM';
  }

  return 'LOW';
}
