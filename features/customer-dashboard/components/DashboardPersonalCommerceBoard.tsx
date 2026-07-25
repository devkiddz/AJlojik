import type {
  CommerceJourneyItem,
  CommerceMix
} from '../contracts/customerDashboardTypes';

import {
  DashboardJourneyCard
} from './DashboardJourneyCard';

import {
  DashboardProductModule
} from './DashboardProductModule';

import {
  DashboardSnapRail
} from './DashboardSnapRail';

const mobileCardClassName = [
  'w-[84vw]',
  'max-w-[26rem]',
  'shrink-0',
  'snap-start',

  'lg:w-full',
  'lg:max-w-none',
  'lg:min-w-0'
].join(' ');

type DashboardPersonalCommerceBoardProps = {
  mixes: CommerceMix[];
  journeys: CommerceJourneyItem[];
};

export function DashboardPersonalCommerceBoard({
  mixes,
  journeys
}: DashboardPersonalCommerceBoardProps) {
  const firstColumnCount =
    Number(Boolean(mixes[0])) +
    Number(Boolean(journeys[0]));

  const secondColumnCount =
    Number(Boolean(mixes[1])) +
    Number(Boolean(journeys[1]));

  const thirdColumnCount =
    Number(Boolean(mixes[2]));

  const columnCount = [
    firstColumnCount,
    secondColumnCount,
    thirdColumnCount
  ].filter(count => count > 0).length;

  const itemCount =
    mixes.length +
    journeys.length;

  const desktopGridClassName =
    columnCount >= 3
      ? 'lg:grid-cols-2 xl:grid-cols-3'
      : columnCount === 2
        ? 'lg:grid-cols-2'
        : 'lg:grid-cols-1';

  return (
    <DashboardSnapRail
      itemCount={itemCount}
      ariaLabel="Continue your experience"
      className={[
        'lg:grid',
        'lg:items-start',
        'lg:gap-3',
        desktopGridClassName
      ].join(' ')}>
      {firstColumnCount > 0 ? (
        <div className="contents lg:grid lg:min-w-0 lg:content-start lg:gap-3">
          {mixes[0] ? (
            <div
              data-dashboard-snap-card="true"
              className={`${mobileCardClassName} order-1 lg:order-none`}>
              <DashboardProductModule
                mix={mixes[0]}
                variant="spotlight"
              />
            </div>
          ) : null}

          {journeys[0] ? (
            <div
              data-dashboard-snap-card="true"
              className={`${mobileCardClassName} order-4 lg:order-none`}>
              <DashboardJourneyCard
                journey={journeys[0]}
              />
            </div>
          ) : null}
        </div>
      ) : null}

      {secondColumnCount > 0 ? (
        <div className="contents lg:grid lg:min-w-0 lg:content-start lg:gap-3">
          {mixes[1] ? (
            <div
              data-dashboard-snap-card="true"
              className={`${mobileCardClassName} order-2 lg:order-none`}>
              <DashboardProductModule
                mix={mixes[1]}
                variant="list"
              />
            </div>
          ) : null}

          {journeys[1] ? (
            <div
              data-dashboard-snap-card="true"
              className={`${mobileCardClassName} order-5 lg:order-none`}>
              <DashboardJourneyCard
                journey={journeys[1]}
              />
            </div>
          ) : null}
        </div>
      ) : null}

      {thirdColumnCount > 0 ? (
        <div className="contents lg:grid lg:min-w-0 lg:content-start lg:gap-3">
          <div
            data-dashboard-snap-card="true"
            className={`${mobileCardClassName} order-3 lg:order-none`}>
            <DashboardProductModule
              mix={mixes[2]}
              variant="compact"
            />
          </div>
        </div>
      ) : null}
    </DashboardSnapRail>
  );
}
