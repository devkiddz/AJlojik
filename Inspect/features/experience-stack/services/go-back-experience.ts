import { prisma } from '@/lib/prisma';
import { mapExperienceHistoryEntry } from '../resolvers/map-experience-history-entry';
import type { ExperienceHistoryEntry } from '../experienceStackTypes';

type GoBackExperienceInput = {
  userId: string;
  workspaceId: string;
};

type GoBackExperienceResult = {
  previousEntry: ExperienceHistoryEntry | null;
  removedEntryId: string | null;
};

export async function goBackExperience(
  input: GoBackExperienceInput
): Promise<GoBackExperienceResult> {
  const entries = await prisma.experienceHistoryEntry.findMany({
    where: {
      workspaceId: input.workspaceId,
      userId: input.userId
    },

    orderBy: {
      visitedAt: 'desc'
    },

    take: 2
  });

  const currentEntry = entries[0] ?? null;
  const previousEntry = entries[1] ?? null;

  if (!currentEntry || !previousEntry) {
    return {
      previousEntry: null,
      removedEntryId: null
    };
  }

  await prisma.experienceHistoryEntry.delete({
    where: {
      id: currentEntry.id
    }
  });

 return {
  removedEntryId: currentEntry.id,
  previousEntry: mapExperienceHistoryEntry(previousEntry)
};
}