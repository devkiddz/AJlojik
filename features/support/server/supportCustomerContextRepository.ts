import 'server-only';

import type {
  Prisma
} from '@/lib/generated/prisma/client';

import {
  prisma
} from '@/lib/prisma';

import type {
  SupportCustomerIdentityContext,
  SupportCustomerLocationContext,
  SupportCustomerOrderCandidate,
  SupportCustomerProductCandidate
} from './supportCustomerContextTypes';

const orderContextInclude = {
  payments: {
    orderBy: {
      createdAt:
        'desc'
    },
    take:
      5,
    select: {
      id:
        true,
      reference:
        true,
      amount:
        true,
      status:
        true,
      paidAt:
        true,
      createdAt:
        true
    }
  },
  delivery: {
    select: {
      id:
        true,
      trackingCode:
        true,
      method:
        true,
      status:
        true,
      estimatedArrival:
        true,
      pickedUpAt:
        true,
      deliveredAt:
        true,
      lastLocationAt:
        true,
      updatedAt:
        true
    }
  },
  items: {
    orderBy: {
      createdAt:
        'asc'
    },
    take:
      8,
    select: {
      productId:
        true,
      variantId:
        true,
      productName:
        true,
      variantLabel:
        true,
      quantity:
        true
    }
  }
} satisfies Prisma.OrderInclude;

type OrderContextRecord =
  Prisma.OrderGetPayload<{
    include:
      typeof orderContextInclude;
  }>;

const productContextInclude = {
  variants: {
    orderBy: [
      {
        active:
          'desc'
      },
      {
        position:
          'asc'
      }
    ],
    include: {
      inventory:
        true
    }
  }
} satisfies Prisma.ProductInclude;

type ProductContextRecord =
  Prisma.ProductGetPayload<{
    include:
      typeof productContextInclude;
  }>;

function mapOrder(
  record:
    OrderContextRecord
): SupportCustomerOrderCandidate {
  return {
    id:
      record.id,
    orderNumber:
      record.orderNumber,
    status:
      record.status,
    paymentStatus:
      record.paymentStatus,
    subtotal:
      Number(
        record.subtotal
      ),
    deliveryFee:
      Number(
        record.deliveryFee
      ),
    total:
      Number(
        record.total
      ),
    deliveryAddress:
      record.deliveryAddress,
    createdAt:
      record.createdAt
        .toISOString(),
    updatedAt:
      record.updatedAt
        .toISOString(),
    payments:
      record.payments.map(
        payment => ({
          id:
            payment.id,
          reference:
            payment.reference,
          amount:
            Number(
              payment.amount
            ),
          status:
            payment.status,
          paidAt:
            payment.paidAt
              ?.toISOString() ??
            null,
          createdAt:
            payment.createdAt
              .toISOString()
        })
      ),
    delivery:
      record.delivery
        ? {
            id:
              record.delivery
                .id,
            trackingCode:
              record.delivery
                .trackingCode,
            method:
              record.delivery
                .method,
            status:
              record.delivery
                .status,
            estimatedArrival:
              record.delivery
                .estimatedArrival
                ?.toISOString() ??
              null,
            pickedUpAt:
              record.delivery
                .pickedUpAt
                ?.toISOString() ??
              null,
            deliveredAt:
              record.delivery
                .deliveredAt
                ?.toISOString() ??
              null,
            lastLocationAt:
              record.delivery
                .lastLocationAt
                ?.toISOString() ??
              null,
            updatedAt:
              record.delivery
                .updatedAt
                .toISOString()
          }
        : null,
    items:
      record.items.map(
        item => ({
          productId:
            item.productId,
          variantId:
            item.variantId,
          productName:
            item.productName,
          variantLabel:
            item.variantLabel,
          quantity:
            item.quantity
        })
      )
  };
}

function mapProduct(
  record:
    ProductContextRecord
): SupportCustomerProductCandidate {
  return {
    id:
      record.id,
    slug:
      record.slug,
    name:
      record.name,
    active:
      record.active,
    status:
      record.status,
    estimatedDelivery:
      record.estimatedDelivery,
    variants:
      record.variants.map(
        variant => {
          const quantity =
            variant.inventory
              ?.quantity ??
            null;

          const reserved =
            variant.inventory
              ?.reserved ??
            null;

          return {
            id:
              variant.id,
            label:
              variant.label,
            sku:
              variant.sku,
            active:
              variant.active,
            price:
              Number(
                variant.price
              ),
            quantity,
            reserved,
            availableQuantity:
              quantity ===
                null ||
              reserved ===
                null
                ? null
                : Math.max(
                    0,
                    quantity -
                      reserved
                  )
          };
        }
      )
  };
}

export async function getSupportCustomerIdentityContext(
  workspaceId: string,
  customerId: string
): Promise<SupportCustomerIdentityContext | null> {
  const membership =
    await prisma.workspaceMembership.findFirst({
      where: {
        workspaceId,
        userId:
          customerId,
        active:
          true,
        workspace: {
          active:
            true
        }
      },
      select: {
        workspace: {
          select: {
            id:
              true,
            name:
              true,
            currency:
              true
          }
        },
        user: {
          select: {
            id:
              true,
            name:
              true,
            accountState:
              true,
            emailVerified:
              true
          }
        }
      }
    });

  if (!membership) {
    return null;
  }

  return {
    customerId:
      membership.user
        .id,
    name:
      membership.user
        .name,
    accountState:
      membership.user
        .accountState,
    emailVerified:
      membership.user
        .emailVerified,
    workspaceId:
      membership.workspace
        .id,
    workspaceName:
      membership.workspace
        .name,
    currency:
      membership.workspace
        .currency
  };
}

export async function listSupportCustomerOrderContext(
  workspaceId: string,
  customerId: string,
  take = 12
): Promise<SupportCustomerOrderCandidate[]> {
  const records =
    await prisma.order.findMany({
      where: {
        workspaceId,
        userId:
          customerId
      },
      orderBy: {
        createdAt:
          'desc'
      },
      take:
        Math.min(
          20,
          Math.max(
            1,
            Math.trunc(
              take
            )
          )
        ),
      include:
        orderContextInclude
    });

  return records.map(
    mapOrder
  );
}

export async function getSupportCustomerSavedLocation(
  customerId: string
): Promise<SupportCustomerLocationContext | null> {
  const address =
    await prisma.address.findFirst({
      where: {
        userId:
          customerId
      },
      orderBy: [
        {
          default:
            'desc'
        },
        {
          updatedAt:
            'desc'
        }
      ],
      select: {
        city:
          true,
        state:
          true,
        country:
          true
      }
    });

  if (!address) {
    return null;
  }

  return {
    source:
      'SAVED_ADDRESS',
    city:
      address.city,
    state:
      address.state,
    country:
      address.country
  };
}

export async function listSupportCustomerProductContext(
  workspaceId: string,
  clues:
    readonly string[]
): Promise<SupportCustomerProductCandidate[]> {
  if (!clues.length) {
    return [];
  }

  const filters:
    Prisma.ProductWhereInput[] =
    [];

  for (
    const clue of
    clues.slice(
      0,
      8
    )
  ) {
    filters.push(
      {
        name: {
          contains:
            clue,
          mode:
            'insensitive'
        }
      },
      {
        slug: {
          contains:
            clue,
          mode:
            'insensitive'
        }
      },
      {
        variants: {
          some: {
            OR: [
              {
                label: {
                  contains:
                    clue,
                  mode:
                    'insensitive'
                }
              },
              {
                sku: {
                  contains:
                    clue,
                  mode:
                    'insensitive'
                }
              }
            ]
          }
        }
      }
    );
  }

  const records =
    await prisma.product.findMany({
      where: {
        workspaceId,
        OR:
          filters
      },
      orderBy: [
        {
          active:
            'desc'
        },
        {
          featured:
            'desc'
        },
        {
          updatedAt:
            'desc'
        }
      ],
      take:
        12,
      include:
        productContextInclude
    });

  return records.map(
    mapProduct
  );
}
