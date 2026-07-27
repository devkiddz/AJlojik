'use client';

import { Clock3, Heart, History, ReceiptText, ShoppingBag, Truck } from 'lucide-react';

import type {
  CommerceDashboardData,
  CommerceOrder,
  CommerceProduct
} from '../../contracts/customerDashboardTypes';

import { DashboardRail } from '../rail/DashboardRail';

import { ActivityRows, DeliveryRows, OrderRows } from './JourneyRows';

import { JourneyListCard } from './JourneyListCard';

import { ProductJourneyCard } from './ProductJourneyCard';

import { CartJourneyCard } from './CartJourneyCard';

type ExperienceJourneyRailProps = {
  recentProducts: CommerceProduct[];
  wishlistProducts: CommerceProduct[];

  history: CommerceDashboardData['history'];

  orders: CommerceOrder[];
  activeDeliveries: CommerceOrder[];

  cartItems: CommerceDashboardData['cartItems'];
  cartQuantity: number;
  cartSubtotal: number;
};

export function ExperienceJourneyRail({
  recentProducts,
  wishlistProducts,
  history,
  orders,
  activeDeliveries,
  cartItems,
  cartQuantity,
  cartSubtotal
}: ExperienceJourneyRailProps) {
  return (
    <DashboardRail title="Your Experience Journey" code="EJ" icon={<History className="size-4" />}>
      <ProductJourneyCard
        code="RV"
        title="Recent Views"
        count={recentProducts.length}
        href="/dashboard/journey/recent-views"
        icon={<Clock3 />}
        tone="slate"
        products={recentProducts}
        emptyLabel="Products you view will appear here"
        supportingLabel="Continue exploring"
      />

      <ProductJourneyCard
        code="WL"
        title="Wishlist"
        count={wishlistProducts.length}
        href="/dashboard/journey/wishlist"
        icon={<Heart className="fill-current" />}
        tone="rose"
        products={wishlistProducts}
        emptyLabel="Products you save will appear here"
        supportingLabel="Your saved interests"
      />

      <CartJourneyCard
        code="CT"
        title="Cart"
        count={cartQuantity}
        href="/dashboard/journey/cart"
        icon={<ShoppingBag />}
        tone="amber"
        items={cartItems}
        subtotal={cartSubtotal}
      />

      <JourneyListCard
        id="activity-archive"
        code="AA"
        title="Activity Archive"
        count={history.length}
        href="/dashboard/journey/activity"
        icon={<History />}
        tone="rose"
        supportingLabel="Recorded activities"
        emptyLabel="No recorded activity yet">
        <ActivityRows history={history} />
      </JourneyListCard>

      <JourneyListCard
        code="OH"
        title="Order History"
        count={orders.length}
        href="/dashboard/journey/orders"
        icon={<ReceiptText />}
        tone="violet"
        supportingLabel={orders.length === 1 ? 'Completed order' : 'Completed orders'}
        emptyLabel="No completed orders yet">
        <OrderRows orders={orders} />
      </JourneyListCard>

      <JourneyListCard
        code="OD"
        title="On Delivery"
        count={activeDeliveries.length}
        href="/dashboard/journey/deliveries"
        icon={<Truck />}
        tone="emerald"
        supportingLabel={activeDeliveries.length === 1 ? 'Active delivery' : 'Active deliveries'}
        emptyLabel="No active deliveries">
        <DeliveryRows orders={activeDeliveries} />
      </JourneyListCard>
    </DashboardRail>
  );
}
