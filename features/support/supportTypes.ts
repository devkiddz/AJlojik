import type {
  CommunicationConversationDetail
} from '@/features/communication';

export const SUPPORT_CASE_CATEGORIES = [
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

export type SupportCaseCategoryValue =
  (typeof SUPPORT_CASE_CATEGORIES)[number];

export const SUPPORT_CASE_PRIORITIES = [
  'LOW',
  'NORMAL',
  'HIGH',
  'URGENT'
] as const;

export type SupportCasePriorityValue =
  (typeof SUPPORT_CASE_PRIORITIES)[number];

export const SUPPORT_CASE_STATUSES = [
  'NEW',
  'TRIAGED',
  'ASSIGNED',
  'IN_PROGRESS',
  'WAITING_CUSTOMER',
  'WAITING_VENDOR',
  'WAITING_INTERNAL',
  'RESOLVED',
  'CUSTOMER_CONFIRMED',
  'CLOSED'
] as const;

export type SupportCaseStatusValue =
  (typeof SUPPORT_CASE_STATUSES)[number];

export const SUPPORT_ESCALATION_STATUSES = [
  'OPEN',
  'ACKNOWLEDGED',
  'RESOLVED',
  'CANCELLED'
] as const;

export type SupportEscalationStatusValue =
  (typeof SUPPORT_ESCALATION_STATUSES)[number];

export const SUPPORT_RESOLUTION_TYPES = [
  'INFORMATION',
  'DELIVERY_FOLLOWUP',
  'ORDER_ADJUSTMENT',
  'REFUND_REQUEST',
  'REPLACEMENT',
  'TECHNICAL_FIX',
  'OTHER'
] as const;

export type SupportResolutionTypeValue =
  (typeof SUPPORT_RESOLUTION_TYPES)[number];

export const SUPPORT_RESOLUTION_STATUSES = [
  'PROPOSED',
  'APPROVED',
  'APPLIED',
  'REJECTED',
  'FAILED'
] as const;

export type SupportResolutionStatusValue =
  (typeof SUPPORT_RESOLUTION_STATUSES)[number];

export type SupportIdentity = {
  id: string;
  name: string;
  email: string | null;
  image: string | null;
};

export type SupportVendorIdentity = {
  id: string;
  name: string;
  slug: string;
};

export type SupportOrderContext = {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
};

export type SupportDeliveryContext = {
  id: string;
  trackingCode: string;
  status: string;
};

export type SupportAssignmentItem = {
  id: string;
  agent: SupportIdentity;
  assignedBy: SupportIdentity | null;
  active: boolean;
  reason: string | null;
  assignedAt: string;
  releasedAt: string | null;
};

export type SupportNoteItem = {
  id: string;
  author: SupportIdentity | null;
  body: string;
  internal: boolean;
  createdAt: string;
};

export type SupportEscalationItem = {
  id: string;
  actor: SupportIdentity | null;
  fromPriority: SupportCasePriorityValue;
  toPriority: SupportCasePriorityValue;
  status: SupportEscalationStatusValue;
  reason: string;
  createdAt: string;
  resolvedAt: string | null;
};

export type SupportStatusHistoryItem = {
  id: string;
  actor: SupportIdentity | null;
  fromStatus: SupportCaseStatusValue | null;
  toStatus: SupportCaseStatusValue;
  note: string | null;
  createdAt: string;
};

export type SupportResolutionItem = {
  id: string;
  type: SupportResolutionTypeValue;
  status: SupportResolutionStatusValue;
  summary: string;
  proposedBy: SupportIdentity | null;
  approvedBy: SupportIdentity | null;
  proposedAt: string;
  approvedAt: string | null;
  appliedAt: string | null;
  failedAt: string | null;
};

export type SupportFeedbackItem = {
  rating: number;
  comment: string | null;
  createdAt: string;
};

export type SupportCaseSummary = {
  id: string;
  caseNumber: string;
  category: SupportCaseCategoryValue;
  priority: SupportCasePriorityValue;
  status: SupportCaseStatusValue;
  subject: string;
  description: string;
  customer: SupportIdentity;
  vendor: SupportVendorIdentity | null;
  order: SupportOrderContext | null;
  delivery: SupportDeliveryContext | null;
  assignedAgent: SupportIdentity | null;
  conversationId: string;
  dueAt: string | null;
  firstResponseAt: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SupportCaseDetail =
  SupportCaseSummary & {
    resolutionSummary: string | null;
    assignments: SupportAssignmentItem[];
    notes: SupportNoteItem[];
    escalations: SupportEscalationItem[];
    statusHistory: SupportStatusHistoryItem[];
    resolutions: SupportResolutionItem[];
    feedback: SupportFeedbackItem | null;
    conversation: CommunicationConversationDetail;
  };

export type SupportCaseListSnapshot = {
  workspaceId: string;
  generatedAt: string;
  totalCount: number;
  cases: SupportCaseSummary[];
};

export type SupportQueueSnapshot = {
  workspaceId: string;
  generatedAt: string;
  counts: Record<SupportCaseStatusValue, number>;
  cases: SupportCaseSummary[];
};
