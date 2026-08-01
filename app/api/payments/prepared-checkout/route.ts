import {
  randomUUID
} from 'node:crypto';

import {
  NextResponse
} from 'next/server';

import type {
  Prisma
} from '@/lib/generated/prisma/client';

import {
  notifyShoppingListPreparationUpdated
} from '@/features/notifications/server/notificationEngine';

import {
  initializePaystackTransaction,
  PaystackConfigurationError,
  readPaystackTestSecret
} from '@/features/payments/server/paystack';

import {
  auth
} from '@/lib/auth';

import {
  prisma
} from '@/lib/prisma';

const DELIVERY_FEES = {
  AJ_DELIVERY:
    2_500,
  PERSONAL_COURIER:
    0,
  STORE_PICKUP:
    0
} as const;

type DeliveryMethod =
  keyof typeof DELIVERY_FEES;

type PreparedCheckoutPayload = {
  requestId?: unknown;
  deliveryMethod?: unknown;
  recipientName?: unknown;
  phone?: unknown;
  addressLine1?: unknown;
  addressLine2?: unknown;
  city?: unknown;
  state?: unknown;
  notes?: unknown;
  saveAddress?: unknown;
};

class PreparedCheckoutError extends Error {
  constructor(
    message: string,
    readonly status = 400
  ) {
    super(message);
  }
}

function text(
  value: unknown,
  maximumLength: number
) {
  return typeof value ===
    'string'
    ? value
        .trim()
        .slice(
          0,
          maximumLength
        )
    : '';
}

function reference(
  prefix: string
) {
  return `${prefix}-${Date.now()}-${randomUUID()
    .replaceAll(
      '-',
      ''
    )
    .slice(
      0,
      10
    )}`;
}

function parsePayload(
  payload: PreparedCheckoutPayload
) {
  const requestId =
    text(
      payload.requestId,
      120
    );

  const deliveryMethod =
    text(
      payload.deliveryMethod,
      30
    ) as DeliveryMethod;

  const recipientName =
    text(
      payload.recipientName,
      120
    );

  const phone =
    text(
      payload.phone,
      40
    );

  const addressLine1 =
    text(
      payload.addressLine1,
      240
    );

  const addressLine2 =
    text(
      payload.addressLine2,
      240
    );

  const city =
    text(
      payload.city,
      100
    );

  const state =
    text(
      payload.state,
      100
    );

  const notes =
    text(
      payload.notes,
      500
    );

  if (!requestId) {
    throw new PreparedCheckoutError(
      'A preparation request is required.'
    );
  }

  if (
    !(
      deliveryMethod in
      DELIVERY_FEES
    )
  ) {
    throw new PreparedCheckoutError(
      'Select a valid fulfilment method.'
    );
  }

  if (
    !recipientName ||
    !phone
  ) {
    throw new PreparedCheckoutError(
      'Recipient name and phone number are required.'
    );
  }

  if (
    deliveryMethod !==
      'STORE_PICKUP' &&
    (
      !addressLine1 ||
      !city ||
      !state
    )
  ) {
    throw new PreparedCheckoutError(
      'Delivery address, city and state are required.'
    );
  }

  return {
    requestId,
    deliveryMethod,
    recipientName,
    phone,
    addressLine1,
    addressLine2,
    city,
    state,
    notes,
    saveAddress:
      payload.saveAddress ===
      true
  };
}

export async function POST(
  request: Request
) {
  let createdOrderId:
    string | null =
    null;

  let pendingPaymentReference:
    string | null =
    null;

  let preparationRequestId:
    string | null =
    null;

  let cleanupContext:
    | {
        workspaceId: string;
        userId: string;
        shoppingListId: string;
        shoppingListName: string;
        requestId: string;
      }
    | null =
    null;

  try {
    const session =
      await auth.api.getSession({
        headers:
          request.headers
      });

    if (
      !session?.user?.id
    ) {
      throw new PreparedCheckoutError(
        'Sign in before starting checkout.',
        401
      );
    }

    const input =
      parsePayload(
        (await request.json()) as PreparedCheckoutPayload
      );

    preparationRequestId =
      input.requestId;

    const preparation =
      await prisma.shoppingListPreparationRequest.findFirst({
        where: {
          id:
            input.requestId,
          userId:
            session.user.id,
          status:
            'READY_FOR_CHECKOUT',
          customerDecision:
            'APPROVED',
          orderId:
            null
        },
        include: {
          workspace:
            true,
          shoppingList: {
            select: {
              id: true,
              name: true
            }
          },
          items: {
            include: {
              resolvedVariant: {
                include: {
                  product: {
                    include: {
                      images: {
                        orderBy: {
                          position:
                            'asc'
                        },
                        take: 1
                      }
                    }
                  },
                  inventory:
                    true
                }
              }
            },
            orderBy: {
              position:
                'asc'
            }
          }
        }
      });

    if (!preparation) {
      throw new PreparedCheckoutError(
        'This prepared quote is unavailable, already converted, or no longer approved.',
        409
      );
    }

    cleanupContext = {
      workspaceId:
        preparation.workspaceId,
      userId:
        session.user.id,
      shoppingListId:
        preparation.shoppingListId,
      shoppingListName:
        preparation.shoppingList.name,
      requestId:
        preparation.id
    };

    const membership =
      await prisma.workspaceMembership.findFirst({
        where: {
          workspaceId:
            preparation.workspaceId,
          userId:
            session.user.id,
          active:
            true,
          workspace: {
            active:
              true
          }
        },
        select: {
          id: true
        }
      });

    if (!membership) {
      throw new PreparedCheckoutError(
        'You no longer have access to this workspace.',
        403
      );
    }

    const includedItems =
      preparation.items.filter(
        item =>
          item.status !==
            'UNAVAILABLE' &&
          item.status !==
            'REMOVED' &&
          item.customerDecision !==
            'REJECTED' &&
          item.preparedQuantity >
            0 &&
          item.resolvedVariant
      );

    if (!includedItems.length) {
      throw new PreparedCheckoutError(
        'No approved prepared item remains for checkout.',
        409
      );
    }

    for (
      const item of
      includedItems
    ) {
      const variant =
        item.resolvedVariant;

      if (
        !variant ||
        !variant.active ||
        !variant.product
          .active ||
        variant.product
          .status !==
          'PUBLISHED'
      ) {
        throw new PreparedCheckoutError(
          `${item.productName} is no longer available.`,
          409
        );
      }

      if (
        variant.inventory
      ) {
        const available =
          Math.max(
            variant.inventory
              .quantity -
              variant.inventory
                .reserved,
            0
          );

        if (
          item.preparedQuantity >
          available
        ) {
          throw new PreparedCheckoutError(
            `Only ${available} unit(s) of ${variant.product.name} remain available.`,
            409
          );
        }
      }
    }

    const approvedSubtotal =
      includedItems.reduce(
        (
          total,
          item
        ) =>
          total +
          Number(
            item.quotedUnitPrice
          ) *
            item.preparedQuantity,
        0
      );

    const recordedApprovedTotal =
      preparation.approvedTotal ===
      null
        ? null
        : Number(
            preparation.approvedTotal
          );

    if (
      recordedApprovedTotal ===
        null ||
      Math.abs(
        recordedApprovedTotal -
          approvedSubtotal
      ) >
        0.01
    ) {
      throw new PreparedCheckoutError(
        'The approved quote changed and must be reviewed again.',
        409
      );
    }

    if (
      preparation.workspace
        .mode ===
      'LIVE'
    ) {
      readPaystackTestSecret();
    }

    const deliveryFee =
      DELIVERY_FEES[
        input.deliveryMethod
      ];

    const total =
      approvedSubtotal +
      deliveryFee;

    const paymentReference =
      reference(
        'AJP'
      );

    const orderNumber =
      reference(
        'AJ'
      );

    const trackingCode =
      reference(
        'AJD'
      );

    pendingPaymentReference =
      paymentReference;

    const dataSource =
      preparation.workspace
        .mode ===
      'LIVE'
        ? 'REAL'
        : 'SYNTHETIC';

    const address:
      Prisma.InputJsonValue =
      input.deliveryMethod ===
      'STORE_PICKUP'
        ? {
            recipientName:
              input.recipientName,
            phone:
              input.phone,
            fulfilment:
              'STORE_PICKUP'
          }
        : {
            recipientName:
              input.recipientName,
            phone:
              input.phone,
            addressLine1:
              input.addressLine1,
            addressLine2:
              input.addressLine2 ||
              null,
            city:
              input.city,
            state:
              input.state,
            country:
              'Nigeria'
          };

    const result =
      await prisma.$transaction(
        async transaction => {
          const order =
            await transaction.order.create({
              data: {
                orderNumber,
                userId:
                  session.user.id,
                workspaceId:
                  preparation.workspaceId,
                mode:
                  preparation
                    .workspace
                    .mode,
                dataSource,
                subtotal:
                  approvedSubtotal,
                deliveryFee,
                total,
                deliveryAddress:
                  address,
                notes:
                  input.notes ||
                  null,
                items: {
                  create:
                    includedItems.map(
                      item => {
                        const variant =
                          item.resolvedVariant!;

                        return {
                          productId:
                            variant.productId,
                          variantId:
                            variant.id,
                          productName:
                            variant.product
                              .name,
                          variantLabel:
                            variant.label,
                          image:
                            variant.image ??
                            variant.product
                              .images[0]
                              ?.url ??
                            null,
                          quantity:
                            item.preparedQuantity,
                          unitPrice:
                            Number(
                              item.quotedUnitPrice
                            ),
                          totalPrice:
                            Number(
                              item.quotedUnitPrice
                            ) *
                            item.preparedQuantity
                        };
                      }
                    )
                }
              }
            });

          createdOrderId =
            order.id;

          await transaction.delivery.create({
            data: {
              workspaceId:
                preparation.workspaceId,
              orderId:
                order.id,
              method:
                input.deliveryMethod,
              trackingCode,
              dispatcherName:
                input.deliveryMethod ===
                'PERSONAL_COURIER'
                  ? 'Customer-appointed courier'
                  : null
            }
          });

          if (
            input.saveAddress &&
            input.deliveryMethod !==
              'STORE_PICKUP'
          ) {
            await transaction.address.create({
              data: {
                userId:
                  session.user.id,
                label:
                  'Prepared order address',
                recipientName:
                  input.recipientName,
                phone:
                  input.phone,
                addressLine1:
                  input.addressLine1,
                addressLine2:
                  input.addressLine2 ||
                  null,
                city:
                  input.city,
                state:
                  input.state,
                country:
                  'Nigeria'
              }
            });
          }

          await transaction.shoppingListPreparationRequest.update({
            where: {
              id:
                preparation.id
            },
            data: {
              status:
                'ORDER_CREATED',
              orderId:
                order.id,
              convertedAt:
                new Date()
            }
          });

          await transaction.shoppingListPreparationEvent.create({
            data: {
              requestId:
                preparation.id,
              actorId:
                session.user.id,
              type:
                'ORDER_CREATED',
              fromStatus:
                'READY_FOR_CHECKOUT',
              toStatus:
                'ORDER_CREATED',
              note:
                `Prepared quote converted to ${orderNumber}.`,
              metadata: {
                orderId:
                  order.id,
                orderNumber,
                approvedSubtotal,
                deliveryFee,
                total,
                deliveryMethod:
                  input.deliveryMethod
              }
            }
          });

          await transaction.experienceEvent.create({
            data: {
              workspaceId:
                preparation.workspaceId,
              userId:
                session.user.id,
              type:
                'CHECKOUT_STARTED',
              source:
                'shopping-list-preparation',
              dataSource,
              metadata: {
                preparationRequestId:
                  preparation.id,
                shoppingListId:
                  preparation
                    .shoppingListId,
                orderId:
                  order.id,
                orderNumber,
                deliveryMethod:
                  input.deliveryMethod,
                quoteVersion:
                  preparation
                    .quoteVersion
              }
            }
          });

          await notifyShoppingListPreparationUpdated(
            transaction,
            {
              workspaceId:
                preparation.workspaceId,
              userId:
                session.user.id,
              requestId:
                preparation.id,
              listId:
                preparation
                  .shoppingListId,
              listName:
                preparation
                  .shoppingList
                  .name,
              status:
                'ORDER_CREATED',
              message:
                `${orderNumber} was created from your approved prepared quote.`
            }
          );

          await transaction.adminAuditEvent.create({
            data: {
              workspaceId:
                preparation.workspaceId,
              actorId:
                session.user.id,
              action:
                'SHOPPING_LIST_PREPARATION_ORDER_CREATED',
              targetType:
                'ORDER',
              targetId:
                order.id,
              summary:
                `${orderNumber} was created from ${preparation.shoppingList.name}.`,
              metadata: {
                preparationRequestId:
                  preparation.id,
                shoppingListId:
                  preparation
                    .shoppingListId,
                approvedSubtotal,
                deliveryFee,
                total,
                quoteVersion:
                  preparation
                    .quoteVersion
              }
            }
          });

          if (
            preparation.workspace
              .mode !==
            'LIVE'
          ) {
            const walletUpdate =
              await transaction.demoWallet.updateMany({
                where: {
                  workspaceId:
                    preparation.workspaceId,
                  userId:
                    session.user.id,
                  active:
                    true,
                  balance: {
                    gte:
                      total
                  }
                },
                data: {
                  balance: {
                    decrement:
                      total
                  }
                }
              });

            if (
              walletUpdate.count !==
              1
            ) {
              throw new PreparedCheckoutError(
                'Your paper wallet balance is too low.',
                409
              );
            }

            await transaction.payment.create({
              data: {
                orderId:
                  order.id,
                provider:
                  'paper-wallet',
                reference:
                  paymentReference,
                amount:
                  total,
                status:
                  'PAID',
                paidAt:
                  new Date(),
                metadata: {
                  workspaceMode:
                    preparation
                      .workspace
                      .mode,
                  preparationRequestId:
                    preparation.id,
                  quoteVersion:
                    preparation
                      .quoteVersion,
                  testPayment:
                    true
                }
              }
            });

            await transaction.order.update({
              where: {
                id:
                  order.id
              },
              data: {
                status:
                  'CONFIRMED',
                paymentStatus:
                  'PAID'
              }
            });

            await transaction.experienceEvent.create({
              data: {
                workspaceId:
                  preparation.workspaceId,
                userId:
                  session.user.id,
                type:
                  'PAYMENT_COMPLETED',
                source:
                  'paper-wallet',
                dataSource,
                metadata: {
                  orderId:
                    order.id,
                  reference:
                    paymentReference,
                  preparationRequestId:
                    preparation.id
                }
              }
            });

            return {
              order,
              paper:
                true
            };
          }

          await transaction.payment.create({
            data: {
              orderId:
                order.id,
              provider:
                'paystack-test',
              reference:
                paymentReference,
              amount:
                total,
              status:
                'PROCESSING',
              metadata: {
                testPayment:
                  true,
                preparationRequestId:
                  preparation.id,
                quoteVersion:
                  preparation
                    .quoteVersion,
                deliveryMethod:
                  input.deliveryMethod
              }
            }
          });

          await transaction.experienceEvent.create({
            data: {
              workspaceId:
                preparation.workspaceId,
              userId:
                session.user.id,
              type:
                'PAYMENT_STARTED',
              source:
                'paystack-test',
              metadata: {
                orderId:
                  order.id,
                reference:
                  paymentReference,
                preparationRequestId:
                  preparation.id
              }
            }
          });

          return {
            order,
            paper:
              false
          };
        }
      );

    if (result.paper) {
      return NextResponse.json({
        reference:
          paymentReference,
        orderNumber,
        orderId:
          result.order.id,
        status:
          'PAID',
        paper:
          true
      });
    }

    const callbackUrl =
      process.env
        .PAYSTACK_CALLBACK_URL
        ?.trim() ||
      new URL(
        '/payments',
        request.url
      ).toString();

    const initialized =
      await initializePaystackTransaction({
        email:
          session.user.email,
        amountKobo:
          Math.round(
            total *
              100
          ),
        reference:
          paymentReference,
        callbackUrl,
        metadata: {
          orderId:
            result.order.id,
          orderNumber,
          workspaceId:
            preparation.workspaceId,
          preparationRequestId:
            preparation.id,
          quoteVersion:
            preparation
              .quoteVersion,
          testMode:
            true
        }
      });

    await prisma.payment.update({
      where: {
        reference:
          paymentReference
      },
      data: {
        metadata: {
          testPayment:
            true,
          accessCode:
            initialized.access_code,
          preparationRequestId:
            preparation.id,
          quoteVersion:
            preparation
              .quoteVersion,
          deliveryMethod:
            input.deliveryMethod
        }
      }
    });

    return NextResponse.json({
      reference:
        initialized.reference,
      authorizationUrl:
        initialized.authorization_url,
      orderNumber,
      orderId:
        result.order.id,
      status:
        'PROCESSING',
      paper:
        false
    });
  } catch (error) {
    if (
      createdOrderId &&
      preparationRequestId
    ) {
      await prisma
        .$transaction(
          async transaction => {
            const order =
              await transaction.order.findUnique({
                where: {
                  id:
                    createdOrderId!
                },
                select: {
                  paymentStatus:
                    true
                }
              });

            if (
              !order ||
              order.paymentStatus ===
                'PAID'
            ) {
              return;
            }

            await transaction.shoppingListPreparationRequest.updateMany({
              where: {
                id:
                  preparationRequestId!,
                orderId:
                  createdOrderId!
              },
              data: {
                orderId:
                  null,
                status:
                  'READY_FOR_CHECKOUT',
                convertedAt:
                  null
              }
            });

            if (cleanupContext) {
              await transaction.shoppingListPreparationEvent.create({
                data: {
                  requestId:
                    cleanupContext.requestId,
                  actorId:
                    cleanupContext.userId,
                  type:
                    'PAYMENT_INITIALIZATION_FAILED',
                  fromStatus:
                    'ORDER_CREATED',
                  toStatus:
                    'READY_FOR_CHECKOUT',
                  note:
                    'External payment initialization failed. The unpaid Order was removed and checkout was restored.'
                }
              });

              await notifyShoppingListPreparationUpdated(
                transaction,
                {
                  workspaceId:
                    cleanupContext.workspaceId,
                  userId:
                    cleanupContext.userId,
                  requestId:
                    cleanupContext.requestId,
                  listId:
                    cleanupContext.shoppingListId,
                  listName:
                    cleanupContext.shoppingListName,
                  status:
                    'READY_FOR_CHECKOUT',
                  message:
                    'Payment could not start, so your approved quote was restored for another checkout attempt.',
                  urgent:
                    true
                }
              );
            }

            await transaction.delivery.deleteMany({
              where: {
                orderId:
                  createdOrderId!
              }
            });

            await transaction.payment.deleteMany({
              where: {
                orderId:
                  createdOrderId!
              }
            });

            await transaction.order.deleteMany({
              where: {
                id:
                  createdOrderId!,
                paymentStatus: {
                  not:
                    'PAID'
                }
              }
            });
          }
        )
        .catch(
          cleanupError => {
            console.error(
              'Prepared checkout cleanup failed.',
              cleanupError
            );
          }
        );
    } else if (
      pendingPaymentReference
    ) {
      await prisma.payment
        .updateMany({
          where: {
            reference:
              pendingPaymentReference,
            status: {
              not:
                'PAID'
            }
          },
          data: {
            status:
              'FAILED'
          }
        })
        .catch(
          () =>
            undefined
        );
    }

    const status =
      error instanceof
      PreparedCheckoutError
        ? error.status
        : error instanceof
            PaystackConfigurationError
          ? 503
          : 500;

    const message =
      error instanceof
        PreparedCheckoutError ||
      error instanceof
        PaystackConfigurationError
        ? error.message
        : 'Prepared checkout could not be completed. Please try again.';

    if (status === 500) {
      console.error(
        'Prepared checkout failed:',
        error
      );
    }

    return NextResponse.json(
      {
        error:
          message
      },
      {
        status
      }
    );
  }
}
