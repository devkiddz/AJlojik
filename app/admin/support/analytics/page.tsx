import {
  requireAdminPermission
} from '@/features/admin/auth/adminPermissions';
import {
  SupportAnalyticsDashboard
} from '@/features/support/components/SupportAnalyticsDashboard';
import {
  getSupportAnalyticsSnapshot
} from '@/features/support/server/supportAnalyticsRepository';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SupportAnalyticsPage() {
  const access =
    await requireAdminPermission(
      'support:view'
    );

  const snapshot =
    await getSupportAnalyticsSnapshot(
      access.membership.workspace.id
    );

  return (
    <SupportAnalyticsDashboard
      snapshot={snapshot}
    />
  );
}
