import 'server-only';

import {
  Prisma
} from '@/lib/generated/prisma/client';

import type {
  PreparationProductReference,
  PreparationVariantReference,
  PreparationView
} from './preparationContracts';

export const preparationInclude = {
  workspace: {
    select: {
      name: true,
      mode: true
    }
  },
  shoppingList: {
    select: {
      id: true,
      name: true,
      description: true
    }
  },
  user: {
    select: {
      id: true,
      name: true,
      email: true
    }
  },
  assignedStaff: {
    select: {
      id: true,
      name: true
    }
  },
  order: {
    select: {
      id: true,
      orderNumber: true,
      status: true,
      paymentStatus: true
    }
  },
  items: {
    orderBy: {
      position: 'asc'
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          vendorProfileId: true
        }
      },
      originalVariant: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              vendorProfileId: true
            }
          },
          inventory: {
            select: {
              quantity: true,
              reserved: true
            }
          }
        }
      },
      resolvedVariant: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              vendorProfileId: true
            }
          },
          inventory: {
            select: {
              quantity: true,
              reserved: true
            }
          }
        }
      }
    }
  },
  events: {
    orderBy: {
      createdAt: 'desc'
    },
    take: 100,
    include: {
      actor: {
        select: {
          name: true
        }
      }
    }
  }
} satisfies Prisma.ShoppingListPreparationRequestInclude;

export type PreparationRecord =
  Prisma.ShoppingListPreparationRequestGetPayload<{
    include: typeof preparationInclude;
  }>;

function numberValue(
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

function productReference(
  product: {
    id: string;
    name: string;
    slug: string;
    vendorProfileId: string | null;
  }
): PreparationProductReference {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    vendorProfileId:
      product.vendorProfileId
  };
}

function variantReference(
  variant: {
    id: string;
    label: string;
    price: Prisma.Decimal;
    image: string | null;
    product: {
      id: string;
      name: string;
      slug: string;
      vendorProfileId: string | null;
    };
    inventory: {
      quantity: number;
      reserved: number;
    } | null;
  } | null
): PreparationVariantReference | null {
  if (!variant) {
    return null;
  }

  return {
    id: variant.id,
    productId:
      variant.product.id,
    productName:
      variant.product.name,
    label:
      variant.label,
    price:
      numberValue(
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
  };
}

export function mapPreparation(
  record: PreparationRecord
): PreparationView {
  return {
    id: record.id,
    workspaceId:
      record.workspaceId,
    workspaceName:
      record.workspace.name,
    workspaceMode:
      record.workspace.mode,
    shoppingListId:
      record.shoppingListId,
    shoppingListName:
      record.shoppingList.name,
    shoppingListDescription:
      record.shoppingList
        .description,
    userId:
      record.userId,
    customerName:
      record.user.name,
    customerEmail:
      record.user.email,
    assignedStaffId:
      record.assignedStaffId,
    assignedStaffName:
      record.assignedStaff
        ?.name ?? null,
    orderId:
      record.orderId,
    orderNumber:
      record.order
        ?.orderNumber ?? null,
    orderStatus:
      record.order
        ?.status ?? null,
    paymentStatus:
      record.order
        ?.paymentStatus ?? null,
    status:
      record.status,
    customerDecision:
      record.customerDecision,
    priority:
      record.priority,
    customerNote:
      record.customerNote,
    staffNote:
      record.staffNote,
    customerDecisionNote:
      record.customerDecisionNote,
    originalEstimatedTotal:
      numberValue(
        record.originalEstimatedTotal
      ),
    quotedSubtotal:
      numberValue(
        record.quotedSubtotal
      ),
    approvedTotal:
      record.approvedTotal ===
      null
        ? null
        : numberValue(
            record.approvedTotal
          ),
    quoteVersion:
      record.quoteVersion,
    submittedAt:
      record.submittedAt
        .toISOString(),
    startedAt:
      record.startedAt
        ?.toISOString() ?? null,
    approvalRequestedAt:
      record.approvalRequestedAt
        ?.toISOString() ?? null,
    customerRespondedAt:
      record.customerRespondedAt
        ?.toISOString() ?? null,
    readyAt:
      record.readyAt
        ?.toISOString() ?? null,
    convertedAt:
      record.convertedAt
        ?.toISOString() ?? null,
    completedAt:
      record.completedAt
        ?.toISOString() ?? null,
    cancelledAt:
      record.cancelledAt
        ?.toISOString() ?? null,
    updatedAt:
      record.updatedAt
        .toISOString(),
    items:
      record.items.map(
        item => {
          const originalVariant =
            variantReference(
              item.originalVariant
            );

          const resolvedVariant =
            variantReference(
              item.resolvedVariant
            );

          const excluded =
            item.status ===
              'UNAVAILABLE' ||
            item.status ===
              'REMOVED' ||
            item.customerDecision ===
              'REJECTED';

          const quotedLineTotal =
            excluded
              ? 0
              : numberValue(
                  item.quotedUnitPrice
                ) *
                item.preparedQuantity;

          return {
            id:
              item.id,
            sourceShoppingListItemId:
              item.sourceShoppingListItemId,
            originalProduct:
              productReference(
                item.product
              ),
            resolvedProduct:
              item.resolvedVariant
                ? productReference(
                    item.resolvedVariant
                      .product
                  )
                : null,
            originalVariant,
            resolvedVariant,
            productName:
              item.productName,
            originalVariantLabel:
              item.originalVariantLabel,
            resolvedVariantLabel:
              item.resolvedVariantLabel,
            image:
              item.image,
            requestedQuantity:
              item.requestedQuantity,
            preparedQuantity:
              item.preparedQuantity,
            originalUnitPrice:
              numberValue(
                item.originalUnitPrice
              ),
            quotedUnitPrice:
              numberValue(
                item.quotedUnitPrice
              ),
            quotedLineTotal,
            status:
              item.status,
            customerDecision:
              item.customerDecision,
            substitutionReason:
              item.substitutionReason,
            staffNote:
              item.staffNote,
            customerNote:
              item.customerNote,
            position:
              item.position,
            resolvedAt:
              item.resolvedAt
                ?.toISOString() ??
              null,
            customerRespondedAt:
              item.customerRespondedAt
                ?.toISOString() ??
              null,
            updatedAt:
              item.updatedAt
                .toISOString()
          };
        }
      ),
    events:
      record.events.map(
        event => ({
          id:
            event.id,
          actorName:
            event.actor?.name ??
            null,
          type:
            event.type,
          fromStatus:
            event.fromStatus,
          toStatus:
            event.toStatus,
          note:
            event.note,
          createdAt:
            event.createdAt
              .toISOString()
        })
      )
  };
}
