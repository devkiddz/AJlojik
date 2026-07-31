import { mapExperienceHistoryEntry } from '../resolvers/map-experience-history-entry';
import { prisma } from '@/lib/prisma';

import type {
  ExperienceStackState
} from '../experienceStackTypes';

type GetExperienceHistoryInput = {
  userId: string;
  workspaceId: string;
};


export async function getExperienceHistory(
  input: GetExperienceHistoryInput
): Promise<ExperienceStackState> {
  const now = new Date();

  await prisma.experienceHistoryEntry.deleteMany({
    where: {
      workspaceId: input.workspaceId,
      userId: input.userId,
      expiresAt: {
        lte: now
      }
    }
  });  const settings =
    await prisma.experienceHistorySettings.upsert({
      where: {
        workspaceId_userId: {
          workspaceId: input.workspaceId,
          userId: input.userId
        }
      },
      update: {},
      create: {
        workspaceId: input.workspaceId,
        userId: input.userId,
        enabled: true,
        retention: 'SEVEN_DAYS',
        maxEntries: 20
      }
    });

  const resolvedSettings = settings;

  if (!resolvedSettings.enabled) {
    return {
      entries: [],
      settings: {
        enabled: false,
        retention: resolvedSettings.retention,
        maxEntries: resolvedSettings.maxEntries
      },
      canGoBack: false,
      currentEntry: null
    };
  }

  const entries =
    await prisma.experienceHistoryEntry.findMany({
      where: {
        workspaceId: input.workspaceId,
        userId: input.userId
      },

      orderBy: {
        visitedAt: 'desc'
      },

      take: resolvedSettings.maxEntries
    });

const mappedEntries = entries.map(mapExperienceHistoryEntry);

  return {
    entries: mappedEntries,

    settings: {
      enabled: resolvedSettings.enabled,
      retention: resolvedSettings.retention,
      maxEntries: resolvedSettings.maxEntries
    },

    canGoBack: mappedEntries.length > 1,

    currentEntry: mappedEntries[0] ?? null
  };
}