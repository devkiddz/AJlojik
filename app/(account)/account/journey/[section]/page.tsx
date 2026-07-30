import { notFound } from 'next/navigation';

import {
  CustomerJourneyWorkspace,
  CUSTOMER_JOURNEY_SECTIONS,
  type CustomerJourneySection
} from '@/features/customer-dashboard/components/journey/CustomerJourneyWorkspace';
import { getCustomerDashboardData } from '@/features/customer-dashboard/services/get-customer-dashboard-data';
import { resolveCustomerDashboard } from '@/features/customer-dashboard/resolvers/resolve-customer-dashboard';
import { resolveCustomerDashboardView } from '@/features/customer-dashboard/view/resolveCustomerDashboardView';
import { resolveShoppingListWorkspace } from '@/features/shopping-lists/server/resolveShoppingListWorkspace';

type Props = {
  params: Promise<{ section: string }>;
};

function isJourneySection(value: string): value is CustomerJourneySection {
  return CUSTOMER_JOURNEY_SECTIONS.includes(value as CustomerJourneySection);
}

export default async function CustomerJourneyPage({ params }: Props) {
  const { section } = await params;

  if (!isJourneySection(section)) {
    notFound();
  }

  const resolvedSection = section as CustomerJourneySection;
  const returnTo = `/account/journey/${resolvedSection}`;
  const { userId, workspace } = await resolveShoppingListWorkspace(returnTo);
  const dashboardData = await getCustomerDashboardData(userId, workspace);
  const dashboard = resolveCustomerDashboard(dashboardData);
  const view = resolveCustomerDashboardView(dashboard);

  return <CustomerJourneyWorkspace section={resolvedSection} view={view} />;
}
