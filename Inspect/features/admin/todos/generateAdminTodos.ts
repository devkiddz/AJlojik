import 'server-only';

import { prisma } from '@/lib/prisma';

const ACTIVE_TODO_STATUSES = ['OPEN', 'IN_PROGRESS', 'BLOCKED'] as const;

export async function generateAdminTodos(workspaceId: string): Promise<void> {
  if (
    !prisma.productVariant?.findMany ||
    !prisma.delivery?.findMany ||
    !prisma.adminTodo?.findFirst ||
    !prisma.adminTodo?.create
  ) {
    console.warn('Admin todo generation is waiting for the latest Prisma client.');
    return;
  }

  const [inventoryCandidates, delayedDeliveries] = await Promise.all([
    prisma.productVariant.findMany({
      where: {
        active: true,
        product: {
          workspaceId
        },
        inventory: {
          isNot: null
        }
      },
      select: {
        productId: true,
        product: {
          select: {
            name: true
          }
        },
        inventory: {
          select: {
            quantity: true,
            reorderLevel: true
          }
        }
      },
      take: 250
    }),
    prisma.delivery.findMany({
      where: {
        workspaceId,
        status: {
          in: ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT']
        },
        estimatedArrival: {
          lt: new Date()
        }
      },
      select: {
        id: true,
        trackingCode: true
      },
      take: 50
    })
  ]).catch(error => {
    console.error(
      'Admin todo generation skipped because operational data is unavailable.',
      error
    );

    return [[], []] as const;
  });

  const lowStockProducts = new Map<
    string,
    {
      productId: string;
      productName: string;
      quantity: number;
      reorderLevel: number;
    }
  >();

  for (const item of inventoryCandidates) {
    const quantity = item.inventory?.quantity ?? 0;
    const reorderLevel = item.inventory?.reorderLevel ?? 5;

    if (quantity > reorderLevel) {
      continue;
    }

    const current = lowStockProducts.get(item.productId);

    if (!current || quantity < current.quantity) {
      lowStockProducts.set(item.productId, {
        productId: item.productId,
        productName: item.product.name,
        quantity,
        reorderLevel
      });
    }
  }

  const lowStockProductIds = [...lowStockProducts.keys()];
  const delayedDeliveryIds = delayedDeliveries.map(delivery => delivery.id);
  const completedAt = new Date();

  await prisma.$transaction(async transaction => {
    await transaction.adminTodo.updateMany({
      where: {
        workspaceId,
        source: 'INVENTORY',
        targetType: 'PRODUCT',
        status: {
          in: [...ACTIVE_TODO_STATUSES]
        },
        ...(lowStockProductIds.length
          ? {
              targetId: {
                notIn: lowStockProductIds
              }
            }
          : {})
      },
      data: {
        status: 'COMPLETED',
        completedAt
      }
    });

    await transaction.adminTodo.updateMany({
      where: {
        workspaceId,
        source: 'DELIVERY',
        targetType: 'DELIVERY',
        status: {
          in: [...ACTIVE_TODO_STATUSES]
        },
        ...(delayedDeliveryIds.length
          ? {
              targetId: {
                notIn: delayedDeliveryIds
              }
            }
          : {})
      },
      data: {
        status: 'COMPLETED',
        completedAt
      }
    });

    for (const item of lowStockProducts.values()) {
      const existing = await transaction.adminTodo.findFirst({
        where: {
          workspaceId,
          source: 'INVENTORY',
          targetType: 'PRODUCT',
          targetId: item.productId,
          status: {
            in: [...ACTIVE_TODO_STATUSES]
          }
        },
        select: {
          id: true
        }
      });

      const description = `${item.quantity} units remain; reorder level is ${item.reorderLevel}.`;
      const priority = item.quantity <= 0 ? 'URGENT' : 'HIGH';

      if (existing) {
        await transaction.adminTodo.update({
          where: {
            id: existing.id
          },
          data: {
            title: `Restock ${item.productName}`,
            description,
            priority,
            completedAt: null
          }
        });
      } else {
        await transaction.adminTodo.create({
          data: {
            workspaceId,
            title: `Restock ${item.productName}`,
            description,
            source: 'INVENTORY',
            priority,
            targetType: 'PRODUCT',
            targetId: item.productId
          }
        });
      }
    }

    for (const delivery of delayedDeliveries) {
      const existing = await transaction.adminTodo.findFirst({
        where: {
          workspaceId,
          source: 'DELIVERY',
          targetType: 'DELIVERY',
          targetId: delivery.id,
          status: {
            in: [...ACTIVE_TODO_STATUSES]
          }
        },
        select: {
          id: true
        }
      });

      if (existing) {
        await transaction.adminTodo.update({
          where: {
            id: existing.id
          },
          data: {
            title: `Review delayed delivery ${delivery.trackingCode}`,
            description:
              'The estimated arrival time has passed while delivery remains active.',
            priority: 'URGENT',
            completedAt: null
          }
        });
      } else {
        await transaction.adminTodo.create({
          data: {
            workspaceId,
            title: `Review delayed delivery ${delivery.trackingCode}`,
            description:
              'The estimated arrival time has passed while delivery remains active.',
            source: 'DELIVERY',
            priority: 'URGENT',
            targetType: 'DELIVERY',
            targetId: delivery.id
          }
        });
      }
    }
  });
}
