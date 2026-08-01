import type {
  IntelligenceResolution
} from '../domain';

import type {
  IntelligencePlanningResult
} from './planningContracts';

export function applyPlanningResult(
  resolution:
    IntelligenceResolution,
  result:
    IntelligencePlanningResult,
  now =
    new Date().toISOString()
): IntelligenceResolution {
  return {
    ...resolution,
    status:
      result.missingInformation.length >
        0
        ? 'COLLECTING'
        : 'READY',
    expectedOutcome:
      result.expectedOutcome,
    constraints:
      result.constraints,
    recommendations:
      result.recommendations,
    plan:
      result.plan,
    confidence:
      result.confidence,
    riskLevel:
      result.riskLevel,
    completion:
      result.missingInformation.length >
        0
        ? 0
        : 50,
    updatedAt:
      now,
    updates: [
      ...resolution.updates,
      {
        id:
          `${resolution.id}:plan:${now}`,
        resolutionId:
          resolution.id,
        type:
          'PLAN_UPDATED',
        title:
          result.missingInformation.length >
            0
            ? 'More context required'
            : 'Resolution plan prepared',
        detail:
          result.plan.summary,
        metadata: {
          missingInformation:
            result.missingInformation,
          warnings:
            result.warnings,
          confidence:
            result.confidence,
          riskLevel:
            result.riskLevel
        },
        createdAt:
          now
      }
    ]
  };
}
