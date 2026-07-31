// lib/actions.ts
'use server'

import { prisma } from '@/lib/prisma';

export async function getExperienceProfile(id: string) {
  // This runs ONLY on the server, where 'dns' is available
  return await prisma.experienceProfile.findUnique({
    where: { id }
  });
}