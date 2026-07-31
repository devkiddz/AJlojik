import type {
  CommerceOrder,
  DashboardActivityItem,
  DashboardOrchestration,
  DashboardQuickAction,
  DashboardSummaryItem
} from '../contracts/customerDashboardTypes';

import { DashboardActivityCard } from './DashboardActivityCard';

import { DashboardCommerceOverviewCard } from './DashboardCommerceOverviewCard';

import { DashboardCompanionCard } from './DashboardCompanionCard';

import { DashboardOrdersCard } from './DashboardOrdersCard';

import { DashboardQuickLinksCard } from './DashboardQuickLinksCard';

import { DashboardSnapRail } from './DashboardSnapRail';

const mobileCardClassName = [
  'w-[calc(100%-1rem)]',
  'min-w-[calc(100%-1rem)]',
  'max-w-none',
  'flex-none',
  'snap-start',

  'sm:w-[24rem]',
  'sm:min-w-[24rem]',
  'sm:max-w-[24rem]',

  'lg:w-full',
  'lg:min-w-0',
  'lg:max-w-none',
  'lg:flex-auto'
].join(' ');

type DashboardCommerceBoardProps = {
  summary: DashboardSummaryItem[];
  quickActions: DashboardQuickAction[];
  activity: DashboardActivityItem[];
  orders: CommerceOrder[];

  visibility: DashboardOrchestration['visibility'];

  orderBudget: number;
};

export function DashboardCommerceBoard({
  summary,
  quickActions,
  activity,
  orders,
  visibility,
  orderBudget
}: DashboardCommerceBoardProps) {
  const firstColumnCount = Number(visibility.overview) + Number(visibility.activity);

  const secondColumnCount = Number(visibility.quickActions) + Number(visibility.orders);

  const thirdColumnCount = Number(visibility.companion);

  const columnCount = [firstColumnCount, secondColumnCount, thirdColumnCount].filter(
    count => count > 0
  ).length;

  const itemCount = firstColumnCount + secondColumnCount + thirdColumnCount;

  const desktopGridClassName =
    columnCount >= 3
      ? 'lg:grid-cols-2 xl:grid-cols-3'
      : columnCount === 2
        ? 'lg:grid-cols-2'
        : 'lg:grid-cols-1';

  return (
    <DashboardSnapRail
      itemCount={itemCount}
      ariaLabel="Your commerce"
      className={['lg:grid', 'lg:items-start', 'lg:gap-3', desktopGridClassName].join(' ')}>
      {firstColumnCount > 0 ? (
        <div className="contents lg:grid lg:min-w-0 lg:content-start lg:gap-3">
          {visibility.overview ? (
            <div data-dashboard-snap-card="true" className={`${mobileCardClassName} order-1 lg:order-none`}>
              <DashboardCommerceOverviewCard items={summary} />
            </div>
          ) : null}

          {visibility.activity ? (
            <div data-dashboard-snap-card="true" className={`${mobileCardClassName} order-4 lg:order-none`}>
              <DashboardActivityCard items={activity} />
            </div>
          ) : null}
        </div>
      ) : null}

      {secondColumnCount > 0 ? (
        <div className="contents lg:grid lg:min-w-0 lg:content-start lg:gap-3">
          {visibility.quickActions ? (
            <div data-dashboard-snap-card="true" className={`${mobileCardClassName} order-2 lg:order-none`}>
              <DashboardQuickLinksCard items={quickActions} />
            </div>
          ) : null}

          {visibility.orders ? (
            <div data-dashboard-snap-card="true" className={`${mobileCardClassName} order-5 lg:order-none`}>
              <DashboardOrdersCard orders={orders.slice(0, orderBudget)} />
            </div>
          ) : null}
        </div>
      ) : null}

      {thirdColumnCount > 0 ? (
        <div className="contents lg:grid lg:min-w-0 lg:content-start lg:gap-3">
          <div data-dashboard-snap-card="true" className={`${mobileCardClassName} order-3 lg:order-none`}>
            <DashboardCompanionCard />
          </div>
        </div>
      ) : null}
    </DashboardSnapRail>
  );
}
