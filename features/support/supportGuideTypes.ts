export const SUPPORT_GUIDE_INTENTS = [
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
  'HUMAN_SUPPORT',
  'UNKNOWN'
] as const;

export type SupportGuideIntent =
  (typeof SUPPORT_GUIDE_INTENTS)[number];

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

export type SupportGuideResponse = {
  intent: SupportGuideIntent;
  answer: string;
  followUp: string | null;
  confidence:
    | 'HIGH'
    | 'MEDIUM'
    | 'LOW';
  source:
    | 'APP_KNOWLEDGE'
    | 'DATABASE_KNOWLEDGE'
    | 'LIVE_CONTEXT'
    | 'CLARIFICATION';
  actions: SupportGuideAction[];
  shouldOfferHuman: boolean;
};

export type SupportGuideRequest = {
  question: string;
  pathname?: string | null;
};
