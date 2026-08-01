import type {
  Prisma
} from '@/lib/generated/prisma/client';

import type {
  IntelligenceAssumption,
  IntelligenceConstraint,
  IntelligenceContextSnapshot,
  IntelligenceEvidence,
  IntelligencePlan,
  IntelligencePreparedAction,
  IntelligenceRecommendation,
  IntelligenceResolution,
  IntelligenceResolutionUpdate
} from '../domain';

export const intelligenceResolutionInclude = {
  updates: {
    orderBy: {
      createdAt:
        'asc'
    }
  },
  actions: {
    orderBy: {
      createdAt:
        'asc'
    }
  },
  sessions: {
    orderBy: {
      attachedAt:
        'asc'
    }
  }
} satisfies Prisma.IntelligenceResolutionInclude;

export type IntelligenceResolutionRecord =
  Prisma.IntelligenceResolutionGetPayload<{
    include:
      typeof intelligenceResolutionInclude;
  }>;

export type IntelligenceResolutionSummary = {
  id: string;
  audience:
    IntelligenceResolution['audience'];
  type:
    IntelligenceResolution['type'];
  status:
    IntelligenceResolution['status'];
  title: string;
  objective: string;
  expectedOutcome: string;
  completion:
    IntelligenceResolution['completion'];
  confidence: number;
  riskLevel:
    IntelligenceResolution['riskLevel'];
  latestUpdate:
    IntelligenceResolutionUpdate |
    null;
  preparedActionCount: number;
  pendingActionCount: number;
  createdAt: string;
  updatedAt: string;
};

export function mapIntelligenceResolution(
  record: IntelligenceResolutionRecord
): IntelligenceResolution {
  return {
    id:
      record.id,
    workspaceId:
      record.workspaceId,
    ownerUserId:
      record.ownerUserId,
    vendorProfileId:
      record.vendorProfileId,
    audience:
      record.audience.toLowerCase() as
        IntelligenceResolution['audience'],
    type:
      record.type,
    status:
      record.status,
    title:
      record.title,
    objective:
      record.objective,
    expectedOutcome:
      record.expectedOutcome,
    contextSnapshot:
      record.contextSnapshot as unknown as
        IntelligenceContextSnapshot,
    constraints:
      record.constraints as unknown as
        IntelligenceConstraint[],
    assumptions:
      record.assumptions as unknown as
        IntelligenceAssumption[],
    evidence:
      record.evidence as unknown as
        IntelligenceEvidence[],
    recommendations:
      record.recommendations as unknown as
        IntelligenceRecommendation[],
    plan:
      record.plan as unknown as
        IntelligencePlan,
    preparedActions:
      record.actions.map(
        mapPreparedAction
      ),
    updates:
      record.updates.map(
        mapResolutionUpdate
      ),
    confidence:
      record.confidence,
    riskLevel:
      record.riskLevel,
    completion:
      normalizeCompletion(
        record.completion
      ),
    blockedReason:
      record.blockedReason,
    expiresAt:
      record.expiresAt?.toISOString() ??
      null,
    createdAt:
      record.createdAt.toISOString(),
    updatedAt:
      record.updatedAt.toISOString(),
    resolvedAt:
      record.resolvedAt?.toISOString() ??
      null
  };
}

export function mapIntelligenceResolutionSummary(
  record: IntelligenceResolutionRecord
): IntelligenceResolutionSummary {
  const last =
    record.updates[
      record.updates.length -
        1
    ];

  return {
    id:
      record.id,
    audience:
      record.audience.toLowerCase() as
        IntelligenceResolution['audience'],
    type:
      record.type,
    status:
      record.status,
    title:
      record.title,
    objective:
      record.objective,
    expectedOutcome:
      record.expectedOutcome,
    completion:
      normalizeCompletion(
        record.completion
      ),
    confidence:
      record.confidence,
    riskLevel:
      record.riskLevel,
    latestUpdate:
      last
        ? mapResolutionUpdate(
            last
          )
        : null,
    preparedActionCount:
      record.actions.length,
    pendingActionCount:
      record.actions.filter(
        action =>
          ![
            'APPLIED',
            'FAILED',
            'CANCELLED'
          ].includes(
            action.status
          )
      ).length,
    createdAt:
      record.createdAt.toISOString(),
    updatedAt:
      record.updatedAt.toISOString()
  };
}

function mapResolutionUpdate(
  record:
    IntelligenceResolutionRecord['updates'][number]
): IntelligenceResolutionUpdate {
  return {
    id:
      record.id,
    resolutionId:
      record.resolutionId,
    type:
      record.type,
    title:
      record.title,
    detail:
      record.detail ??
      undefined,
    metadata:
      record.metadata
        ? record.metadata as
            Record<string, unknown>
        : undefined,
    createdAt:
      record.createdAt.toISOString()
  };
}

function mapPreparedAction(
  record:
    IntelligenceResolutionRecord['actions'][number]
): IntelligencePreparedAction {
  return {
    id:
      record.id,
    resolutionId:
      record.resolutionId,
    actionType:
      record.actionType,
    authorityClass:
      record.authorityClass,
    status:
      record.status,
    label:
      record.label,
    description:
      record.description,
    targetType:
      record.targetType,
    targetId:
      record.targetId,
    input:
      record.input as
        Record<string, unknown>,
    preview:
      record.preview as
        Record<string, unknown>,
    validation:
      record.validation as unknown as
        IntelligencePreparedAction['validation'],
    idempotencyKey:
      record.idempotencyKey,
    applicationId:
      record.applicationId,
    approvedByUserId:
      record.approvedByUserId,
    approvedAt:
      record.approvedAt?.toISOString() ??
      null,
    appliedAt:
      record.appliedAt?.toISOString() ??
      null,
    error:
      record.error
  };
}

function normalizeCompletion(
  value: number
): IntelligenceResolution['completion'] {
  if (value >= 100) {
    return 100;
  }

  if (value >= 75) {
    return 75;
  }

  if (value >= 50) {
    return 50;
  }

  if (value >= 25) {
    return 25;
  }

  return 0;
}
