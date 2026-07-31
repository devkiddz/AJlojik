import type { ExperienceHistoryRetention } from '@/lib/generated/prisma/client';

import { prisma } from '@/lib/prisma';

type UpdateExperienceHistorySettingsInput = {
  userId: string;
  workspaceId: string;

  enabled?: boolean;
  retention?: ExperienceHistoryRetention;
  maxEntries?: number;
};

const MIN_ENTRIES = 5;
const MAX_ENTRIES = 100;

export async function updateExperienceHistorySettings(
  input: UpdateExperienceHistorySettingsInput
) {
  const maxEntries =
    input.maxEntries === undefined
      ? undefined
      : Math.min(
          MAX_ENTRIES,
          Math.max(MIN_ENTRIES, Math.round(input.maxEntries))
        );

  const settings = await prisma.experienceHistorySettings.upsert({
    where: {
      workspaceId_userId: {
        workspaceId: input.workspaceId,
        userId: input.userId
      }
    },

    update: {
      enabled: input.enabled,
      retention: input.retention,
      maxEntries
    },

    create: {
      workspaceId: input.workspaceId,
      userId: input.userId,
      enabled: input.enabled ?? true,
      retention: input.retention ?? 'SEVEN_DAYS',
      maxEntries: maxEntries ?? 20
    }
  });

  if (maxEntries !== undefined) {
    const overflowEntries =
      await prisma.experienceHistoryEntry.findMany({
        where: {
          workspaceId: input.workspaceId,
          userId: input.userId
        },

        orderBy: {
          visitedAt: 'desc'
        },

        skip: maxEntries,

        select: {
          id: true
        }
      });

    if (overflowEntries.length > 0) {
      await prisma.experienceHistoryEntry.deleteMany({
        where: {
          id: {
            in: overflowEntries.map(entry => entry.id)
          }
        }
      });
    }
  }

  return settings;
}