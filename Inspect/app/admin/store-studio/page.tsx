import { redirect } from 'next/navigation';

import { getAdminAccess } from '@/features/admin/auth/adminPermissions';
import {
  getStoreStudioAdminDashboard,
  StoreStudioAdminDashboard
} from '@/features/store-studio/admin';

export const dynamic = 'force-dynamic';

export default async function StoreStudioAdminPage() {
  const access = await getAdminAccess();

  if (!access.permissions.has('experience:manage')) {
    redirect('/admin');
  }

  const data = await getStoreStudioAdminDashboard(
    access.membership.workspaceId
  );

  return (
    <StoreStudioAdminDashboard
      data={data}
      canReview={access.permissions.has('approval:review')}
      administratorName={access.session.user.name}
    />
  );
}
