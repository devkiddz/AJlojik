import 'server-only';

import { prisma } from '@/lib/prisma';

export async function getOrCreateExperienceProfile(userId: string) {
  const existingProfile = await prisma.experienceProfile.findUnique({
    where: {
      userId
    }
  });

  if (existingProfile) {
    return existingProfile;
  }

  return prisma.experienceProfile.create({
    data: {
      userId,
      persona: 'new-member',
      onboardingCompleted: false,
      personalizationEnabled: true
    }
  });
}