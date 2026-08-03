export const SUPPORT_GUIDE_INTENTS = [
  'GREETING',
  'HOW_TO_BUY',
  'HOW_TO_USE_APP',
  'MULTIVENDOR_AVAILABILITY',
  'CART_AND_CHECKOUT',
  'PAYMENT_HELP',
  'ORDER_TRACKING',
  'DELIVERY_HELP',
  'ACCOUNT_HELP',
  'SHOPPING_LISTS',
  'VENDOR_CONTACT',
  'RETURNS_AND_REFUNDS',
  'PRODUCT_AVAILABILITY',
  'ALCOHOL_DELIVERY_ELIGIBILITY',
  'PARTY_PLANNING',
  'HUMAN_SUPPORT',
  'UNKNOWN'
] as const;

export type SupportGuideIntent =
  (typeof SUPPORT_GUIDE_INTENTS)[number];

export const SUPPORT_GUIDE_OUTCOMES = [
  'ANSWERED',
  'CLARIFICATION_REQUIRED',
  'CONTEXT_REQUIRED',
  'HUMAN_SUPPORT_REQUIRED',
  'NO_MATCH'
] as const;

export type SupportGuideOutcome =
  (typeof SUPPORT_GUIDE_OUTCOMES)[number];

export type SupportGuideAction = {
  id: string;
  label: string;
  href?: string;
  kind:
    | 'NAVIGATE'
    | 'FOLLOW_UP'
    | 'HUMAN_HANDOFF';
  prompt?: string;
};

export type SupportGuideMessage = {
  id: string;
  role:
    | 'CUSTOMER'
    | 'GUIDE';
  body: string;
  createdAt: string;
};

export const SUPPORT_GUIDE_CONTEXT_STATES = [
  'NOT_REQUIRED',
  'RESOLVED',
  'PARTIAL',
  'AMBIGUOUS',
  'UNAVAILABLE'
] as const;

export type SupportGuideContextState =
  (typeof SUPPORT_GUIDE_CONTEXT_STATES)[number];

export type SupportGuideContextReferenceKind =
  | 'CUSTOMER'
  | 'ORDER'
  | 'PAYMENT'
  | 'DELIVERY'
  | 'PRODUCT'
  | 'LOCATION'
  | 'VERIFICATION';

export type SupportGuideContextReference = {
  kind: SupportGuideContextReferenceKind;
  id: string | null;
  label: string;
  status: string | null;
  detail: string | null;
};

export type SupportGuideContextSnapshot = {
  state: SupportGuideContextState;
  resolved: string[];
  missing: string[];
  ambiguous: string[];
  summary: string[];
  references: SupportGuideContextReference[];
};

export const SUPPORT_GUIDE_HANDOFF_CATEGORIES = [
  'ORDER',
  'DELIVERY',
  'PAYMENT',
  'PRODUCT',
  'ACCOUNT',
  'VENDOR',
  'SHOPPING_LIST',
  'TECHNICAL',
  'OTHER'
] as const;

export type SupportGuideHandoffCategory =
  (typeof SUPPORT_GUIDE_HANDOFF_CATEGORIES)[number];

export type SupportGuideHandoffPriority =
  | 'NORMAL'
  | 'HIGH';

export type SupportGuideHandoffDraft = {
  category: SupportGuideHandoffCategory;
  priority: SupportGuideHandoffPriority;
  subject: string;
  orderId: string | null;
  deliveryId: string | null;
  vendorProfileId: string | null;
  interactionId: string | null;
  metadata: Record<string, unknown>;
};

export type SupportGuideResponse = {
  outcome: SupportGuideOutcome;
  intent: SupportGuideIntent;
  answer: string;
  followUp: string | null;
  confidence:
    | 'HIGH'
    | 'MEDIUM'
    | 'LOW';
  confidenceScore: number;
  source:
    | 'DATABASE_KNOWLEDGE'
    | 'LIVE_CONTEXT'
    | 'CLARIFICATION'
    | 'SYSTEM_FALLBACK';
  knowledgeEntryId: string | null;
  knowledgeEntrySlug: string | null;
  interactionId: string | null;
  requiredContext: string[];
  context: SupportGuideContextSnapshot | null;
  actions: SupportGuideAction[];
  shouldOfferHuman: boolean;
};

export type SupportGuideRequest = {
  question: string;
  pathname?: string | null;
};
