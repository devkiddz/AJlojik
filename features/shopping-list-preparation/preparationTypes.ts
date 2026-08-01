import type {
  ShoppingListPreparationCustomerDecision,
  ShoppingListPreparationItemDecision,
  ShoppingListPreparationItemStatus,
  ShoppingListPreparationStatus
} from '@/lib/generated/prisma/client';

export type SubmitPreparationInput = {
  workspaceId: string;
  shoppingListId: string;
  customerNote?: string | null;
};

export type ResolvePreparationItemInput = {
  workspaceId: string;
  requestId: string;
  itemId: string;
  status: ShoppingListPreparationItemStatus;
  resolvedVariantId?: string | null;
  preparedQuantity?: number;
  quotedUnitPrice?: number;
  substitutionReason?: string | null;
  staffNote?: string | null;
};

export type DecidePreparationItemInput = {
  workspaceId: string;
  requestId: string;
  itemId: string;
  decision: Extract<ShoppingListPreparationItemDecision, 'APPROVED' | 'REJECTED'>;
  customerNote?: string | null;
};

export type DecidePreparationRequestInput = {
  workspaceId: string;
  requestId: string;
  decision: Extract<
    ShoppingListPreparationCustomerDecision,
    'APPROVED' | 'CHANGES_REQUESTED' | 'CANCELLED'
  >;
  note?: string | null;
};

export type TransitionPreparationInput = {
  workspaceId: string;
  requestId: string;
  nextStatus: ShoppingListPreparationStatus;
  note?: string | null;
};
