import type { PrismaClient } from '../../lib/generated/prisma/client';
import type { SeededWorkspaces } from './workspace.seed';

export async function seedMemberships(
  prisma: PrismaClient,
  workspaces: SeededWorkspaces
) {
  console.log('Creating workspace memberships...');

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true
    }
  });

  const workspaceList = [
    workspaces.live,
    workspaces.demo,
    workspaces.practice
  ];

  for (const user of users) {
    for (const workspace of workspaceList) {
      await prisma.workspaceMembership.upsert({
        where: {
          workspaceId_userId: {
            workspaceId: workspace.id,
            userId: user.id
          }
        },

        update: {
          active: true
        },

        create: {
          workspaceId: workspace.id,
          userId: user.id,
          role: 'MEMBER',
          active: true
        }
      });
    }
  }

  console.log(
    `✓ ${users.length} users linked across ${workspaceList.length} workspaces.`
  );
}