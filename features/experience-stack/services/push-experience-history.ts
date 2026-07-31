import {
  Prisma,
  type ExperienceHistorySource,
} from '@/lib/generated/prisma/client';

import { resolveHistoryExpiry } from '../resolvers/resolve-history-expiry';
import { prisma } from '@/lib/prisma';

type PushExperienceHistoryInput = {
  userId: string;
  workspaceId: string;

  label: string;
  subtitle?: string | null;

  categorySlug: string;
  source: ExperienceHistorySource;

  experienceId?: string | null;
  campaignId?: string | null;
  collectionId?: string | null;
  productId?: string | null;

  intentSnapshot: Prisma.InputJsonValue;
  contextSnapshot?: Prisma.InputJsonValue | null;

  fingerprint: string;
};

// function resolveExpiresAt(
//   retention:
//     | 'SESSION'
//     | 'ONE_DAY'
//     | 'SEVEN_DAYS'
//     | 'THIRTY_DAYS'
//     | 'FOREVER'
// ): Date | null {
//   const now = new Date();

//   switch (retention) {
//     case 'SESSION':
//       return now;

//     case 'ONE_DAY':
//       return new Date(now.getTime() + 24 * 60 * 60 * 1000);

//     case 'SEVEN_DAYS':
//       return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

//     case 'THIRTY_DAYS':
//       return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

//     case 'FOREVER':
//       return null;
//   }
// }

export async function pushExperienceHistory(
  input: PushExperienceHistoryInput
) {  const settings =
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

  if (!settings.enabled) {
    return null;
  }

  const expiresAt = resolveHistoryExpiry(settings.retention);

  const entry = await prisma.experienceHistoryEntry.upsert({
    where: {
      workspaceId_userId_fingerprint: {
        workspaceId: input.workspaceId,
        userId: input.userId,
        fingerprint: input.fingerprint
      }
    },

    update: {
      label: input.label,
      subtitle: input.subtitle ?? null,
      categorySlug: input.categorySlug,
      source: input.source,

      experienceId: input.experienceId ?? null,
      campaignId: input.campaignId ?? null,
      collectionId: input.collectionId ?? null,
      productId: input.productId ?? null,

      intentSnapshot: input.intentSnapshot,

      contextSnapshot:
        input.contextSnapshot === null
          ? Prisma.JsonNull
          : input.contextSnapshot,

      visitedAt: new Date(),
      expiresAt
    },

    create: {
      workspaceId: input.workspaceId,
      userId: input.userId,

      label: input.label,
      subtitle: input.subtitle ?? null,

      categorySlug: input.categorySlug,
      source: input.source,

      experienceId: input.experienceId ?? null,
      campaignId: input.campaignId ?? null,
      collectionId: input.collectionId ?? null,
      productId: input.productId ?? null,

      intentSnapshot: input.intentSnapshot,

      contextSnapshot:
        input.contextSnapshot === null
          ? Prisma.JsonNull
          : input.contextSnapshot,

      fingerprint: input.fingerprint,
      visitedAt: new Date(),
      expiresAt
    }
  });

  const overflowEntries =
    await prisma.experienceHistoryEntry.findMany({
      where: {
        workspaceId: input.workspaceId,
        userId: input.userId
      },

      orderBy: {
        visitedAt: 'desc'
      },

      skip: settings.maxEntries,

      select: {
        id: true
      }
    });

  if (overflowEntries.length > 0) {
    await prisma.experienceHistoryEntry.deleteMany({
      where: {
        id: {
          in: overflowEntries.map(item => item.id)
        }
      }
    });
  }

  return entry;
}