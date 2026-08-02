export const SUPPORT_COMMERCE_ACTION_TYPES = [
  'REFUND_REQUEST',
  'ORDER_CANCELLATION',
  'DELIVERY_RETRY',
  'PAYMENT_REVIEW',
  'INVENTORY_REVIEW',
  'VENDOR_FOLLOWUP'
] as const;

export type SupportCommerceActionTypeValue =
  (typeof SUPPORT_COMMERCE_ACTION_TYPES)[number];

export const SUPPORT_COMMERCE_ACTION_STATUSES = [
  'PREPARED',
  'APPROVED',
  'REJECTED',
  'APPLIED',
  'FAILED',
  'CANCELLED'
] as const;

export type SupportCommerceActionStatusValue =
  (typeof SUPPORT_COMMERCE_ACTION_STATUSES)[number];

export type SupportSLAState =
  | 'NO_TARGET'
  | 'ON_TRACK'
  | 'AT_RISK'
  | 'BREACHED'
  | 'MET';

export type SupportSLAHealth = {
  firstResponseState: SupportSLAState;
  resolutionState: SupportSLAState;
  firstResponseDueAt: string | null;
  resolutionDueAt: string | null;
  remainingMinutes: number | null;
};

export type SupportCommerceContext = {
  order: {
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    total: number;
    currency: string;
    payments: Array<{
      id: string;
      provider: string;
      reference: string;
      amount: number;
      status: string;
      paidAt: string | null;
    }>;
  } | null;
  delivery: {
    id: string;
    trackingCode: string;
    status: string;
    estimatedArrival: string | null;
    deliveredAt: string | null;
  } | null;
  vendor: {
    id: string;
    name: string;
    slug: string;
  } | null;
};

export type SupportCommerceActionItem = {
  id: string;
  type: SupportCommerceActionTypeValue;
  status: SupportCommerceActionStatusValue;
  requestedAmount: number | null;
  currency: string | null;
  reason: string;
  requestedBy: {
    id: string;
    name: string;
  } | null;
  approvedBy: {
    id: string;
    name: string;
  } | null;
  executedBy: {
    id: string;
    name: string;
  } | null;
  preparedAt: string;
  approvedAt: string | null;
  rejectedAt: string | null;
  appliedAt: string | null;
  failedAt: string | null;
  cancelledAt: string | null;
  failureReason: string | null;
};

export type SupportOperationsSnapshot = {
  workspaceId: string;
  caseId: string;
  generatedAt: string;
  sla: SupportSLAHealth;
  commerce: SupportCommerceContext;
  actions: SupportCommerceActionItem[];
};
