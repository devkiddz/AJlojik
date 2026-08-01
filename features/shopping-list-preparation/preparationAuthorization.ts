import 'server-only';

import { auth } from '@/lib/auth';
import { getAdminApiAccess } from '@/features/admin/auth/adminPermissions';
import { prisma } from '@/lib/prisma';

export class PreparationAccessError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

export async function requirePreparationCustomer(
  requestHeaders: Headers,
  workspaceId?: string
) {
  const session = await auth.api
    .getSession({
      headers: requestHeaders
    })
    .catch(() => null);

  if (!session?.user?.id) {
    throw new PreparationAccessError(
      'Sign in to continue with Shopping List preparation.',
      401
    );
  }

  if (workspaceId) {
    const membership =
      await prisma.workspaceMembership.findFirst({
        where: {
          workspaceId,
          userId: session.user.id,
          active: true,
          workspace: {
            active: true
          }
        },
        select: {
          id: true,
          role: true
        }
      });

    if (!membership) {
      throw new PreparationAccessError(
        'You do not have access to this shopping workspace.',
        403
      );
    }
  }

  return {
    session,
    userId: session.user.id
  };
}

export async function requirePreparationStaff(
  requestHeaders: Headers,
  permission: 'view' | 'manage'
) {
  const access =
    await getAdminApiAccess(
      requestHeaders
    );

  if (!access) {
    throw new PreparationAccessError(
      'Administrator access is required.',
      401
    );
  }

  const requiredPermission =
    permission === 'manage'
      ? 'order:manage'
      : 'order:view';

  if (
    !access.permissions.has(
      requiredPermission
    )
  ) {
    throw new PreparationAccessError(
      `Missing required permission: ${requiredPermission}`,
      403
    );
  }

  return access;
}
