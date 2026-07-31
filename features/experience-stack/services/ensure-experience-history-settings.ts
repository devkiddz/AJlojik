import { prisma } from '@/lib/prisma';

type EnsureExperienceHistorySettingsInput = {
  userId: string;
  workspaceId: string;
};

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'P2002'
  );
}

export async function ensureExperienceHistorySettings(
  input: EnsureExperienceHistorySettingsInput
) {
  const where = {
    workspaceId_userId: {
      workspaceId: input.workspaceId,
      userId: input.userId
    }
  } as const;

  const existing =
    await prisma.experienceHistorySettings.findUnique({
      where
    });

  if (existing) {
    return existing;
  }

  try {
    return await prisma.experienceHistorySettings.create({
      data: {
        workspaceId: input.workspaceId,
        userId: input.userId,
        enabled: true,
        retention: 'SEVEN_DAYS',
        maxEntries: 20
      }
    });
  } catch (error) {
    if (!isUniqueConstraintError(error)) {
      throw error;
    }

    const concurrentlyCreated =
      await prisma.experienceHistorySettings.findUnique({
        where
      });

    if (concurrentlyCreated) {
      return concurrentlyCreated;
    }

    throw error;
  }
}
