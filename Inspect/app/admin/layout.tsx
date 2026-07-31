import { getAdminAccess } from '@/features/admin/auth/adminPermissions';
import { AdminShell, type AdminShellPermission } from '@/features/admin/shell';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const access = await getAdminAccess();

  return (
    <AdminShell
      operator={{
        name: access.actor.name,
        role: access.membership.role,
        workspaceName: access.membership.workspace.name,
        workspaceMode: access.membership.workspace.mode,
        commerceMode: access.membership.workspace.commerceMode,
        isDeveloperAdmin: access.isDeveloperAdmin
      }}
      permissions={Array.from(access.permissions) as AdminShellPermission[]}>
      {children}
    </AdminShell>
  );
}
