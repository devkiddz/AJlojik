import 'server-only';

import { prisma } from '@/lib/prisma';

export async function generateAdminTodos(workspaceId: string) {
  const [lowStockVariants, delayedDeliveries] = await Promise.all([
    prisma.productVariant.findMany({
      where: { active: true, inventory: { is: { quantity: { lte: 5 } } } },
      select: { productId: true, product: { select: { name: true } }, inventory: { select: { quantity: true, reorderLevel: true } } },
      take: 20
    }),
    prisma.delivery.findMany({
      where: { workspaceId, status: { in: ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT'] }, estimatedArrival: { lt: new Date() } },
      select: { id: true, trackingCode: true },
      take: 20
    })
  ]).catch(error => {
    console.error('Admin todo generation skipped because operational data is unavailable.', error);
    return [[], []] as const;
  });

  for (const item of lowStockVariants) {
    const existing = await prisma.adminTodo.findFirst({ where: { workspaceId, source: 'INVENTORY', targetType: 'PRODUCT', targetId: item.productId, status: { in: ['OPEN', 'IN_PROGRESS', 'BLOCKED'] } }, select: { id: true } });
    if (!existing) await prisma.adminTodo.create({ data: { workspaceId, title: `Restock ${item.product.name}`, description: `${item.inventory?.quantity ?? 0} units remain; reorder level is ${item.inventory?.reorderLevel ?? 5}.`, source: 'INVENTORY', priority: (item.inventory?.quantity ?? 0) <= 0 ? 'URGENT' : 'HIGH', targetType: 'PRODUCT', targetId: item.productId } });
  }

  for (const delivery of delayedDeliveries) {
    const existing = await prisma.adminTodo.findFirst({ where: { workspaceId, source: 'DELIVERY', targetType: 'DELIVERY', targetId: delivery.id, status: { in: ['OPEN', 'IN_PROGRESS', 'BLOCKED'] } }, select: { id: true } });
    if (!existing) await prisma.adminTodo.create({ data: { workspaceId, title: `Review delayed delivery ${delivery.trackingCode}`, description: 'The estimated arrival time has passed while delivery remains active.', source: 'DELIVERY', priority: 'URGENT', targetType: 'DELIVERY', targetId: delivery.id } });
  }
}
