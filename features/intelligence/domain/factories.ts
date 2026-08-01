import {
  createEmptyIntelligenceContext
} from './context';

import type {
  IntelligenceAudience,
  IntelligencePreparedAction,
  IntelligenceResolution,
  IntelligenceResolutionDraft,
  IntelligenceResolutionType,
  IntelligenceRiskLevel
} from './contracts';

import {
  completionForResolutionStatus
} from './resolutionStateMachine';

import {
  clampIntelligenceConfidence,
  validateResolutionDraft
} from './validation';

export type CreateResolutionInput = {
  id: string;
  workspaceId: string;
  ownerUserId: string;
  vendorProfileId?: string | null;
  audience: IntelligenceAudience;
  type: IntelligenceResolutionType;
  title: string;
  objective: string;
  expectedOutcome: string;
  riskLevel?: IntelligenceRiskLevel;
  confidence?: number;
  now?: string;
};

export function createIntelligenceResolution(
  input: CreateResolutionInput
): IntelligenceResolution {
  const now =
    input.now ??
    new Date().toISOString();

  return {
    id:
      input.id,
    workspaceId:
      input.workspaceId,
    ownerUserId:
      input.ownerUserId,
    vendorProfileId:
      input.vendorProfileId ??
      null,
    audience:
      input.audience,
    type:
      input.type,
    status:
      'COLLECTING',
    title:
      input.title.trim(),
    objective:
      input.objective.trim(),
    expectedOutcome:
      input.expectedOutcome.trim(),
    contextSnapshot:
      createEmptyIntelligenceContext(
        now
      ),
    constraints:
      [],
    assumptions:
      [],
    evidence:
      [],
    recommendations:
      [],
    plan: {
      summary:
        '',
      steps:
        []
    },
    preparedActions:
      [],
    updates: [
      {
        id:
          `${input.id}:goal:${now}`,
        resolutionId:
          input.id,
        type:
          'GOAL_CAPTURED',
        title:
          input.title.trim(),
        detail:
          input.objective.trim(),
        createdAt:
          now
      }
    ],
    confidence:
      clampIntelligenceConfidence(
        input.confidence ??
          0
      ),
    riskLevel:
      input.riskLevel ??
      'LOW',
    completion:
      completionForResolutionStatus(
        'COLLECTING'
      ),
    blockedReason:
      null,
    expiresAt:
      null,
    createdAt:
      now,
    updatedAt:
      now,
    resolvedAt:
      null
  };
}

export function materializeResolutionDraft(
  draft: IntelligenceResolutionDraft,
  identity: {
    workspaceId: string;
    ownerUserId: string;
    now?: string;
  }
): IntelligenceResolution {
  const validation =
    validateResolutionDraft(
      draft
    );

  if (
    !validation.valid
  ) {
    const message =
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
        .join('; ');

    throw new Error(
      `Invalid intelligence resolution draft: ${message}`
    );
  }

  const now =
    identity.now ??
    draft.updatedAt ??
    draft.createdAt ??
    new Date().toISOString();

  return {
    ...draft,
    workspaceId:
      draft.workspaceId ??
      identity.workspaceId,
    ownerUserId:
      draft.ownerUserId ??
      identity.ownerUserId,
    createdAt:
      draft.createdAt ??
      now,
    updatedAt:
      draft.updatedAt ??
      now
  };
}

export function attachPreparedAction(
  resolution: IntelligenceResolution,
  action: IntelligencePreparedAction,
  now =
    new Date().toISOString()
): IntelligenceResolution {
  if (
    resolution.preparedActions.some(
      candidate =>
        candidate.id ===
          action.id ||
        candidate.idempotencyKey ===
          action.idempotencyKey
    )
  ) {
    return resolution;
  }

  return {
    ...resolution,
    preparedActions: [
      ...resolution.preparedActions,
      action
    ],
    updatedAt:
      now,
    updates: [
      ...resolution.updates,
      {
        id:
          `${resolution.id}:action:${action.id}:${now}`,
        resolutionId:
          resolution.id,
        type:
          'ACTION_PREPARED',
        title:
          action.label,
        detail:
          action.description,
        metadata: {
          actionId:
            action.id,
          actionType:
            action.actionType,
          authorityClass:
            action.authorityClass
        },
        createdAt:
          now
      }
    ]
  };
}
