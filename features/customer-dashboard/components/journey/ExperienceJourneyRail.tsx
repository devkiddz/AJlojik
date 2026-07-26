'use client';

import {
  Clock3,
  History,
  ReceiptText,
  ShoppingBag,
  Truck
} from 'lucide-react';

import type {
  CommerceDashboardData,
  CommerceOrder,
  CommerceProduct
} from '../../contracts/customerDashboardTypes';
import { DashboardRail } from '../rail/DashboardRail';
import {
  ActivityRows,
  CartRows,
  DeliveryRows,
  OrderRows,
  RecentViewRows
} from './JourneyRows';
import {
  JourneyListCard
} from './JourneyListCard';

type ExperienceJourneyRailProps = {
  recentProducts: CommerceProduct[];
  history: CommerceDashboardData['history'];
  orders: CommerceOrder[];
  activeDeliveries: CommerceOrder[];
  cartItems: CommerceDashboardData['cartItems'];
  cartQuantity: number;
  cartSubtotal: number;
};

export function ExperienceJourneyRail({
  recentProducts,
  history,
  orders,
  activeDeliveries,
  cartItems,
  cartQuantity,
  cartSubtotal
}: ExperienceJourneyRailProps) {
  return (
    <DashboardRail
      title="Your Experience Journey"
      code="EJ"
      icon={<History className="size-4" />}>
      <JourneyListCard
        code="RV"
        title="Recent Views"
        count={recentProducts.length}
        href="/store?view=recent"
        icon={<Clock3 />}
        tone="slate">
        <RecentViewRows products={recentProducts} />
      </JourneyListCard>

      <JourneyListCard
        id="activity-archive"
        code="AA"
        title="Activity Archive"
        count={history.length}
        href="/store?view=history"
        icon={<History />}
        tone="rose">
        <ActivityRows history={history} />
      </JourneyListCard>

      <JourneyListCard
        code="OH"
        title="Order History"
        count={orders.length}
        href="/orders"
        icon={<ReceiptText />}
        tone="violet">
        <OrderRows orders={orders} />
      </JourneyListCard>

      <JourneyListCard
        code="OD"
        title="On Delivery"
        count={activeDeliveries.length}
        href="/orders?status=active"
        icon={<Truck />}
        tone="emerald">
        <DeliveryRows orders={activeDeliveries} />
      </JourneyListCard>

      <JourneyListCard
        code="CT"
        title="Cart"
        count={cartQuantity}
        href="/cart"
        icon={<ShoppingBag />}
        tone="amber">
        <CartRows
          items={cartItems}
          subtotal={cartSubtotal}
        />
      </JourneyListCard>
    </DashboardRail>
  );
}
