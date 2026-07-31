import { prisma } from '@/lib/prisma';

import type {
  ExperienceStackState
} from '../experienceStackTypes';

import { mapExperienceHistoryEntry } from '../resolvers/map-experience-history-entry';
import { ensureExperienceHistorySettings } from './ensure-experience-history-settings';

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
  });

  const settings =
    await ensureExperienceHistorySettings(input);

  if (!settings.enabled) {
    return {
      entries: [],
      settings: {
        enabled: false,
        retention: settings.retention,
        maxEntries: settings.maxEntries
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
      take: settings.maxEntries
    });

  const mappedEntries =
    entries.map(mapExperienceHistoryEntry);

  return {
    entries: mappedEntries,
    settings: {
      enabled: settings.enabled,
      retention: settings.retention,
      maxEntries: settings.maxEntries
    },
    canGoBack: mappedEntries.length > 1,
    currentEntry: mappedEntries[0] ?? null
  };
}
