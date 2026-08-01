import type {
  ShoppingListPreparationStatus
} from '@/lib/generated/prisma/client';

const TRANSITIONS: Record<
  ShoppingListPreparationStatus,
  readonly ShoppingListPreparationStatus[]
> = {
  SUBMITTED: [
    'IN_PREPARATION',
    'CANCELLED'
  ],
  IN_PREPARATION: [
    'AWAITING_CUSTOMER_APPROVAL',
    'READY_FOR_CHECKOUT',
    'CANCELLED'
  ],
  AWAITING_CUSTOMER_APPROVAL: [
    'IN_PREPARATION',
    'READY_FOR_CHECKOUT',
    'CANCELLED'
  ],
  READY_FOR_CHECKOUT: [
    'ORDER_CREATED',
    'IN_PREPARATION',
    'CANCELLED'
  ],
  ORDER_CREATED: [
    'COMPLETED'
  ],
  COMPLETED: [],
  CANCELLED: []
};

export function assertPreparationTransition(
  current:
    ShoppingListPreparationStatus,
  next:
    ShoppingListPreparationStatus
): void {
  if (
    current ===
    next
  ) {
    return;
  }

  if (
    !TRANSITIONS[
      current
    ].includes(
      next
    )
  ) {
    throw new Error(
      `Preparation cannot move directly from ${current.replaceAll(
        '_',
        ' '
      )} to ${next.replaceAll(
        '_',
        ' '
      )}.`
    );
  }
}
