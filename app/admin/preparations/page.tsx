import {
  getAdminAccess
} from '@/features/admin/auth/adminPermissions';

import {
  PreparationOperationsClient
} from '@/features/shopping-list-preparation/PreparationOperationsClient';

export default async function AdminPreparationsPage() {
  const access =
    await getAdminAccess();

  if (
    !access.permissions.has(
      'order:view'
    )
  ) {
    throw new Error(
      'Missing required permission: order:view'
    );
  }

  return (
    <PreparationOperationsClient
      workspaceName={
        access.membership
          .workspace.name
      }
    />
  );
}
