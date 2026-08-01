import type {
  IntelligenceAuthorityClass,
  IntelligencePreparedAction,
  IntelligencePreparedActionStatus
} from './contracts';

export type IntelligenceAuthorityDecision = {
  allowed: boolean;
  requiresConfirmation: boolean;
  requiresApproval: boolean;
  mayExecuteImmediately: boolean;
  reason: string;
};

export function evaluateAuthority(
  authorityClass: IntelligenceAuthorityClass
): IntelligenceAuthorityDecision {
  switch (authorityClass) {
    case 'READ_ONLY':
      return {
        allowed: true,
        requiresConfirmation: false,
        requiresApproval: false,
        mayExecuteImmediately: true,
        reason:
          'Read-only intelligence may run without changing application state.'
      };
    case 'RECOMMEND':
      return {
        allowed: true,
        requiresConfirmation: false,
        requiresApproval: false,
        mayExecuteImmediately: true,
        reason:
          'Recommendations do not mutate application state.'
      };
    case 'PREPARE':
      return {
        allowed: true,
        requiresConfirmation: false,
        requiresApproval: false,
        mayExecuteImmediately: true,
        reason:
          'A draft may be prepared but not published automatically.'
      };
    case 'APPLY_REVERSIBLE':
      return {
        allowed: true,
        requiresConfirmation: true,
        requiresApproval: false,
        mayExecuteImmediately: false,
        reason:
          'The reversible change still requires explicit confirmation.'
      };
    case 'REQUIRE_CONFIRMATION':
      return {
        allowed: true,
        requiresConfirmation: true,
        requiresApproval: false,
        mayExecuteImmediately: false,
        reason:
          'The action changes application state and requires confirmation.'
      };
    case 'REQUIRE_APPROVAL':
      return {
        allowed: true,
        requiresConfirmation: false,
        requiresApproval: true,
        mayExecuteImmediately: false,
        reason:
          'The action must enter an established governance flow.'
      };
    case 'PROHIBITED':
      return {
        allowed: false,
        requiresConfirmation: false,
        requiresApproval: false,
        mayExecuteImmediately: false,
        reason:
          'RCENTZ Intelligence is not permitted to execute this action.'
      };
  }
}

export function initialPreparedActionStatus(
  authorityClass: IntelligenceAuthorityClass
): IntelligencePreparedActionStatus {
  const decision =
    evaluateAuthority(
      authorityClass
    );

  if (!decision.allowed) {
    return 'CANCELLED';
  }

  if (
    decision.requiresApproval
  ) {
    return 'AWAITING_APPROVAL';
  }

  if (
    decision.requiresConfirmation
  ) {
    return 'AWAITING_CONFIRMATION';
  }

  return 'PREPARED';
}

export function preparedActionMayExecute(
  action: IntelligencePreparedAction
): boolean {
  if (
    !action.validation.valid
  ) {
    return false;
  }

  const decision =
    evaluateAuthority(
      action.authorityClass
    );

  if (!decision.allowed) {
    return false;
  }

  if (
    action.status ===
      'APPROVED'
  ) {
    return true;
  }

  return (
    decision.mayExecuteImmediately &&
    action.status ===
      'PREPARED'
  );
}
