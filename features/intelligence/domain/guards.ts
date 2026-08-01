import type {
  IntelligencePreparedAction,
  IntelligenceResolution,
  IntelligenceResolutionStatus
} from './contracts';

import {
  preparedActionMayExecute
} from './authority';

import {
  resolutionStatusIsTerminal
} from './resolutionStateMachine';

export function resolutionMayBeEdited(
  resolution: IntelligenceResolution
): boolean {
  return (
    !resolutionStatusIsTerminal(
      resolution.status
    ) &&
    resolution.status !==
      'EXECUTING'
  );
}

export function resolutionRequiresReview(
  resolution: IntelligenceResolution
): boolean {
  return (
    resolution.status ===
      'AWAITING_REVIEW' ||
    resolution.preparedActions.some(
      action =>
        action.status ===
          'AWAITING_CONFIRMATION' ||
        action.status ===
          'AWAITING_APPROVAL'
    )
  );
}

export function resolutionMayExecute(
  resolution: IntelligenceResolution
): boolean {
  if (
    resolution.status !==
      'READY' &&
    resolution.status !==
      'APPROVED' &&
    resolution.status !==
      'PARTIALLY_APPLIED'
  ) {
    return false;
  }

  return resolution.preparedActions.some(
    preparedActionMayExecute
  );
}

export function resolutionHasBlockingAction(
  resolution: IntelligenceResolution
): boolean {
  return resolution.preparedActions.some(
    action =>
      !action.validation.valid ||
      action.status ===
        'FAILED' ||
      action.status ===
        'CANCELLED'
  );
}

export function actionIsSettled(
  action: IntelligencePreparedAction
): boolean {
  return (
    action.status ===
      'APPLIED' ||
    action.status ===
      'FAILED' ||
    action.status ===
      'CANCELLED'
  );
}

export function statusAllowsNewActions(
  status: IntelligenceResolutionStatus
): boolean {
  return (
    status ===
      'COLLECTING' ||
    status ===
      'PLANNING' ||
    status ===
      'READY' ||
    status ===
      'AWAITING_REVIEW' ||
    status ===
      'PARTIALLY_APPLIED'
  );
}
