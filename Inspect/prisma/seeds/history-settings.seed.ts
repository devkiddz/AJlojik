import type { PrismaClient } from '../../lib/generated/prisma/client';

import type { SeededWorkspaces } from './workspace.seed';

export async function seedHistorySettings(
  prisma: PrismaClient,
  workspaces: SeededWorkspaces
) {
  console.log('Seeding experience history settings...');

  const users = await prisma.user.findMany({
    select: {
      id: true
    }
  });

  const workspaceSettings = [
    {
      workspaceId: workspaces.live.id,
      retention: 'THIRTY_DAYS' as const,
      maxEntries: 20
    },
    {
      workspaceId: workspaces.demo.id,
      retention: 'ONE_DAY' as const,
      maxEntries: 10
    },
    {
      workspaceId: workspaces.practice.id,
      retention: 'FOREVER' as const,
      maxEntries: 50
    }
  ];

  let settingsCount = 0;

  for (const user of users) {
    for (const setting of workspaceSettings) {
      await prisma.experienceHistorySettings.upsert({
        where: {
          workspaceId_userId: {
            workspaceId: setting.workspaceId,
            userId: user.id
          }
        },
        update: {
          enabled: true,
          retention: setting.retention,
          maxEntries: setting.maxEntries
        },
        create: {
          workspaceId: setting.workspaceId,
          userId: user.id,
          enabled: true,
          retention: setting.retention,
          maxEntries: setting.maxEntries
        }
      });

      settingsCount += 1;
    }
  }

  console.log(`✓ ${settingsCount} experience history settings ready.`);
}