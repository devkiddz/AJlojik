import type {
  DashboardSummaryItem
} from '../contracts/customerDashboardTypes';

import {
  DashboardSummaryCard
} from './DashboardSummaryCard';

type DashboardSummaryProps = {
  items: DashboardSummaryItem[];
};

export function DashboardSummary({
  items
}: DashboardSummaryProps) {
  return (
    <section
      aria-label="Commerce summary"
      className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(item => (
        <DashboardSummaryCard
          key={item.id}
          item={item}
        />
      ))}
    </section>
  );
}
