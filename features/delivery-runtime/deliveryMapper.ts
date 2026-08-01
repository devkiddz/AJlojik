import type {
  Prisma
} from '@/lib/generated/prisma/client';

import type {
  CustomerOrderValue,
  DeliveryRuntimeValue
} from './deliveryContracts';

export const deliveryInclude = {
  dispatcher: {
    select: {
      id: true,
      name: true,
      email: true
    }
  },
  order: {
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      items: {
        orderBy: {
          createdAt: 'asc'
        }
      }
    }
  },
  events: {
    orderBy: {
      createdAt: 'desc'
    },
    take: 100
  }
} satisfies Prisma.DeliveryInclude;

export type DeliveryRecord =
  Prisma.DeliveryGetPayload<{
    include: typeof deliveryInclude;
  }>;

export function mapDelivery(
  delivery: DeliveryRecord
): DeliveryRuntimeValue {
  return {
    id: delivery.id,
    workspaceId: delivery.workspaceId,
    method: delivery.method,
    status: delivery.status,
    trackingCode: delivery.trackingCode,
    handoverReady:
      delivery.status === 'ASSIGNED' &&
      !delivery.trackingEnabled &&
      Boolean(delivery.barcodeTokenHash) &&
      Boolean(
        delivery.barcodeExpiresAt &&
        delivery.barcodeExpiresAt > new Date()
      ),
    handoverExpiresAt:
      delivery.barcodeExpiresAt?.toISOString() ??
      null,
    trackingEnabled:
      delivery.trackingEnabled,
    dispatcherId:
      delivery.dispatcherId,
    dispatcherName:
      delivery.dispatcher?.name ??
      delivery.dispatcherName,
    dispatcherPhone:
      delivery.dispatcherPhone,
    estimatedArrival:
      delivery.estimatedArrival?.toISOString() ??
      null,
    pickedUpAt:
      delivery.pickedUpAt?.toISOString() ??
      null,
    deliveredAt:
      delivery.deliveredAt?.toISOString() ??
      null,
    lastLatitude:
      delivery.lastLatitude,
    lastLongitude:
      delivery.lastLongitude,
    lastLocationAt:
      delivery.lastLocationAt?.toISOString() ??
      null,
    createdAt:
      delivery.createdAt.toISOString(),
    updatedAt:
      delivery.updatedAt.toISOString(),
    order: {
      id: delivery.order.id,
      orderNumber:
        delivery.order.orderNumber,
      status:
        delivery.order.status,
      paymentStatus:
        delivery.order.paymentStatus,
      total:
        Number(delivery.order.total),
      deliveryAddress:
        delivery.order.deliveryAddress,
      createdAt:
        delivery.order.createdAt.toISOString(),
      user: delivery.order.user,
      items:
        delivery.order.items.map(
          item => ({
            id: item.id,
            productName:
              item.productName,
            variantLabel:
              item.variantLabel,
            image:
              item.image,
            quantity:
              item.quantity,
            unitPrice:
              Number(item.unitPrice),
            totalPrice:
              Number(item.totalPrice)
          })
        )
    },
    events:
      delivery.events.map(
        event => ({
          id: event.id,
          status:
            event.status,
          source:
            event.source,
          latitude:
            event.latitude,
          longitude:
            event.longitude,
          accuracyMeters:
            event.accuracyMeters,
          note:
            event.note,
          createdAt:
            event.createdAt.toISOString()
        })
      )
  };
}

export function mapCustomerOrder(
  order: Prisma.OrderGetPayload<{
    include: {
      items: true;
      delivery: {
        include: typeof deliveryInclude;
      };
    };
  }>
): CustomerOrderValue {
  return {
    id: order.id,
    orderNumber:
      order.orderNumber,
    status:
      order.status,
    paymentStatus:
      order.paymentStatus,
    subtotal:
      Number(order.subtotal),
    deliveryFee:
      Number(order.deliveryFee),
    total:
      Number(order.total),
    deliveryAddress:
      order.deliveryAddress,
    notes:
      order.notes,
    createdAt:
      order.createdAt.toISOString(),
    updatedAt:
      order.updatedAt.toISOString(),
    items:
      order.items.map(
        item => ({
          id: item.id,
          productName:
            item.productName,
          variantLabel:
            item.variantLabel,
          image:
            item.image,
          quantity:
            item.quantity,
          unitPrice:
            Number(item.unitPrice),
          totalPrice:
            Number(item.totalPrice)
        })
      ),
    delivery:
      order.delivery
        ? mapDelivery(
            order.delivery
          )
        : null
  };
}
