import type {
  IntelligenceCompletion,
  IntelligenceResolution,
  IntelligenceResolutionStatus,
  IntelligenceResolutionUpdate,
  IntelligenceUpdateType
} from './contracts';

const TRANSITIONS: Record<
  IntelligenceResolutionStatus,
  readonly IntelligenceResolutionStatus[]
> = {
  COLLECTING: [
    'PLANNING',
    'READY',
    'BLOCKED',
    'DISMISSED',
    'STALE',
    'ARCHIVED'
  ],
  PLANNING: [
    'COLLECTING',
    'READY',
    'AWAITING_REVIEW',
    'BLOCKED',
    'DISMISSED',
    'STALE',
    'ARCHIVED'
  ],
  READY: [
    'PLANNING',
    'AWAITING_REVIEW',
    'APPROVED',
    'EXECUTING',
    'BLOCKED',
    'DISMISSED',
    'STALE',
    'ARCHIVED'
  ],
  AWAITING_REVIEW: [
    'PLANNING',
    'APPROVED',
    'BLOCKED',
    'DISMISSED',
    'STALE',
    'ARCHIVED'
  ],
  APPROVED: [
    'EXECUTING',
    'BLOCKED',
    'DISMISSED',
    'STALE',
    'ARCHIVED'
  ],
  EXECUTING: [
    'APPLIED',
    'PARTIALLY_APPLIED',
    'BLOCKED'
  ],
  APPLIED: [
    'ARCHIVED'
  ],
  PARTIALLY_APPLIED: [
    'PLANNING',
    'READY',
    'AWAITING_REVIEW',
    'APPROVED',
    'EXECUTING',
    'BLOCKED',
    'DISMISSED',
    'STALE',
    'ARCHIVED'
  ],
  BLOCKED: [
    'COLLECTING',
    'PLANNING',
    'READY',
    'AWAITING_REVIEW',
    'DISMISSED',
    'STALE',
    'ARCHIVED'
  ],
  DISMISSED: [
    'ARCHIVED'
  ],
  STALE: [
    'COLLECTING',
    'PLANNING',
    'DISMISSED',
    'ARCHIVED'
  ],
  ARCHIVED: []
};

const COMPLETION_BY_STATUS: Record<
  IntelligenceResolutionStatus,
  IntelligenceCompletion
> = {
  COLLECTING: 0,
  PLANNING: 25,
  READY: 50,
  AWAITING_REVIEW: 50,
  APPROVED: 75,
  EXECUTING: 75,
  APPLIED: 100,
  PARTIALLY_APPLIED: 75,
  BLOCKED: 50,
  DISMISSED: 100,
  STALE: 50,
  ARCHIVED: 100
};

const UPDATE_BY_STATUS: Partial<
  Record<
    IntelligenceResolutionStatus,
    IntelligenceUpdateType
  >
> = {
  AWAITING_REVIEW:
    'APPROVAL_REQUIRED',
  APPROVED:
    'ACTION_APPROVED',
  EXECUTING:
    'EXECUTION_STARTED',
  APPLIED:
    'RESOLUTION_COMPLETED',
  PARTIALLY_APPLIED:
    'ACTION_APPLIED',
  BLOCKED:
    'RESOLUTION_BLOCKED',
  DISMISSED:
    'RESOLUTION_DISMISSED',
  ARCHIVED:
    'RESOLUTION_ARCHIVED'
};

export class InvalidResolutionTransitionError
  extends Error {
  readonly from:
    IntelligenceResolutionStatus;

  readonly to:
    IntelligenceResolutionStatus;

  constructor(
    from: IntelligenceResolutionStatus,
    to: IntelligenceResolutionStatus
  ) {
    super(
      `Invalid intelligence resolution transition: ${from} → ${to}`
    );

    this.name =
      'InvalidResolutionTransitionError';

    this.from =
      from;

    this.to =
      to;
  }
}

export function canTransitionResolution(
  from: IntelligenceResolutionStatus,
  to: IntelligenceResolutionStatus
): boolean {
  return TRANSITIONS[
    from
  ].includes(
    to
  );
}

export function allowedResolutionTransitions(
  status: IntelligenceResolutionStatus
): readonly IntelligenceResolutionStatus[] {
  return TRANSITIONS[
    status
  ];
}

export function completionForResolutionStatus(
  status: IntelligenceResolutionStatus
): IntelligenceCompletion {
  return COMPLETION_BY_STATUS[
    status
  ];
}

export function resolutionStatusIsTerminal(
  status: IntelligenceResolutionStatus
): boolean {
  return (
    status ===
      'APPLIED' ||
    status ===
      'DISMISSED' ||
    status ===
      'ARCHIVED'
  );
}

export function transitionResolution(
  resolution: IntelligenceResolution,
  to: IntelligenceResolutionStatus,
  options: {
    now?: string;
    detail?: string;
    blockedReason?: string | null;
    updateId?: string;
  } = {}
): IntelligenceResolution {
  if (
    !canTransitionResolution(
      resolution.status,
      to
    )
  ) {
    throw new InvalidResolutionTransitionError(
      resolution.status,
      to
    );
  }

  const now =
    options.now ??
    new Date().toISOString();

  const updateType =
    UPDATE_BY_STATUS[
      to
    ];

  const update:
    IntelligenceResolutionUpdate | null =
      updateType
        ? {
            id:
              options.updateId ??
              `${resolution.id}:${to}:${now}`,
            resolutionId:
              resolution.id,
            type:
              updateType,
            title:
              titleForTransition(to),
            ...(options.detail
              ? {
                  detail:
                    options.detail
                }
              : {}),
            createdAt:
              now
          }
        : null;

  return {
    ...resolution,
    status:
      to,
    completion:
      completionForResolutionStatus(
        to
      ),
    blockedReason:
      to ===
      'BLOCKED'
        ? options.blockedReason ??
          options.detail ??
          resolution.blockedReason ??
          'The resolution is blocked.'
        : null,
    resolvedAt:
      to ===
        'APPLIED' ||
      to ===
        'DISMISSED'
        ? now
        : resolution.resolvedAt,
    updatedAt:
      now,
    updates:
      update
        ? [
            ...resolution.updates,
            update
          ]
        : resolution.updates
  };
}

function titleForTransition(
  status: IntelligenceResolutionStatus
): string {
  switch (status) {
    case 'AWAITING_REVIEW':
      return 'Review required';
    case 'APPROVED':
      return 'Resolution approved';
    case 'EXECUTING':
      return 'Execution started';
    case 'APPLIED':
      return 'Resolution completed';
    case 'PARTIALLY_APPLIED':
      return 'Resolution partially applied';
    case 'BLOCKED':
      return 'Resolution blocked';
    case 'DISMISSED':
      return 'Resolution dismissed';
    case 'ARCHIVED':
      return 'Resolution archived';
    default:
      return 'Resolution updated';
  }
}
