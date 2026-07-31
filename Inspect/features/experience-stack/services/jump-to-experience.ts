import { prisma } from '@/lib/prisma';

import { mapExperienceHistoryEntry } from '../resolvers/map-experience-history-entry';

import type { ExperienceHistoryEntry } from '../experienceStackTypes';

type JumpToExperienceInput = {
  userId: string;
  workspaceId: string;
  entryId: string;
};

export async function jumpToExperience(
  input: JumpToExperienceInput
): Promise<ExperienceHistoryEntry | null> {
  const entry = await prisma.experienceHistoryEntry.findFirst({
    where: {
      id: input.entryId,
      userId: input.userId,
      workspaceId: input.workspaceId
    },
    select: {
      id: true
    }
  });

  if (!entry) {
    return null;
  }

  const updatedEntry = await prisma.experienceHistoryEntry.update({
    where: {
      id: entry.id
    },
    data: {
      visitedAt: new Date()
    }
  });

  return mapExperienceHistoryEntry(updatedEntry);
}