import 'server-only';

import {
  prisma
} from '@/lib/prisma';

import type {
  ExperienceHistoryProjection,
  PendingReviewProjection,
  SerializableValue,
  WorkspaceCommerceProjection,
  WorkspaceDeliveryProjection,
  WorkspaceOrderProjection
} from './commerceProjectionTypes';

type GetWorkspaceCommerceProjectionInput = {
  userId: string;
  workspaceId: string;

  orderLimit?: number;
  historyLimit?: number;
};

function numberFromDecimal(
  value: unknown
): number {
  const amount =
    Number(value);

  return Number.isFinite(amount)
    ? amount
    : 0;
}

function toSerializableValue(
  value: unknown
): SerializableValue {
  return value as SerializableValue;
}

export async function getWorkspaceCommerceProjection({
  userId,
  workspaceId,
  orderLimit = 6,
  historyLimit = 8
}: GetWorkspaceCommerceProjectionInput): Promise<
  WorkspaceCommerceProjection | null
> {
  const now =
    new Date();

  /**
   * Never trust a client-supplied workspace ID without
   * confirming that the authenticated user has an active
   * membership in that workspace.
   */
  const membership =
    await prisma.workspaceMembership.findFirst({
      where: {
        userId,
        workspaceId,
        active: true,

        workspace: {
          active: true
        }
      },

      select: {
        id: true
      }
    });

  if (!membership) {
    return null;
  }

  const [
    recentOrderRecords,
    activeDeliveryRecord,
    deliveredOrderRecords,
    historyRecords
  ] = await Promise.all([
    prisma.order.findMany({
      where: {
        userId,
        workspaceId
      },

      orderBy: {
        createdAt: 'desc'
      },

      take:
        Math.max(
          1,
          Math.min(orderLimit, 12)
        ),

      include: {
        items: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    }),

    prisma.delivery.findFirst({
      where: {
        workspaceId,

        status: {
          notIn: [
            'DELIVERED',
            'FAILED',
            'CANCELLED'
          ]
        },

        order: {
          userId,
          workspaceId
        }
      },

      orderBy: {
        updatedAt: 'desc'
      },

      include: {
        order: {
          select: {
            orderNumber: true
          }
        },

        events: {
          orderBy: {
            createdAt: 'asc'
          },

          take: 12
        }
      }
    }),

    prisma.order.findMany({
      where: {
        userId,
        workspaceId,
        status: 'DELIVERED'
      },

      orderBy: {
        updatedAt: 'desc'
      },

      take: 20,

      include: {
        items: {
          orderBy: {
            createdAt: 'asc'
          }
        },

        delivery: {
          select: {
            deliveredAt: true
          }
        }
      }
    }),

    prisma.experienceHistoryEntry.findMany({
      where: {
        userId,
        workspaceId,

        OR: [
          {
            expiresAt: null
          },
          {
            expiresAt: {
              gt: now
            }
          }
        ]
      },

      orderBy: {
        visitedAt: 'desc'
      },

      take:
        Math.max(
          1,
          Math.min(historyLimit, 20)
        )
    })
  ]);

  const recentOrders:
    WorkspaceOrderProjection[] =
    recentOrderRecords.map(
      order => {
        const items =
          order.items.map(
            item => ({
              id:
                item.id,

              productId:
                item.productId,

              variantId:
                item.variantId,

              productName:
                item.productName,

              variantLabel:
                item.variantLabel,

              image:
                item.image ?? null,

              quantity:
                item.quantity,

              unitPrice:
                numberFromDecimal(
                  item.unitPrice
                ),

              totalPrice:
                numberFromDecimal(
                  item.totalPrice
                )
            })
          );

        return {
          id:
            order.id,

          orderNumber:
            order.orderNumber,

          status:
            String(order.status),

          paymentStatus:
            String(
              order.paymentStatus
            ),

          subtotal:
            numberFromDecimal(
              order.subtotal
            ),

          discountAmount:
            numberFromDecimal(
              order.discountAmount
            ),

          deliveryFee:
            numberFromDecimal(
              order.deliveryFee
            ),

          total:
            numberFromDecimal(
              order.total
            ),

          itemCount:
            items.reduce(
              (
                total,
                item
              ) =>
                total +
                item.quantity,
              0
            ),

          items,

          createdAt:
            order.createdAt.toISOString(),

          updatedAt:
            order.updatedAt.toISOString()
        };
      }
    );

  const activeDelivery:
    WorkspaceDeliveryProjection | null =
    activeDeliveryRecord
      ? {
          id:
            activeDeliveryRecord.id,

          orderId:
            activeDeliveryRecord.orderId,

          orderNumber:
            activeDeliveryRecord.order
              .orderNumber,

          method:
            String(
              activeDeliveryRecord.method
            ),

          status:
            String(
              activeDeliveryRecord.status
            ),

          trackingCode:
            activeDeliveryRecord
              .trackingCode,

          dispatcherName:
            activeDeliveryRecord
              .dispatcherName ??
            null,

          dispatcherPhone:
            activeDeliveryRecord
              .dispatcherPhone ??
            null,

          estimatedArrival:
            activeDeliveryRecord
              .estimatedArrival
              ?.toISOString() ??
            null,

          pickedUpAt:
            activeDeliveryRecord
              .pickedUpAt
              ?.toISOString() ??
            null,

          deliveredAt:
            activeDeliveryRecord
              .deliveredAt
              ?.toISOString() ??
            null,

          trackingEnabled:
            activeDeliveryRecord
              .trackingEnabled,

          lastLocationAt:
            activeDeliveryRecord
              .lastLocationAt
              ?.toISOString() ??
            null,

          location:
            typeof activeDeliveryRecord
              .lastLatitude ===
              'number' &&
            typeof activeDeliveryRecord
              .lastLongitude ===
              'number'
              ? {
                  lat:
                    activeDeliveryRecord
                      .lastLatitude,

                  lng:
                    activeDeliveryRecord
                      .lastLongitude
                }
              : null,

          events:
            activeDeliveryRecord.events.map(
              event => ({
                id:
                  event.id,

                status:
                  String(
                    event.status
                  ),

                source:
                  String(
                    event.source
                  ),

                note:
                  event.note ??
                  null,

                createdAt:
                  event.createdAt.toISOString()
              })
            ),

          createdAt:
            activeDeliveryRecord
              .createdAt
              .toISOString(),

          updatedAt:
            activeDeliveryRecord
              .updatedAt
              .toISOString()
        }
      : null;

  const deliveredProductIds =
    [
      ...new Set(
        deliveredOrderRecords.flatMap(
          order =>
            order.items.map(
              item =>
                item.productId
            )
        )
      )
    ];

  const reviewedProducts =
    deliveredProductIds.length
      ? await prisma.review.findMany({
          where: {
            userId,

            productId: {
              in:
                deliveredProductIds
            }
          },

          select: {
            productId: true
          }
        })
      : [];

  const reviewedProductIds =
    new Set(
      reviewedProducts.map(
        review =>
          review.productId
      )
    );

  const pendingReviewByProductId =
    new Map<
      string,
      PendingReviewProjection
    >();

  for (
    const order of
    deliveredOrderRecords
  ) {
    const deliveredAt =
      order.delivery
        ?.deliveredAt ??
      order.updatedAt;

    for (
      const item of
      order.items
    ) {
      if (
        reviewedProductIds.has(
          item.productId
        ) ||
        pendingReviewByProductId.has(
          item.productId
        )
      ) {
        continue;
      }

      pendingReviewByProductId.set(
        item.productId,
        {
          productId:
            item.productId,

          productName:
            item.productName,

          image:
            item.image ??
            null,

          orderId:
            order.id,

          orderNumber:
            order.orderNumber,

          deliveredAt:
            deliveredAt.toISOString()
        }
      );
    }
  }

  const pendingReviews =
    [
      ...pendingReviewByProductId.values()
    ].slice(
      0,
      8
    );

  const history:
    ExperienceHistoryProjection[] =
    historyRecords.map(
      entry => ({
        id:
          entry.id,

        label:
          entry.label,

        subtitle:
          entry.subtitle ??
          null,

        categorySlug:
          entry.categorySlug,

        source:
          String(entry.source),

        experienceId:
          entry.experienceId ??
          null,

        campaignId:
          entry.campaignId ??
          null,

        collectionId:
          entry.collectionId ??
          null,

        productId:
          entry.productId ??
          null,

        intentSnapshot:
          toSerializableValue(
            entry.intentSnapshot
          ),

        contextSnapshot:
          entry.contextSnapshot ===
          null
            ? null
            : toSerializableValue(
                entry.contextSnapshot
              ),

        visitedAt:
          entry.visitedAt.toISOString()
      })
    );

  return {
    workspaceId,

    generatedAt:
      now.toISOString(),

    orders: {
      recent:
        recentOrders,

      ...(activeDelivery
        ? {
            activeDelivery
          }
        : {})
    },

    pendingReviews,

    history
  };
}