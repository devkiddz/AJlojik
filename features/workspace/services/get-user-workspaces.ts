import { prisma } from '@/lib/prisma';

import type {
  Workspace,
  WorkspaceRuntime
} from '../workspaceTypes';

export async function getUserWorkspaces(
  userId: string
): Promise<WorkspaceRuntime> {
  const coreWorkspaces = await prisma.workspace.findMany({
    where: {
      mode: {
        in: ['LIVE', 'DEMO', 'PRACTICE']
      },
      active: true
    },
    orderBy: {
      createdAt: 'asc'
    },
    select: {
      id: true,
      mode: true
    }
  });

  for (const workspace of coreWorkspaces) {
    await prisma.workspaceMembership.upsert({
      where: {
        workspaceId_userId: {
          workspaceId: workspace.id,
          userId
        }
      },
      update: {
        active: true
      },
      create: {
        workspaceId: workspace.id,
        userId,
        role: 'MEMBER',
        active: true
      }
    });

    if (workspace.mode === 'DEMO' || workspace.mode === 'PRACTICE') {
      await prisma.demoWallet.upsert({
        where: {
          workspaceId_userId: {
            workspaceId: workspace.id,
            userId
          }
        },
        update: {
          active: true
        },
        create: {
          workspaceId: workspace.id,
          userId,
          currency: 'NGN',
          balance: workspace.mode === 'DEMO' ? 1_000_000 : 500_000,
          active: true
        }
      });
    }
  }

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
