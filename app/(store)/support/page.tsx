import {
  CustomerSupportWorkspace
} from '@/features/support/components/CustomerSupportWorkspace';
import {
  getCustomerSupportCases
} from '@/features/support/server/supportRepository';
import {
  resolveCommunicationWorkspace
} from '@/features/communication/server/resolveCommunicationWorkspace';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SupportPage() {
  const { userId, workspace } =
    await resolveCommunicationWorkspace(
      '/support'
    );

  const snapshot =
    await getCustomerSupportCases(
      userId,
      workspace.id,
      100
    );

  const orders =
    await prisma.order.findMany({
      where: {
        userId,
        workspaceId: workspace.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        delivery: {
          select: {
            id: true
          }
        }
      }
    });

  return (
    <CustomerSupportWorkspace
      initialSnapshot={snapshot}
      orders={orders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: Number(order.total),
        deliveryId:
          order.delivery?.id ?? null
      }))}
    />
  );
}
