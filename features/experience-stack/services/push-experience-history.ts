import {
  Prisma,
  type ExperienceHistorySource
} from '@/lib/generated/prisma/client';

import { prisma } from '@/lib/prisma';

import { resolveHistoryExpiry } from '../resolvers/resolve-history-expiry';
import { ensureExperienceHistorySettings } from './ensure-experience-history-settings';

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

export async function pushExperienceHistory(
  input: PushExperienceHistoryInput
) {
  const settings =
    await ensureExperienceHistorySettings(input);

  if (!settings.enabled) {
    return null;
  }

  const expiresAt =
    resolveHistoryExpiry(settings.retention);

  const entry =
    await prisma.experienceHistoryEntry.upsert({
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
