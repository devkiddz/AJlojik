import 'server-only';

import {
  Prisma,
  type ShoppingListPreparationCustomerDecision,
  type ShoppingListPreparationItemDecision,
  type ShoppingListPreparationItemStatus,
  type ShoppingListPreparationStatus
} from '@/lib/generated/prisma/client';

import {
  completeOperationalTodos,
  upsertOperationalTodo
} from '@/features/admin/todos/adminTodoRepository';

import {
  notifyShoppingListPreparationUpdated
} from '@/features/notifications/server/notificationEngine';

import {
  prisma
} from '@/lib/prisma';

import type {
  PreparationVariantReference
} from './preparationContracts';

import {
  mapPreparation,
  preparationInclude
} from './preparationMapper';

import {
  assertPreparationTransition
} from './preparationStateMachine';

export class PreparationRuntimeError extends Error {
  constructor(
    message: string,
    readonly status = 400
  ) {
    super(message);
  }
}

const EDITABLE_STATUSES: ShoppingListPreparationStatus[] = [
  'SUBMITTED',
  'IN_PREPARATION',
  'AWAITING_CUSTOMER_APPROVAL'
];

const CUSTOMER_APPROVAL_ITEM_STATUSES: ShoppingListPreparationItemStatus[] = [
  'PARTIALLY_AVAILABLE',
  'SUBSTITUTED',
  'PRICE_CHANGED'
];

function decimalNumber(
  value:
    | Prisma.Decimal
    | number
    | string
    | null
): number {
  if (value === null) {
    return 0;
  }

  const parsed =
    Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

async function loadRequest(
  requestId: string
) {
  const request =
    await prisma.shoppingListPreparationRequest.findUnique({
      where: {
        id: requestId
      },
      include:
        preparationInclude
    });

  if (!request) {
    throw new PreparationRuntimeError(
      'The preparation request was not found.',
      404
    );
  }

  return request;
}

async function createPreparationEvent(
  transaction:
    Prisma.TransactionClient,
  input: {
    requestId: string;
    actorId?: string | null;
    type: string;
    fromStatus?: ShoppingListPreparationStatus | null;
    toStatus?: ShoppingListPreparationStatus | null;
    note?: string | null;
    metadata?: Prisma.InputJsonValue;
  }
) {
  return transaction.shoppingListPreparationEvent.create({
    data: {
      requestId:
        input.requestId,
      actorId:
        input.actorId ??
        null,
      type:
        input.type,
      fromStatus:
        input.fromStatus ??
        null,
      toStatus:
        input.toStatus ??
        null,
      note:
        input.note?.trim() ||
        null,
      metadata:
        input.metadata
    }
  });
}

async function calculateQuote(
  transaction:
    Prisma.TransactionClient,
  requestId: string
) {
  const items =
    await transaction.shoppingListPreparationItem.findMany({
      where: {
        requestId
      },
      select: {
        requestedQuantity:
          true,
        preparedQuantity:
          true,
        originalUnitPrice:
          true,
        quotedUnitPrice:
          true,
        status:
          true,
        customerDecision:
          true
      }
    });

  const originalEstimatedTotal =
    items.reduce(
      (
        total,
        item
      ) =>
        total +
        decimalNumber(
          item.originalUnitPrice
        ) *
        item.requestedQuantity,
      0
    );

  const quotedSubtotal =
    items.reduce(
      (
        total,
        item
      ) => {
        const excluded =
          item.status ===
            'UNAVAILABLE' ||
          item.status ===
            'REMOVED' ||
          item.customerDecision ===
            'REJECTED';

        if (excluded) {
          return total;
        }

        return (
          total +
          decimalNumber(
            item.quotedUnitPrice
          ) *
            item.preparedQuantity
        );
      },
      0
    );

  await transaction.shoppingListPreparationRequest.update({
    where: {
      id: requestId
    },
    data: {
      originalEstimatedTotal,
      quotedSubtotal,
      approvedTotal:
        null,
      quoteVersion: {
        increment: 1
      }
    }
  });

  return {
    originalEstimatedTotal,
    quotedSubtotal
  };
}

async function completePreparationTodo(
  transaction:
    Prisma.TransactionClient,
  input: {
    workspaceId: string;
    shoppingListId: string;
  }
) {
  return completeOperationalTodos(
    transaction,
    {
      workspaceId:
        input.workspaceId,
      source:
        'SHOPPING_LIST',
      targetType:
        'SHOPPING_LIST',
      targetId:
        input.shoppingListId
    }
  );
}

async function upsertPreparationTodo(
  transaction:
    Prisma.TransactionClient,
  input: {
    workspaceId: string;
    shoppingListId: string;
    requestId: string;
    listName: string;
    itemCount: number;
    createdById?: string | null;
    urgent?: boolean;
    description?: string;
  }
) {
  return upsertOperationalTodo(
    transaction,
    {
      workspaceId:
        input.workspaceId,
      title:
        `Prepare ${input.listName}`,
      description:
        input.description ??
        `${input.itemCount} item(s) are waiting for staff verification.`,
      source:
        'SHOPPING_LIST',
      priority:
        input.urgent
          ? 'URGENT'
          : 'HIGH',
      targetType:
        'SHOPPING_LIST',
      targetId:
        input.shoppingListId,
      dedupeKey:
        `shopping-list-preparation:${input.requestId}`,
      createdById:
        input.createdById ??
        null,
      metadata: {
        requestId:
          input.requestId,
        shoppingListId:
          input.shoppingListId,
        itemCount:
          input.itemCount
      }
    }
  );
}

function requirePreparationTransition(
  current: ShoppingListPreparationStatus,
  next: ShoppingListPreparationStatus
) {
  try {
    assertPreparationTransition(
      current,
      next
    );
  } catch (error) {
    throw new PreparationRuntimeError(
      error instanceof Error
        ? error.message
        : 'The requested preparation transition is invalid.',
      409
    );
  }
}

function requiresCustomerApproval(
  input: {
    status: ShoppingListPreparationItemStatus;
    originalVariantId: string | null;
    resolvedVariantId: string | null;
    requestedQuantity: number;
    preparedQuantity: number;
    originalUnitPrice: number;
    quotedUnitPrice: number;
  }
) {
  return (
    CUSTOMER_APPROVAL_ITEM_STATUSES.includes(
      input.status
    ) ||
    input.originalVariantId !==
      input.resolvedVariantId ||
    input.requestedQuantity !==
      input.preparedQuantity ||
    Math.abs(
      input.originalUnitPrice -
      input.quotedUnitPrice
    ) >
      0.009
  );
}

export const PreparationRepository = {
  async listCustomerRequests(
    userId: string,
    input: {
      workspaceId?: string;
      shoppingListId?: string;
    }
  ) {
    const requests =
      await prisma.shoppingListPreparationRequest.findMany({
        where: {
          userId,
          ...(input.workspaceId
            ? {
                workspaceId:
                  input.workspaceId
              }
            : {}),
          ...(input.shoppingListId
            ? {
                shoppingListId:
                  input.shoppingListId
              }
            : {})
        },
        include:
          preparationInclude,
        orderBy: {
          updatedAt:
            'desc'
        },
        take: 50
      });

    return requests.map(
      mapPreparation
    );
  },

  async getCustomerRequest(
    userId: string,
    requestId: string
  ) {
    const request =
      await prisma.shoppingListPreparationRequest.findFirst({
        where: {
          id:
            requestId,
          userId
        },
        include:
          preparationInclude
      });

    return request
      ? mapPreparation(
          request
        )
      : null;
  },

  async listStaffRequests(
    workspaceId: string
  ) {
    const requests =
      await prisma.shoppingListPreparationRequest.findMany({
        where: {
          workspaceId
        },
        include:
          preparationInclude,
        orderBy: [
          {
            status:
              'asc'
          },
          {
            priority:
              'desc'
          },
          {
            submittedAt:
              'asc'
          }
        ],
        take: 100
      });

    return requests.map(
      mapPreparation
    );
  },

  async submit(
    userId: string,
    input: {
      workspaceId: string;
      shoppingListId: string;
      customerNote?: string | null;
    }
  ) {
    const list =
      await prisma.shoppingList.findFirst({
        where: {
          id:
            input.shoppingListId,
          workspaceId:
            input.workspaceId,
          userId,
          status:
            'ACTIVE'
        },
        include: {
          items: {
            orderBy: {
              position:
                'asc'
            },
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  active: true,
                  status: true,
                  vendorProfileId:
                    true
                }
              },
              variant: {
                select: {
                  id: true,
                  label: true,
                  image: true,
                  price: true,
                  active: true
                }
              }
            }
          }
        }
      });

    if (!list) {
      throw new PreparationRuntimeError(
        'The selected Shopping List was not found.',
        404
      );
    }

    if (!list.items.length) {
      throw new PreparationRuntimeError(
        'Add at least one product before submitting this Shopping List for preparation.',
        422
      );
    }

    const active =
      await prisma.shoppingListPreparationRequest.findFirst({
        where: {
          shoppingListId:
            list.id,
          status: {
            notIn: [
              'COMPLETED',
              'CANCELLED'
            ]
          }
        },
        select: {
          id: true
        }
      });

    if (active) {
      throw new PreparationRuntimeError(
        'This Shopping List already has an active preparation request.',
        409
      );
    }

    const originalEstimatedTotal =
      list.items.reduce(
        (
          total,
          item
        ) =>
          total +
          (
            item.variant
              ? decimalNumber(
                  item.variant
                    .price
                )
              : 0
          ) *
            item.quantity,
        0
      );

    const created =
      await prisma.$transaction(
        async transaction => {
          const request =
            await transaction.shoppingListPreparationRequest.create({
              data: {
                workspaceId:
                  input.workspaceId,
                shoppingListId:
                  list.id,
                userId,
                status:
                  'SUBMITTED',
                customerDecision:
                  'PENDING',
                customerNote:
                  input.customerNote?.trim() ||
                  null,
                originalEstimatedTotal,
                quotedSubtotal:
                  originalEstimatedTotal,
                items: {
                  create:
                    list.items.map(
                      item => {
                        const available =
                          item.product
                            .active &&
                          item.product
                            .status ===
                            'PUBLISHED' &&
                          Boolean(
                            item.variant
                              ?.active
                          );

                        const price =
                          item.variant
                            ? decimalNumber(
                                item
                                  .variant
                                  .price
                              )
                            : 0;

                        return {
                          sourceShoppingListItemId:
                            item.id,
                          productId:
                            item.productId,
                          originalVariantId:
                            item.variantId,
                          resolvedVariantId:
                            available
                              ? item.variantId
                              : null,
                          vendorProfileId:
                            item.product
                              .vendorProfileId,
                          productName:
                            item.product.name,
                          originalVariantLabel:
                            item.variant
                              ?.label ??
                            null,
                          resolvedVariantLabel:
                            available
                              ? item.variant
                                  ?.label ??
                                null
                              : null,
                          image:
                            item.variant
                              ?.image ??
                            null,
                          requestedQuantity:
                            item.quantity,
                          preparedQuantity:
                            available
                              ? item.quantity
                              : 0,
                          originalUnitPrice:
                            price,
                          quotedUnitPrice:
                            available
                              ? price
                              : 0,
                          status:
                            available
                              ? 'PENDING'
                              : 'UNAVAILABLE',
                          customerDecision:
                            available
                              ? 'PENDING'
                              : 'NOT_REQUIRED',
                          customerNote:
                            item.note,
                          position:
                            item.position
                        };
                      }
                    )
                }
              },
              include:
                preparationInclude
            });

          const event =
            await createPreparationEvent(
              transaction,
              {
                requestId:
                  request.id,
                actorId:
                  userId,
                type:
                  'SUBMITTED',
                toStatus:
                  'SUBMITTED',
                note:
                  input.customerNote,
                metadata: {
                  itemCount:
                    list.items
                      .length,
                  quoteVersion:
                    1
                }
              }
            );

          await upsertPreparationTodo(
            transaction,
            {
              workspaceId:
                input.workspaceId,
              shoppingListId:
                list.id,
              requestId:
                request.id,
              listName:
                list.name,
              itemCount:
                list.items
                  .length,
              createdById:
                userId
            }
          );

          await notifyShoppingListPreparationUpdated(
            transaction,
            {
              workspaceId:
                input.workspaceId,
              userId,
              requestId:
                request.id,
              listId:
                list.id,
              listName:
                list.name,
              status:
                'SUBMITTED',
              message:
                'Your Shopping List was submitted for preparation.'
            }
          );

          await transaction.adminAuditEvent.create({
            data: {
              workspaceId:
                input.workspaceId,
              actorId:
                userId,
              action:
                'SHOPPING_LIST_PREPARATION_SUBMITTED',
              targetType:
                'SHOPPING_LIST',
              targetId:
                list.id,
              summary:
                `${list.name} was submitted for preparation.`,
              metadata: {
                requestId:
                  request.id,
                eventId:
                  event.id,
                itemCount:
                  list.items
                    .length,
                originalEstimatedTotal
              }
            }
          });

          return request;
        }
      );

    return mapPreparation(
      created
    );
  },

  async transition(
    actorId: string,
    input: {
      workspaceId: string;
      requestId: string;
      nextStatus: ShoppingListPreparationStatus;
      note?: string | null;
    }
  ) {
    const current =
      await prisma.shoppingListPreparationRequest.findFirst({
        where: {
          id:
            input.requestId,
          workspaceId:
            input.workspaceId
        },
        include: {
          shoppingList: {
            select: {
              id: true,
              name: true
            }
          },
          items: {
            select: {
              id: true,
              status: true,
              customerDecision:
                true,
              preparedQuantity:
                true
            }
          }
        }
      });

    if (!current) {
      throw new PreparationRuntimeError(
        'The preparation request was not found.',
        404
      );
    }

    requirePreparationTransition(
      current.status,
      input.nextStatus
    );

    if (
      input.nextStatus ===
      'AWAITING_CUSTOMER_APPROVAL'
    ) {
      const unresolved =
        current.items.filter(
          item =>
            item.status ===
            'PENDING'
        );

      if (unresolved.length) {
        throw new PreparationRuntimeError(
          'Resolve every pending item before requesting customer approval.',
          409
        );
      }

      const purchasable =
        current.items.some(
          item =>
            item.status !==
              'UNAVAILABLE' &&
            item.status !==
              'REMOVED' &&
            item.preparedQuantity >
              0
        );

      if (!purchasable) {
        throw new PreparationRuntimeError(
          'At least one prepared item is required before requesting approval.',
          409
        );
      }
    }

    if (
      input.nextStatus ===
      'READY_FOR_CHECKOUT'
    ) {
      const pendingDecisions =
        current.items.filter(
          item =>
            item.customerDecision ===
            'PENDING'
        );

      if (
        pendingDecisions.length ||
        (
          current.customerDecision !==
            'APPROVED' &&
          current.status ===
            'AWAITING_CUSTOMER_APPROVAL'
        )
      ) {
        throw new PreparationRuntimeError(
          'The customer must approve every changed item and the final quote first.',
          409
        );
      }
    }

    await prisma.$transaction(
      async transaction => {
          const now =
            new Date();

          await transaction.shoppingListPreparationRequest.update({
            where: {
              id:
                current.id
            },
            data: {
              status:
                input.nextStatus,
              ...(input.nextStatus ===
              'IN_PREPARATION'
                ? {
                    startedAt:
                      current.startedAt ??
                      now,
                    assignedStaffId:
                      current.assignedStaffId ??
                      actorId,
                    customerDecision:
                      'PENDING',
                    approvedTotal:
                      null
                  }
                : {}),
              ...(input.nextStatus ===
              'AWAITING_CUSTOMER_APPROVAL'
                ? {
                    approvalRequestedAt:
                      now,
                    customerDecision:
                      'PENDING',
                    customerDecisionNote:
                      null,
                    customerRespondedAt:
                      null,
                    approvedTotal:
                      null
                  }
                : {}),
              ...(input.nextStatus ===
              'READY_FOR_CHECKOUT'
                ? {
                    readyAt:
                      now
                  }
                : {}),
              ...(input.nextStatus ===
              'COMPLETED'
                ? {
                    completedAt:
                      now
                  }
                : {}),
              ...(input.nextStatus ===
              'CANCELLED'
                ? {
                    cancelledAt:
                      now
                  }
                : {})
            }
          });

          const event =
            await createPreparationEvent(
              transaction,
              {
                requestId:
                  current.id,
                actorId,
                type:
                  'STATUS_CHANGED',
                fromStatus:
                  current.status,
                toStatus:
                  input.nextStatus,
                note:
                  input.note
              }
            );

          if (
            input.nextStatus ===
              'READY_FOR_CHECKOUT' ||
            input.nextStatus ===
              'CANCELLED' ||
            input.nextStatus ===
              'COMPLETED'
          ) {
            await completePreparationTodo(
              transaction,
              {
                workspaceId:
                  input.workspaceId,
                shoppingListId:
                  current
                    .shoppingList
                    .id
              }
            );
          } else {
            await upsertPreparationTodo(
              transaction,
              {
                workspaceId:
                  input.workspaceId,
                shoppingListId:
                  current
                    .shoppingList
                    .id,
                requestId:
                  current.id,
                listName:
                  current
                    .shoppingList
                    .name,
                itemCount:
                  current.items
                    .length,
                createdById:
                  actorId,
                urgent:
                  input.nextStatus ===
                  'AWAITING_CUSTOMER_APPROVAL',
                description:
                  input.nextStatus ===
                  'AWAITING_CUSTOMER_APPROVAL'
                    ? 'The prepared quote is waiting for the customer response.'
                    : 'Preparation is active and requires staff attention.'
              }
            );
          }

          await notifyShoppingListPreparationUpdated(
            transaction,
            {
              workspaceId:
                input.workspaceId,
              userId:
                current.userId,
              requestId:
                current.id,
              listId:
                current
                  .shoppingList
                  .id,
              listName:
                current
                  .shoppingList
                  .name,
              status:
                input.nextStatus,
              message:
                input.note?.trim() ||
                `Your preparation request is now ${input.nextStatus
                  .replaceAll(
                    '_',
                    ' '
                  )
                  .toLowerCase()}.`,
              urgent:
                input.nextStatus ===
                'AWAITING_CUSTOMER_APPROVAL'
            }
          );

          await transaction.adminAuditEvent.create({
            data: {
              workspaceId:
                input.workspaceId,
              actorId,
              action:
                'SHOPPING_LIST_PREPARATION_STATUS_CHANGED',
              targetType:
                'SHOPPING_LIST',
              targetId:
                current
                  .shoppingList
                  .id,
              summary:
                `${current.shoppingList.name} moved from ${current.status.replaceAll('_', ' ')} to ${input.nextStatus.replaceAll('_', ' ')}.`,
              metadata: {
                requestId:
                  current.id,
                eventId:
                  event.id,
                previousStatus:
                  current.status,
                nextStatus:
                  input.nextStatus
              }
            }
          });
        }
      );

    return mapPreparation(
      await loadRequest(
        current.id
      )
    );
  },

  async resolveItem(
    actorId: string,
    input: {
      workspaceId: string;
      requestId: string;
      itemId: string;
      status: ShoppingListPreparationItemStatus;
      resolvedVariantId?: string | null;
      preparedQuantity?: number;
      quotedUnitPrice?: number;
      substitutionReason?: string | null;
      staffNote?: string | null;
    }
  ) {
    const item =
      await prisma.shoppingListPreparationItem.findFirst({
        where: {
          id:
            input.itemId,
          requestId:
            input.requestId,
          request: {
            workspaceId:
              input.workspaceId,
            status: {
              in:
                EDITABLE_STATUSES
            }
          }
        },
        include: {
          request: {
            select: {
              id: true,
              status: true,
              userId: true,
              shoppingListId:
                true,
              shoppingList: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      });

    if (!item) {
      throw new PreparationRuntimeError(
        'The preparation item was not found or is no longer editable.',
        404
      );
    }

    let replacement:
      | {
          id: string;
          label: string;
          price: Prisma.Decimal;
          image: string | null;
          productId: string;
          product: {
            name: string;
            vendorProfileId:
              string | null;
          };
        }
      | null =
      null;

    const resolvedVariantId =
      input.resolvedVariantId ===
      undefined
        ? item.resolvedVariantId
        : input.resolvedVariantId;

    if (resolvedVariantId) {
      replacement =
        await prisma.productVariant.findFirst({
          where: {
            id:
              resolvedVariantId,
            active:
              true,
            product: {
              workspaceId:
                input.workspaceId,
              active:
                true,
              status:
                'PUBLISHED'
            }
          },
          select: {
            id: true,
            label: true,
            price: true,
            image: true,
            productId: true,
            product: {
              select: {
                name: true,
                vendorProfileId:
                  true
              }
            }
          }
        });

      if (!replacement) {
        throw new PreparationRuntimeError(
          'The selected product variant is unavailable.',
          409
        );
      }
    }

    if (
      input.status ===
        'SUBSTITUTED' &&
      (
        !resolvedVariantId ||
        resolvedVariantId ===
          item.originalVariantId
      )
    ) {
      throw new PreparationRuntimeError(
        'Select a different replacement variant before marking this item as substituted.',
        409
      );
    }

    const unavailable =
      input.status ===
        'UNAVAILABLE' ||
      input.status ===
        'REMOVED';

    const preparedQuantity =
      unavailable
        ? 0
        : Math.max(
            1,
            Math.floor(
              input.preparedQuantity ??
                item.preparedQuantity
            )
          );

    const defaultPrice =
      replacement
        ? decimalNumber(
            replacement.price
          )
        : decimalNumber(
            item.quotedUnitPrice
          );

    const quotedUnitPrice =
      unavailable
        ? 0
        : Math.max(
            0,
            input.quotedUnitPrice ??
              defaultPrice
          );

    const approvalRequired =
      !unavailable &&
      requiresCustomerApproval({
        status:
          input.status,
        originalVariantId:
          item.originalVariantId,
        resolvedVariantId,
        requestedQuantity:
          item.requestedQuantity,
        preparedQuantity,
        originalUnitPrice:
          decimalNumber(
            item.originalUnitPrice
          ),
        quotedUnitPrice
      });

    const customerDecision:
      ShoppingListPreparationItemDecision =
      unavailable
        ? 'NOT_REQUIRED'
        : approvalRequired
          ? 'PENDING'
          : 'NOT_REQUIRED';

    await prisma.$transaction(
      async transaction => {
          if (
            item.request.status ===
            'AWAITING_CUSTOMER_APPROVAL'
          ) {
            await transaction.shoppingListPreparationRequest.update({
              where: {
                id:
                  item.requestId
              },
              data: {
                status:
                  'IN_PREPARATION',
                customerDecision:
                  'PENDING',
                customerDecisionNote:
                  null,
                customerRespondedAt:
                  null,
                approvedTotal:
                  null
              }
            });

            await createPreparationEvent(
              transaction,
              {
                requestId:
                  item.requestId,
                actorId,
                type:
                  'QUOTE_REOPENED',
                fromStatus:
                  'AWAITING_CUSTOMER_APPROVAL',
                toStatus:
                  'IN_PREPARATION',
                note:
                  'The quote changed after customer approval was requested.'
              }
            );
          }

          const updatedItem =
            await transaction.shoppingListPreparationItem.update({
              where: {
                id:
                  item.id
              },
              data: {
                status:
                  input.status,
                resolvedVariantId:
                  unavailable
                    ? null
                    : resolvedVariantId,
                resolvedVariantLabel:
                  unavailable
                    ? null
                    : replacement
                        ?.label ??
                      item.resolvedVariantLabel,
                vendorProfileId:
                  replacement
                    ?.product
                    .vendorProfileId ??
                  item.vendorProfileId,
                image:
                  replacement
                    ?.image ??
                  item.image,
                preparedQuantity,
                quotedUnitPrice,
                substitutionReason:
                  input.substitutionReason?.trim() ||
                  null,
                staffNote:
                  input.staffNote?.trim() ||
                  null,
                customerDecision,
                customerRespondedAt:
                  null,
                resolvedAt:
                  new Date(),
                resolvedById:
                  actorId
              }
            });

          const totals =
            await calculateQuote(
              transaction,
              item.requestId
            );

          const event =
            await createPreparationEvent(
              transaction,
              {
                requestId:
                  item.requestId,
                actorId,
                type:
                  'ITEM_RESOLVED',
                note:
                  input.staffNote,
                metadata: {
                  itemId:
                    item.id,
                  previousStatus:
                    item.status,
                  nextStatus:
                    input.status,
                  previousVariantId:
                    item.resolvedVariantId,
                  nextVariantId:
                    unavailable
                      ? null
                      : resolvedVariantId,
                  preparedQuantity,
                  quotedUnitPrice,
                  customerDecision,
                  quotedSubtotal:
                    totals.quotedSubtotal
                }
              }
            );

          await upsertPreparationTodo(
            transaction,
            {
              workspaceId:
                input.workspaceId,
              shoppingListId:
                item.request
                  .shoppingListId,
              requestId:
                item.requestId,
              listName:
                item.request
                  .shoppingList
                  .name,
              itemCount:
                1,
              createdById:
                actorId,
              description:
                'Preparation item changes are waiting for completion or customer approval.'
            }
          );

          await transaction.adminAuditEvent.create({
            data: {
              workspaceId:
                input.workspaceId,
              actorId,
              action:
                'SHOPPING_LIST_PREPARATION_ITEM_RESOLVED',
              targetType:
                'SHOPPING_LIST',
              targetId:
                item.request
                  .shoppingListId,
              summary:
                `${item.productName} was resolved as ${input.status.replaceAll('_', ' ')}.`,
              metadata: {
                requestId:
                  item.requestId,
                preparationItemId:
                  item.id,
                eventId:
                  event.id,
                quotedUnitPrice,
                preparedQuantity,
                customerDecision
              }
            }
          });

          return updatedItem;
        }
      );

    return mapPreparation(
      await loadRequest(
        item.requestId
      )
    );
  },

  async decideItem(
    userId: string,
    input: {
      requestId: string;
      itemId: string;
      decision:
        Extract<
          ShoppingListPreparationItemDecision,
          'APPROVED' | 'REJECTED'
        >;
      customerNote?: string | null;
    }
  ) {
    const item =
      await prisma.shoppingListPreparationItem.findFirst({
        where: {
          id:
            input.itemId,
          requestId:
            input.requestId,
          request: {
            userId,
            status:
              'AWAITING_CUSTOMER_APPROVAL'
          }
        },
        include: {
          request: {
            select: {
              id: true,
              workspaceId:
                true,
              shoppingListId:
                true
            }
          }
        }
      });

    if (!item) {
      throw new PreparationRuntimeError(
        'This item is not awaiting your decision.',
        404
      );
    }

    if (
      item.customerDecision !==
      'PENDING'
    ) {
      throw new PreparationRuntimeError(
        'This item decision has already been recorded.',
        409
      );
    }

    await prisma.$transaction(
      async transaction => {
        await transaction.shoppingListPreparationItem.update({
          where: {
            id:
              item.id
          },
          data: {
            customerDecision:
              input.decision,
            customerNote:
              input.customerNote?.trim() ||
              null,
            customerRespondedAt:
              new Date()
          }
        });

        const totals =
          await calculateQuote(
            transaction,
            item.requestId
          );

        await createPreparationEvent(
          transaction,
          {
            requestId:
              item.requestId,
            actorId:
              userId,
            type:
              'CUSTOMER_ITEM_DECISION',
            note:
              input.customerNote,
            metadata: {
              itemId:
                item.id,
              decision:
                input.decision,
              quotedSubtotal:
                totals.quotedSubtotal
            }
          }
        );
      }
    );

    return mapPreparation(
      await loadRequest(
        item.requestId
      )
    );
  },

  async decideRequest(
    userId: string,
    input: {
      requestId: string;
      decision:
        Extract<
          ShoppingListPreparationCustomerDecision,
          | 'APPROVED'
          | 'CHANGES_REQUESTED'
          | 'CANCELLED'
        >;
      note?: string | null;
    }
  ) {
    const request =
      await prisma.shoppingListPreparationRequest.findFirst({
        where: {
          id:
            input.requestId,
          userId,
          status:
            'AWAITING_CUSTOMER_APPROVAL'
        },
        include: {
          shoppingList: {
            select: {
              id: true,
              name: true
            }
          },
          items: true
        }
      });

    if (!request) {
      throw new PreparationRuntimeError(
        'This preparation request is not awaiting your decision.',
        404
      );
    }

    if (
      input.decision ===
      'APPROVED'
    ) {
      const pending =
        request.items.filter(
          item =>
            item.customerDecision ===
            'PENDING'
        );

      if (pending.length) {
        throw new PreparationRuntimeError(
          'Approve or reject every changed item before accepting the final quote.',
          409
        );
      }

      const included =
        request.items.filter(
          item =>
            item.status !==
              'UNAVAILABLE' &&
            item.status !==
              'REMOVED' &&
            item.customerDecision !==
              'REJECTED' &&
            item.preparedQuantity >
              0 &&
            item.resolvedVariantId
        );

      if (!included.length) {
        throw new PreparationRuntimeError(
          'No approved item remains for checkout.',
          409
        );
      }
    }

    const nextStatus:
      ShoppingListPreparationStatus =
      input.decision ===
      'APPROVED'
        ? 'READY_FOR_CHECKOUT'
        : input.decision ===
            'CHANGES_REQUESTED'
          ? 'IN_PREPARATION'
          : 'CANCELLED';

    requirePreparationTransition(
      request.status,
      nextStatus
    );

    await prisma.$transaction(
      async transaction => {
        const now =
          new Date();

        const approvedTotal =
          input.decision ===
          'APPROVED'
            ? decimalNumber(
                request.quotedSubtotal
              )
            : null;

        await transaction.shoppingListPreparationRequest.update({
          where: {
            id:
              request.id
          },
          data: {
            customerDecision:
              input.decision,
            customerDecisionNote:
              input.note?.trim() ||
              null,
            customerRespondedAt:
              now,
            status:
              nextStatus,
            approvedTotal,
            ...(nextStatus ===
            'READY_FOR_CHECKOUT'
              ? {
                  readyAt:
                    now
                }
              : {}),
            ...(nextStatus ===
            'CANCELLED'
              ? {
                  cancelledAt:
                    now
                }
              : {})
          }
        });

        const event =
          await createPreparationEvent(
            transaction,
            {
              requestId:
                request.id,
              actorId:
                userId,
              type:
                'CUSTOMER_REQUEST_DECISION',
              fromStatus:
                request.status,
              toStatus:
                nextStatus,
              note:
                input.note,
              metadata: {
                decision:
                  input.decision,
                approvedTotal
              }
            }
          );

        if (
          nextStatus ===
            'READY_FOR_CHECKOUT' ||
          nextStatus ===
            'CANCELLED'
        ) {
          await completePreparationTodo(
            transaction,
            {
              workspaceId:
                request.workspaceId,
              shoppingListId:
                request
                  .shoppingListId
            }
          );
        } else {
          await upsertPreparationTodo(
            transaction,
            {
              workspaceId:
                request.workspaceId,
              shoppingListId:
                request
                  .shoppingListId,
              requestId:
                request.id,
              listName:
                request
                  .shoppingList
                  .name,
              itemCount:
                request.items
                  .length,
              createdById:
                userId,
              urgent:
                true,
              description:
                'The customer requested changes to the prepared quote.'
            }
          );
        }

        await notifyShoppingListPreparationUpdated(
          transaction,
          {
            workspaceId:
              request.workspaceId,
            userId,
            requestId:
              request.id,
            listId:
              request
                .shoppingListId,
            listName:
              request
                .shoppingList
                .name,
            status:
              nextStatus,
            message:
              input.decision ===
              'APPROVED'
                ? 'Your prepared quote is approved and ready for secure checkout.'
                : input.decision ===
                    'CHANGES_REQUESTED'
                  ? 'Your requested changes were sent back to the preparation team.'
                  : 'Your preparation request was cancelled.'
          }
        );

        await transaction.adminAuditEvent.create({
          data: {
            workspaceId:
              request.workspaceId,
            actorId:
              userId,
            action:
              'SHOPPING_LIST_PREPARATION_CUSTOMER_DECISION',
            targetType:
              'SHOPPING_LIST',
            targetId:
              request
                .shoppingListId,
            summary:
              `${request.shoppingList.name}: customer decision ${input.decision.replaceAll('_', ' ')}.`,
            metadata: {
              requestId:
                request.id,
              eventId:
                event.id,
              decision:
                input.decision,
              approvedTotal
            }
          }
        });
      }
    );

    return mapPreparation(
      await loadRequest(
        request.id
      )
    );
  },

  async searchVariants(
    workspaceId: string,
    query: string
  ): Promise<
    PreparationVariantReference[]
  > {
    const normalized =
      query.trim();

    if (
      normalized.length <
      2
    ) {
      return [];
    }

    const variants =
      await prisma.productVariant.findMany({
        where: {
          active:
            true,
          OR: [
            {
              label: {
                contains:
                  normalized,
                mode:
                  'insensitive'
              }
            },
            {
              product: {
                name: {
                  contains:
                    normalized,
                  mode:
                    'insensitive'
                }
              }
            }
          ],
          product: {
            workspaceId,
            active:
              true,
            status:
              'PUBLISHED'
          }
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              vendorProfileId:
                true
            }
          },
          inventory: {
            select: {
              quantity:
                true,
              reserved:
                true
            }
          }
        },
        orderBy: [
          {
            product: {
              name:
                'asc'
            }
          },
          {
            label:
              'asc'
          }
        ],
        take: 20
      });

    return variants.map(
      variant => ({
        id:
          variant.id,
        productId:
          variant.productId,
        productName:
          variant.product
            .name,
        label:
          variant.label,
        price:
          decimalNumber(
            variant.price
          ),
        image:
          variant.image,
        vendorProfileId:
          variant.product
            .vendorProfileId,
        availableQuantity:
          variant.inventory
            ? Math.max(
                variant.inventory
                  .quantity -
                  variant.inventory
                    .reserved,
                0
              )
            : null
      })
    );
  }
};
