import {
  CircleDollarSign,
  Clock3,
  PackageCheck,
  ShoppingBag
} from 'lucide-react';

import { getAdminAccess } from '@/features/admin/auth/adminPermissions';
import {
  AdminMetric,
  AdminPage,
  AdminPageHeader
} from '@/features/admin/components';
import { updateOrderStatus } from '@/features/admin/orders/actions';
import { prisma } from '@/lib/prisma';

type OrderStatusValue =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'READY'
  | 'DISPATCHED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

const NEXT_ORDER_STATUSES: Record<
  OrderStatusValue,
  readonly OrderStatusValue[]
> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED', 'REFUNDED'],
  PROCESSING: ['READY', 'CANCELLED', 'REFUNDED'],
  READY: ['DISPATCHED', 'CANCELLED', 'REFUNDED'],
  DISPATCHED: ['DELIVERED', 'REFUNDED'],
  DELIVERED: ['REFUNDED'],
  CANCELLED: ['REFUNDED'],
  REFUNDED: []
};

export default async function AdminOrdersPage() {
  const access = await getAdminAccess();
  const money = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: access.membership.workspace.currency,
    maximumFractionDigits: 0
  });

  if (!access.permissions.has('order:view')) {
    throw new Error('Order access is required.');
  }

  const orders = await prisma.order.findMany({
    where: { workspaceId: access.membership.workspaceId },
    include: {
      user: { select: { name: true, email: true } },
      items: {
        select: {
          id: true,
          productName: true,
          quantity: true
        }
      },
      delivery: {
        select: {
          status: true,
          trackingCode: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 100
  });
  const revenue = orders
    .filter(order => order.paymentStatus === 'PAID')
    .reduce((sum, order) => sum + Number(order.total), 0);
  const open = orders.filter(
    order => !['DELIVERED', 'CANCELLED', 'REFUNDED'].includes(order.status)
  ).length;
  const paid = orders.filter(order => order.paymentStatus === 'PAID').length;

  return (
    <AdminPage>
      <div className="mx-auto max-w-[96rem] space-y-5">
        <AdminPageHeader
          eyebrow="Fulfilment command"
          title="Orders Management"
          description="Review customer orders, payment state, controlled fulfilment transitions and delivery handoff from one workspace-scoped view."
        />

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <AdminMetric icon={ShoppingBag} label="Orders" value={orders.length} />
          <AdminMetric icon={Clock3} label="Open orders" value={open} />
          <AdminMetric icon={PackageCheck} label="Paid orders" value={paid} />
          <AdminMetric
            icon={CircleDollarSign}
            label="Paid revenue"
            value={money.format(revenue)}
          />
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {orders.map(order => {
            const availableStatuses = NEXT_ORDER_STATUSES[order.status].filter(
              status => status !== 'REFUNDED' || order.paymentStatus === 'PAID'
            );

            return (
              <article
                key={order.id}
                className="rounded-[2rem] border border-border/60 bg-card/75 p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[.14em] text-primary">
                      {order.orderNumber}
                    </p>
                    <h2 className="mt-2 text-sm font-black">{order.user.name}</h2>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {order.user.email}
                    </p>
                  </div>
                  <span className="rounded-full bg-muted px-2 py-1 text-[8px] font-bold">
                    {order.status}
                  </span>
                </div>

                <div className="mt-4 rounded-2xl bg-muted/40 p-3">
                  <p className="text-xl font-black">
                    {money.format(Number(order.total))}
                  </p>
                  <p className="mt-1 text-[9px] text-muted-foreground">
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)} items ·{' '}
                    {order.paymentStatus}
                  </p>
                </div>

                <div className="mt-4 space-y-1">
                  {order.items.slice(0, 3).map(item => (
                    <p
                      key={item.id}
                      className="truncate text-[10px] text-muted-foreground">
                      {item.quantity}× {item.productName}
                    </p>
                  ))}
                </div>

                {order.delivery ? (
                  <p className="mt-3 text-[9px] font-bold">
                    Delivery: {order.delivery.status} · {order.delivery.trackingCode}
                  </p>
                ) : null}

                {access.permissions.has('order:manage') && availableStatuses.length ? (
                  <form action={updateOrderStatus} className="mt-4 flex gap-2">
                    <input type="hidden" name="id" value={order.id} />
                    <select
                      name="status"
                      defaultValue=""
                      required
                      className="h-10 min-w-0 flex-1 rounded-xl border border-border/70 bg-background px-2 text-[9px]">
                      <option value="" disabled>
                        Select next status
                      </option>
                      {availableStatuses.map(status => (
                        <option key={status} value={status}>
                          {status.replaceAll('_', ' ')}
                        </option>
                      ))}
                    </select>
                    <button className="rounded-full bg-foreground px-3 text-[9px] font-bold text-background">
                      Update
                    </button>
                  </form>
                ) : null}
              </article>
            );
          })}
        </section>
      </div>
    </AdminPage>
  );
}
