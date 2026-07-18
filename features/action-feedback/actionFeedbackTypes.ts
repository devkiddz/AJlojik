export type ActionFeedbackTone =
  | 'success'
  | 'error'
  | 'warning'
  | 'info';

export type ActionFeedbackAction = {
  label: string;
  onSelect: () => void;
};

export type ActionFeedbackBanner = {
  label?: string;
  detail?: string;
  badge?: string;
};

export type ActionFeedbackInput = {
  tone?: ActionFeedbackTone;

  title: string;
  description?: string;

  duration?: number;

  banner?: ActionFeedbackBanner;
  action?: ActionFeedbackAction;
};

export type ActionFeedbackMessage = {
  id: string;

  tone: ActionFeedbackTone;

  title: string;
  description?: string;

  duration: number;
  createdAt: number;

  banner?: ActionFeedbackBanner;
  action?: ActionFeedbackAction;
};

export type JsonPrimitive =
  | string
  | number
  | boolean
  | null;

export type JsonValue =
  | JsonPrimitive
  | JsonValue[]
  | {
      [key: string]: JsonValue;
    };

export type ProtectedActionDescriptor = {
  id: string;
  type: string;

  payload: JsonValue;

  title: string;
  description?: string;

  successTitle?: string;
  successDescription?: string;

  returnTo: string;
  createdAt: number;
};

export type CreateProtectedActionInput = {
  id?: string;
  type: string;

  payload: JsonValue;

  title: string;
  description?: string;

  successTitle?: string;
  successDescription?: string;

  returnTo?: string;
};

export type AuthenticationGateCopy = {
  title?: string;
  description?: string;
  benefits?: string[];
};

export type AuthenticationGateRequest = {
  action: ProtectedActionDescriptor;
  copy?: AuthenticationGateCopy;
};

export type ProtectedActionHandler = (
  payload: JsonValue,
  action: ProtectedActionDescriptor
) => void | Promise<void>;

export type RunProtectedActionInput = {
  action: CreateProtectedActionInput;
  execute: ProtectedActionHandler;
  gate?: AuthenticationGateCopy;
};

export type ActionFeedbackContextValue = {
  success: (
    input: Omit<ActionFeedbackInput, 'tone'>
  ) => string;

  error: (
    input: Omit<ActionFeedbackInput, 'tone'>
  ) => string;

  warning: (
    input: Omit<ActionFeedbackInput, 'tone'>
  ) => string;

  info: (
    input: Omit<ActionFeedbackInput, 'tone'>
  ) => string;

  notify: (
    input: ActionFeedbackInput
  ) => string;

  dismiss: (
    messageId: string
  ) => void;

  dismissAll: () => void;

  runProtectedAction: (
    input: RunProtectedActionInput
  ) => Promise<boolean>;

  registerProtectedActionHandler: (
    actionType: string,
    handler: ProtectedActionHandler
  ) => () => void;

  pendingAction:
    | ProtectedActionDescriptor
    | null;

  clearPendingAction: () => void;

  authenticationGateOpen: boolean;
  resumingAction: boolean;
};

export type ExperienceOnboardingPath =
  | 'signup'
  | 'signin'
  | 'guest';

export type ExperienceOnboardingState = {
  version: number;

  dismissedAt?: string;
  completedAt?: string;

  selectedPath?: ExperienceOnboardingPath;
};