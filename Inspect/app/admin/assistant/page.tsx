import { AssistantFoundationPage } from '@/features/ai-assistance';
import { getAdminAccess } from '@/features/admin/auth/adminPermissions';

export default async function AdminAssistantPage() {
  const access = await getAdminAccess();

  return (
    <AssistantFoundationPage
      audience="admin"
      contextLabel={`${access.membership.workspace.name} · ${access.membership.role.replaceAll('_', ' ')}`}
    />
  );
}
