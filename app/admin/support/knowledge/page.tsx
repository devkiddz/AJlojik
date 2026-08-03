import {
  requireAdminPermission
} from '@/features/admin/auth/adminPermissions';
import {
  SupportKnowledgeStudio
} from '@/features/support/components/SupportKnowledgeStudio';
import {
  resolveSupportKnowledgeStudio
} from '@/features/support/server/supportKnowledgeManagementService';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SupportKnowledgePage() {
  const access = await requireAdminPermission('support:view');
  const snapshot = await resolveSupportKnowledgeStudio(
    access.membership.workspace.id
  );

  return (
    <SupportKnowledgeStudio
      initialSnapshot={snapshot}
      canConfigure={access.permissions.has('support:configure')}
    />
  );
}
