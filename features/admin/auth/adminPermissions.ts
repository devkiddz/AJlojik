import 'server-only';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import type { WorkspaceRole } from '@/lib/generated/prisma/client';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export type AdminPermission =
  | 'commerce:view'
  | 'inventory:view'
  | 'activity:view'
  | 'delivery:view'
  | 'product:create'
  | 'product:update'
  | 'promotion:manage'
  | 'experience:manage'
  | 'featured:manage'
  | 'deletion:request'
  | 'delivery:update:request'
  | 'delivery:update:routine'
  | 'approval:review'
  | 'product:delete'
  | 'staff:view'
  | 'staff:assign'
  | 'tracking:delete'
  | 'system:manage';

const levelOne: AdminPermission[] = ['commerce:view', 'inventory:view', 'activity:view', 'delivery:view'];
const levelTwo: AdminPermission[] = [...levelOne, 'product:create', 'product:update', 'promotion:manage', 'experience:manage', 'featured:manage', 'deletion:request', 'delivery:update:request', 'delivery:update:routine'];
const levelThree: AdminPermission[] = [...levelTwo, 'approval:review', 'product:delete', 'staff:view'];
const superAdmin: AdminPermission[] = [...levelThree, 'staff:assign', 'tracking:delete', 'system:manage'];

export const permissionsByRole: Partial<Record<WorkspaceRole, readonly AdminPermission[]>> = {
  SUPPORT: levelOne,
  MANAGER: levelTwo,
  ADMIN: levelThree,
  SUPER_ADMIN: superAdmin
};

export function staffLevelForRole(role: WorkspaceRole) {
  if (role === 'SUPPORT') return 'LEVEL_1' as const;
  if (role === 'MANAGER') return 'LEVEL_2' as const;
  if (role === 'ADMIN') return 'LEVEL_3' as const;
  return null;
}

export function roleForStaffLevel(level: 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3'): WorkspaceRole {
  return level === 'LEVEL_1' ? 'SUPPORT' : level === 'LEVEL_2' ? 'MANAGER' : 'ADMIN';
}

export async function getAdminAccess() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/sign-in');

  const membership = await prisma.workspaceMembership.findFirst({
    where: {
      userId: session.user.id,
      active: true,
      workspace: { active: true },
      role: { in: ['SUPPORT', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'] }
    },
    include: { workspace: true },
    orderBy: [{ workspace: { mode: 'asc' } }, { joinedAt: 'asc' }]
  });

  if (!membership) redirect('/account');

  return {
    session,
    membership,
    permissions: new Set(permissionsByRole[membership.role] ?? [])
  };
}

export async function requireAdminPermission(permission: AdminPermission) {
  const access = await getAdminAccess();
  if (!access.permissions.has(permission)) throw new Error(`Missing required permission: ${permission}`);
  return access;
}
