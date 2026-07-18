import type {
  ExperienceOnboardingPath,
  ExperienceOnboardingState,
  ProtectedActionDescriptor
} from './actionFeedbackTypes';

export const PENDING_ACTION_STORAGE_KEY =
  'aj_logik_pending_authenticated_action';

export const EXPERIENCE_ONBOARDING_STORAGE_KEY =
  'aj_logik_experience_onboarding';

export const EXPERIENCE_ONBOARDING_VERSION = 1;

const ONBOARDING_REPEAT_INTERVAL_DAYS = 14;

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function isProtectedActionDescriptor(
  value: unknown
): value is ProtectedActionDescriptor {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate =
    value as Partial<ProtectedActionDescriptor>;

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.type === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.returnTo === 'string' &&
    typeof candidate.createdAt === 'number' &&
    'payload' in candidate
  );
}

export function readPendingAction():
  | ProtectedActionDescriptor
  | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    const storedValue =
      window.sessionStorage.getItem(
        PENDING_ACTION_STORAGE_KEY
      );

    if (!storedValue) {
      return null;
    }

    const parsedValue: unknown =
      JSON.parse(storedValue);

    return isProtectedActionDescriptor(parsedValue)
      ? parsedValue
      : null;
  } catch {
    return null;
  }
}

export function writePendingAction(
  action: ProtectedActionDescriptor | null
): void {
  if (!isBrowser()) {
    return;
  }

  try {
    if (!action) {
      window.sessionStorage.removeItem(
        PENDING_ACTION_STORAGE_KEY
      );

      return;
    }

    window.sessionStorage.setItem(
      PENDING_ACTION_STORAGE_KEY,
      JSON.stringify(action)
    );
  } catch {
    // Storage failures must not interrupt user actions.
  }
}

function isExperienceOnboardingState(
  value: unknown
): value is ExperienceOnboardingState {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate =
    value as Partial<ExperienceOnboardingState>;

  return typeof candidate.version === 'number';
}

export function readExperienceOnboardingState():
  | ExperienceOnboardingState
  | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    const storedValue =
      window.localStorage.getItem(
        EXPERIENCE_ONBOARDING_STORAGE_KEY
      );

    if (!storedValue) {
      return null;
    }

    const parsedValue: unknown =
      JSON.parse(storedValue);

    return isExperienceOnboardingState(parsedValue)
      ? parsedValue
      : null;
  } catch {
    return null;
  }
}

export function writeExperienceOnboardingState(
  state: ExperienceOnboardingState
): void {
  if (!isBrowser()) {
    return;
  }

  try {
    window.localStorage.setItem(
      EXPERIENCE_ONBOARDING_STORAGE_KEY,
      JSON.stringify(state)
    );
  } catch {
    // Storage failures must not block Store access.
  }
}

export function shouldShowExperienceOnboarding(
  state: ExperienceOnboardingState | null,
  now = Date.now()
): boolean {
  if (!state) {
    return true;
  }

  if (
    state.version !==
    EXPERIENCE_ONBOARDING_VERSION
  ) {
    return true;
  }

  if (state.completedAt) {
    return false;
  }

  if (!state.dismissedAt) {
    return true;
  }

  const dismissedAt =
    new Date(state.dismissedAt).getTime();

  if (Number.isNaN(dismissedAt)) {
    return true;
  }

  const repeatInterval =
    ONBOARDING_REPEAT_INTERVAL_DAYS *
    24 *
    60 *
    60 *
    1000;

  return now - dismissedAt >= repeatInterval;
}

export function recordExperienceOnboardingPath(
  selectedPath: ExperienceOnboardingPath
): void {
  const currentState =
    readExperienceOnboardingState();

  writeExperienceOnboardingState({
    ...currentState,
    version: EXPERIENCE_ONBOARDING_VERSION,
    selectedPath,
    dismissedAt: new Date().toISOString()
  });
}

export function completeExperienceOnboarding(): void {
  const currentState =
    readExperienceOnboardingState();

  writeExperienceOnboardingState({
    ...currentState,
    version: EXPERIENCE_ONBOARDING_VERSION,
    completedAt: new Date().toISOString()
  });
}