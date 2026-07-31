import { headers } from 'next/headers';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

import { CartRouteError } from './cartValidation';

export async function requireCartUserId(): Promise<string> {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  const userId = session?.user?.id;

  if (!userId) {
    throw new CartRouteError(
      'Authentication is required.',
      401
    );
  }

  return userId;
}

export async function assertCartWorkspaceAccess(
  userId: string,
  workspaceId: string
): Promise<void> {
  const membership =
    await prisma.workspaceMembership.findFirst({
      where: {
        userId,
        workspaceId,
        active: true,

        workspace: {
          active: true
        }
      },

      select: {
        id: true
      }
    });

  if (!membership) {
    throw new CartRouteError(
      'You do not have access to this workspace.',
      403
    );
  }
}