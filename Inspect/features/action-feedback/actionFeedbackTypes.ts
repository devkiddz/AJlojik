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

// ============================================================
// RICH CART FEEDBACK
// ============================================================

export type ActionFeedbackCartItem = {
  /**
   * Stable identity used when repeated additions are merged.
   *
   * Recommended:
   * `${productId}:${variantId}`
   */
  id: string;

  productId: string;
  variantId: string;

  name: string;
  variantLabel?: string;
  image: string;

  quantity: number;

  /**
   * Unit price, not quantity-adjusted line total.
   */
  price?: number;
};

export type ActionFeedbackCartPreview = {
  /**
   * Products added during the current cart-notification burst.
   */
  items: ActionFeedbackCartItem[];

  /**
   * Total quantity represented by the current notification.
   *
   * When omitted, the viewport may derive it from `items`.
   */
  totalQuantity?: number;

  /**
   * Combined monetary value represented by the notification.
   */
  totalAmount?: number;

  locale?: string;
  currency?: string;
};

// ============================================================
// FEEDBACK INPUT AND MESSAGE
// ============================================================

export type ActionFeedbackInput = {
  tone?: ActionFeedbackTone;

  title: string;
  description?: string;

  duration?: number;

  banner?: ActionFeedbackBanner;
  action?: ActionFeedbackAction;

  /**
   * Optional rich cart presentation.
   *
   * Existing feedback messages remain unaffected when omitted.
   */
  cartPreview?: ActionFeedbackCartPreview;

  /**
   * Messages sharing the same group key may be merged by the
   * provider instead of creating separate notification cards.
   *
   * Example:
   * `cart-activity`
   */
  groupKey?: string;
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

  cartPreview?: ActionFeedbackCartPreview;

  /**
   * Identifies a notification that may be updated in place.
   */
  groupKey?: string;

  /**
   * Incremented whenever an existing message is updated.
   *
   * The viewport uses this to restart the progress animation.
   */
  revision: number;
};

// ============================================================
// SERIALIZABLE PROTECTED ACTIONS
// ============================================================

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

// ============================================================
// CONTEXT CONTRACT
// ============================================================

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

// ============================================================
// EXPERIENCE ONBOARDING
// ============================================================

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