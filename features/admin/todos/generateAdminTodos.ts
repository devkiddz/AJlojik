import 'server-only';

import {
  ACTIVE_ADMIN_TODO_STATUSES
} from '@/features/admin/todos/adminTodoConstants';
import {
  upsertOperationalTodo
} from '@/features/admin/todos/adminTodoRepository';
import { prisma } from '@/lib/prisma';

export async function generateAdminTodos(
  workspaceId: string
): Promise<void> {
  const [inventoryCandidates, delayedDeliveries, newSupportCases] = await Promise.all([
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
    }),
    prisma.supportCase.findMany({
      where: {
        workspaceId,
        status: 'NEW'
      },
      select: {
        id: true,
        caseNumber: true,
        subject: true,
        category: true,
        priority: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 100
    })
  ]).catch(error => {
    console.error(
      'Admin Todo generation skipped because operational data is unavailable.',
      error
    );

    return [[], [], []] as const;
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
  const newSupportCaseIds = newSupportCases.map(supportCase => supportCase.id);
  const inventoryScanComplete = inventoryCandidates.length < 250;
  const deliveryScanComplete = delayedDeliveries.length < 50;
  const supportScanComplete = newSupportCases.length < 100;
  const completedAt = new Date();

  await prisma.$transaction(async transaction => {
    if (inventoryScanComplete) {
      await transaction.adminTodo.updateMany({
        where: {
          workspaceId,
          source: 'INVENTORY',
          targetType: 'PRODUCT',
          status: {
            in: [...ACTIVE_ADMIN_TODO_STATUSES]
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
          completedAt,
          dismissedAt: null,
          snoozedUntil: null,
          activeDedupeKey: null
        }
      });

      await transaction.adminTodo.updateMany({
        where: {
          workspaceId,
          source: 'INVENTORY',
          targetType: 'PRODUCT',
          status: 'DISMISSED',
          activeDedupeKey: {
            not: null
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
          activeDedupeKey: null
        }
      });
    }

    if (deliveryScanComplete) {
      await transaction.adminTodo.updateMany({
        where: {
          workspaceId,
          source: 'DELIVERY',
          targetType: 'DELIVERY',
          status: {
            in: [...ACTIVE_ADMIN_TODO_STATUSES]
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
          completedAt,
          dismissedAt: null,
          snoozedUntil: null,
          activeDedupeKey: null
        }
      });

      await transaction.adminTodo.updateMany({
        where: {
          workspaceId,
          source: 'DELIVERY',
          targetType: 'DELIVERY',
          status: 'DISMISSED',
          activeDedupeKey: {
            not: null
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
          activeDedupeKey: null
        }
      });
    }

    if (supportScanComplete) {
      await transaction.adminTodo.updateMany({
        where: {
          workspaceId,
          source: 'SUPPORT',
          dedupeKey: {
            startsWith: 'support:case:'
          },
          status: {
            in: [...ACTIVE_ADMIN_TODO_STATUSES]
          },
          ...(newSupportCaseIds.length
            ? {
                targetId: {
                  notIn: newSupportCaseIds
                }
              }
            : {})
        },
        data: {
          status: 'COMPLETED',
          completedAt,
          dismissedAt: null,
          snoozedUntil: null,
          activeDedupeKey: null
        }
      });

      await transaction.adminTodo.updateMany({
        where: {
          workspaceId,
          source: 'SUPPORT',
          dedupeKey: {
            startsWith: 'support:case:'
          },
          status: 'DISMISSED',
          activeDedupeKey: {
            not: null
          },
          ...(newSupportCaseIds.length
            ? {
                targetId: {
                  notIn: newSupportCaseIds
                }
              }
            : {})
        },
        data: {
          activeDedupeKey: null,
          snoozedUntil: null
        }
      });
    }

    for (const item of lowStockProducts.values()) {
      await upsertOperationalTodo(transaction, {
        workspaceId,
        title: `Restock ${item.productName}`,
        description: `${item.quantity} units remain; reorder level is ${item.reorderLevel}.`,
        source: 'INVENTORY',
        priority: item.quantity <= 0 ? 'URGENT' : 'HIGH',
        targetType: 'PRODUCT',
        targetId: item.productId,
        dedupeKey: `inventory:product:${item.productId}:low-stock`,
        metadata: {
          quantity: item.quantity,
          reorderLevel: item.reorderLevel
        }
      });
    }

    for (const delivery of delayedDeliveries) {
      await upsertOperationalTodo(transaction, {
        workspaceId,
        title: `Review delayed delivery ${delivery.trackingCode}`,
        description:
          'The estimated arrival time has passed while delivery remains active.',
        source: 'DELIVERY',
        priority: 'URGENT',
        targetType: 'DELIVERY',
        targetId: delivery.id,
        dedupeKey: `delivery:${delivery.id}:delayed`,
        metadata: {
          trackingCode: delivery.trackingCode
        }
      });
    }

    for (const supportCase of newSupportCases) {
      await upsertOperationalTodo(transaction, {
        workspaceId,
        title: `Review new Support Case ${supportCase.caseNumber}`,
        description: `${supportCase.category.replaceAll('_', ' ')} · ${supportCase.subject}`,
        source: 'SUPPORT',
        priority:
          supportCase.priority === 'URGENT'
            ? 'URGENT'
            : supportCase.priority === 'HIGH'
              ? 'HIGH'
              : supportCase.priority === 'LOW'
                ? 'LOW'
                : 'MEDIUM',
        targetId: supportCase.id,
        dedupeKey: `support:case:${supportCase.id}:new`,
        metadata: {
          caseNumber: supportCase.caseNumber,
          category: supportCase.category,
          priority: supportCase.priority
        }
      });
    }
  });
}
