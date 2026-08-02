import {
  AgentSupportQueue
} from '@/features/support/components/AgentSupportQueue';
import {
  getAgentSupportQueue
} from '@/features/support/server/supportRepository';
import {
  requireAdminPermission
} from '@/features/admin/auth/adminPermissions';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminSupportPage() {
  const access =
    await requireAdminPermission(
      'support:view'
    );

  const snapshot =
    await getAgentSupportQueue(
      access.membership.workspace.id,
      200
    );

  return (
    <AgentSupportQueue
      initialSnapshot={snapshot}
    />
  );
}
