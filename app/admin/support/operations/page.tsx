import {
  requireAdminPermission
} from '@/features/admin/auth/adminPermissions';
import {
  SupportOperationsDashboard
} from '@/features/support/components/SupportOperationsDashboard';
import {
  getSupportOperationsOverview
} from '@/features/support/server/supportOperationsDashboardRepository';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SupportOperationsPage() {
  const access =
    await requireAdminPermission(
      'support:view'
    );

  const snapshot =
    await getSupportOperationsOverview(
      access.membership.workspace.id
    );

  return (
    <SupportOperationsDashboard
      snapshot={snapshot}
    />
  );
}
