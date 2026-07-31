import type {
  AdminApprovalAction,
  AdminApprovalEventType,
  AdminApprovalPriority,
  AdminApprovalSource,
  AdminApprovalStatus,
  AdminTargetType
} from '@/lib/generated/prisma/client';

export type ApprovalInspectionProduct = {
  id: string;
  name: string;
  imageUrl: string | null;
  status: string;
  available: number;
  quantity?: number | null;
};

export type ApprovalInspection = {
  targetType: AdminTargetType;
  targetId: string;
  title: string;
  subtitle: string | null;
  status: string | null;
  href: string | null;
  images: string[];
  fields: Array<{
    label: string;
    value: string;
  }>;
  metrics: Array<{
    label: string;
    value: string;
  }>;
  products: ApprovalInspectionProduct[];
  warnings: string[];
  canExecute: boolean;
  unsupportedReason: string | null;
};

export type ApprovalTimelineEvent = {
  id: string;
  type: AdminApprovalEventType;
  fromStatus: AdminApprovalStatus | null;
  toStatus: AdminApprovalStatus | null;
  note: string | null;
  createdAt: string;
  actor: {
    id: string;
    name: string;
  } | null;
};

export type ApprovalOperationsItem = {
  id: string;
  source: AdminApprovalSource;
  priority: AdminApprovalPriority;
  action: AdminApprovalAction;
  targetType: AdminTargetType;
  targetId: string;
  reason: string;
  payload: unknown;
  status: AdminApprovalStatus;
  reviewNote: string | null;
  internalNote: string | null;
  revision: number;
  dueAt: string | null;
  holdUntil: string | null;
  inspectionStartedAt: string | null;
  reviewedAt: string | null;
  executedAt: string | null;
  pausedAt: string | null;
  reactivatedAt: string | null;
  revertedAt: string | null;
  expiredAt: string | null;
  createdAt: string;
  updatedAt: string;
  requestedBy: {
    id: string;
    name: string;
    email: string;
  };
  reviewedBy: {
    id: string;
    name: string;
  } | null;
  assignedReviewer: {
    id: string;
    name: string;
    email: string;
  } | null;
  inspection: ApprovalInspection;
  events: ApprovalTimelineEvent[];
};

export type ApprovalReviewerOption = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type ApprovalLifecycleOperation =
  | 'inspect'
  | 'assign'
  | 'update-administration'
  | 'hold'
  | 'reactivate'
  | 'request-changes'
  | 'approve'
  | 'reject'
  | 'pause'
  | 'revert'
  | 'cancel';
