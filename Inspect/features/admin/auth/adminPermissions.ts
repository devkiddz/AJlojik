import 'server-only';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import type { WorkspaceRole } from '@/lib/generated/prisma/client';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export type AdminPermission =
  | 'commerce:view'
  | 'inventory:view'
  | 'inventory:manage'
  | 'activity:view'
  | 'analytics:view'
  | 'delivery:view'
  | 'order:view'
  | 'order:manage'
  | 'customer:view'
  | 'customer:manage'
  | 'media:view'
  | 'media:manage'
  | 'media:delete'
  | 'product:create'
  | 'product:update'
  | 'product:delete'
  | 'category:view'
  | 'category:manage'
  | 'brand:view'
  | 'brand:manage'
  | 'collection:view'
  | 'collection:manage'
  | 'promotion:view'
  | 'promotion:manage'
  | 'experience:manage'
  | 'featured:manage'
  | 'vendor:view'
  | 'vendor:manage'
  | 'vendor:approve'
  | 'deletion:request'
  | 'delivery:update:request'
  | 'delivery:update:routine'
  | 'approval:view'
  | 'approval:review'
  | 'staff:view'
  | 'staff:assign'
  | 'tracking:delete'
  | 'settings:view'
  | 'settings:manage'
  | 'system:manage'
  | 'platform:manage'
  | 'multivendor:manage';

const levelOne: AdminPermission[] = [
  'commerce:view',
  'inventory:view',
  'activity:view',
  'analytics:view',
  'delivery:view',
  'order:view',
  'customer:view',
  'media:view',
  'category:view',
  'brand:view',
  'collection:view',
  'promotion:view',
  'vendor:view',
  'approval:view',
  'settings:view'
];

const levelTwo: AdminPermission[] = [
  ...levelOne,
  'inventory:manage',
  'order:manage',
  'media:manage',
  'product:create',
  'product:update',
  'category:manage',
  'brand:manage',
  'collection:manage',
  'promotion:manage',
  'experience:manage',
  'featured:manage',
  'deletion:request',
  'delivery:update:request',
  'delivery:update:routine'
];

const levelThree: AdminPermission[] = [
  ...levelTwo,
  'customer:manage',
  'media:delete',
  'approval:review',
  'product:delete',
  'vendor:manage',
  'vendor:approve',
  'staff:view'
];

const superAdmin: AdminPermission[] = [
  ...levelThree,
  'staff:assign',
  'tracking:delete',
  'settings:manage',
  'system:manage'
];

const developerAdmin: AdminPermission[] = [
  ...superAdmin,
  'platform:manage',
  'multivendor:manage'
];

export const permissionsByRole: Partial<Record<WorkspaceRole, readonly AdminPermission[]>> = {
  SUPPORT: levelOne,
  MANAGER: levelTwo,
  ADMIN: levelThree,
  OWNER: superAdmin,
  SUPER_ADMIN: superAdmin
};

const ADMIN_ROLES: WorkspaceRole[] = [
  'SUPPORT',
  'MANAGER',
  'ADMIN',
  'OWNER',
  'SUPER_ADMIN'
];

export function staffLevelForRole(role: WorkspaceRole) {
  if (role === 'SUPPORT') return 'LEVEL_1' as const;
  if (role === 'MANAGER') return 'LEVEL_2' as const;
  if (role === 'ADMIN') return 'LEVEL_3' as const;
  return null;
}

export function roleForStaffLevel(level: 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3'): WorkspaceRole {
  return level === 'LEVEL_1' ? 'SUPPORT' : level === 'LEVEL_2' ? 'MANAGER' : 'ADMIN';
}

async function resolveAdminAccess(requestHeaders: Headers) {
  const session = await auth.api
    .getSession({ headers: requestHeaders })
    .catch(() => null);

  if (!session) return null;

  const [membership, actor] = await Promise.all([
    prisma.workspaceMembership.findFirst({
      where: {
        userId: session.user.id,
        active: true,
        workspace: { active: true },
        role: { in: ADMIN_ROLES }
      },
      include: { workspace: true },
      orderBy: [{ workspace: { mode: 'asc' } }, { joinedAt: 'asc' }]
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        isGhostDeveloper: true,
        platformRole: true
      }
    })
  ]);

  if (!membership || !actor) return null;

  const isDeveloperAdmin =
    actor.platformRole === 'DEVELOPER_ADMIN' || actor.isGhostDeveloper;

  const permissions = new Set<AdminPermission>(
    isDeveloperAdmin
      ? developerAdmin
      : permissionsByRole[membership.role] ?? []
  );

  return {
    session,
    actor,
    membership,
    permissions,
    isDeveloperAdmin
  };
}

export async function getAdminAccess() {
  const access = await resolveAdminAccess(await headers());

  if (!access) {
    const session = await auth.api
      .getSession({ headers: await headers() })
      .catch(() => null);

    redirect(session ? '/account' : '/adminlogin/login');
  }

  return access;
}

export async function getAdminApiAccess(requestHeaders: Headers) {
  return resolveAdminAccess(requestHeaders);
}

export async function requireAdminPermission(permission: AdminPermission) {
  const access = await getAdminAccess();

  if (!access.permissions.has(permission)) {
    throw new Error(`Missing required permission: ${permission}`);
  }

  return access;
}

export async function requireDeveloperAdmin() {
  const access = await getAdminAccess();

  if (!access.isDeveloperAdmin || !access.permissions.has('platform:manage')) {
    throw new Error('Developer Admin authority is required.');
  }

  return access;
}

/**
 * Resolves administrator access without redirecting public Store visitors.
 * Every write action must still enforce its permission independently.
 */
export async function getOptionalAdminAccess() {
  return resolveAdminAccess(await headers());
}
