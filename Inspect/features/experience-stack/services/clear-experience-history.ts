import { prisma } from '@/lib/prisma';

type ClearExperienceHistoryInput = {
  userId: string;
  workspaceId: string;
};

export async function clearExperienceHistory(
  input: ClearExperienceHistoryInput
): Promise<number> {
  const result = await prisma.experienceHistoryEntry.deleteMany({
    where: {
      userId: input.userId,
      workspaceId: input.workspaceId
    }
  });

  return result.count;
}