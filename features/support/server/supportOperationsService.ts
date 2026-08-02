import 'server-only';

import type {
  Prisma,
  SupportCommerceActionType
} from '@/lib/generated/prisma/client';
import { prisma } from '@/lib/prisma';

import type {
  SupportOperationsSnapshot
} from '../supportOperationsTypes';
import {
  getSupportOperationsSnapshot
} from './supportOperationsRepository';

const MAX_REASON_LENGTH = 2000;

export type SupportOperationsErrorCode =
  | 'INVALID_INPUT'
  | 'CASE_NOT_FOUND'
  | 'ACTION_NOT_FOUND'
  | 'ACTION_UNAVAILABLE'
  | 'CONTEXT_REQUIRED';

export class SupportOperationsError extends Error {
  readonly code: SupportOperationsErrorCode;

  constructor(
    code: SupportOperationsErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'SupportOperationsError';
    this.code = code;
  }
}

type PrepareSupportCommerceActionInput = {
  workspaceId: string;
  caseId: string;
  requestedById: string;
  type: SupportCommerceActionType;
  reason: string;
  requestedAmount?: number | null;
  currency?: string | null;
  requestPayload?: Prisma.InputJsonValue;
};

type ReviewSupportCommerceActionInput = {
  workspaceId: string;
  caseId: string;
  actionId: string;
  reviewedById: string;
  decision: 'APPROVE' | 'REJECT';
  note?: string | null;
};

function requiredReason(value: string) {
  const reason = value.trim();

  if (!reason) {
    throw new SupportOperationsError(
      'INVALID_INPUT',
      'A reason is required.'
    );
  }

  if (reason.length > MAX_REASON_LENGTH) {
    throw new SupportOperationsError(
      'INVALID_INPUT',
      `The reason must not exceed ${MAX_REASON_LENGTH} characters.`
    );
  }

  return reason;
}

function needsOrder(
  type: SupportCommerceActionType
) {
  return [
    'REFUND_REQUEST',
    'ORDER_CANCELLATION',
    'PAYMENT_REVIEW'
  ].includes(type);
}

export async function prepareSupportCommerceAction(
  input: PrepareSupportCommerceActionInput
): Promise<SupportOperationsSnapshot> {
  const reason = requiredReason(
    input.reason
  );

  const supportCase =
    await prisma.supportCase.findFirst({
      where: {
        id: input.caseId,
        workspaceId: input.workspaceId
      },
      select: {
        id: true,
        status: true,
        orderId: true,
        deliveryId: true,
        vendorProfileId: true,
        order: {
          select: {
            total: true
          }
        }
      }
    });

  if (!supportCase) {
    throw new SupportOperationsError(
      'CASE_NOT_FOUND',
      'The Support Case could not be found.'
    );
  }

  if (supportCase.status === 'CLOSED') {
    throw new SupportOperationsError(
      'ACTION_UNAVAILABLE',
      'Prepared commerce actions cannot be added to a closed case.'
    );
  }

  if (
    needsOrder(input.type) &&
    !supportCase.orderId
  ) {
    throw new SupportOperationsError(
      'CONTEXT_REQUIRED',
      'This action requires an order-linked Support Case.'
    );
  }

  if (
    input.type === 'DELIVERY_RETRY' &&
    !supportCase.deliveryId
  ) {
    throw new SupportOperationsError(
      'CONTEXT_REQUIRED',
      'This action requires delivery context.'
    );
  }

  if (
    input.type === 'VENDOR_FOLLOWUP' &&
    !supportCase.vendorProfileId
  ) {
    throw new SupportOperationsError(
      'CONTEXT_REQUIRED',
      'This action requires vendor context.'
    );
  }

  const requestedAmount =
    input.requestedAmount ?? null;

  if (
    requestedAmount !== null &&
    (!Number.isFinite(requestedAmount) ||
      requestedAmount <= 0)
  ) {
    throw new SupportOperationsError(
      'INVALID_INPUT',
      'The requested amount must be greater than zero.'
    );
  }

  if (
    input.type === 'REFUND_REQUEST' &&
    requestedAmount !== null &&
    supportCase.order &&
    requestedAmount >
      Number(supportCase.order.total)
  ) {
    throw new SupportOperationsError(
      'INVALID_INPUT',
      'The requested refund exceeds the order total.'
    );
  }

  await prisma.$transaction([
    prisma.supportCommerceAction.create({
      data: {
        caseId: input.caseId,
        requestedById:
          input.requestedById,
        type: input.type,
        status: 'PREPARED',
        requestedAmount,
        currency:
          input.currency?.trim() ||
          (requestedAmount !== null
            ? 'NGN'
            : null),
        reason,
        requestPayload:
          input.requestPayload
      }
    }),
    prisma.supportNote.create({
      data: {
        caseId: input.caseId,
        authorId: input.requestedById,
        internal: true,
        body:
          `Prepared commerce action: ${input.type.replaceAll('_', ' ')}.`,
        metadata: {
          kind:
            'SUPPORT_COMMERCE_ACTION_PREPARED',
          type: input.type,
          requestedAmount,
          reason
        }
      }
    })
  ]);

  const snapshot =
    await getSupportOperationsSnapshot(
      input.caseId,
      input.workspaceId
    );

  if (!snapshot) {
    throw new SupportOperationsError(
      'CASE_NOT_FOUND',
      'The updated Support operations snapshot could not be reloaded.'
    );
  }

  return snapshot;
}

export async function reviewSupportCommerceAction(
  input: ReviewSupportCommerceActionInput
): Promise<SupportOperationsSnapshot> {
  const action =
    await prisma.supportCommerceAction.findFirst({
      where: {
        id: input.actionId,
        caseId: input.caseId,
        case: {
          workspaceId: input.workspaceId
        }
      },
      select: {
        id: true,
        type: true,
        status: true
      }
    });

  if (!action) {
    throw new SupportOperationsError(
      'ACTION_NOT_FOUND',
      'The prepared commerce action could not be found.'
    );
  }

  if (action.status !== 'PREPARED') {
    throw new SupportOperationsError(
      'ACTION_UNAVAILABLE',
      'Only prepared commerce actions can be reviewed.'
    );
  }

  const now = new Date();
  const approved =
    input.decision === 'APPROVE';

  await prisma.$transaction([
    prisma.supportCommerceAction.update({
      where: {
        id: action.id
      },
      data: approved
        ? {
            status: 'APPROVED',
            approvedById:
              input.reviewedById,
            approvedAt: now
          }
        : {
            status: 'REJECTED',
            approvedById:
              input.reviewedById,
            rejectedAt: now,
            failureReason:
              input.note?.trim() ||
              'Rejected during governed review.'
          }
    }),
    prisma.supportNote.create({
      data: {
        caseId: input.caseId,
        authorId: input.reviewedById,
        internal: true,
        body: approved
          ? `Approved prepared commerce action: ${action.type.replaceAll('_', ' ')}.`
          : `Rejected prepared commerce action: ${action.type.replaceAll('_', ' ')}.`,
        metadata: {
          kind: approved
            ? 'SUPPORT_COMMERCE_ACTION_APPROVED'
            : 'SUPPORT_COMMERCE_ACTION_REJECTED',
          actionId: action.id,
          note:
            input.note?.trim() || null
        }
      }
    })
  ]);

  const snapshot =
    await getSupportOperationsSnapshot(
      input.caseId,
      input.workspaceId
    );

  if (!snapshot) {
    throw new SupportOperationsError(
      'CASE_NOT_FOUND',
      'The reviewed Support operations snapshot could not be reloaded.'
    );
  }

  return snapshot;
}
