import {
  getAdminAccess
} from '@/features/admin/auth/adminPermissions';

import {
  DeliveryOperationsClient
} from '@/features/delivery-runtime/DeliveryOperationsClient';

export default async function AdminDeliveriesPage() {
  const access =
    await getAdminAccess();

  return (
    <DeliveryOperationsClient
      workspaceId={
        access.membership
          .workspaceId
      }
      workspaceName={
        access.membership
          .workspace.name
      }
      canManage={
        access.permissions.has(
          'delivery:update:routine'
        )
      }
    />
  );
}
