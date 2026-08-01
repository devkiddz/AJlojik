import type {
  IntelligencePreparedAction,
  IntelligenceResolution,
  IntelligenceResolutionDraft
} from './contracts';

export type IntelligenceValidationIssue = {
  path: string;
  message: string;
  severity:
    | 'ERROR'
    | 'WARNING';
};

export type IntelligenceValidationResult = {
  valid: boolean;
  issues: IntelligenceValidationIssue[];
};

export function clampIntelligenceConfidence(
  value: number
): number {
  if (
    !Number.isFinite(value)
  ) {
    return 0;
  }

  return Math.min(
    1,
    Math.max(
      0,
      value
    )
  );
}

export function validateResolutionDraft(
  draft: IntelligenceResolutionDraft
): IntelligenceValidationResult {
  const issues:
    IntelligenceValidationIssue[] = [];

  requiredText(
    issues,
    'title',
    draft.title
  );

  requiredText(
    issues,
    'objective',
    draft.objective
  );

  requiredText(
    issues,
    'expectedOutcome',
    draft.expectedOutcome
  );

  if (
    draft.confidence <
      0 ||
    draft.confidence >
      1 ||
    !Number.isFinite(
      draft.confidence
    )
  ) {
    issues.push({
      path:
        'confidence',
      message:
        'Confidence must be between 0 and 1.',
      severity:
        'ERROR'
    });
  }

  const actionIds =
    new Set<string>();

  for (
    const [
      index,
      action
    ] of draft.preparedActions.entries()
  ) {
    validatePreparedAction(
      action,
      index,
      issues,
      actionIds
    );
  }

  return {
    valid:
      !issues.some(
        issue =>
          issue.severity ===
          'ERROR'
      ),
    issues
  };
}

export function validateResolution(
  resolution: IntelligenceResolution
): IntelligenceValidationResult {
  const draftResult =
    validateResolutionDraft(
      resolution
    );

  const issues = [
    ...draftResult.issues
  ];

  requiredText(
    issues,
    'workspaceId',
    resolution.workspaceId
  );

  requiredText(
    issues,
    'ownerUserId',
    resolution.ownerUserId
  );

  requiredText(
    issues,
    'createdAt',
    resolution.createdAt
  );

  requiredText(
    issues,
    'updatedAt',
    resolution.updatedAt
  );

  return {
    valid:
      !issues.some(
        issue =>
          issue.severity ===
          'ERROR'
      ),
    issues
  };
}

function validatePreparedAction(
  action: IntelligencePreparedAction,
  index: number,
  issues: IntelligenceValidationIssue[],
  actionIds: Set<string>
): void {
  const path =
    `preparedActions.${index}`;

  requiredText(
    issues,
    `${path}.id`,
    action.id
  );

  requiredText(
    issues,
    `${path}.actionType`,
    action.actionType
  );

  requiredText(
    issues,
    `${path}.idempotencyKey`,
    action.idempotencyKey
  );

  if (
    actionIds.has(
      action.id
    )
  ) {
    issues.push({
      path:
        `${path}.id`,
      message:
        'Prepared action ids must be unique inside a resolution.',
      severity:
        'ERROR'
    });
  }

  actionIds.add(
    action.id
  );

  if (
    !action.validation.valid &&
    action.validation.errors.length ===
      0
  ) {
    issues.push({
      path:
        `${path}.validation`,
      message:
        'An invalid action should explain at least one validation error.',
      severity:
        'WARNING'
    });
  }
}

function requiredText(
  issues: IntelligenceValidationIssue[],
  path: string,
  value: string
): void {
  if (
    value.trim().length ===
    0
  ) {
    issues.push({
      path,
      message:
        'A non-empty value is required.',
      severity:
        'ERROR'
    });
  }
}
