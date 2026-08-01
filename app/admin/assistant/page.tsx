import {
  AssistantRuntimePage
} from '@/features/ai-assistance';

import {
  getAdminAccess
} from '@/features/admin/auth/adminPermissions';

export default async function AdminAssistantPage() {
  const access =
    await getAdminAccess();

  return (
    <AssistantRuntimePage
      audience="admin"
      initialWorkspaceId={
        access.membership
          .workspaceId
      }
      contextLabel={`${access.membership.workspace.name} · ${access.membership.role.replaceAll('_', ' ')}`}
    />
  );
}
