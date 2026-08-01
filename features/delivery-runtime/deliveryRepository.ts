import 'server-only';

import type {
  DeliveryEventSource,
  DeliveryStatus,
  Prisma
} from '@/lib/generated/prisma/client';

import {
  completeOperationalTodos,
  upsertOperationalTodo
} from '@/features/admin/todos/adminTodoRepository';

import {
  notifyDeliveryStatusChanged,
  notifyOrderStatusChanged,
  notifyShoppingListPreparationUpdated
} from '@/features/notifications/server/notificationEngine';

import { prisma } from '@/lib/prisma';

import {
  deliveryInclude,
  mapCustomerOrder,
  mapDelivery
} from './deliveryMapper';

import {
  DeliveryRuntimeError
} from './deliveryRouteResponse';

import {
  assertDeliveryTransition
} from './deliveryStateMachine';

import {
  createDeliveryToken,
  deliveryTokenExpiry,
  deliveryTokenMatches,
  hashDeliveryToken
} from './deliveryToken';

const RIDER_ACTIVE_STATUSES: DeliveryStatus[] = [
  'BARCODE_SCANNED',
  'PICKED_UP',
  'IN_TRANSIT',
  'ARRIVED'
];

const RIDER_TRANSITIONS: DeliveryStatus[] = [
  'PICKED_UP',
  'IN_TRANSIT',
  'ARRIVED',
  'DELIVERED',
  'FAILED'
];

function text(
  value: unknown
): string | null {
  return typeof value === 'string' &&
    value.trim()
    ? value.trim()
    : null;
}

function recipientName(
  deliveryAddress: unknown
): string | null {
  if (
    !deliveryAddress ||
    typeof deliveryAddress !== 'object' ||
    Array.isArray(deliveryAddress)
  ) {
    return null;
  }

  return text(
    (
      deliveryAddress as Record<
        string,
        unknown
      >
    ).recipientName
  );
}

function haversineMeters(
  latitudeA: number,
  longitudeA: number,
  latitudeB: number,
  longitudeB: number
): number {
  const radius = 6_371_000;
  const radians = (
    value: number
  ) =>
    (value * Math.PI) /
    180;

  const latitudeDelta =
    radians(
      latitudeB -
        latitudeA
    );

  const longitudeDelta =
    radians(
      longitudeB -
        longitudeA
    );

  const a =
    Math.sin(
      latitudeDelta / 2
    ) **
      2 +
    Math.cos(
      radians(latitudeA)
    ) *
      Math.cos(
        radians(latitudeB)
      ) *
      Math.sin(
        longitudeDelta / 2
      ) **
        2;

  return (
    2 *
    radius *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    )
  );
}

async function readDelivery(
  deliveryId: string
) {
  const delivery =
    await prisma.delivery.findUnique({
      where: {
        id: deliveryId
      },
      include:
        deliveryInclude
    });

  if (!delivery) {
    throw new DeliveryRuntimeError(
      'The selected delivery was not found.',
      404
    );
  }

  return delivery;
}

async function findSessionDelivery(
  sessionToken: string
) {
  const normalized =
    sessionToken.trim();

  if (!normalized) {
    throw new DeliveryRuntimeError(
      'A rider session token is required.',
      401
    );
  }

  const hashed =
    hashDeliveryToken(
      normalized
    );

  const delivery =
    await prisma.delivery.findFirst({
      where: {
        barcodeTokenHash:
          hashed,
        barcodeExpiresAt: {
          gt: new Date()
        },
        trackingEnabled:
          true,
        status: {
          in:
            RIDER_ACTIVE_STATUSES
        }
      },
      include:
        deliveryInclude
    });

  if (
    !delivery ||
    !delivery.barcodeTokenHash ||
    !deliveryTokenMatches(
      normalized,
      delivery.barcodeTokenHash
    )
  ) {
    throw new DeliveryRuntimeError(
      'The rider session is invalid or expired.',
      401
    );
  }

  return delivery;
}

async function createTrackingEvent(
  transaction:
    Prisma.TransactionClient,
  input: {
    deliveryId: string;
    actorId?: string | null;
    status: DeliveryStatus;
    source: DeliveryEventSource;
    latitude?: number | null;
    longitude?: number | null;
    accuracyMeters?: number | null;
    note?: string | null;
    metadata?: Prisma.InputJsonValue;
  }
) {
  return transaction.deliveryTrackingEvent.create({
    data: {
      deliveryId:
        input.deliveryId,
      actorId:
        input.actorId ??
        null,
      status:
        input.status,
      source:
        input.source,
      latitude:
        input.latitude ??
        null,
      longitude:
        input.longitude ??
        null,
      accuracyMeters:
        input.accuracyMeters ??
        null,
      note:
        input.note ??
        null,
      metadata:
        input.metadata
    }
  });
}


async function completePreparationForDeliveredOrder(
  transaction:
    Prisma.TransactionClient,
  input: {
    orderId: string;
    actorId?: string | null;
  }
) {
  const request =
    await transaction.shoppingListPreparationRequest.findFirst({
      where: {
        orderId:
          input.orderId,
        status:
          'ORDER_CREATED'
      },
      include: {
        shoppingList: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

  if (!request) {
    return null;
  }

  const completedAt =
    new Date();

  await transaction.shoppingListPreparationRequest.update({
    where: {
      id:
        request.id
    },
    data: {
      status:
        'COMPLETED',
      completedAt
    }
  });

  await transaction.shoppingListPreparationEvent.create({
    data: {
      requestId:
        request.id,
      actorId:
        input.actorId ??
        null,
      type:
        'DELIVERY_COMPLETED',
      fromStatus:
        'ORDER_CREATED',
      toStatus:
        'COMPLETED',
      note:
        'The connected Order was delivered successfully.',
      metadata: {
        orderId:
          input.orderId,
        completedAt:
          completedAt.toISOString()
      }
    }
  });

  await notifyShoppingListPreparationUpdated(
    transaction,
    {
      workspaceId:
        request.workspaceId,
      userId:
        request.userId,
      requestId:
        request.id,
      listId:
        request.shoppingList.id,
      listName:
        request.shoppingList.name,
      status:
        'COMPLETED',
      message:
        'Your prepared Shopping List has completed its delivery journey.'
    }
  );

  return request.id;
}

async function synchronizeOrderStatus(
  transaction:
    Prisma.TransactionClient,
  input: {
    deliveryStatus:
      DeliveryStatus;
    orderId: string;
    currentOrderStatus: string;
    actorId?: string | null;
  }
): Promise<
  | 'DISPATCHED'
  | 'DELIVERED'
  | null
> {
  const nextOrderStatus =
    input.deliveryStatus ===
    'DELIVERED'
      ? 'DELIVERED'
      : [
            'PICKED_UP',
            'IN_TRANSIT',
            'ARRIVED'
          ].includes(
            input.deliveryStatus
          )
        ? 'DISPATCHED'
        : null;

  if (
    input.deliveryStatus ===
    'DELIVERED'
  ) {
    await completePreparationForDeliveredOrder(
      transaction,
      {
        orderId:
          input.orderId,
        actorId:
          input.actorId
      }
    );
  }

  if (
    !nextOrderStatus ||
    input.currentOrderStatus ===
      nextOrderStatus
  ) {
    return null;
  }

  await transaction.order.update({
    where: {
      id: input.orderId
    },
    data: {
      status:
        nextOrderStatus
    }
  });

  return nextOrderStatus;
}

export const DeliveryRepository = {
  async readSession(
    sessionToken: string
  ) {
    const delivery =
      await findSessionDelivery(
        sessionToken
      );

    return mapDelivery(
      delivery
    );
  },

  async listAdmin(
    workspaceId: string
  ) {
    const [
      deliveries,
      memberships
    ] =
      await Promise.all([
        prisma.delivery.findMany({
          where: {
            workspaceId
          },
          include:
            deliveryInclude,
          orderBy: [
            {
              status: 'asc'
            },
            {
              updatedAt: 'desc'
            }
          ],
          take: 100
        }),
        prisma.workspaceMembership.findMany({
          where: {
            workspaceId,
            active: true,
            role: {
              in: [
                'SUPPORT',
                'MANAGER',
                'ADMIN',
                'OWNER',
                'SUPER_ADMIN'
              ]
            }
          },
          select: {
            role: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            joinedAt: 'asc'
          }
        })
      ]);

    return {
      deliveries:
        deliveries.map(
          mapDelivery
        ),
      staff:
        memberships.map(
          membership => ({
            ...membership.user,
            role:
              membership.role
          })
        )
    };
  },

  async listCustomer(
    userId: string,
    workspaceId: string
  ) {
    const orders =
      await prisma.order.findMany({
        where: {
          userId,
          workspaceId
        },
        include: {
          items: {
            orderBy: {
              createdAt: 'asc'
            }
          },
          delivery: {
            include:
              deliveryInclude
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 50
      });

    return orders.map(
      mapCustomerOrder
    );
  },

  async getCustomerOrder(
    userId: string,
    workspaceId: string,
    orderId: string
  ) {
    const order =
      await prisma.order.findFirst({
        where: {
          id: orderId,
          userId,
          workspaceId
        },
        include: {
          items: {
            orderBy: {
              createdAt: 'asc'
            }
          },
          delivery: {
            include:
              deliveryInclude
          }
        }
      });

    return order
      ? mapCustomerOrder(
          order
        )
      : null;
  },


  async confirmCustomerDelivery(
    userId: string,
    input: {
      workspaceId: string;
      orderId: string;
      note?: string | null;
    }
  ) {
    const order =
      await prisma.order.findFirst({
        where: {
          id:
            input.orderId,
          userId,
          workspaceId:
            input.workspaceId
        },
        include: {
          items: {
            orderBy: {
              createdAt:
                'asc'
            }
          },
          delivery: {
            include:
              deliveryInclude
          }
        }
      });

    if (!order) {
      throw new DeliveryRuntimeError(
        'The selected Order was not found.',
        404
      );
    }

    if (!order.delivery) {
      throw new DeliveryRuntimeError(
        'This Order does not have a Delivery record.',
        409
      );
    }

    if (
      order.delivery.status ===
      'DELIVERED'
    ) {
      return mapCustomerOrder(
        order
      );
    }

    if (
      order.delivery.status !==
      'ARRIVED'
    ) {
      throw new DeliveryRuntimeError(
        'Confirm receipt only after the rider has marked the Delivery as arrived.',
        409
      );
    }

    assertDeliveryTransition(
      order.delivery.status,
      'DELIVERED'
    );

    const confirmationNote =
      text(
        input.note
      );

    await prisma.$transaction(
      async transaction => {
        const deliveredAt =
          new Date();

        await transaction.order.update({
          where: {
            id:
              order.id
          },
          data: {
            status:
              'DELIVERED'
          }
        });

        await transaction.delivery.update({
          where: {
            id:
              order.delivery!.id
          },
          data: {
            status:
              'DELIVERED',
            deliveredAt,
            trackingEnabled:
              false,
            barcodeTokenHash:
              null,
            barcodeExpiresAt:
              null
          }
        });

        await createTrackingEvent(
          transaction,
          {
            deliveryId:
              order.delivery!.id,
            actorId:
              userId,
            status:
              'DELIVERED',
            source:
              'CUSTOMER',
            note:
              confirmationNote ??
              'Customer confirmed successful receipt.',
            metadata: {
              confirmation:
                'CUSTOMER_DASHBOARD',
              orderId:
                order.id,
              deliveredAt:
                deliveredAt.toISOString()
            }
          }
        );

        await completePreparationForDeliveredOrder(
          transaction,
          {
            orderId:
              order.id,
            actorId:
              userId
          }
        );

        await notifyDeliveryStatusChanged(
          transaction,
          {
            workspaceId:
              input.workspaceId,
            userId,
            deliveryId:
              order.delivery!.id,
            trackingCode:
              order.delivery!.trackingCode,
            status:
              'DELIVERED'
          }
        );

        await notifyOrderStatusChanged(
          transaction,
          {
            workspaceId:
              input.workspaceId,
            userId,
            orderId:
              order.id,
            orderNumber:
              order.orderNumber,
            status:
              'DELIVERED'
          }
        );

        await completeOperationalTodos(
          transaction,
          {
            workspaceId:
              input.workspaceId,
            source:
              'DELIVERY',
            targetType:
              'DELIVERY',
            targetId:
              order.delivery!.id
          }
        );

        await transaction.adminAuditEvent.create({
          data: {
            workspaceId:
              input.workspaceId,
            actorId:
              userId,
            action:
              'DELIVERY_CONFIRMED_BY_CUSTOMER',
            targetType:
              'DELIVERY',
            targetId:
              order.delivery!.id,
            summary:
              `${order.delivery!.trackingCode} was confirmed received by the customer.`,
            metadata: {
              orderId:
                order.id,
              orderNumber:
                order.orderNumber,
              confirmationNote
            }
          }
        });
      }
    );

    const refreshed =
      await prisma.order.findUnique({
        where: {
          id:
            order.id
        },
        include: {
          items: {
            orderBy: {
              createdAt:
                'asc'
            }
          },
          delivery: {
            include:
              deliveryInclude
          }
        }
      });

    if (!refreshed) {
      throw new DeliveryRuntimeError(
        'The delivered Order could not be reloaded.',
        500
      );
    }

    return mapCustomerOrder(
      refreshed
    );
  },

  async assign(
    actorId: string,
    input: {
      workspaceId: string;
      deliveryId: string;
      dispatcherId?: string | null;
      dispatcherName?: string | null;
      dispatcherPhone?: string | null;
      estimatedArrival?: Date | null;
    }
  ) {
    const existing =
      await prisma.delivery.findFirst({
        where: {
          id:
            input.deliveryId,
          workspaceId:
            input.workspaceId
        },
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              status: true,
              paymentStatus: true,
              userId: true
            }
          }
        }
      });

    if (!existing) {
      throw new DeliveryRuntimeError(
        'The selected delivery was not found.',
        404
      );
    }

    if (
      existing.order
        .paymentStatus !==
      'PAID'
    ) {
      throw new DeliveryRuntimeError(
        'Only a paid order can be assigned for delivery.',
        409
      );
    }

    if (
      existing.order.status !==
      'READY'
    ) {
      throw new DeliveryRuntimeError(
        'The order must be marked READY before delivery assignment.',
        409
      );
    }

    assertDeliveryTransition(
      existing.status,
      'ASSIGNED'
    );

    let dispatcherId =
      input.dispatcherId ??
      null;

    let dispatcherName =
      text(
        input.dispatcherName
      );

    let dispatcherPhone =
      text(
        input.dispatcherPhone
      );

    if (dispatcherId) {
      const membership =
        await prisma.workspaceMembership.findFirst({
          where: {
            workspaceId:
              input.workspaceId,
            userId:
              dispatcherId,
            active:
              true,
            role: {
              in: [
                'SUPPORT',
                'MANAGER',
                'ADMIN',
                'OWNER',
                'SUPER_ADMIN'
              ]
            }
          },
          select: {
            user: {
              select: {
                name: true
              }
            }
          }
        });

      if (!membership) {
        throw new DeliveryRuntimeError(
          'The selected dispatcher is not active in this workspace.',
          422
        );
      }

      dispatcherName =
        membership.user.name;
    }

    if (
      existing.method ===
        'PERSONAL_COURIER' &&
      (
        !dispatcherName ||
        !dispatcherPhone
      )
    ) {
      throw new DeliveryRuntimeError(
        'Courier name and phone number are required.',
        422
      );
    }

    if (
      existing.method ===
        'AJ_DELIVERY' &&
      !dispatcherId &&
      !dispatcherName
    ) {
      throw new DeliveryRuntimeError(
        'Select or name an AJ Delivery dispatcher.',
        422
      );
    }

    if (
      existing.method ===
      'STORE_PICKUP'
    ) {
      dispatcherId =
        null;
      dispatcherName =
        'Store pickup desk';
      dispatcherPhone =
        null;
    }

    await prisma.$transaction(
      async transaction => {
        await transaction.delivery.update({
          where: {
            id:
              existing.id
          },
          data: {
            status:
              'ASSIGNED',
            dispatcherId,
            dispatcherName,
            dispatcherPhone,
            estimatedArrival:
              input.estimatedArrival ??
              null,
            trackingEnabled:
              false,
            barcodeTokenHash:
              null,
            barcodeExpiresAt:
              null
          }
        });

        await createTrackingEvent(
          transaction,
          {
            deliveryId:
              existing.id,
            actorId,
            status:
              'ASSIGNED',
            source:
              'STAFF',
            note:
              `${dispatcherName ?? 'Dispatcher'} assigned.`
          }
        );

        await notifyDeliveryStatusChanged(
          transaction,
          {
            workspaceId:
              input.workspaceId,
            userId:
              existing.order.userId,
            deliveryId:
              existing.id,
            trackingCode:
              existing.trackingCode,
            status:
              'ASSIGNED'
          }
        );

        await completeOperationalTodos(
          transaction,
          {
            workspaceId:
              input.workspaceId,
            source:
              'DELIVERY',
            targetType:
              'DELIVERY',
            targetId:
              existing.id
          }
        );

        await transaction.adminAuditEvent.create({
          data: {
            workspaceId:
              input.workspaceId,
            actorId,
            action:
              'DELIVERY_ASSIGNED',
            targetType:
              'DELIVERY',
            targetId:
              existing.id,
            summary:
              `${existing.trackingCode} assigned to ${dispatcherName ?? 'dispatcher'}.`,
            metadata: {
              dispatcherId,
              dispatcherName,
              dispatcherPhone,
              estimatedArrival:
                input.estimatedArrival?.toISOString() ??
                null
            }
          }
        });
      }
    );

    return mapDelivery(
      await readDelivery(
        existing.id
      )
    );
  },

  async issueHandover(
    actorId: string,
    input: {
      workspaceId: string;
      deliveryId: string;
      origin: string;
    }
  ) {
    const existing =
      await prisma.delivery.findFirst({
        where: {
          id:
            input.deliveryId,
          workspaceId:
            input.workspaceId
        },
        include: {
          order: {
            select: {
              status: true,
              paymentStatus: true
            }
          }
        }
      });

    if (!existing) {
      throw new DeliveryRuntimeError(
        'The selected delivery was not found.',
        404
      );
    }

    if (
      existing.status !==
      'ASSIGNED'
    ) {
      throw new DeliveryRuntimeError(
        'Assign the delivery before generating rider access.',
        409
      );
    }

    if (
      existing.order
        .paymentStatus !==
        'PAID' ||
      existing.order.status !==
        'READY'
    ) {
      throw new DeliveryRuntimeError(
        'The order must be paid and READY before handover.',
        409
      );
    }

    const token =
      createDeliveryToken(
        'AJH'
      );

    const expiresAt =
      deliveryTokenExpiry(
        30
      );

    await prisma.$transaction(
      async transaction => {
        await transaction.delivery.update({
          where: {
            id:
              existing.id
          },
          data: {
            barcodeTokenHash:
              hashDeliveryToken(
                token
              ),
            barcodeExpiresAt:
              expiresAt,
            trackingEnabled:
              false
          }
        });

        await transaction.adminAuditEvent.create({
          data: {
            workspaceId:
              input.workspaceId,
            actorId,
            action:
              'DELIVERY_HANDOVER_ACCESS_ISSUED',
            targetType:
              'DELIVERY',
            targetId:
              existing.id,
            summary:
              `Temporary rider access issued for ${existing.trackingCode}.`,
            metadata: {
              expiresAt:
                expiresAt.toISOString()
            }
          }
        });
      }
    );

    const accessUrl =
      new URL(
        '/delivery-access',
        input.origin
      );

    accessUrl.searchParams.set(
      'token',
      token
    );

    return {
      delivery:
        mapDelivery(
          await readDelivery(
            existing.id
          )
        ),
      accessUrl:
        accessUrl.toString(),
      expiresAt:
        expiresAt.toISOString()
    };
  },

  async inspectHandover(
    token: string
  ) {
    const normalized =
      token.trim();

    if (!normalized) {
      throw new DeliveryRuntimeError(
        'A handover token is required.',
        400
      );
    }

    const hashed =
      hashDeliveryToken(
        normalized
      );

    const delivery =
      await prisma.delivery.findFirst({
        where: {
          barcodeTokenHash:
            hashed,
          barcodeExpiresAt: {
            gt: new Date()
          },
          status:
            'ASSIGNED',
          trackingEnabled:
            false
        },
        include: {
          order: {
            select: {
              orderNumber: true,
              deliveryAddress: true
            }
          }
        }
      });

    if (
      !delivery ||
      !delivery.barcodeTokenHash ||
      !deliveryTokenMatches(
        normalized,
        delivery.barcodeTokenHash
      )
    ) {
      throw new DeliveryRuntimeError(
        'This handover access is invalid or expired.',
        401
      );
    }

    return {
      deliveryId:
        delivery.id,
      trackingCode:
        delivery.trackingCode,
      orderNumber:
        delivery.order
          .orderNumber,
      method:
        delivery.method,
      status:
        delivery.status,
      expiresAt:
        delivery.barcodeExpiresAt!.toISOString(),
      dispatcherName:
        delivery.dispatcherName,
      recipientName:
        recipientName(
          delivery.order
            .deliveryAddress
        )
    };
  },

  async activateHandover(
    token: string
  ) {
    const normalized =
      token.trim();

    const hashed =
      hashDeliveryToken(
        normalized
      );

    const result =
      await prisma.$transaction(
        async transaction => {
          const delivery =
            await transaction.delivery.findFirst({
              where: {
                barcodeTokenHash:
                  hashed,
                barcodeExpiresAt: {
                  gt: new Date()
                },
                status:
                  'ASSIGNED',
                trackingEnabled:
                  false
              },
              include: {
                order: {
                  select: {
                    userId: true
                  }
                }
              }
            });

          if (
            !delivery ||
            !delivery.barcodeTokenHash ||
            !deliveryTokenMatches(
              normalized,
              delivery.barcodeTokenHash
            )
          ) {
            throw new DeliveryRuntimeError(
              'This handover access is invalid or expired.',
              401
            );
          }

          assertDeliveryTransition(
            delivery.status,
            'BARCODE_SCANNED'
          );

          const sessionToken =
            createDeliveryToken(
              'AJS'
            );

          const expiresAt =
            deliveryTokenExpiry(
              12 * 60
            );

          await transaction.delivery.update({
            where: {
              id:
                delivery.id
            },
            data: {
              status:
                'BARCODE_SCANNED',
              barcodeTokenHash:
                hashDeliveryToken(
                  sessionToken
                ),
              barcodeExpiresAt:
                expiresAt,
              trackingEnabled:
                true
            }
          });

          await createTrackingEvent(
            transaction,
            {
              deliveryId:
                delivery.id,
              status:
                'BARCODE_SCANNED',
              source:
                'DISPATCHER_SCAN',
              note:
                'Rider handover access activated.'
            }
          );

          await notifyDeliveryStatusChanged(
            transaction,
            {
              workspaceId:
                delivery.workspaceId,
              userId:
                delivery.order.userId,
              deliveryId:
                delivery.id,
              trackingCode:
                delivery.trackingCode,
              status:
                'BARCODE_SCANNED'
            }
          );

          await transaction.adminAuditEvent.create({
            data: {
              workspaceId:
                delivery.workspaceId,
              action:
                'DELIVERY_HANDOVER_ACTIVATED',
              targetType:
                'DELIVERY',
              targetId:
                delivery.id,
              summary:
                `${delivery.trackingCode} rider access was activated.`,
              metadata: {
                sessionExpiresAt:
                  expiresAt.toISOString()
              }
            }
          });

          return {
            deliveryId:
              delivery.id,
            sessionToken,
            expiresAt
          };
        }
      );

    return {
      delivery:
        mapDelivery(
          await readDelivery(
            result.deliveryId
          )
        ),
      sessionToken:
        result.sessionToken,
      expiresAt:
        result.expiresAt.toISOString()
    };
  },

  async updateLocation(
    sessionToken: string,
    input: {
      latitude: number;
      longitude: number;
      accuracyMeters?: number | null;
    }
  ) {
    if (
      !Number.isFinite(
        input.latitude
      ) ||
      input.latitude <
        -90 ||
      input.latitude >
        90 ||
      !Number.isFinite(
        input.longitude
      ) ||
      input.longitude <
        -180 ||
      input.longitude >
        180
    ) {
      throw new DeliveryRuntimeError(
        'A valid GPS position is required.',
        422
      );
    }

    const delivery =
      await findSessionDelivery(
        sessionToken
      );

    const now =
      new Date();

    const elapsed =
      delivery.lastLocationAt
        ? now.getTime() -
          delivery.lastLocationAt.getTime()
        : Number.POSITIVE_INFINITY;

    const distance =
      delivery.lastLatitude !==
        null &&
      delivery.lastLongitude !==
        null
        ? haversineMeters(
            delivery.lastLatitude,
            delivery.lastLongitude,
            input.latitude,
            input.longitude
          )
        : Number.POSITIVE_INFINITY;

    const persistEvent =
      elapsed >= 90_000 ||
      distance >= 75;

    await prisma.$transaction(
      async transaction => {
        await transaction.delivery.update({
          where: {
            id:
              delivery.id
          },
          data: {
            lastLatitude:
              input.latitude,
            lastLongitude:
              input.longitude,
            lastLocationAt:
              now
          }
        });

        if (persistEvent) {
          await createTrackingEvent(
            transaction,
            {
              deliveryId:
                delivery.id,
              status:
                delivery.status,
              source:
                'DISPATCHER_GPS',
              latitude:
                input.latitude,
              longitude:
                input.longitude,
              accuracyMeters:
                input.accuracyMeters ??
                null,
              metadata: {
                distanceMeters:
                  Number.isFinite(
                    distance
                  )
                    ? Math.round(
                        distance
                      )
                    : null
              }
            }
          );
        }
      }
    );

    return {
      accepted: true,
      eventCreated:
        persistEvent,
      receivedAt:
        now.toISOString()
    };
  },

  async riderTransition(
    sessionToken: string,
    input: {
      nextStatus: DeliveryStatus;
      note?: string | null;
      latitude?: number | null;
      longitude?: number | null;
      accuracyMeters?: number | null;
    }
  ) {
    if (
      !RIDER_TRANSITIONS.includes(
        input.nextStatus
      )
    ) {
      throw new DeliveryRuntimeError(
        'The requested rider status is not allowed.',
        422
      );
    }

    const delivery =
      await findSessionDelivery(
        sessionToken
      );

    assertDeliveryTransition(
      delivery.status,
      input.nextStatus
    );

    await prisma.$transaction(
      async transaction => {
        const now =
          new Date();

        const orderStatus =
          await synchronizeOrderStatus(
            transaction,
            {
              deliveryStatus:
                input.nextStatus,
              orderId:
                delivery.order.id,
              currentOrderStatus:
                delivery.order.status
            }
          );

        await transaction.delivery.update({
          where: {
            id:
              delivery.id
          },
          data: {
            status:
              input.nextStatus,
            ...(input.nextStatus ===
            'PICKED_UP'
              ? {
                  pickedUpAt:
                    delivery.pickedUpAt ??
                    now
                }
              : {}),
            ...(input.nextStatus ===
            'DELIVERED'
              ? {
                  deliveredAt:
                    now,
                  trackingEnabled:
                    false,
                  barcodeTokenHash:
                    null,
                  barcodeExpiresAt:
                    null
                }
              : {}),
            ...(input.nextStatus ===
            'FAILED'
              ? {
                  trackingEnabled:
                    false,
                  barcodeTokenHash:
                    null,
                  barcodeExpiresAt:
                    null
                }
              : {}),
            ...(input.latitude !==
              null &&
            input.latitude !==
              undefined
              ? {
                  lastLatitude:
                    input.latitude
                }
              : {}),
            ...(input.longitude !==
              null &&
            input.longitude !==
              undefined
              ? {
                  lastLongitude:
                    input.longitude
                }
              : {}),
            ...(input.latitude !==
              null &&
            input.latitude !==
              undefined &&
            input.longitude !==
              null &&
            input.longitude !==
              undefined
              ? {
                  lastLocationAt:
                    now
                }
              : {})
          }
        });

        await createTrackingEvent(
          transaction,
          {
            deliveryId:
              delivery.id,
            status:
              input.nextStatus,
            source:
              'DISPATCHER_GPS',
            latitude:
              input.latitude,
            longitude:
              input.longitude,
            accuracyMeters:
              input.accuracyMeters,
            note:
              text(
                input.note
              )
          }
        );

        await notifyDeliveryStatusChanged(
          transaction,
          {
            workspaceId:
              delivery.workspaceId,
            userId:
              delivery.order.user.id,
            deliveryId:
              delivery.id,
            trackingCode:
              delivery.trackingCode,
            status:
              input.nextStatus
          }
        );

        if (orderStatus) {
          await notifyOrderStatusChanged(
            transaction,
            {
              workspaceId:
                delivery.workspaceId,
              userId:
                delivery.order.user.id,
              orderId:
                delivery.order.id,
              orderNumber:
                delivery.order.orderNumber,
              status:
                orderStatus
            }
          );
        }

        if (
          input.nextStatus ===
          'FAILED'
        ) {
          await upsertOperationalTodo(
            transaction,
            {
              workspaceId:
                delivery.workspaceId,
              title:
                `Resolve failed delivery ${delivery.trackingCode}`,
              description:
                text(
                  input.note
                ) ??
                'The rider reported a failed delivery attempt.',
              source:
                'DELIVERY',
              priority:
                'URGENT',
              targetType:
                'DELIVERY',
              targetId:
                delivery.id,
              dedupeKey:
                `delivery:${delivery.id}:failed`,
              metadata: {
                trackingCode:
                  delivery.trackingCode
              }
            }
          );
        }

        if (
          input.nextStatus ===
          'DELIVERED'
        ) {
          await completeOperationalTodos(
            transaction,
            {
              workspaceId:
                delivery.workspaceId,
              source:
                'DELIVERY',
              targetType:
                'DELIVERY',
              targetId:
                delivery.id
            }
          );
        }

        await transaction.adminAuditEvent.create({
          data: {
            workspaceId:
              delivery.workspaceId,
            action:
              'DELIVERY_RIDER_STATUS_UPDATED',
            targetType:
              'DELIVERY',
            targetId:
              delivery.id,
            summary:
              `${delivery.trackingCode} moved from ${delivery.status.replaceAll('_', ' ')} to ${input.nextStatus.replaceAll('_', ' ')}.`,
            metadata: {
              previousStatus:
                delivery.status,
              nextStatus:
                input.nextStatus,
              orderStatus
            }
          }
        });
      }
    );

    return mapDelivery(
      await readDelivery(
        delivery.id
      )
    );
  },

  async adminTransition(
    actorId: string,
    input: {
      workspaceId: string;
      deliveryId: string;
      nextStatus: DeliveryStatus;
      note?: string | null;
    }
  ) {
    const delivery =
      await prisma.delivery.findFirst({
        where: {
          id:
            input.deliveryId,
          workspaceId:
            input.workspaceId
        },
        include:
          deliveryInclude
      });

    if (!delivery) {
      throw new DeliveryRuntimeError(
        'The selected delivery was not found.',
        404
      );
    }

    assertDeliveryTransition(
      delivery.status,
      input.nextStatus
    );

    await prisma.$transaction(
      async transaction => {
        const now =
          new Date();

        const orderStatus =
          await synchronizeOrderStatus(
            transaction,
            {
              deliveryStatus:
                input.nextStatus,
              orderId:
                delivery.order.id,
              currentOrderStatus:
                delivery.order.status,
              actorId
            }
          );

        await transaction.delivery.update({
          where: {
            id:
              delivery.id
          },
          data: {
            status:
              input.nextStatus,
            ...(input.nextStatus ===
            'PICKED_UP'
              ? {
                  pickedUpAt:
                    delivery.pickedUpAt ??
                    now
                }
              : {}),
            ...(input.nextStatus ===
            'DELIVERED'
              ? {
                  deliveredAt:
                    now,
                  trackingEnabled:
                    false,
                  barcodeTokenHash:
                    null,
                  barcodeExpiresAt:
                    null
                }
              : {}),
            ...([
              'FAILED',
              'CANCELLED'
            ].includes(
              input.nextStatus
            )
              ? {
                  trackingEnabled:
                    false,
                  barcodeTokenHash:
                    null,
                  barcodeExpiresAt:
                    null
                }
              : {})
          }
        });

        await createTrackingEvent(
          transaction,
          {
            deliveryId:
              delivery.id,
            actorId,
            status:
              input.nextStatus,
            source:
              'STAFF',
            note:
              text(
                input.note
              )
          }
        );

        await notifyDeliveryStatusChanged(
          transaction,
          {
            workspaceId:
              delivery.workspaceId,
            userId:
              delivery.order.user.id,
            deliveryId:
              delivery.id,
            trackingCode:
              delivery.trackingCode,
            status:
              input.nextStatus
          }
        );

        if (orderStatus) {
          await notifyOrderStatusChanged(
            transaction,
            {
              workspaceId:
                delivery.workspaceId,
              userId:
                delivery.order.user.id,
              orderId:
                delivery.order.id,
              orderNumber:
                delivery.order.orderNumber,
              status:
                orderStatus
            }
          );
        }

        if (
          input.nextStatus ===
          'FAILED'
        ) {
          await upsertOperationalTodo(
            transaction,
            {
              workspaceId:
                delivery.workspaceId,
              title:
                `Resolve failed delivery ${delivery.trackingCode}`,
              description:
                text(
                  input.note
                ) ??
                'Staff marked this delivery as failed.',
              source:
                'DELIVERY',
              priority:
                'URGENT',
              targetType:
                'DELIVERY',
              targetId:
                delivery.id,
              dedupeKey:
                `delivery:${delivery.id}:failed`
            }
          );
        }

        if (
          [
            'DELIVERED',
            'CANCELLED'
          ].includes(
            input.nextStatus
          )
        ) {
          await completeOperationalTodos(
            transaction,
            {
              workspaceId:
                delivery.workspaceId,
              source:
                'DELIVERY',
              targetType:
                'DELIVERY',
              targetId:
                delivery.id
            }
          );
        }

        await transaction.adminAuditEvent.create({
          data: {
            workspaceId:
              delivery.workspaceId,
            actorId,
            action:
              'DELIVERY_STATUS_UPDATED',
            targetType:
              'DELIVERY',
            targetId:
              delivery.id,
            summary:
              `${delivery.trackingCode} moved from ${delivery.status.replaceAll('_', ' ')} to ${input.nextStatus.replaceAll('_', ' ')}.`,
            metadata: {
              previousStatus:
                delivery.status,
              nextStatus:
                input.nextStatus,
              orderStatus
            }
          }
        });
      }
    );

    return mapDelivery(
      await readDelivery(
        delivery.id
      )
    );
  }
};
