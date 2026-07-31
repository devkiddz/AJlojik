import {
  headers
} from 'next/headers';

import {
  auth
} from '@/lib/auth';

import {
  prisma
} from '@/lib/prisma';

import {
  ShoppingListRouteError
} from './shoppingListValidation';

export async function requireShoppingListUserId(): Promise<string> {
  const session =
    await auth.api.getSession({
      headers:
        await headers()
    });

  const userId =
    session?.user?.id;

  if (!userId) {
    throw new ShoppingListRouteError(
      'Authentication is required.',
      401
    );
  }

  return userId;
}

export async function assertShoppingListWorkspaceAccess(
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
    throw new ShoppingListRouteError(
      'You do not have access to this workspace.',
      403
    );
  }
}