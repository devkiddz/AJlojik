import { prisma } from '@/lib/prisma';

import type {
  Workspace,
  WorkspaceRuntime
} from '../workspaceTypes';

export async function getUserWorkspaces(
  userId: string
): Promise<WorkspaceRuntime> {
  const memberships =
    await prisma.workspaceMembership.findMany({
      where: {
        userId,
        active: true,
        workspace: {
          active: true
        }
      },

      include: {
        workspace: {
          include: {
            demoWallets: {
              where: {
                userId,
                active: true
              },
              take: 1
            }
          }
        }
      },

      orderBy: {
        joinedAt: 'asc'
      }
    });

  const availableWorkspaces: Workspace[] =
    memberships.map(membership => {
      const wallet =
        membership.workspace.demoWallets[0] ?? null;

      return {
        id: membership.workspace.id,
        slug: membership.workspace.slug,
        name: membership.workspace.name,

        mode: membership.workspace.mode,

        active: membership.workspace.active,
        resettable: membership.workspace.resettable,

        membership: {
          role: membership.role,
          active: membership.active
        },

        wallet: wallet
          ? {
              currency: wallet.currency,
              balance: Number(wallet.balance)
            }
          : null
      };
    });

  const activeWorkspace =
    availableWorkspaces.find(
      workspace => workspace.mode === 'LIVE'
    ) ??
    availableWorkspaces[0] ??
    null;

  return {
    activeWorkspace,
    availableWorkspaces,

    isLive: activeWorkspace?.mode === 'LIVE',
    isDemo: activeWorkspace?.mode === 'DEMO',
    isPractice: activeWorkspace?.mode === 'PRACTICE',
    isSandbox: activeWorkspace?.mode === 'SANDBOX',

    switchingWorkspace: false,
    error: null
  };
}