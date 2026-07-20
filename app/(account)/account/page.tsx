import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import CommerceDashboard, { type ExpensePoint } from '@/features/dashboard/CommerceDashboard';
import { CatalogProvider } from '@/features/catalog';
import { getCatalog } from '@/features/catalog/services/get-catalog';
import { getOrCreateExperienceProfile } from '@/features/feed-experience/services';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function createExpenseSeries(orders: { total: unknown; createdAt: Date; status: string }[]): ExpensePoint[] {
  const now = new Date();

  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    const month = date.toLocaleDateString('en-NG', { month: 'short' });
    const value = orders
      .filter(order => {
        const sameMonth =
          order.createdAt.getFullYear() === date.getFullYear() && order.createdAt.getMonth() === date.getMonth();

        return sameMonth && order.status !== 'CANCELLED' && order.status !== 'REFUNDED';
      })
      .reduce((sum, order) => sum + Number(order.total), 0);

    return { month, value };
  });
}

export default async function AccountPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect('/sign-in');
  }

  const experienceProfile = await getOrCreateExperienceProfile(session.user.id);

  const [orders, recentViews, catalog] = await Promise.all([
    prisma.order
      .findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        select: { total: true, createdAt: true, status: true }
      })
      .catch(() => []),
    prisma.recentlyViewed
      .findMany({
        where: { userId: session.user.id },
        orderBy: { viewedAt: 'desc' },
        take: 8,
        select: { productId: true }
      })
      .catch(() => []),
    getCatalog().catch(() => [])
  ]);

  const recentProductIds = Array.from(
    new Set([
      ...recentViews.map(item => item.productId),
      ...experienceProfile.recentlyViewedProductIds
    ])
  ).slice(0, 8);

  const totalSpent = orders
    .filter(order => order.status !== 'CANCELLED' && order.status !== 'REFUNDED')
    .reduce((sum, order) => sum + Number(order.total), 0);

  const shoppingListProductIds = Array.isArray(experienceProfile.shoppingLists)
    ? Array.from(new Set(experienceProfile.shoppingLists.flatMap(list => {
        if (!list || typeof list !== 'object' || !('productIds' in list) || !Array.isArray(list.productIds)) return [];
        return list.productIds.filter((id): id is string => typeof id === 'string');
      })))
    : [];

  return (
    <CatalogProvider initialProducts={catalog}>
      <CommerceDashboard
        user={{
          name: session.user.name,
          email: session.user.email,
          image: session.user.image ?? null,
          tier: typeof session.user.tier === 'string' ? session.user.tier : 'member',
          emailVerified: session.user.emailVerified
        }}
        persona={experienceProfile.persona}
        personalizationEnabled={experienceProfile.personalizationEnabled}
        recentProductIds={recentProductIds}
        expenseSeries={createExpenseSeries(orders)}
        totalSpent={totalSpent}
        orderCount={orders.length}
        checkedOutCount={orders.filter(order => ['CONFIRMED', 'PROCESSING', 'READY', 'DISPATCHED', 'DELIVERED'].includes(order.status)).length}
        onDeliveryCount={orders.filter(order => order.status === 'DISPATCHED').length}
        shoppingListProductIds={shoppingListProductIds}
      />
    </CatalogProvider>
  );
}
