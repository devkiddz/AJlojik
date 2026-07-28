import { Suspense } from 'react';

import { getOptionalAdminAccess } from '@/features/admin/auth/adminPermissions';
import FeedExperienceWorkspace from '@/features/feed-experience/layout/FeedExperienceWorkspace';

export default async function AJStorePage() {
  const adminAccess = await getOptionalAdminAccess();

  const canManageStoreStudio = Boolean(
    adminAccess?.permissions.has('approval:review')
  );

  return (
    <Suspense fallback={null}>
      <FeedExperienceWorkspace
        canManageStoreStudio={canManageStoreStudio}
        storeStudioWorkspaceId={
          adminAccess?.membership.workspaceId ?? null
        }
      />
    </Suspense>
  );
}
